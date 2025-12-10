const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(flash());

// Global Variables Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.error = req.flash('error'); // ensuring compatibility with passport-style errors if needed
    res.locals.user = req.session.user || null;
    next();
});

// Set static folders & Views
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Routes
const indexRoutes = require('./routes/index'); // We'll create this next
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const courseRoutes = require('./routes/courses');

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/courses', courseRoutes);

// Start Server
// Start Server (Only if not in Vercel/Serverless environment)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
