# Budget Tracking Web Application

A comprehensive budget tracking application built with React.js frontend and Node.js/Express backend.

## Features

### 🔐 Authentication & Security
- User registration and login with JWT authentication
- Password validation with strength requirements
- Protected routes and automatic token refresh
- Error boundary for graceful error handling

### 💰 Financial Management
- **Dashboard**: Overview of income, expenses, and balance with interactive charts
- **Transactions**: Add, view, and manage income/expense transactions
- **Budgets**: Set category-based budgets with spending tracking
- **Wallets**: Multiple wallet support for organization
- **Reports**: Detailed financial analytics and insights

### 📊 Data Visualization
- Trading-style candlestick charts for income vs expenses
- Monthly transaction trend analysis with line graphs
- Real-time budget progress tracking
- Responsive charts that adapt to screen size

### 🎨 User Experience
- Dark/Light theme toggle with system preference detection
- Responsive design for mobile, tablet, and desktop
- Smooth animations and micro-interactions
- Clean, modern UI with Tailwind CSS

### 🤖 AI Integration
- AI-powered transaction description generation
- Smart categorization suggestions
- Automated insights and recommendations

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **GSAP** - Advanced animations
- **Lucide React** - Icon library
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Nodemailer** - Email service
- **Multer & Cloudinary** - File uploads

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/budget-tracking
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GEMINI_API_KEY=your_gemini_api_key
```

Start backend:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/charts` - Get chart data

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Wallets
- `GET /api/wallets` - Get all wallets
- `POST /api/wallets` - Create wallet
- `PUT /api/wallets/:id` - Update wallet
- `DELETE /api/wallets/:id` - Delete wallet

## Testing

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Backend Tests
```bash
cd backend
npm test
```

## Error Handling

### Frontend
- Global error boundary catches React errors
- API interceptors handle authentication errors
- Form validation with user-friendly messages
- Loading states and error feedback

### Backend
- Centralized error handling middleware
- Input validation with express-validator
- Mongoose error handling
- JWT error management
- Database connection error handling

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input sanitization and validation
- Protected API routes
- CORS configuration
- Rate limiting (recommended for production)

## Performance Optimizations

- Lazy loading of components
- Memoized calculations
- Optimized re-renders
- Compressed images
- Efficient database queries
- Caching strategies

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
```

### Backend (Heroku/Railway)
- Set environment variables
- Configure MongoDB Atlas
- Deploy with Git integration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@budgettracker.com or create an issue on GitHub.