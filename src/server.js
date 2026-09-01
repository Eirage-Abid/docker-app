const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notesdb';

// --- Mongoose model ---
const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Docker demo app is running', mongoState: mongoose.connection.readyState });
});

app.get('/notes', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 });
  res.json(notes);
});

app.post('/notes', async (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: 'text is required' });
  }
  const note = await Note.create({ text: req.body.text });
  res.status(201).json(note);
});

// --- Connect to Mongo, then start server ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB at', MONGO_URI);
    app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
