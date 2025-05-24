from django.urls import path
from .views import (
    AllWorkersAPIView,
    AllTasksAPIView,
    WorkerAssignedTasksAPIView,
    AssignedTasksByWorkerAPIView,
)

urlpatterns = [
    path('workers/', AllWorkersAPIView.as_view(), name='all-workers'),
    path('tasks/', AllTasksAPIView.as_view(), name='all-tasks'),
    path('tasks/worker/<int:worker_id>/', WorkerAssignedTasksAPIView.as_view(), name='worker-assigned-tasks'),
    path('tasks/assigned/', AssignedTasksByWorkerAPIView.as_view(), name='assigned-tasks-by-worker'),
]