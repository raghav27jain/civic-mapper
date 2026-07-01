# 🗺️ CivicMapper — AI-Powered Hyperlocal Civic Issue Reporter

A full-stack civic tech web application where authenticated citizens can report
local infrastructure problems (potholes, garbage, waterlogging, broken streetlights)
using photos and GPS location. Issues appear instantly on a live interactive map
and can be managed by administrators through a dedicated dashboard.

🔗 **Live Demo:** [civic-mapper.vercel.app](https://civic-mapper.vercel.app)  
📦 **Backend API:** [civic-mapper-backend.onrender.com](https://civic-mapper-backend.onrender.com)

---

## 🚀 Features

### Citizen Side
- 🔐 OTP-based authentication (Name + Phone + OTP verification)
- 📝 Submit complaints with text description
- 📸 Upload photos (JPG, PNG, WEBP — max 5MB) with live preview
- 📍 One-click GPS location capture via browser Geolocation API
- 🗺️ Real-time Leaflet.js map showing all complaints as colored markers
- 🖼️ Click any complaint photo to view fullscreen lightbox

### Admin Side
- 🔑 Secure admin login with password authentication
- 👥 View citizen name + phone number for every complaint
- ✅ Update complaint status (Open → In Progress → Resolved)
- 📊 Dashboard with stats, filters, search, and sort

### Smart Features (No ML)
- 🤖 Keyword-based automatic category detection (pothole, garbage, waterlogging, streetlight, other)
- ⚡ Rule-based priority scoring (1–5 scale)
- 🔗 "View on Google Maps" — opens exact complaint location in Google Maps
- 🎨 Premium dark UI with animated glow blobs and glassmorphism cards

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, CSS3 |
| Map | Leaflet.js, React-Leaflet |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), OTP (Mock) |
| Image Upload | Multer |
| Notifications | React Hot Toast |
| Icons | Lucide React |
| Deployment | Vercel (Frontend), Render (Backend), MongoDB Atlas (DB) |

---

## 📁 Project Structure

```
civic-mapper/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── CitizenLogin.jsx
│   │   │   └── AdminLogin.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                     # Node.js Backend
    ├── config/db.js
    ├── controllers/
    │   ├── authController.js
    │   └── complaintController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── User.js
    │   └── Complaint.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── complaintRoutes.js
    ├── uploads/
    └── server.js
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/raghav27jain/civic-mapper.git
cd civic-mapper
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔑 Test Credentials

| Role | Credentials |
|---|---|
| Citizen | Any name + 10-digit phone → OTP appears in server console |
| Admin | Password: `admin@civic123` |

---

## 🗺️ API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | Public | Send OTP to phone |
| POST | `/api/auth/verify-otp` | Public | Verify OTP + get token |
| POST | `/api/auth/admin-login` | Public | Admin login |
| GET | `/api/complaints` | Public | Get all complaints |
| POST | `/api/complaints` | Protected | Submit new complaint |
| PUT | `/api/complaints/:id/status` | Admin only | Update complaint status |
| GET | `/health` | Public | Server health check |

---

## 🔮 Future Roadmap (Version 2)

- [ ] YOLO-based image detection — auto detect issue from photo
- [ ] Duplicate complaint detection using embeddings
- [ ] Geo-clustering — group nearby complaints on map
- [ ] ML-based dynamic priority scoring
- [ ] Real SMS OTP via Fast2SMS / Twilio
- [ ] Email notifications to citizens on status update
- [ ] Municipality portal with analytics dashboard

---

## 👨‍💻 Author

**Raghav Jain**  
B.Tech CSE (AI & ML) — SRM Institute of Science and Technology, Delhi-NCR

[![GitHub](https://img.shields.io/badge/GitHub-raghav27jain-black?logo=github)](https://github.com/raghav27jain)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-raghav--jain27-blue?logo=linkedin)](https://linkedin.com/in/raghav-jain27)

---

## 📄 License

MIT License — feel free to use this project for learning purposes.