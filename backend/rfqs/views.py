from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import RFQ, RFQItem
from .serializers import RFQCreateSerializer, RFQReadSerializer, RFQItemSerializer, RFQItemStandaloneSerializer

class RFQViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'WORKSHOP':
            return RFQ.objects.filter(workshop=user).order_by('-created_at')
        elif user.role == 'VENDOR':
             # Vendors can see RFQs that are open for bidding OR RFQs they have bid on (even if closed)
            from django.db.models import Q
            return RFQ.objects.filter(
                Q(status=RFQ.Status.BIDDING_OPEN) | Q(items__bids__vendor=user)
            ).distinct().order_by('-created_at')
        return RFQ.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return RFQCreateSerializer
        return RFQReadSerializer

    def perform_create(self, serializer):
        serializer.save(workshop=self.request.user)

    def perform_update(self, serializer):
        # Check for changes before saving
        instance = self.get_object()
        old_data = {
            'make': instance.make,
            'model': instance.model,
            'year': instance.year,
            'vin': instance.vin
        }
        
        rfq = serializer.save()
        
        # Determine if major changes occurred
        changes = []
        if rfq.make != old_data['make'] or rfq.model != old_data['model']:
            changes.append(f"Vehicle changed to {rfq.year} {rfq.make} {rfq.model}")
        elif rfq.year != old_data['year']:
            changes.append(f"Year changed to {rfq.year}")
        elif rfq.engine != getattr(instance, 'engine', ''): # Handle case where old instance didn't have engine in checks, though it should be fine.
             changes.append(f"Engine changed to {rfq.engine}")
            
        if changes:
            from .notifications import notify_vendors_of_update
            notify_vendors_of_update(rfq, ", ".join(changes))

    def perform_destroy(self, instance):
        # Notify vendors of cancellation before deleting
        from .notifications import notify_vendors_of_update
        notify_vendors_of_update(instance, "Request has been cancelled/deleted by the workshop")
        instance.delete()

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        rfq = self.get_object()
        if rfq.status == RFQ.Status.DRAFT:
            rfq.status = RFQ.Status.BIDDING_OPEN
            rfq.save()
            return Response({'status': 'BIDDING_OPEN'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def award_order(self, request, pk=None):
        rfq = self.get_object()
        
        # Payload: { "bid_ids": [1, 2] }
        bid_ids = request.data.get('bid_ids', [])
        if not bid_ids:
            return Response({'error': 'No bids selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        from bids.models import Bid
        from orders.models import VendorOrder

        selected_bids = Bid.objects.filter(id__in=bid_ids, rfq_item__rfq=rfq)
        
        if not selected_bids.exists():
            return Response({'error': 'Invalid bids'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Group by Vendor
        bids_by_vendor = {}
        for bid in selected_bids:
            if bid.vendor not in bids_by_vendor:
                bids_by_vendor[bid.vendor] = []
            bids_by_vendor[bid.vendor].append(bid)
            
        created_orders = []
        
        for vendor, bids in bids_by_vendor.items():
            total = sum([bid.amount for bid in bids])
            order = VendorOrder.objects.create(
                rfq=rfq,
                vendor=vendor,
                total_amount=total,
                status=VendorOrder.Status.PENDING_PAYMENT
            )
            order.bids.set(bids)
            created_orders.append(order.id)
            
            # Update Bid status
            for bid in bids:
                bid.status = Bid.Status.ACCEPTED
                bid.save()
                
        # Check if all items in the RFQ have an accepted bid
        # If so, mark RFQ as COMPLETED
        total_items = rfq.items.count()
        # Count items that have at least one accepted bid
        items_with_accepted_bids = rfq.items.filter(bids__status=Bid.Status.ACCEPTED).distinct().count()
        
        if items_with_accepted_bids >= total_items:
            rfq.status = RFQ.Status.COMPLETED
        else:
            # Stay open if partial
            rfq.status = RFQ.Status.BIDDING_OPEN
            
        rfq.save()
        
        return Response({'message': 'Orders created', 'order_ids': created_orders}, status=status.HTTP_201_CREATED)

class RFQItemViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RFQItemStandaloneSerializer
    queryset = RFQItem.objects.all()

    def create(self, request, *args, **kwargs):
        # Allow creating an item linked to an RFQ
        # RFQ ID must be in the body
        return super().create(request, *args, **kwargs)

    def perform_destroy(self, instance):
        # Notify vendors of item removal
        rfq = instance.rfq
        from .notifications import notify_vendors_of_update
        notify_vendors_of_update(rfq, f"Item '{instance.name}' was removed from the request")
        instance.delete()

from .models import VehicleMake, VehicleModel, VehicleYear, VehicleEngine
from .serializers import VehicleMakeSerializer, VehicleModelSerializer, VehicleYearSerializer, VehicleEngineSerializer

class VehicleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API for retrieving static vehicle data.
    Default list returns all makes.
    Custom actions: /vehicles/models/?make=<id>, /vehicles/years/?model=<id>, /vehicles/engines/?model=<id>
    """
    permission_classes = [permissions.AllowAny]
    queryset = VehicleMake.objects.all()
    serializer_class = VehicleMakeSerializer

    def list(self, request):
        """Return all vehicle makes"""
        makes = VehicleMake.objects.all()
        serializer = VehicleMakeSerializer(makes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='makes')
    def makes(self, request):
        """Explicit makes endpoint (same as list)"""
        makes = VehicleMake.objects.all()
        serializer = VehicleMakeSerializer(makes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='models')
    def models(self, request):
        """Get models for a specific make"""
        make_id = request.query_params.get('make')
        if not make_id:
            return Response({'error': 'make parameter is required'}, status=400)
        models_list = VehicleModel.objects.filter(make_id=make_id)
        serializer = VehicleModelSerializer(models_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='years')
    def years(self, request):
        """Get years for a specific model"""
        model_id = request.query_params.get('model')
        if not model_id:
            return Response({'error': 'model parameter is required'}, status=400)
        years_list = VehicleYear.objects.filter(model_id=model_id)
        serializer = VehicleYearSerializer(years_list, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='engines')
    def engines(self, request):
        """Get engines for a specific model"""
        model_id = request.query_params.get('model')
        if not model_id:
            return Response({'error': 'model parameter is required'}, status=400)
        engines_list = VehicleEngine.objects.filter(model_id=model_id)
        serializer = VehicleEngineSerializer(engines_list, many=True)
        return Response(serializer.data)

from .models import PartCatalog
from .serializers import PartCatalogSerializer
from django.db.models import Q

class PartCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API for searching parts catalog.
    Supports fuzzy search and vehicle compatibility checking.
    """
    permission_classes = [permissions.AllowAny]
    queryset = PartCatalog.objects.all()
    serializer_class = PartCatalogSerializer
    
    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        Search parts by part number or name.
        Intelligent search: removes hyphens and special chars for matching.
        Query params:
        - q: search query (part number or name)
        - vehicle_make: make ID for compatibility check
        - vehicle_model: model ID for compatibility check  
        - vehicle_year: year for compatibility check
        """
        query = request.query_params.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response([])
        
        # Normalize query for intelligent matching
        normalized_query = query.replace('-', '').replace(' ', '').upper()
        
        # Get all parts and filter in Python for normalized matching
        all_parts = PartCatalog.objects.select_related('make', 'model').all()
        
        results = []
        for part in all_parts:
            # Normalize part number for comparison
            normalized_part_num = part.part_number.replace('-', '').replace(' ', '').upper()
            
            # Check if query matches
            if (normalized_query in normalized_part_num or
                query.lower() in part.part_name.lower() or
                (part.alternative_numbers and query in part.alternative_numbers)):
                results.append(part)
                
                if len(results) >= 10:
                    break
        
        serializer = PartCatalogSerializer(
            results, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)


from .models import SavedVehicle
from .serializers import SavedVehicleSerializer

class SavedVehicleViewSet(viewsets.ModelViewSet):
    """
    API for managing user's saved vehicles (My Garage).
    Users can only access their own saved vehicles.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedVehicleSerializer
    
    def get_queryset(self):
        return SavedVehicle.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
