from django.urls import path
from .views import (
    AllComplaintsView,
    UserComplaintsView,
    ComplaintStatusView,
    ComplaintCreateView
)

urlpatterns = [
    path('complaints/', AllComplaintsView.as_view(), name='all-complaints'),
    path('complaints/user/', UserComplaintsView.as_view(), name='user-complaints'),
    path('complaints/<int:complaint_id>/status/', ComplaintStatusView.as_view(), name='complaint-status'),
    path('complaints-create/', ComplaintCreateView.as_view(), name='create-complaint'),
]
