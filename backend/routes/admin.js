const express = require('express');
const router = express.Router();
const { query } = require('../db');
const upload = require('../middleware/upload');

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access Denied: Admins only');
    }
};

router.use(isAdmin);

router.get('/dashboard', async (req, res) => {
    try {
        const result = await query('SELECT * FROM courses ORDER BY created_at DESC');
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            courses: result.rows,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/courses', async (req, res) => {
    const { title, description, price } = req.body;
    try {
        await query(
            'INSERT INTO courses (title, description, price) VALUES ($1, $2, $3)',
            [title, description, price]
        );
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating course');
    }
});

router.post('/courses/:id/content', upload.single('file'), async (req, res) => {
    const courseId = req.params.id;
    const { title, type } = req.body;
    const url = req.file ? '/uploads/' + req.file.filename : '';

    try {
        await query(
            'INSERT INTO contents (course_id, title, type, url) VALUES ($1, $2, $3, $4)',
            [courseId, title, type, url]
        );
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding content');
    }
});

module.exports = router;
