const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../db');

// Login Page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login', user: req.session.user });
});

// Register Page
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register', user: req.session.user });
});

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            req.flash('error', 'Email already registered');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);

        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Server error during registration');
        res.redirect('/auth/register');
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        req.flash('success', 'Logged in successfully');

        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/courses');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Server error during login');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
});

module.exports = router;
