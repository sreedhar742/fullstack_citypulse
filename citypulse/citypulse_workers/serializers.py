from rest_framework import serializers
from .models import Worker, AssignedTask

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = ['id', 'name', 'phone', 'email', 'specialization', 'active']

class AssignedTaskSerializer(serializers.ModelSerializer):
    worker = WorkerSerializer(read_only=True)

    class Meta:
        model = AssignedTask
        fields = ['id', 'worker', 'complaint', 'assigned_at', 'completed_at']