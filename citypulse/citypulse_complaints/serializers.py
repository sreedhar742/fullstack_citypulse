from rest_framework import serializers
from .models import Complaint

from rest_framework import serializers
from .models import Complaint, User
from rest_framework import serializers
import base64
from rest_framework import serializers
from .models import Complaint

from rest_framework import serializers
import base64
from .models import Complaint

class ComplaintSerializer(serializers.ModelSerializer):
    # Use CharField to accept base64 string input
    image = serializers.CharField(required=False, allow_null=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def create(self, validated_data):
        image_base64 = validated_data.pop('image', None)
        if image_base64 and isinstance(image_base64, str):
            try:
                header, base64_data = image_base64.split(',', 1) if ',' in image_base64 else ('', image_base64)
                validated_data['image'] = base64.b64decode(base64_data)
            except Exception:
                raise serializers.ValidationError({'image': 'Invalid base64 image data.'})
        return Complaint.objects.create(**validated_data)

    def update(self, instance, validated_data):
        image_base64 = validated_data.pop('image', None)
        if image_base64 and isinstance(image_base64, str):
            try:
                header, base64_data = image_base64.split(',', 1) if ',' in image_base64 else ('', image_base64)
                validated_data['image'] = base64.b64decode(base64_data)
            except Exception:
                raise serializers.ValidationError({'image': 'Invalid base64 image data.'})
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = 'data:image/jpeg;base64,' + base64.b64encode(instance.image).decode()
        return rep

from .models import ComplaintStatus

class ComplaintStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintStatus
        fields = '__all__'
