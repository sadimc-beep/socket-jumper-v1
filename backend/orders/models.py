from django.db import models
from django.conf import settings

class VendorOrder(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = 'PENDING_PAYMENT', 'Pending Payment'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', 'Ready for Pickup'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery' # If delivery
        COMPLETED = 'COMPLETED', 'Completed'
        DISPUTED = 'DISPUTED', 'Disputed'

    rfq = models.ForeignKey('rfqs.RFQ', on_delete=models.CASCADE, related_name='orders')
    vendor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vendor_orders')
    
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING_PAYMENT)
    
    # Bids included in this order
    bids = models.ManyToManyField('bids.Bid', related_name='order')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.vendor}"
