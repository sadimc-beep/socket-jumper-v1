from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'phone_number', 'role', 'is_verified', 'is_active', 'shop_name', 'shop_address', 'rating', 'rating_count']
        read_only_fields = ['id', 'username', 'role', 'is_verified', 'is_active', 'rating', 'rating_count']

class OTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=True)

class OTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15, required=True)
    otp = serializers.CharField(max_length=4, required=True)
