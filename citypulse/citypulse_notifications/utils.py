# Add to a new file: citypulse_notifications/utils.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer
import json

def send_notification(user, message, complaint=None):
    """
    Create a notification in the database and send it via WebSocket
    """
    # Create notification in database
    notification = Notification.objects.create(
        user=user,
        message=message,
        complaint=complaint
    )
    
    # Serialize for WebSocket
    serializer = NotificationSerializer(notification)
    
    # Send to WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}_notifications",
        {
            "type": "notification_message",
            "content": serializer.data
        }
    )
    print("Notification sent:", user.username, message)
    return notification