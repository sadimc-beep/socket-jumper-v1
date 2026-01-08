import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from orders.models import VendorOrder
from bids.models import Bid
from rfqs.models import RFQ
from django.db import transaction

def reset():
    print("WARNING: This script will WIPE all RFQs, Orders, and Bids.")
    
    with transaction.atomic():
        print("Deleting Vendor Orders...")
        count_orders = VendorOrder.objects.all().delete()[0]
        print(f"  Deleted {count_orders} orders.")
        
        print("Deleting Bids...")
        count_bids = Bid.objects.all().delete()[0]
        print(f"  Deleted {count_bids} bids.")
        
        print("Deleting RFQs...")
        count_rfqs = RFQ.objects.all().delete()[0]
        print(f"  Deleted {count_rfqs} RFQs.")

    print("Data reset complete!")

if __name__ == "__main__":
    reset()
