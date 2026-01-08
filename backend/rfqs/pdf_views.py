from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework import permissions
from .models import RFQ
from bids.models import Bid
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class RFQPDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        rfq = get_object_or_404(RFQ, pk=pk)
        
        # Calculate CS Data (Same logic as before)
        bids = Bid.objects.filter(rfq_item__rfq=rfq)
        vendors = list(set([b.vendor for b in bids]))
        vendors.sort(key=lambda u: u.id) 

        # Build PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="cs_rfq_{rfq.id}.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        # Header
        elements.append(Paragraph("Comparative Statement (CS)", styles['Title']))
        elements.append(Paragraph("Marketplace Generation", styles['Normal']))
        elements.append(Spacer(1, 20))
        
        # Meta Info
        meta_data = [
            [f"Workshop: {rfq.workshop.username}", f"RFQ ID: #{rfq.id}"],
            [f"Date: {rfq.updated_at.strftime('%Y-%m-%d %H:%M')}", f"VIN: {rfq.vin}"],
            ["", f"{rfq.make} {rfq.model} ({rfq.year})"]
        ]
        meta_table = Table(meta_data, colWidths=[300, 200])
        meta_table.setStyle(TableStyle([
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 20))
        
        # CS Table
        # Header Row
        headers = ['Item', 'Qty'] + [v.username for v in vendors]
        data = [headers]
        
        # Data Rows
        items = rfq.items.all()
        for item in items:
            row = [f"{item.name}\n({item.preferred_category})", str(item.quantity)]
            for vendor in vendors:
                bid = bids.filter(rfq_item=item, vendor=vendor).order_by('amount').first()
                if bid:
                    row.append(f"{bid.amount}\n{bid.brand}")
                else:
                    row.append("-")
            data.append(row)
            
        # Totals Row
        totals_row = ['Total', '']
        for vendor in vendors:
            total = sum([b.amount for b in bids.filter(vendor=vendor)])
            totals_row.append(str(total))
        data.append(totals_row)

        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
            ('TEXTCOLOR', (0,0), (-1,0), colors.black),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,-1), (-1,-1), colors.beige),
            ('GRID', (0,0), (-1,-1), 1, colors.black),
        ]))
        elements.append(table)
        
        doc.build(elements)
        return response
