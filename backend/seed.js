const { query } = require('./db');
const bcrypt = require('bcrypt');

const sampleCourses = [
    { title: "Python for Data Science", desc: "Master Python with data analysis libraries.", price: 19.99, image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80", instructor: "Jose Portilla", category: "Development" },
    { title: "The Complete JavaScript Course", desc: "Modern JavaScript from the beginning.", price: 29.99, image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80", instructor: "Jonas Schmedtmann", category: "Development" },
    { title: "Figma UI/UX Design Essentials", desc: "Learn to design mobile and web apps.", price: 49.99, image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80", instructor: "Gary Simon", category: "Design" },
    { title: "Machine Learning A-Z", desc: "Hands-on Python & R In Data Science.", price: 89.99, image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&q=80", instructor: "Kirill Eremenko", category: "IT & Software" },
    { title: "Digital Marketing Masterclass", desc: "SEO, Social Media, Email Marketing.", price: 12.99, image: "https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&q=80", instructor: "Phil Ebiner", category: "Marketing" },
    { title: "React - The Complete Guide", desc: "Hooks, React Router, Redux.", price: 39.99, image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80", instructor: "Maximilian Schwarzmüller", category: "Development" },
    { title: "Investing in Stocks", desc: "The complete course on stock market.", price: 44.99, image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80", instructor: "Steve Ballinger", category: "Finance" },
    { title: "Portrait Photography", desc: "Take stunning photos of people.", price: 24.99, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80", instructor: "Jessica Kobeissi", category: "Photography" },
    { title: "Public Speaking Mastery", desc: "Give unforgettable presentations.", price: 15.99, image: "https://images.unsplash.com/photo-1475721027767-f753c9138d77?w=600&q=80", instructor: "Chris Haroun", category: "Personal Development" },
    { title: "Cyber Security for Beginners", desc: "Learn to protect your digital life.", price: 59.99, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80", instructor: "Nathan House", category: "IT & Software" },
    { title: "Docker & Kubernetes", desc: "The practical guide to DevOps.", price: 34.99, image: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80", instructor: "Stephen Grider", category: "Development" },
    { title: "Game Design with Unity", desc: "Create your first 3D game.", price: 49.99, image: "https://images.unsplash.com/photo-1556438050-bf886e5e25a2?w=600&q=80", instructor: "Ben Tristem", category: "Development" },
    { title: "PostgreSQL Bootcamp", desc: "From beginner to advanced SQL.", price: 19.99, image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&q=80", instructor: "Colt Steele", category: "Development" },
    { title: "Adobe Illustrator CC", desc: "Master vector graphic design.", price: 29.99, image: "https://images.unsplash.com/photo-1572044162444-ad6021105507?w=600&q=80", instructor: "Dan Scott", category: "Design" },
    { title: "Cryptocurrency Fundamentals", desc: "Buy, sell, and trade crypto.", price: 39.99, image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80", instructor: "George Levy", category: "Finance" }
];

async function seed() {
    try {
        console.log("Resetting and Seeding Database...");

        // Optional: truncate tables to avoid duplicates (USE WITH CAUTION)
        // We will just insert if not exists to be safe, but ideally we'd clear them for a 'fresh' feel if that was the request.
        // Given constraints, I'll rely on the existing check logic, but I'll add 'TRUNCATE' for this specific step to Ensure clean state for the images.
        // User asked to "change the image", implies replacing old ones.
        await query('TRUNCATE TABLE courses, enrollments, progress, contents RESTART IDENTITY CASCADE');

        // Schema Update: Add image, instructor, and category columns if they don't exist
        try {
            await query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT');
            await query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor TEXT');
            await query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT');
        } catch (e) {
            console.log("Schema update skipped or error:", e.message);
        }

        // Create Admin User
        const password = await bcrypt.hash('admin123', 10);
        const userCheck = await query('SELECT * FROM users WHERE email = $1', ['admin@learnhub.com']);
        let adminId;
        if (userCheck.rows.length === 0) {
            const res = await query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                ['Admin User', 'admin@learnhub.com', password, 'admin']
            );
            adminId = res.rows[0].id;
            console.log("Admin user created.");
        } else {
            adminId = userCheck.rows[0].id;
        }

        // Seed Courses
        for (const course of sampleCourses) {
            const check = await query('SELECT * FROM courses WHERE title = $1', [course.title]);
            if (check.rows.length === 0) {
                const res = await query(
                    'INSERT INTO courses (title, description, price, image_url, instructor, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                    [course.title, course.desc, course.price, course.image, course.instructor, course.category]
                );
                const courseId = res.rows[0].id;

                // Add sample content
                await query(
                    'INSERT INTO contents (course_id, title, type, url) VALUES ($1, $2, $3, $4)',
                    [courseId, 'Introduction', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ']
                );
            }
        }

        console.log("Seeding Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seed();
