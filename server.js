const express = require('express');
const cors = require('cors');
const pool = require('./db');
const Joi = require('joi');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


const movieSchema = Joi.object({
  title: Joi.string().min(1).required(),
  director: Joi.string().min(1).required(),
  year: Joi.number().integer().min(1800).max(2100).required(),
  genre: Joi.string().allow(''),
  rating: Joi.number().min(0).max(10).required(),
});


app.get('/movies', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM movies ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});


app.get('/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { rows } = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Фільм не знайдено' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});


app.post('/movies', async (req, res) => {
  const { error, value } = movieSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { title, director, year, genre, rating } = value;

  try {
    const { rows } = await pool.query(
      `INSERT INTO movies (title, director, year, genre, rating)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, director, year, genre, rating]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});


app.put('/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { error, value } = movieSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { title, director, year, genre, rating } = value;

  try {
    const { rowCount } = await pool.query(
      `UPDATE movies SET title=$1, director=$2, year=$3, genre=$4, rating=$5 WHERE id=$6`,
      [title, director, year, genre, rating, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Фільм не знайдено' });
    res.json({ message: 'Фільм оновлено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});


app.delete('/movies/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { rowCount } = await pool.query('DELETE FROM movies WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Фільм не знайдено' });
    res.json({ message: 'Фільм видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
