from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUserRole
from .models import Profile
from .serializers import UserSerializer, ProfileSerializer

class AddWorkerOrUserAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def post(self, request):
        user_serializer = UserSerializer(data=request.data.get('user'))
        profile_serializer = ProfileSerializer(data=request.data.get('profile'))

        if user_serializer.is_valid() and profile_serializer.is_valid():
            user = user_serializer.save()
            profile_data = profile_serializer.validated_data
            Profile.objects.create(user=user, **profile_data)
            return Response({"message": "User and profile created successfully."}, status=201)
        errors = {
            "user_errors": user_serializer.errors,
            "profile_errors": profile_serializer.errors,
        }
        return Response(errors, status=400)
    
    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class CurrentUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminUserRole
from .serializers import UserSerializer, ProfileSerializer

class ListAllUsersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        user_data = []
        for user in users:
            profile = Profile.objects.filter(user=user).first()
            user_serializer = UserSerializer(user)
            profile_serializer = ProfileSerializer(profile)
            user_data.append({
                "user": user_serializer.data,
                "profile": profile_serializer.data if profile else None
            })
        return Response(user_data, status=200)