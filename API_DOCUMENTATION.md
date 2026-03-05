# Wedding E-Invitation API Documentation v2.0

Complete API documentation for the enhanced Wedding E-Invitation backend.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most admin endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Admin Login
**POST** `/api/admin/login`

Request Body:
```json
{
  "username": "admin",
  "password": "changeme123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## RSVP Endpoints

### Submit RSVP
**POST** `/api/rsvp`

Request Body:
```json
{
  "guest_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "attendance": "attending",
  "number_of_guests": 2,
  "dietary_restrictions": "Vegetarian",
  "special_requests": "Need wheelchair access"
}
```

Response:
```json
{
  "success": true,
  "message": "RSVP submitted successfully! Check your email for confirmation.",
  "data": {
    "id": 1
  }
}
```

### Check RSVP by Email
**GET** `/api/rsvp/check/:email`

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "guest_name": "John Doe",
    "email": "john@example.com",
    "attendance": "attending",
    "number_of_guests": 2,
    "created_at": "2026-01-01T12:00:00.000Z"
  }
}
```

### Get All RSVPs (Admin Only)
**GET** `/api/admin/rsvps`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "rsvps": [...],
    "stats": {
      "total_responses": 50,
      "attending_count": 40,
      "not_attending_count": 10,
      "total_guests": 85
    }
  }
}
```

### Delete RSVP (Admin Only)
**DELETE** `/api/admin/rsvps/:id`

Headers: `Authorization: Bearer <token>`

---

## Guest List Management

### Get All Guests (Admin Only)
**GET** `/api/guestlist`

Query Parameters:
- `type`: Filter by invitation type (VIP/Regular)
- `checked_in`: Filter by check-in status (0/1)
- `search`: Search by name, email, or phone

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "guests": [...],
    "stats": {
      "total_guests": 100,
      "vip_count": 20,
      "regular_count": 80,
      "checked_in_count": 65,
      "total_capacity": 150
    }
  }
}
```

### Add Guest (Admin Only)
**POST** `/api/guestlist`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "invitation_type": "VIP",
  "max_guests": 2,
  "table_number": 5,
  "notes": "Special guest"
}
```

Response:
```json
{
  "success": true,
  "message": "Guest added successfully",
  "data": {
    "id": 1,
    "unique_code": "abc123-def456-ghi789",
    "qr_code": "/uploads/qrcodes/abc123-def456-ghi789.png"
  }
}
```

### Bulk Import Guests (Admin Only)
**POST** `/api/guestlist/bulk`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "guests": [
    {
      "name": "Guest 1",
      "email": "guest1@example.com",
      "invitation_type": "Regular",
      "max_guests": 1
    },
    {
      "name": "Guest 2",
      "email": "guest2@example.com",
      "invitation_type": "VIP",
      "max_guests": 2
    }
  ]
}
```

### Verify Guest by QR Code
**GET** `/api/guestlist/verify/:code`

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Smith",
    "invitation_type": "VIP",
    "max_guests": 2,
    "checked_in": false
  }
}
```

### Check-in Guest
**POST** `/api/guestlist/checkin/:code`

Response:
```json
{
  "success": true,
  "message": "Guest checked in successfully",
  "data": {
    "name": "Jane Smith",
    "check_in_time": "2026-12-31T18:00:00.000Z"
  }
}
```

### Update Guest (Admin Only)
**PATCH** `/api/guestlist/:id`

Headers: `Authorization: Bearer <token>`

### Delete Guest (Admin Only)
**DELETE** `/api/guestlist/:id`

Headers: `Authorization: Bearer <token>`

### Download QR Code (Admin Only)
**GET** `/api/guestlist/:id/qrcode`

Headers: `Authorization: Bearer <token>`

---

## Photo Upload

### Get All Photos (Public - Approved Only)
**GET** `/api/photos`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "photo-123456.jpg",
      "path": "/uploads/photos/photo-123456.jpg",
      "uploaded_by": "John Doe",
      "caption": "Beautiful moment!",
      "approved": true,
      "created_at": "2026-12-31T18:00:00.000Z"
    }
  ]
}
```

### Get All Photos Including Unapproved (Admin Only)
**GET** `/api/photos/admin/all`

Headers: `Authorization: Bearer <token>`

### Upload Single Photo
**POST** `/api/photos/upload`

Content-Type: `multipart/form-data`

Form Data:
- `photo`: Image file (max 5MB)
- `uploaded_by`: Name of uploader (optional)
- `caption`: Caption text (optional)

Response:
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "id": 1,
    "path": "/uploads/photos/photo-123456.jpg"
  }
}
```

### Upload Multiple Photos
**POST** `/api/photos/upload-multiple`

Content-Type: `multipart/form-data`

Form Data:
- `photos`: Array of image files (max 10 files, 5MB each)
- `uploaded_by`: Name of uploader (optional)

### Approve Photo (Admin Only)
**PATCH** `/api/photos/:id/approve`

Headers: `Authorization: Bearer <token>`

### Update Photo Caption (Admin Only)
**PATCH** `/api/photos/:id/caption`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "caption": "Updated caption"
}
```

### Delete Photo (Admin Only)
**DELETE** `/api/photos/:id`

Headers: `Authorization: Bearer <token>`

---

## Messages

### Get Approved Messages (Public)
**GET** `/api/messages`

### Get All Messages (Admin Only)
**GET** `/api/admin/messages`

Headers: `Authorization: Bearer <token>`

### Submit Message
**POST** `/api/messages`

Request Body:
```json
{
  "guest_name": "John Doe",
  "message": "Congratulations on your special day!"
}
```

### Approve Message (Admin Only)
**PATCH** `/api/admin/messages/:id/approve`

Headers: `Authorization: Bearer <token>`

### Delete Message (Admin Only)
**DELETE** `/api/admin/messages/:id`

Headers: `Authorization: Bearer <token>`

### Get Message Count
**GET** `/api/messages/count`

---

## Gift Tracking (Admin Only)

### Get All Gifts
**GET** `/api/gifts`

Query Parameters:
- `type`: Filter by gift type (cash/physical/other)
- `search`: Search by guest name or description

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "gifts": [...],
    "stats": {
      "total_gifts": 45,
      "cash_count": 30,
      "physical_count": 15,
      "total_amount": 15000.00
    }
  }
}
```

### Add Gift
**POST** `/api/gifts`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "guest_name": "John Doe",
  "gift_type": "cash",
  "amount": 500.00,
  "description": "Gift envelope",
  "received_date": "2026-12-31"
}
```

### Update Gift
**PATCH** `/api/gifts/:id`

Headers: `Authorization: Bearer <token>`

### Delete Gift
**DELETE** `/api/gifts/:id`

Headers: `Authorization: Bearer <token>`

---

## Seating Arrangement (Admin Only)

### Get All Tables
**GET** `/api/seating`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": 1,
        "table_number": 1,
        "table_name": "Family Table",
        "capacity": 10,
        "assigned_guests": 8,
        "notes": "Close to stage"
      }
    ],
    "stats": {
      "total_tables": 10,
      "total_capacity": 100,
      "assigned_guests": 75,
      "unassigned_guests": 25
    }
  }
}
```

### Get Guests by Table
**GET** `/api/seating/:tableNumber/guests`

Headers: `Authorization: Bearer <token>`

### Add Table
**POST** `/api/seating`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "table_number": 5,
  "table_name": "Friends Table",
  "capacity": 8,
  "notes": "Near the bar"
}
```

### Assign Guest to Table
**POST** `/api/seating/assign`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "guestId": 10,
  "tableNumber": 5
}
```

### Update Table
**PATCH** `/api/seating/:tableNumber`

Headers: `Authorization: Bearer <token>`

### Delete Table
**DELETE** `/api/seating/:tableNumber`

Headers: `Authorization: Bearer <token>`

---

## Analytics (Admin Only)

### Get Comprehensive Analytics
**GET** `/api/analytics`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": {
    "rsvp": {
      "total_responses": 85,
      "attending": 70,
      "not_attending": 15,
      "total_guests": 120,
      "response_rate": "85.00"
    },
    "guestList": {
      "total_invited": 100,
      "vip_count": 20,
      "regular_count": 80,
      "checked_in": 65,
      "total_capacity": 150,
      "check_in_rate": "65.00"
    },
    "gifts": {
      "total_gifts": 45,
      "cash_gifts": 30,
      "physical_gifts": 15,
      "total_amount": 15000.00
    },
    "media": {
      "photos": 120,
      "messages": 85
    }
  }
}
```

### Get RSVP Timeline
**GET** `/api/analytics/rsvp-timeline`

Headers: `Authorization: Bearer <token>`

### Get Check-in Timeline
**GET** `/api/analytics/checkin-timeline`

Headers: `Authorization: Bearer <token>`

### Export Data as CSV
**GET** `/api/analytics/export/:type`

Parameters:
- `type`: rsvp, guestlist, or gifts

Headers: `Authorization: Bearer <token>`

Downloads CSV file.

---

## Email Notifications (Admin Only)

### Send Invitation to Guest
**POST** `/api/notifications/send-invitation/:guestId`

Headers: `Authorization: Bearer <token>`

### Send Bulk Invitations
**POST** `/api/notifications/send-bulk-invitations`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "guestIds": [1, 2, 3, 4, 5]
}
```

Response:
```json
{
  "success": true,
  "message": "Bulk invitations completed",
  "data": {
    "success": 4,
    "failed": 1,
    "errors": [
      {
        "guestId": 3,
        "reason": "Guest not found or no email"
      }
    ]
  }
}
```

### Send Reminder to Guest
**POST** `/api/notifications/send-reminder/:guestId`

Headers: `Authorization: Bearer <token>`

### Send Bulk Reminders
**POST** `/api/notifications/send-bulk-reminders`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "filter": {
    "invitation_type": "VIP",
    "checked_in": 0
  }
}
```

---

## WebSocket Events

Connect to WebSocket at `ws://localhost:3000`

### Events

#### Client → Server

**new-comment**
```json
{
  "guest_name": "John Doe",
  "message": "Great celebration!"
}
```

#### Server → Client

**comment-added**
```json
{
  "id": 1,
  "guest_name": "John Doe",
  "message": "Great celebration!",
  "created_at": "2026-12-31T18:00:00.000Z"
}
```

**new-photo**
```json
{
  "id": 1,
  "path": "/uploads/photos/photo-123456.jpg",
  "uploaded_by": "Jane Smith"
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Login**: 5 attempts per 15 minutes
- **RSVP Submission**: 3 submissions per hour
- **Message Submission**: 5 messages per hour
- **Photo Upload**: 10 uploads per hour

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Health Check

**GET** `/api/health`

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-12-31T18:00:00.000Z"
}
```

---

## Configuration

### Email Setup (Gmail Example)

1. Enable 2-Factor Authentication in your Gmail account
2. Generate App Password: Google Account → Security → 2-Step Verification → App Passwords
3. Add to `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### SMS Setup (Twilio)

1. Create Twilio account
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization
- **JWT Authentication**: Secure admin access
- **Request Logging**: All requests logged to files
- **Input Validation**: Server-side validation
- **File Upload Limits**: Max 5MB per photo
- **CORS**: Configurable origin restrictions

---

## Logging

Logs are stored in `logs/` directory:
- `application-YYYY-MM-DD.log`: General logs
- `error-YYYY-MM-DD.log`: Error logs
- `exceptions-YYYY-MM-DD.log`: Unhandled exceptions
- `rejections-YYYY-MM-DD.log`: Unhandled promise rejections

Logs rotate daily and are retained for 14-30 days.

---

**Version:** 2.0  
**Last Updated:** March 2026
