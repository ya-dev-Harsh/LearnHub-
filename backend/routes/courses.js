const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Middleware to check if logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

// List all courses (Public)
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM courses ORDER BY created_at DESC');
        res.render('courses/list', {
            title: 'Browse Courses',
            courses: result.rows,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// My Enrolled Courses
router.get('/my-courses', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const result = await query(`
            SELECT c.*, p.percent 
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            LEFT JOIN progress p ON c.id = p.course_id AND p.user_id = $1
            WHERE e.user_id = $1
        `, [userId]);

        res.render('courses/my_courses', {
            title: 'My Learning',
            courses: result.rows,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// View Course Details (Before Enrollment)
router.get('/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const contentRes = await query('SELECT * FROM contents WHERE course_id = $1 ORDER BY id ASC', [courseId]);

        let isEnrolled = false;
        if (req.session.user) {
            const enrollRes = await query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [req.session.user.id, courseId]);
            if (enrollRes.rows.length > 0) isEnrolled = true;
        }

        if (courseRes.rows.length === 0) return res.status(404).send('Course not found');

        res.render('courses/view', {
            title: courseRes.rows[0].title,
            course: courseRes.rows[0],
            contents: contentRes.rows,
            isEnrolled,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Checkout Page
router.get('/:id/checkout', isAuthenticated, async (req, res) => {
    try {
        const courseId = req.params.id;
        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) return res.status(404).send('Course not found');

        // Redirect if already enrolled
        const check = await query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [req.session.user.id, courseId]);
        if (check.rows.length > 0) return res.redirect('/courses/my-courses');

        res.render('courses/checkout', {
            title: 'Checkout',
            course: courseRes.rows[0],
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Enroll in Course (Post-Payment)
router.post('/:id/enroll', isAuthenticated, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.user.id;

        // Check if already enrolled
        const check = await query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
        if (check.rows.length === 0) {
            await query('INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)', [userId, courseId]);
            await query('INSERT INTO progress (user_id, course_id, percent) VALUES ($1, $2, 0)', [userId, courseId]);
            req.flash('success', 'Payment successful! You are enrolled.');
        } else {
            req.flash('success', 'You are already enrolled in this course.');
        }
        res.redirect('/courses/my-courses');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Enrollment failed.');
        res.redirect('/courses');
    }
});

// Learn Mode (Video/PDF Player)
router.get('/:id/learn', isAuthenticated, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.user.id;

        // Verify enrollment
        const enrollCheck = await query('SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
        if (enrollCheck.rows.length === 0) return res.status(403).send('Not Enrolled');

        const courseRes = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
        const contentRes = await query('SELECT * FROM contents WHERE course_id = $1 ORDER BY id ASC', [courseId]);

        res.render('courses/learn', {
            title: 'Learning: ' + courseRes.rows[0].title,
            course: courseRes.rows[0],
            contents: contentRes.rows,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Progress
router.post('/:id/progress', isAuthenticated, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.user.id;
        const { percent } = req.body;

        console.log(`Updating progress for User ${userId} Course ${courseId} to ${percent}%`);

        const result = await query(
            'UPDATE progress SET percent = $1, last_updated = CURRENT_TIMESTAMP WHERE user_id = $2 AND course_id = $3',
            [percent, userId, courseId]
        );

        if (result.rowCount === 0) {
            console.log('Progress row not found, inserting new row.');
            await query(
                'INSERT INTO progress (user_id, course_id, percent) VALUES ($1, $2, $3)',
                [userId, courseId, percent]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Certificate
router.get('/:id/certificate', isAuthenticated, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.user.id;

        // Verify completion
        const progressRes = await query('SELECT percent FROM progress WHERE user_id = $1 AND course_id = $2', [userId, courseId]);
        if (progressRes.rows.length === 0 || progressRes.rows[0].percent < 100) {
            return res.status(403).send('Complete the course to get the certificate.');
        }

        const courseRes = await query('SELECT title FROM courses WHERE id = $1', [courseId]);

        res.render('certificate', {
            user: req.session.user,
            course: courseRes.rows[0],
            date: new Date().toLocaleDateString()
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
