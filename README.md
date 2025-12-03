 Grocery Buddy (Smart Grocery List Manager)

A full-stack web application for managing grocery shopping lists with user authentication, real-time validation, and intuitive CRUD operations.
1. Features

 User Authentication
- Secure Registration: Password hashing with bcrypt (10 salt rounds)
- Session Management: 7-day persistent sessions with express-session
- Auto-login: Automatic authentication after successful registration
- Protected Routes: Middleware-based route protection

 Grocery List Management
- Create: grocery items with name, category, and quantity
- Edit: existing items inline
- Delete: individual items or bulk operations
- Toggle: completion status for items
- Filter: items by status (all/active/completed)
- Statistics Dashboard: showing total, active, and completed items

 Validation System
Frontend Validation (Client-side):
- Username: 3-20 characters, alphanumeric with (_) and (-)
- Email: Valid email format
- Password: 6-50 characters with uppercase, lowercase, and numbers
- Item Name: 2-50 characters, no special characters
- Quantity: 1-999 numeric range

Backend Validation:
- Field presence checks
- Data type validation
- User ownership verification

 User Experience
- Real-time form validation with error messages
- Loading states with spinners during async operations
- Success notifications for completed actions
- Empty state messaging
- Responsive grid layout for grocery items

2. Technologies Used

 Backend
- Node.js - JavaScript runtime
- Express.js - Web application framework
- MongoDB - NoSQL database
- Mongoose - MongoDB object modeling
- bcryptjs - Password hashing
- express-session - Session middleware
- dotenv - Environment variable management

 Frontend
- Pug - Templating engine
- JavaScript - Client-side logic
- CSS - Styling
- Fetch API - HTTP requests

3. Project Structure


grocery-buddy/
├── models/
│   ├── userModel.js           User schema
│   └── groceryModel.js        Grocery item schema
├── routes/
│   ├── authRoutes.js          Authentication endpoints
│   └── groceryRoutes.js       Grocery CRUD endpoints
├── views/
│   ├── login.pug              Login page
│   ├── register.pug           Registration page
│   └── dashboard.pug          Main application
├── public/
│   ├── js/
│   │   ├── login.js           Login validation
│   │   ├── register.js        Registration validation
│   │   └── dashboard.js       Main app logic
│   └── css/
│       └── styles.css         Application styles
├── server.js                  Application entry point
├── .env                       Environment variables
├── package.json               Dependencies
└── README.md


 4. Installation

 Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm 




 Author:
ANKUNDA TREASURE LATIFAH
SANYU GLORIA






