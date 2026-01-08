from rest_framework import serializers
from .models import Bid
from rfqs.serializers import RFQReadSerializer

class BidSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    vendor_shop_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    vendor_rating = serializers.DecimalField(source='vendor.rating', max_digits=3, decimal_places=2, read_only=True)
    item_name = serializers.CharField(source='rfq_item.name', read_only=True)
    item_quantity = serializers.IntegerField(source='rfq_item.quantity', read_only=True)
    
    class Meta:
        model = Bid
        fields = ['id', 'rfq_item', 'item_name', 'item_quantity', 'vendor_name', 'vendor_shop_name', 'vendor_rating', 'amount', 'part_category', 'brand', 'availability', 'eta', 'remarks', 'status', 'created_at']
        read_only_fields = ['id', 'vendor_name', 'status', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Bid amount must be positive.")
        return value
