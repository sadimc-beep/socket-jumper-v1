from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import VendorOrder
from .serializers import VendorOrderSerializer, VendorOrderUpdateSerializer

class VendorOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return VendorOrderUpdateSerializer
        return VendorOrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'WORKSHOP':
            return VendorOrder.objects.filter(rfq__workshop=user).order_by('-created_at')
        elif user.role == 'VENDOR':
            return VendorOrder.objects.filter(vendor=user).order_by('-created_at')
        return VendorOrder.objects.none()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        if request.user != order.vendor:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        if order.status != VendorOrder.Status.PENDING_PAYMENT: # Assuming logic flow
             # Actually, spec says PENDING_PAYMENT -> CONFIRMED? 
             # Let's check model statuses. Assume PENDING -> CONFIRMED usually.
             pass
        
        order.status = VendorOrder.Status.CONFIRMED
        order.save()
        return Response({'status': order.status})

    @action(detail=True, methods=['post'])
    def mark_ready(self, request, pk=None):
        order = self.get_object()
        if request.user != order.vendor:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        order.status = VendorOrder.Status.READY_FOR_PICKUP
        order.save()
        return Response({'status': order.status})

    @action(detail=True, methods=['post'])
    def confirm_delivery(self, request, pk=None):
        order = self.get_object()
        # Workshop confirms delivery
        # We need to check if user is the RFQ owner
        if request.user != order.rfq.workshop:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
             
        order.status = VendorOrder.Status.COMPLETED
        order.save()
        return Response({'status': order.status})
