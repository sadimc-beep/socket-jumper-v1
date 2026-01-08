# Dhaka Parts RFQ Marketplace – v1 Specification Pack

This document set freezes the **MVP v1** scope and is ready for engineering handoff and Antigravity ingestion.

---

## DOCUMENT INDEX
1. Product Requirements Document (PRD)
2. Functional Specification (FRS)
3. Data Model & Constraints
4. API Specification (v1)
5. Business Rules & Policies
6. Comparative Statement (CS) Specification
7. Non‑Functional Requirements
8. Deployment & Environment Notes
9. Roadmap (Post‑MVP)

---

# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 Product Goal
Enable Dhaka‑based automotive workshops to request **multiple parts for a single vehicle (VIN‑based RFQ)**, receive **real‑time competitive bids** from **curated vendors**, **split‑award items**, pay **per vendor**, and track **same‑day delivery** with auditability and printable comparative approval sheets.

## 1.2 Target Users
- Workshop Staff (Technician / Parts Advisor)
- Vendor
- Admin
- Logistics (optional)

## 1.3 MVP Constraints (Frozen)
- Geography: Dhaka only
- One RFQ = One Vehicle (VIN mandatory)
- RFQ supports multiple line items
- Vendors bid per item
- Split award allowed
- Per‑vendor payment
- Same‑day delivery only
- Curated vendors only
- Bangla + English
- No ERP integration
- No automated part recognition (v1)

---

# 2. FUNCTIONAL REQUIREMENTS SPECIFICATION (FRS)

## 2.1 Workshop App

### Authentication
- OTP login (phone number)
- Language toggle (BN / EN)

### RFQ Creation

**Vehicle Section (Mandatory)**
- VIN (required)
- Make / Model / Year / Engine / Trim (optional manual entry)

**Line Items (1…N)**
Each item must support:
- Entry method: PHOTO | CATALOG | PART NUMBER
- Quantity (required)
- Preferred category: Genuine OEM / Aftermarket Branded / Aftermarket Unbranded / Used-Reconditioned / Any
- Side (LH/RH/NA)
- Color (optional)
- Notes

**Submission**
- RFQ status → BIDDING_OPEN
- Default bidding window: 10 minutes

### Bid Viewing
- Real‑time bid updates
- Bids grouped by vendor
- Vendor rating + items covered X/Y + total cost

### Awarding
- Item‑level award (split allowed)
- Vendor confirmation timeout: 15 minutes

### Orders
- One vendor order per vendor
- Track delivery status
- Confirm delivery + rating

### Comparative Statement
- Generate printable PDF (Pre‑award / Post‑award)

---

## 2.2 Vendor App / Portal

- OTP login
- Upload verification docs (Trade License, NID)
- RFQ feed with filters
- Item‑level bidding (price, ETA, availability, part category mandatory)
- Order confirmation
- Mark ready for pickup
- View payout history

---

## 2.3 Admin Web

- Vendor approval/suspension
- Workshop & branch management
- RFQ SLA monitoring
- Vendor order management
- Courier assignment (manual)
- Dispute resolution
- Strike enforcement
- Report generation

---

# 3. DATA MODEL & CONSTRAINTS

(Condensed – engineering can expand to ORM)

## rfqs
- vin (required, length=17, override allowed)
- status lifecycle enforced

## rfq_items
- rfq_id (FK)
- quantity > 0

## bids
- rfq_item_id (FK)
- vendor_id (FK)
- part_category (ENUM, required)

Allowed categories:
- GENUINE_OEM
- AFTERMARKET_BRANDED
- AFTERMARKET_UNBRANDED
- USED_RECONDITIONED

## vendor_orders
- one per (rfq_id + vendor_id)
- payment_method required

---

# 4. API SPECIFICATION (v1 – High Level)

## Auth
- POST /auth/otp/request
- POST /auth/otp/verify

## Workshop
- POST /rfqs
- GET /rfqs
- GET /rfqs/{id}
- POST /rfqs/{id}/submit
- POST /rfqs/{id}/award
- GET /vendor-orders
- POST /vendor-orders/{id}/confirm-delivery
- POST /vendor-orders/{id}/disputes
- POST /rfqs/{id}/reports/comparative

## Vendor
- GET /rfqs/available
- POST /rfq-items/{id}/bids
- POST /vendor-orders/{id}/confirm
- POST /vendor-orders/{id}/ready-for-pickup

## Admin
- POST /admin/vendors/{id}/approve
- POST /admin/vendors/{id}/suspend
- POST /admin/vendor-orders/{id}/assign-courier
- POST /admin/disputes/{id}/resolve

---

# 5. BUSINESS RULES & POLICIES

## Payments
- Per vendor order
- COD or bank transfer
- Payment reference stored

## Disputes
- Window: 24 hours post delivery
- Reasons: wrong part, damaged, not as described, suspected counterfeit, missing

## Anti‑Counterfeit
- No vendor can openly label "counterfeit"
- Suspected counterfeit handled via dispute
- Strike system enforced by admin

---

# 6. COMPARATIVE STATEMENT (CS) SPECIFICATION

## Purpose
Enable workshop staff to obtain managerial approval via a **printable comparison of vendor bids**.

## Modes
- Pre‑Award (approval)
- Post‑Award (record)

## Content
- Workshop + RFQ metadata
- VIN (bold)
- Vendor summary table
- Item‑level comparison table
- Totals and highlights
- Signature blocks

## Output
- PDF (A4, portrait)
- Bangla + English

---

# 7. NON‑FUNCTIONAL REQUIREMENTS

- Real‑time bid updates (WebSockets)
- Image compression + retry
- Audit logging on bids, awards, disputes
- Role‑based access control

---

# 8. DEPLOYMENT & ENVIRONMENT

- Backend: Django + DRF
- Realtime: Django Channels
- Mobile: Flutter or React Native
- Admin Web: Next.js
- Storage: S3‑compatible

Environments:
- local
- staging
- production

---

# 9. ROADMAP (POST‑MVP)

## v1.1
- Bundle discounts
- Vendor strike automation
- Rating tags

## v2
- VIN recognition
- ML part recognition
- Barcode / OCR
- Courier API integration
- VAT invoice generation
- ERP integration

---

END OF SPEC PACK

