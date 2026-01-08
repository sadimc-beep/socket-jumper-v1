from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        WORKSHOP = 'WORKSHOP', 'Workshop'
        VENDOR = 'VENDOR', 'Vendor'
        LOGISTICS = 'LOGISTICS', 'Logistics'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.WORKSHOP)
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    # Profile Fields
    shop_name = models.CharField(max_length=100, blank=True)
    shop_address = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    rating_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True) # Arbitrary data for navigation (e.g. { "rfq_id": 123 })
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.username}: {self.title}"
