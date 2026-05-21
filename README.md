# Smart Lost & Found App

A full-stack web application for reporting lost items, uploading found items, tracking deliveries, and managing staff operations on railway systems.

## Features

- **Lost Item Reporting**: Users can report lost items with photos, descriptions, train/station info
- **Found Item Reporting**: Staff can upload found items; system auto-matches with lost reports
- **Real-time Tracking**: Users can track their lost items through the delivery pipeline
- **OTP Authentication**: Phone-based OTP login for secure access
- **Delivery Management**: Staff manages delivery of items with OTP verification
- **Admin Dashboard**: Admin users can view all reports, users, and delivery statuses
- **Real-time Notifications**: Socket.IO integration for instant match notifications
- **Image Upload**: Cloudinary integration for cloud image storage

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates

### Backend

- **Node.js + Express** - REST API server
- **MongoDB + Mongoose** - Database
- **JWT** - Token-based authentication
- **Multer** - File uploads
- **Cloudinary** - Cloud image storage
- **Socket.IO** - WebSocket real-time events
- **bcryptjs** - Password hashing

## Project Structure

```
smart-lost-found/
├── backend/
│   └── backend/
│       ├── server.js              # Express server with Socket.IO
│       ├── package.json           # Backend dependencies
│       ├── .env                   # Environment variables
│       ├── models/
│       │   ├── User.js            # User model (passenger, staff, admin)
│       │   ├── LostItem.js        # Lost item model
│       │   ├── FoundItem.js       # Found item model
│       │   └── Delivery.js        # Delivery model
│       ├── routes/
│       │   ├── authRoutes.js      # Login/Register
│       │   ├── otpRoutes.js       # OTP send/verify
│       │   ├── lostRoutes.js      # Lost item CRUD
│       │   ├── foundRoutes.js     # Found item CRUD + matching
│       │   ├── trackingRoutes.js  # Track items
│       │   ├── deliveryRoutes.js  # Delivery management
│       │   └── adminRoutes.js     # Admin reports
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT verification
│       │   └── roleMiddleware.js  # Role-based access
│       └── utils/
│           └── cloudinary.js      # Image upload helper
└── frontend/
    ├── package.json               # Frontend dependencies
    ├── .env.local                 # Environment variables
    ├── next.config.mjs            # Next.js config
    ├── tailwind.config.js         # Tailwind config
    ├── postcss.config.js          # PostCSS config
    ├── src/
    │   ├── app/
    │   │   ├── layout.js          # Root layout
    │   │   ├── globals.css        # Global styles
    │   │   ├── page.js            # Home page
    │   │   ├── login/page.js      # Login page
    │   │   ├── otp/page.js        # OTP verification page
    │   │   ├── dashboard/page.js  # User dashboard
    │   │   ├── report-lost/page.js # Report lost item
    │   │   ├── report-found/page.js # Report found item
    │   │   ├── track/page.js      # Track items
    │   │   ├── delivery/page.js   # Delivery management
    │   │   └── admin/page.js      # Admin dashboard
    │   └── lib/
    │       └── api.js             # API utilities & auth helpers
```

## Setup Instructions

### Backend Setup

1. Install dependencies:

```bash
cd backend/backend
npm install
```

2. Configure environment variables (`.env`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-lost-found
JWT_SECRET=your-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Start MongoDB:

```bash
mongod
```

4. Run the backend:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure environment variables (`.env.local`):

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. Run the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with phone/password
- `POST /api/auth/register` - Register new user
- `POST /api/otp/send` - Send OTP to phone
- `POST /api/otp/verify` - Verify OTP and get token

### Lost Items

- `POST /api/lost` - Report lost item (requires auth)
- `GET /api/lost` - Get all lost items
- `GET /api/lost/:id` - Get lost item details
- `GET /api/lost/pending` - Get pending items (staff/admin only)
- `PUT /api/lost/:id/status` - Update lost item status (staff/admin)

### Found Items

- `POST /api/found` - Upload found item
- `GET /api/found` - Get all found items

### Tracking

- `GET /api/tracking/:id` - Track item status and delivery

### Delivery

- `POST /api/delivery/create` - Create delivery (requires auth)
- `POST /api/delivery/verify` - Verify delivery with OTP
- `GET /api/delivery/:id` - Get delivery details

### Admin

- `GET /api/admin/reports` - Get all reports (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/lost/:id/status` - Update lost item status (admin)

## User Roles

- **User** (Passenger): Can report lost items, track items, verify delivery
- **Staff**: Can report found items, verify lost item status, manage deliveries
- **Admin**: Full access to all reports, users, and system management

## Database Schemas

### User

```javascript
{
  name: String,
  phone: String (unique),
  password: String,
  role: String (user|staff|admin),
  otp: String,
  otpExpires: Date,
  createdAt: Date
}
```

### LostItem

```javascript
{
  title: String (required),
  description: String,
  locationLost: String,
  station: String,
  trainNumber: String,
  lostDate: Date,
  contact: String,
  ownerPhone: String,
  imageUrl: String,
  proofUrl: String,
  status: String (reported|under_verification|matched|dispatched|out_for_delivery|delivered),
  verificationNotes: String,
  createdAt: Date
}
```

### FoundItem

```javascript
{
  title: String (required),
  description: String,
  locationFound: String,
  station: String,
  trainNumber: String,
  foundDate: Date,
  imageUrl: String,
  status: String (found|under_verification|matched|returned),
  matchedLostItem: ObjectId (ref: LostItem),
  createdAt: Date
}
```

### Delivery

```javascript
{
  itemId: ObjectId (ref: LostItem),
  ownerName: String,
  address: String,
  otp: String,
  status: String (dispatched|in_transit|out_for_delivery|delivered),
  deliveryAgent: String,
  createdAt: Date
}
```

## Key Features Implementation

### OTP Authentication

- Generate 6-digit OTP with 5-minute expiry
- Store OTP in user document for verification
- Issue JWT token after successful OTP verification

### Auto-Matching

- When found item is uploaded, search lost items by title/description
- Mark both items as matched
- Emit Socket.IO event to notify users

### File Uploads

- Multer for multipart file handling
- Cloudinary for cloud storage (with fallback to local uploads)
- Support for item images and proof documents

### Real-time Updates

- Socket.IO for instant notifications
- Emit events on: match found, delivery created, delivery completed
- Broadcast to connected clients

### Role-Based Access

- Middleware checks user role before allowing operations
- Admin endpoints restricted to admin users
- Staff endpoints for staff and admin users

## Running the Application

1. Start MongoDB server
2. Navigate to `backend/backend` and run `npm run dev`
3. In another terminal, navigate to `frontend` and run `npm run dev`
4. Open `http://localhost:3000` in browser
5. Login with phone or verify OTP to access dashboard

## Testing

### Test User Creation

```bash
# Create user via registration or OTP flow
# Phone: 1234567890
# Password (optional): test@123
```

### Test Lost Item Report

- Login → Dashboard → Report Lost Item
- Fill details, upload image
- Item created with status "reported"

### Test Found Item Report

- Upload found item with similar title
- System auto-matches if descriptions match
- Socket notification sent to matched item owner

### Test Tracking

- Get item ID from report confirmation
- Go to Track → Enter ID
- View status timeline and delivery info

### Admin Dashboard

- Login with admin role
- Access admin panel to view all reports
- Manage user roles and item statuses

## Environment Setup

### Production Considerations

- Use secure JWT_SECRET
- Configure CLOUDINARY credentials
- Use production MongoDB URI
- Set appropriate CLIENT_URL and SERVER_URL
- Enable HTTPS for production

### Deployment

- Backend: Deploy to Heroku, Railway, or AWS
- Frontend: Deploy to Vercel, Netlify, or AWS
- Database: Use MongoDB Atlas for production
- Images: Use Cloudinary for cloud storage

## Troubleshooting

- **MongoDB connection error**: Ensure MongoDB is running on localhost:27017
- **API connection error**: Check if backend is running on port 5000
- **Image upload failing**: Verify Cloudinary credentials in .env
- **OTP not sending**: Check console logs in backend for OTP generation
- **Auth token issues**: Clear localStorage and re-login

## Future Enhancements

- SMS notifications for OTP and delivery updates
- Email notifications
- Advanced search and filtering
- Payment integration for delivery services
- Mobile app (React Native)
- Admin reporting and analytics
- Machine learning for better item matching
- Multi-language support
- Offline capabilities with service workers

## License

MIT
