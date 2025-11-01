from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Worker, AssignedTask
from .serializers import WorkerSerializer, AssignedTaskSerializer

class TaskassignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        complaint_id=request.data.get('complaint_id')
        worker_id=request.data.get('worker_id')
        if not complaint_id or not worker_id:   
            return Response({"error": "complaint_id and worker_id are required"}, status=400)
        
        
        task = AssignedTask.objects.create(worker=worker_id,complaint=complaint_id)
        task.save()
        serializer = AssignedTaskSerializer(task)
        return Response(serializer.data)

class AllWorkersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workers = Worker.objects.all()
        serializer = WorkerSerializer(workers, many=True)
        return Response(serializer.data)

class AllTasksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tasks = AssignedTask.objects.all()
        serializer = AssignedTaskSerializer(tasks, many=True)
        return Response(serializer.data)

class WorkerAssignedTasksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, worker_id):
        tasks = AssignedTask.objects.filter(worker_id=worker_id)
        serializer = AssignedTaskSerializer(tasks, many=True)
        return Response(serializer.data)

class AssignedTasksByWorkerAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        worker_id = request.query_params.get('worker_id')
        if not worker_id:
            return Response({"error": "worker_id is required"}, status=400)
        tasks = AssignedTask.objects.filter(worker_id=worker_id)
        serializer = AssignedTaskSerializer(tasks, many=True)
        return Response(serializer.data)