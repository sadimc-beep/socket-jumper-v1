from django.db import models
from django.conf import settings

class VehicleMake(models.Model):
    name = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='vehicle_logos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class VehicleModel(models.Model):
    make = models.ForeignKey(VehicleMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.make.name} {self.name}"
    
    class Meta:
        ordering = ['name']
        unique_together = ['make', 'name']

class VehicleEngine(models.Model):
    model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE, related_name='engines')
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model.make.name} {self.model.name} - {self.name}"

    class Meta:
        ordering = ['name']
        unique_together = ['model', 'name']

class VehicleYear(models.Model):
    model = models.ForeignKey(VehicleModel, on_delete=models.CASCADE, related_name='years')
    year = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model} ({self.year})"

    class Meta:
        ordering = ['-year']
        unique_together = ['model', 'year']

class PartCatalog(models.Model):
    """
    Catalog of real OEM and aftermarket parts with vehicle compatibility.
    Part numbers are actual manufacturer part numbers.
    """
    part_number = models.CharField(max_length=100, db_index=True, help_text="Manufacturer part number")
    part_name = models.CharField(max_length=200, help_text="Common name of the part")
    
    # Vehicle Compatibility (null = universal part)
    make = models.ForeignKey(VehicleMake, null=True, blank=True, on_delete=models.SET_NULL, related_name='parts')
    model = models.ForeignKey(VehicleModel, null=True, blank=True, on_delete=models.SET_NULL, related_name='parts')
    year_from = models.PositiveIntegerField(null=True, blank=True, help_text="First compatible year")
    year_to = models.PositiveIntegerField(null=True, blank=True, help_text="Last compatible year")
    
    # Part Metadata
    category = models.CharField(max_length=50, blank=True, help_text="e.g., Brake System, Engine")
    manufacturer = models.CharField(max_length=100, blank=True, help_text="OEM or aftermarket brand")
    is_oem = models.BooleanField(default=True, help_text="True if genuine OEM part")
    
    # Alternative/Cross-reference part numbers
    alternative_numbers = models.TextField(blank=True, help_text="Comma-separated alternative part numbers")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.part_number} - {self.part_name}"
    
    def is_compatible_with(self, make_id, model_id, year):
        """Check if this part is compatible with given vehicle"""
        # Universal parts (no restrictions)
        if not self.make and not self.model:
            return True
        
        # If part has make restriction, check it
        if self.make_id:
            if not make_id or self.make_id != make_id:
                return False
        
        # If part has model restriction, check it
        if self.model_id:
            if not model_id or self.model_id != model_id:
                return False
        
        # Check year range if specified
        if year:
            year_int = int(year) if isinstance(year, str) else year
            if self.year_from and year_int < self.year_from:
                return False
            if self.year_to and year_int > self.year_to:
                return False
        
        return True
    
    class Meta:
        ordering = ['part_number']
        indexes = [
            models.Index(fields=['part_number']),
            models.Index(fields=['make', 'model']),
            models.Index(fields=['year_from', 'year_to']),
        ]
        verbose_name = "Part Catalog Entry"
        verbose_name_plural = "Part Catalog"


class SavedVehicle(models.Model):
    """
    User's saved vehicles for My Garage feature.
    Allows quick RFQ creation from saved vehicle details.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_vehicles')
    
    # Vehicle identification - at least one required
    vin = models.CharField(max_length=17, blank=True, help_text="Vehicle Identification Number")
    reg_city = models.CharField(max_length=50, blank=True, help_text="e.g., DHAKA METRO")
    reg_series = models.CharField(max_length=10, blank=True, help_text="e.g., GHA, KA")
    reg_number1 = models.IntegerField(null=True, blank=True, help_text="First number part")
    reg_number2 = models.IntegerField(null=True, blank=True, help_text="Second number part")
    
    # Vehicle details
    make_id = models.IntegerField()
    make_name = models.CharField(max_length=100)
    model_id = models.IntegerField()
    model_name = models.CharField(max_length=100)
    year = models.IntegerField()
    engine = models.CharField(max_length=100, blank=True)
    
    # Customer details
    customer_name = models.CharField(max_length=200, help_text="Vehicle owner name")
    customer_phone = models.CharField(max_length=20, blank=True)
    
    # Optional nickname for easy identification
    nickname = models.CharField(max_length=100, blank=True, help_text="e.g., Dad's Car, Office Van")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        if self.nickname:
            return f"{self.nickname} ({self.make_name} {self.model_name})"
        return f"{self.make_name} {self.model_name} {self.year}"
    
    def get_registration_display(self):
        """Returns formatted registration number if available"""
        if self.reg_city and self.reg_series:
            parts = [self.reg_city, self.reg_series]
            if self.reg_number1:
                parts.append(str(self.reg_number1))
            if self.reg_number2:
                parts.append(str(self.reg_number2))
            return "-".join(parts)
        return self.vin if self.vin else "No registration"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Saved Vehicle"
        verbose_name_plural = "Saved Vehicles"


class RFQ(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        BIDDING_OPEN = 'BIDDING_OPEN', 'Bidding Open'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    workshop = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rfqs')
    vin = models.CharField(max_length=17, blank=True)
    
    # Optional vehicle details
    make = models.CharField(max_length=50, blank=True)
    model = models.CharField(max_length=50, blank=True)
    year = models.PositiveIntegerField(null=True, blank=True)
    trim = models.CharField(max_length=50, blank=True, help_text="e.g. XLE, Sport")
    engine = models.CharField(max_length=100, blank=True)
    
    # Registration details (Optional)
    reg_city = models.CharField(max_length=50, blank=True)
    reg_series = models.CharField(max_length=10, blank=True)
    reg_number1 = models.IntegerField(null=True, blank=True)
    reg_number2 = models.IntegerField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model} - {self.get_status_display()}"

class RFQItem(models.Model):
    class Category(models.TextChoices):
        OEM = 'GENUINE_OEM', 'Genuine OEM'
        AFTERMARKET_BRANDED = 'AFTERMARKET_BRANDED', 'Aftermarket (Branded)'
        AFTERMARKET_UNBRANDED = 'AFTERMARKET_UNBRANDED', 'Aftermarket (Unbranded)'
        USED = 'USED_RECONDITIONED', 'Used/Reconditioned'
        ANY = 'ANY', 'Any'

    class EntryMethod(models.TextChoices):
        MANUAL = 'MANUAL', 'Manual'
        PHOTO = 'PHOTO', 'Photo'

    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=100) # Or part number
    part_number = models.CharField(max_length=100, blank=True, help_text="OEM or aftermarket part number")
    quantity = models.PositiveIntegerField(default=1)
    entry_method = models.CharField(max_length=10, choices=EntryMethod.choices, default=EntryMethod.MANUAL)
    preferred_category = models.CharField(max_length=30, choices=Category.choices, default=Category.ANY)
    
    # Specifics
    side = models.CharField(max_length=20, blank=True, help_text="e.g. LH, RH")
    color = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} (Qty: {self.quantity})"

class RFQItemImage(models.Model):
    item = models.ForeignKey(RFQItem, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='rfq_items/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
