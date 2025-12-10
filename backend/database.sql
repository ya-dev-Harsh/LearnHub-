-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student', -- 'student' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Contents Table (Videos/PDFs associated with courses)
CREATE TABLE IF NOT EXISTS contents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'video' or 'pdf'
    url VARCHAR(255) NOT NULL, -- Path to file
    sequence_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id)
);

-- Create Progress Table
CREATE TABLE IF NOT EXISTS progress (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    percent INTEGER DEFAULT 0 CHECK (percent >= 0 AND percent <= 100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, course_id)
);
