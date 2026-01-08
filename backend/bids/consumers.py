import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BidConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.rfq_id = self.scope['url_route']['kwargs']['rfq_id']
        self.room_group_name = f'rfq_{self.rfq_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def bid_placed(self, event):
        bid = event['bid']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'bid_placed',
            'bid': bid
        }))
