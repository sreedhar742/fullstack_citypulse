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
        statuses = Complaint.objects.filter(id=complaint_id)
        serializer = ComplaintSerializer(statuses, many=True)
        return Response(serializer.data)

import base64
class ComplaintCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Received data for complaint creation:", request.data)
        # if 'image' in request.data:
        #     print("image data found")
        #     request.data['image']=base64.b64encode(request.data['image'].read()).decode('utf-8')
        #     print("encode image data")
        #     print(request.data['image'][:100])
        serializer = ComplaintSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)