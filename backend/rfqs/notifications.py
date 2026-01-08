from core.models import Notification
from bids.models import Bid

def notify_vendors_of_update(rfq, change_summary):
    """
    Notify all vendors who have placed bids on this RFQ about an update.
    """
    # 1. IDENTIFY RECIPIENTS: Vendors with active bids on this RFQ
    # Get distinct vendors from bids related to this RFQ's items
    vendor_ids = Bid.objects.filter(rfq_item__rfq=rfq).values_list('vendor', flat=True).distinct()
    
    if not vendor_ids:
        return

    from django.contrib.auth import get_user_model
    User = get_user_model()
    vendors = User.objects.filter(id__in=vendor_ids)

    title = f"Update on Request #{rfq.id}"
    message = f"The request for {rfq.year} {rfq.make} {rfq.model} has been updated: {change_summary}. Please review your bids."

    notifications_to_create = []

    for vendor in vendors:
        # 2. IN-APP NOTIFICATION
        notifications_to_create.append(
            Notification(
                recipient=vendor,
                title=title,
                message=message,
                data={'rfq_id': rfq.id, 'type': 'RFQ_UPDATE'}
            )
        )
        
        # 3. PUSH NOTIFICATION (STUB)
        send_push_notification(vendor, title, message)

    # Bulk create for efficiency
    if notifications_to_create:
        Notification.objects.bulk_create(notifications_to_create)

def send_push_notification(user, title, message):
    """
    Stub for sending push notification via FCM/APNS.
    In real implementation, this would use a library like django-push-notifications or firebase-admin.
    """
    # Check if user has a registered device token
    # e.g. if user.fcm_token:
    #     fcm.send(token=user.fcm_token, title=title, body=message)
    print(f"[PUSH STUB] To {user.username}: {title} - {message}")
