# TourneyHub - Tournament Management System

Sistem manajemen turnamen dengan database MongoDB untuk menyimpan data signup, login, pendaftaran partisipan, dan data turnamen.

## 🚀 Fitur Utama

### Authentication & User Management
- ✅ Signup dengan validasi lengkap
- ✅ Login dengan email/username
- ✅ JWT Authentication
- ✅ Password encryption dengan bcrypt
- ✅ Account locking untuk keamanan
- ✅ Profile management
- ✅ Role-based access (Host & Participant)

### Tournament Management
- ✅ CRUD operations untuk turnamen
- ✅ Filtering dan searching
- ✅ Status management (draft, open, ongoing, completed)
- ✅ Prize pool management
- ✅ Schedule management
- ✅ Registration system

### Registration System
- ✅ Pendaftaran partisipan ke turnamen
- ✅ Team registration support
- ✅ Payment tracking
- ✅ Approval/rejection system
- ✅ Check-in system

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB dengan Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: Enabled untuk cross-origin requests

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda telah menginstall:

- [Node.js](https://nodejs.org/) (versi 14 atau lebih baru)
- [MongoDB](https://www.mongodb.com/try/download/community) atau [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass) (untuk GUI database)

## 🚀 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd tourneyhub-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Buat file `config.env` di root directory dengan konfigurasi berikut:

```env
MONGODB_URI=mongodb://localhost:27017/tourneyhub
JWT_SECRET=your_jwt_secret_key_here_change_in_production
PORT=3000
NODE_ENV=development
```

**Catatan**: 
- Ganti `your_jwt_secret_key_here_change_in_production` dengan secret key yang kuat
- Untuk MongoDB Atlas, gunakan connection string dari dashboard Atlas
- Untuk local MongoDB, pastikan MongoDB service berjalan

### 4. Database Setup

#### Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Buat database `tourneyhub`

#### MongoDB Atlas
1. Buat cluster di MongoDB Atlas
2. Dapatkan connection string
3. Update `MONGODB_URI` di `config.env`

### 5. Run Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 📊 Database Schema

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  accountType: String (participant/host),
  profile: {
    avatar: String,
    bio: String,
    phone: String,
    dateOfBirth: Date,
    location: String
  },
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Tournaments Collection
```javascript
{
  _id: ObjectId,
  host: ObjectId (ref: User),
  title: String,
  description: String,
  game: String,
  category: String (MOBA/FPS/Battle Royale/etc),
  format: String (Single Elimination/etc),
  maxParticipants: Number,
  currentParticipants: Number,
  entryFee: Number,
  prizePool: {
    first: Number,
    second: Number,
    third: Number
  },
  schedule: {
    registrationDeadline: Date,
    startDate: Date,
    endDate: Date
  },
  rules: String,
  requirements: String,
  status: String (draft/open/ongoing/completed),
  visibility: String (public/private),
  tags: [String],
  images: {
    banner: String,
    logo: String
  },
  location: {
    type: String (online/offline/hybrid),
    address: String,
    city: String
  },
  contact: {
    email: String,
    phone: String,
    whatsapp: String
  },
  statistics: {
    views: Number,
    registrations: Number,
    shares: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Registrations Collection
```javascript
{
  _id: ObjectId,
  tournament: ObjectId (ref: Tournament),
  participant: ObjectId (ref: User),
  teamName: String,
  teamMembers: [{
    name: String,
    email: String,
    phone: String,
    gameId: String,
    role: String
  }],
  status: String (pending/approved/rejected/cancelled),
  payment: {
    method: String (transfer/ewallet/cash/free),
    amount: Number,
    status: String (pending/paid/failed/refunded),
    proof: String,
    paidAt: Date
  },
  additionalInfo: {
    experience: String,
    previousTournaments: String,
    achievements: String,
    socialMedia: {
      instagram: String,
      twitter: String,
      youtube: String
    }
  },
  notes: {
    fromHost: String,
    fromParticipant: String
  },
  checkedIn: Boolean,
  checkedInAt: Date,
  finalRank: Number,
  prize: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/check-username` - Check username availability
- `POST /api/auth/check-email` - Check email availability

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/account` - Deactivate account
- `GET /api/users/:username` - Get public user profile

### Tournaments
- `GET /api/tournaments` - Get all public tournaments
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments` - Create tournament (Host only)
- `PUT /api/tournaments/:id` - Update tournament (Host only)
- `DELETE /api/tournaments/:id` - Delete tournament (Host only)
- `GET /api/tournaments/host/my-tournaments` - Get host's tournaments
- `POST /api/tournaments/:id/register` - Register for tournament
- `GET /api/tournaments/:id/registrations` - Get tournament registrations

## 🔐 Security Features

- **Password Hashing**: Menggunakan bcryptjs dengan salt rounds 12
- **JWT Authentication**: Token-based authentication dengan expiry 7 hari
- **Account Locking**: Auto-lock setelah 5 kali login gagal
- **Input Validation**: Validasi lengkap menggunakan express-validator
- **CORS Protection**: Cross-origin resource sharing protection
- **Rate Limiting**: Built-in protection untuk brute force attacks

## 📝 Usage Examples

### 1. User Signup
```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123',
    accountType: 'participant'
  })
});
```

### 2. User Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    identifier: 'john@example.com', // or username
    password: 'Password123'
  })
});
```

### 3. Create Tournament
```javascript
const response = await fetch('/api/tournaments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Mobile Legends Tournament 2024',
    description: 'Tournament seru untuk pemain ML',
    game: 'Mobile Legends',
    category: 'MOBA',
    format: 'Single Elimination',
    maxParticipants: 32,
    entryFee: 50000,
    prizePool: {
      first: 5000000,
      second: 2500000,
      third: 1000000
    },
    schedule: {
      registrationDeadline: '2024-02-15T23:59:59.000Z',
      startDate: '2024-02-20T09:00:00.000Z',
      endDate: '2024-02-22T18:00:00.000Z'
    },
    rules: 'Peraturan turnamen...',
    requirements: 'Persyaratan peserta...'
  })
});
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Pastikan MongoDB service berjalan
   - Cek connection string di `config.env`
   - Pastikan network access di MongoDB Atlas

2. **JWT Secret Error**
   - Pastikan `JWT_SECRET` sudah diset di `config.env`
   - Gunakan secret key yang kuat

3. **Port Already in Use**
   - Ganti port di `config.env`
   - Atau kill process yang menggunakan port 3000

4. **Validation Errors**
   - Cek format data yang dikirim
   - Pastikan semua required fields terisi
   - Cek email format dan password strength

## 📈 Performance Optimization

- **Database Indexing**: Sudah dioptimasi dengan indexes untuk query yang sering digunakan
- **Pagination**: Implemented untuk semua list endpoints
- **Selective Population**: Hanya populate field yang diperlukan
- **Caching**: Ready untuk implementasi Redis caching

## 🔄 Database Migration

Untuk migrasi data dari sistem lama:

1. Export data dari sistem lama
2. Transform data sesuai schema baru
3. Import menggunakan MongoDB Compass atau mongoimport
4. Update references jika diperlukan

## 📞 Support

Untuk bantuan dan pertanyaan:
- Buat issue di repository
- Hubungi tim development
- Cek dokumentasi API lengkap

## 📄 License

MIT License - lihat file LICENSE untuk detail.

---

**Happy Coding! 🎮🏆** 