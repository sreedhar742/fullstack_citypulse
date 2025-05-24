from django.urls import path
from .views import AddWorkerOrUserAPIView, ListAllUsersAPIView,CurrentUserAPIView

urlpatterns = [
    path('add-worker-or-user/', AddWorkerOrUserAPIView.as_view(), name='add-worker-or-user'),
    path('list-all-users/', ListAllUsersAPIView.as_view(), name='list-all-users'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
]