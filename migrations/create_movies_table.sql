CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  director VARCHAR(255) NOT NULL,
  year INT CHECK (year > 1800 AND year < 2100),
  genre VARCHAR(100),
  rating NUMERIC CHECK (rating >= 0 AND rating <= 10)
);
