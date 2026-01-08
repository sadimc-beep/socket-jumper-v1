from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.core.cache import cache
from .serializers import OTPRequestSerializer, OTPVerifySerializer, UserSerializer
import random
import uuid

User = get_user_model()

class OTPRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            
            # Generate 4 digit code
            otp = str(random.randint(1000, 9999))
            
            # Store in cache (valid for 5 mins)
            cache_key = f"otp_{phone}"
            cache.set(cache_key, otp, timeout=300)
            
            # In production, send SMS here. For dev, return it.
            return Response({
                "message": "OTP sent successfully",
                "otp": otp # DEV ONLY
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            phone = serializer.validated_data['phone_number']
            incoming_otp = serializer.validated_data['otp']
            
            cache_key = f"otp_{phone}"
            cached_otp = cache.get(cache_key)
            
            if cached_otp == incoming_otp:
                # Get or Create User
                user, created = User.objects.get_or_create(
                    phone_number=phone,
                    defaults={'username': phone, 'role': User.Role.WORKSHOP} # Default to Workshop for now, logic can change
                )
                
                # Delete OTP
                cache.delete(cache_key)
                
                # Verify user
                if not user.is_verified:
                    user.is_verified = True
                    user.save()

                # Generate Token
                token, _ = Token.objects.get_or_create(user=user)
                
                return Response({
                    "token": token.key,
                    "user": UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            
            return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DevLoginView(views.APIView):
    """
    Development only view to bypass OTP and login directly with phone number.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone_number')
        role = request.data.get('role', 'WORKSHOP') # Default to Workshop

        if not phone:
             return Response({"error": "Phone number required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get or Create User
        user, created = User.objects.get_or_create(
            phone_number=phone,
            defaults={'username': phone, 'role': role}
        )
        
        # Verify user automatically
        if not user.is_verified:
            user.is_verified = True
            user.save()

        # Generate Token
        token, _ = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class UserMeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
from rest_framework import viewsets
from rest_framework.decorators import action

class AdminVendorViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.filter(role=User.Role.VENDOR)

    def get_queryset(self):
        # Ensure we only return vendors
        return User.objects.filter(role=User.Role.VENDOR).order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        vendor = self.get_object()
        vendor.is_verified = True
        vendor.save()
        return Response({'status': 'Vendor Approved', 'is_verified': True})

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        vendor = self.get_object()
        vendor.is_active = False # Or is_verified = False depending on biz logic
        vendor.save()
        return Response({'status': 'Vendor Suspended', 'is_active': False})
