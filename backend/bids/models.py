from django.db import models
from django.conf import settings

class Bid(models.Model):
    class Category(models.TextChoices):
        # Vendors must be specific
        OEM = 'GENUINE_OEM', 'Genuine OEM'
        AFTERMARKET_BRANDED = 'AFTERMARKET_BRANDED', 'Aftermarket (Branded)'
        AFTERMARKET_UNBRANDED = 'AFTERMARKET_UNBRANDED', 'Aftermarket (Unbranded)'
        USED = 'USED_RECONDITIONED', 'Used/Reconditioned'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'

    rfq_item = models.ForeignKey('rfqs.RFQItem', on_delete=models.CASCADE, related_name='bids')
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bids')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    part_category = models.CharField(max_length=30, choices=Category.choices)
    brand = models.CharField(max_length=50, blank=True, help_text="Brand name if applicable")
    availability = models.BooleanField(default=True)
    eta = models.CharField(max_length=50, blank=True, help_text="e.g. 2 hours, 1 day")
    remarks = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vendor} - {self.amount}"
