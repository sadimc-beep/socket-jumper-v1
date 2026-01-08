from rest_framework import serializers
from .models import VendorOrder
from bids.serializers import BidSerializer

class VendorOrderSerializer(serializers.ModelSerializer):
    bids = BidSerializer(many=True, read_only=True)
    vendor_name = serializers.CharField(source='vendor.username', read_only=True)
    vendor_shop_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    rfq_vin = serializers.CharField(source='rfq.vin', read_only=True) # Corrected source from rfq.vehicle_vin to rfq.vin
    rfq_details = serializers.SerializerMethodField()

    rfq_workshop_name = serializers.CharField(source='rfq.workshop.shop_name', read_only=True) # Assuming shop_name is on User
    # Fallback to username if shop_name is empty - handled in frontend or we can use SerializerMethodField

    def get_rfq_details(self, obj):
        return f"{obj.rfq.make} {obj.rfq.model} {obj.rfq.year}"

    class Meta:
        model = VendorOrder
        fields = ['id', 'rfq', 'rfq_vin', 'rfq_details', 'rfq_workshop_name', 'vendor', 'vendor_name', 'vendor_shop_name', 'total_amount', 'status', 'bids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'rfq', 'vendor', 'total_amount', 'bids', 'created_at', 'updated_at']

class VendorOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorOrder
        fields = ['status']
