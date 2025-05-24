from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Complaint,ComplaintStatus
from .serializers import ComplaintStatusSerializer
from .serializers import ComplaintSerializer

class AllComplaintsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        complaints = Complaint.objects.all()
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
    
    
class UserComplaintsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_complaints = Complaint.objects.filter(user=request.user)
        serializer = ComplaintSerializer(user_complaints, many=True)
        return Response(serializer.data)
    
    
class ComplaintStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, complaint_id):
        statuses = ComplaintStatus.objects.filter(complaint_id=complaint_id)
        serializer = ComplaintStatusSerializer(statuses, many=True)
        return Response(serializer.data)
