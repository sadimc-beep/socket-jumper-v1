import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/minhazchowdhury/dev/socket-jumper-v1/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import User
from rfqs.models import RFQ
import random

def populate_data():
    print("Populating User Profile Data...")
    
    # Update Workshop Users
    workshops = User.objects.filter(role='WORKSHOP')
    for w in workshops:
        if not w.shop_name:
            w.shop_name = f"{w.username.capitalize()} Auto Care"
            w.shop_address = "123 Tejgaon Industrial Area, Dhaka"
            w.rating = 4.8
            w.rating_count = 120
            w.save()
            print(f"Updated Workshop: {w.username}")

    # Update Vendor Users
    vendors = User.objects.filter(role='VENDOR')
    for v in vendors:
        if not v.shop_name:
            v.shop_name = f"{v.username.capitalize()} Spares & Co."
            v.shop_address = "45 Dholaikhal, Old Dhaka"
            v.rating = 4.5
            v.rating_count = 85
            v.save()
            print(f"Updated Vendor: {v.username}")
            
    # Check RFQs status
    print("\nChecking RFQs...")
    rfqs = RFQ.objects.all()
    bindding_open = rfqs.filter(status='BIDDING_OPEN').count()
    completed = rfqs.filter(status='COMPLETED').count()
    print(f"Total: {rfqs.count()}, Open: {bindding_open}, Completed: {completed}")

if __name__ == '__main__':
    populate_data()
