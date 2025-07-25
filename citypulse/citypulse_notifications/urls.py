from django.urls import path
from .views import NotificationsByUserAPIView, UnreadNotificationsAPIView, NotificationsByTimeAPIView

urlpatterns = [
    path('notifications/user/', NotificationsByUserAPIView.as_view(), name='notifications-by-user'),
    path('notifications/unread/', UnreadNotificationsAPIView.as_view(), name='unread-notifications'),
    path('notifications/time/<int:days>/', NotificationsByTimeAPIView.as_view(), name='notifications-by-time'),
]