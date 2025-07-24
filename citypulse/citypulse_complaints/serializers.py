from rest_framework import serializers
from .models import Complaint

from rest_framework import serializers
from .models import Complaint, User

class ComplaintSerializer(serializers.ModelSerializer):
    """
    Serializer for the Complaint model.
    Handles validation and conversion of complaint data.
    """
    # Make image field explicitly optional
    image = serializers.ImageField(required=False, allow_null=True)
    
    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ('user', 'created_at')  # These fields are set by the server
    
    def to_internal_value(self, data):
        """
        Handle edge cases in input data before validation.
        - Remove empty image objects
        - Convert empty strings to None for optional fields
        """
        # Make a mutable copy if it's not already
        if hasattr(data, '_mutable'):
            data._mutable = True
        
        # Handle empty image objects
        if data.get('image') == {} or data.get('image') == '':
            data.pop('image', None)
        
        return super().to_internal_value(data)
    
    def validate(self, attrs):
        """
        Custom validation for coordinate fields.
        """
        # Validate lat/lng values
        if 'location_lat' in attrs:
            lat = float(attrs['location_lat'])
            if lat < -90 or lat > 90:
                raise serializers.ValidationError(
                    {'location_lat': 'Latitude must be between -90 and 90 degrees.'}
                )
        
        if 'location_lng' in attrs:
            lng = float(attrs['location_lng'])
            if lng < -180 or lng > 180:
                raise serializers.ValidationError(
                    {'location_lng': 'Longitude must be between -180 and 180 degrees.'}
                )
        
        return attrs
from .models import ComplaintStatus

class ComplaintStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintStatus
        fields = '__all__'
