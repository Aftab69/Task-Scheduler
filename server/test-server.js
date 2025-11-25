import express from 'express';
const app = express();
const PORT = 5004;

app.use(express.json());

// Simple test route
app.get('/api/simple', (req, res) => {
  console.log('SIMPLE ROUTE HIT');
  res.json({ message: 'Simple route works' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});