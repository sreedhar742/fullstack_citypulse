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

from citypulse_notifications.models import Notification
from django.contrib.auth.models import User

class ComplaintCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # print(request.data)
        title=request.data.get('title')
    
        serializer = ComplaintSerializer(data=request.data)
        
        if serializer.is_valid():
            # serializer.save(user=request.user)
            Notification.objects.create(
                user=request.user,  # assuming complaint.user is the creator
                message=f"Your complaint '{title}' has been submitted.",
            )
            admins = User.objects.filter(profile__role='admin')
            for admin in admins:
                Notification.objects.create(
                    user=admin,
                    message=f"New complaint '{title}' created by {request.user.username}.",
                )
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
