# Updated urls.py with mark-as-read endpoints
from django.urls import path
from .views import (
    NotificationsByUserAPIView, 
    UnreadNotificationsAPIView, 
    NotificationsByTimeAPIView,
    MarkNotificationAsReadAPIView  # New view we'll create
)

urlpatterns = [
    path('notifications/user/', NotificationsByUserAPIView.as_view(), name='notifications-by-user'),
    path('notifications/unread/', UnreadNotificationsAPIView.as_view(), name='unread-notifications'),
    path('notifications/time/<int:days>/', NotificationsByTimeAPIView.as_view(), name='notifications-by-time'),
    # New endpoints
    path('notifications/mark-read/', MarkNotificationAsReadAPIView.as_view(), name='mark-all-read'),
    path('notifications/mark-read/<int:notification_id>/', MarkNotificationAsReadAPIView.as_view(), name='mark-notification-read'),
]