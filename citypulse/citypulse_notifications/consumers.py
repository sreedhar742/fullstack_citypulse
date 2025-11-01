# citypulse_notifications/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        # Anonymous users can't connect
        if self.user.is_anonymous:
            await self.close()
            return
        
        # Each user gets their own notification group
        self.notification_group_name = f"user_{self.user.id}_notifications"
        
        # Join room group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        print("Connected to notification group:", self.notification_group_name)
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'notification_group_name'):
            await self.channel_layer.group_discard(
                self.notification_group_name,
                self.channel_name
            )
    
    # Receive message from WebSocket
    async def receive(self, text_data):
        # We could handle client-to-server messages here if needed
        pass
    
    # Receive message from notification group
    async def notification_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event["content"]))

    @database_sync_to_async
    def get_notification_count(self):
        from citypulse_notifications.models import Notification
        return Notification.objects.filter(user=self.user, is_read=False).count()