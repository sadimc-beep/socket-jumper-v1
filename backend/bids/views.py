from rest_framework import viewsets, permissions, views, generics
from rest_framework.response import Response
from .models import Bid
from rfqs.models import RFQ
from .serializers import BidSerializer
from rfqs.serializers import RFQReadSerializer

class BidViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BidSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Bid.objects.none()

        if user.role == 'VENDOR':
            queryset = Bid.objects.filter(vendor=user)
        elif user.role == 'WORKSHOP':
            # Workshop can see all bids for their RFQs
            queryset = Bid.objects.filter(rfq_item__rfq__workshop=user)
        
        # Filter by RFQ ID if provided
        rfq_id = self.request.query_params.get('rfq')
        if rfq_id:
            queryset = queryset.filter(rfq_item__rfq_id=rfq_id)
            
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class RFQFeedView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RFQReadSerializer

    def get_queryset(self):
        # Vendors see all Open RFQs
        return RFQ.objects.filter(status=RFQ.Status.BIDDING_OPEN).order_by('-updated_at')
