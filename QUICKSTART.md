# Quick Start Guide

## Prerequisites

- Node.js v18+
- MongoDB running locally
- npm or yarn

## Step 1: Start MongoDB

```bash
mongod
```

Keep this running in a separate terminal.

## Step 2: Start Backend

```bash
cd backend/backend
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

You should see:

```
Server Running on Port 5000
MongoDB Connected
```

## Step 3: Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Step 4: Access the Application

Open your browser and go to: `http://localhost:3000`

## First Time Setup

### Create Test Account (via OTP)

1. Go to `http://localhost:3000/otp`
2. Enter phone: `1234567890`
3. Click "Send OTP"
4. **Check backend terminal** for OTP code (will be logged)
5. Enter OTP → Dashboard

### Create Test Account (via Register)

1. Go to `http://localhost:3000/login`
2. Enter phone: `1234567890`
3. Enter password: `test@123`
4. Click Login → Dashboard

## Test Workflows

### Report Lost Item

1. Dashboard → "Report Lost Item"
2. Fill in:
   - Item Name: "Black Wallet"
   - Description: "Leather wallet with cards"
   - Location Lost: "Train A1"
   - Station: "Central"
   - Train: "Local Express"
   - Contact: "1234567890"
3. Upload image (optional)
4. Submit

### Report Found Item (for matching)

1. Dashboard → "Report Found Item"
2. Fill in with same title or similar description
3. System auto-matches with lost items
4. View matched items below form

### Track Item

1. Dashboard → "Track Item"
2. Enter the item ID from report
3. View status and delivery info

### Verify Delivery with OTP

1. Dashboard → "Delivery Management"
2. Enter Item ID, Owner Name, Address
3. Create Delivery → Check backend console for OTP
4. Enter OTP → Verify

## Admin Panel Access

### Create Admin User

1. Register with phone: `9999999999`
2. Manually update user role in MongoDB:

```javascript
db.users.updateOne({ phone: "9999999999" }, { $set: { role: "admin" } });
```

### Access Admin Dashboard

1. Login with admin account
2. Dashboard shows "Admin Panel" button
3. Click to view: Lost Items, Found Items, Deliveries, Users

## Troubleshooting

### Backend won't start

- Check if port 5000 is available
- Ensure MongoDB is running
- Check .env file has correct values

### Frontend won't start

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is available
- Ensure backend is running

### Can't connect to backend

- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Should be: `http://localhost:5000`
- Restart frontend after changing

### OTP not working

- Backend logs OTP to console
- Copy code and paste in frontend
- OTP expires after 5 minutes

### MongoDB connection failed

- Ensure MongoDB service is running
- Check URI in `.env`: `mongodb://127.0.0.1:27017/smart-lost-found`
- Try: `mongosh` to test connection

## File Upload Notes

- Images upload to local `backend/backend/uploads/` folder
- Configure Cloudinary in `.env` for cloud storage
- Fallback to local uploads if Cloudinary unavailable

## Key Files to Know

- Backend: `backend/backend/server.js`
- Frontend: `frontend/src/app/page.js`
- API Config: `frontend/src/lib/api.js`
- Styles: `frontend/src/app/globals.css`

## Database Inspection

```bash
# Connect to MongoDB
mongosh

# Switch to database
use smart-lost-found

# View collections
show collections

# View users
db.users.find()

# View lost items
db.lostitems.find()

# View found items
db.founditems.find()

# View deliveries
db.deliveries.find()
```

## Environment Setup for Production

See `README.md` for full details on:

- Deploying backend
- Deploying frontend
- Setting up MongoDB Atlas
- Configuring Cloudinary
- Production security

## Need Help?

- Check backend console for API errors
- Check browser console for frontend errors
- Verify all environment variables are set
- Ensure all services (MongoDB, backend, frontend) are running

## Development Mode Commands

```bash
# Backend - with auto-reload
npm run dev

# Frontend - with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Enjoy using Smart Lost & Found! 🎉
