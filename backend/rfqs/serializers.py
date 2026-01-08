from rest_framework import serializers
from .models import RFQ, RFQItem, VehicleMake, VehicleModel, VehicleYear, SavedVehicle, VehicleEngine

class VehicleMakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleMake
        fields = ['id', 'name', 'logo']

class VehicleModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleModel
        fields = ['id', 'name', 'make']

class VehicleYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleYear
        fields = ['id', 'year', 'model']

class VehicleEngineSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleEngine
        fields = ['id', 'name', 'model']

class SavedVehicleSerializer(serializers.ModelSerializer):
    registration_display = serializers.CharField(source='get_registration_display', read_only=True)
    
    class Meta:
        model = SavedVehicle
        fields = [
            'id', 'vin', 'reg_city', 'reg_series', 'reg_number1', 'reg_number2',
            'make_id', 'make_name', 'model_id', 'model_name', 'year', 'engine',
            'customer_name', 'customer_phone', 'nickname',
            'registration_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'registration_display']


from .models import PartCatalog

class PartCatalogSerializer(serializers.ModelSerializer):
    is_compatible = serializers.SerializerMethodField()
    make_name = serializers.CharField(source='make.name', read_only=True)
    model_name = serializers.CharField(source='model.name', read_only=True)
    
    class Meta:
        model = PartCatalog
        fields = [
            'id', 'part_number', 'part_name', 'make', 'make_name', 
            'model', 'model_name', 'year_from', 'year_to',
            'category', 'manufacturer', 'is_oem', 'is_compatible'
        ]
    
    def get_is_compatible(self, obj):
        """Check compatibility with vehicle from context"""
        request = self.context.get('request')
        if not request:
            return None
        
        make_id = request.query_params.get('vehicle_make')
        model_id = request.query_params.get('vehicle_model')
        year = request.query_params.get('vehicle_year')
        
        if not (make_id or model_id or year):
            return None  # No vehicle specified
        
        try:
            make_id = int(make_id) if make_id else None
            model_id = int(model_id) if model_id else None
            year = int(year) if year else None
            return obj.is_compatible_with(make_id, model_id, year)
        except (ValueError, TypeError):
            return None


class RFQItemSerializer(serializers.ModelSerializer):
    my_bid = serializers.SerializerMethodField()
    winning_bid_id = serializers.SerializerMethodField()

    class Meta:
        model = RFQItem
        fields = ['id', 'name', 'part_number', 'quantity', 'entry_method', 'preferred_category', 'side', 'color', 'notes', 'my_bid', 'winning_bid_id']

    def get_my_bid(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'VENDOR':
            bid = obj.bids.filter(vendor=request.user).first()
            if bid:
                 from bids.serializers import BidSerializer
                 return BidSerializer(bid).data
        return None

    def get_winning_bid_id(self, obj):
        # Return ID of the accepted bid if any
        from bids.models import Bid
        bid = obj.bids.filter(status=Bid.Status.ACCEPTED).first()
        return bid.id if bid else None

class RFQItemStandaloneSerializer(serializers.ModelSerializer):
    class Meta:
        model = RFQItem
        fields = ['id', 'rfq', 'name', 'part_number', 'quantity', 'entry_method', 'preferred_category', 'side', 'color', 'notes']

class RFQReadSerializer(serializers.ModelSerializer):
    items = RFQItemSerializer(many=True, read_only=True)
    workshop_name = serializers.CharField(source='workshop.username', read_only=True)
    workshop_shop_name = serializers.CharField(source='workshop.shop_name', read_only=True)
    workshop_rating = serializers.DecimalField(source='workshop.rating', max_digits=3, decimal_places=2, read_only=True)
    workshop_address = serializers.CharField(source='workshop.shop_address', read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)
    
    class Meta:
        model = RFQ
        fields = ['id', 'workshop_name', 'workshop_shop_name', 'workshop_rating', 'workshop_address', 
                  'vin', 'make', 'model', 'year', 'trim', 'engine', 
                  'reg_city', 'reg_series', 'reg_number1', 'reg_number2',
                  'status', 'created_at', 'items', 'item_count']

class RFQCreateSerializer(serializers.ModelSerializer):
    items = RFQItemSerializer(many=True, required=False)

    class Meta:
        model = RFQ
        fields = ['id', 'vin', 'make', 'model', 'year', 'trim', 'engine', 'reg_city', 'reg_series', 'reg_number1', 'reg_number2', 'items']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        rfq = RFQ.objects.create(**validated_data)
        for item_data in items_data:
            RFQItem.objects.create(rfq=rfq, **item_data)
        return rfq
