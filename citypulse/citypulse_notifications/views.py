from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from django.utils.timezone import now, timedelta

class NotificationsByUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class UnreadNotificationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user, is_read=False)
        
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class NotificationsByTimeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, days):
        time_threshold = now() - timedelta(days=days)
        notifications = Notification.objects.filter(user=request.user, created_at__gte=time_threshold)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)




# Add to your existing views.py
class MarkNotificationAsReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id=None):
        if notification_id:
            # Mark specific notification as read
            try:
                notification = Notification.objects.get(id=notification_id, user=request.user)
                notification.is_read = True
                notification.save()
                return Response({"status": "success", "message": "Notification marked as read"})
            except Notification.DoesNotExist:
                return Response({"status": "error", "message": "Notification not found"}, status=404)
        else:
            # Mark all as read
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({"status": "success", "message": "All notifications marked as read"})