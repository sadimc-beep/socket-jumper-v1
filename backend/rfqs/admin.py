from django.contrib import admin
from .models import RFQ, RFQItem, RFQItemImage, VehicleMake, VehicleModel, VehicleYear

class RFQItemInline(admin.TabularInline):
    model = RFQItem
    extra = 0

@admin.register(RFQ)
class RFQAdmin(admin.ModelAdmin):
    list_display = ('id', 'workshop', 'year', 'make', 'model', 'status', 'created_at')
    list_filter = ('status', 'make')
    search_fields = ('vin', 'make', 'model', 'workshop__username', 'workshop__shop_name')
    inlines = [RFQItemInline]

@admin.register(RFQItem)
class RFQItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'rfq', 'name', 'quantity')

@admin.register(VehicleMake)
class VehicleMakeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

@admin.register(VehicleModel)
class VehicleModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'make', 'created_at')
    list_filter = ('make',)
    search_fields = ('name', 'make__name')

@admin.register(VehicleYear)
class VehicleYearAdmin(admin.ModelAdmin):
    list_display = ('year', 'model')
    list_filter = ('year', 'model__make')
    search_fields = ('year', 'model__name')

from .models import PartCatalog

@admin.register(PartCatalog)
class PartCatalogAdmin(admin.ModelAdmin):
    list_display = ('part_number', 'part_name', 'make', 'model', 'year_from', 'year_to', 'is_oem')
    list_filter = ('make', 'is_oem', 'category')
    search_fields = ('part_number', 'part_name', 'alternative_numbers')
    autocomplete_fields = ['make', 'model']


from .models import SavedVehicle

@admin.register(SavedVehicle)
class SavedVehicleAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'make_name', 'model_name', 'year', 'customer_name', 'get_registration_display', 'created_at')
    list_filter = ('make_name', 'year')
    search_fields = ('user__username', 'make_name', 'model_name', 'customer_name', 'vin', 'reg_city', 'nickname')
    readonly_fields = ('created_at', 'updated_at')
