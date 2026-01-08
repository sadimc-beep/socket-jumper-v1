from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Bid
from .serializers import BidSerializer

@receiver(post_save, sender=Bid)
def bid_saved(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        group_name = f'rfq_{instance.rfq_item.rfq.id}'
        
        # Serialize the bid
        serializer = BidSerializer(instance)
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'bid_placed',
                'bid': serializer.data
            }
        )
