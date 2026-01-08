from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import OTPRequestView, OTPVerifyView, AdminVendorViewSet, DevLoginView, UserMeView
from rfqs.views import RFQViewSet, RFQItemViewSet, VehicleViewSet, PartCatalogViewSet, SavedVehicleViewSet
from rfqs.pdf_views import RFQPDFView
from bids.views import BidViewSet, RFQFeedView
from orders.views import VendorOrderViewSet

router = DefaultRouter()
router.register(r'rfqs', RFQViewSet, basename='rfq')
router.register(r'rfq-items', RFQItemViewSet, basename='rfq-item')
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'saved-vehicles', SavedVehicleViewSet, basename='saved-vehicle')
router.register(r'parts', PartCatalogViewSet, basename='part')
router.register(r'bids', BidViewSet, basename='bid')
router.register(r'orders', VendorOrderViewSet, basename='order')
router.register(r'admin/vendors', AdminVendorViewSet, basename='admin-vendors')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('auth/otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('auth/dev-login/', DevLoginView.as_view(), name='dev-login'),
    path('auth/me/', UserMeView.as_view(), name='user-me'),
    path('feed/', RFQFeedView.as_view(), name='rfq-feed'),
    path('rfqs/<int:pk>/pdf/', RFQPDFView.as_view(), name='rfq-pdf'),
]
