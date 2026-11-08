const path = require('path');
const express = require('express');
const { sendToSupport } = require('./support');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

app.post('/contact', (req, res) => {
  const { address_line, form_loaded_at } = req.body;

  const currentTime = Date.now();
  const loadTime = parseInt(form_loaded_at, 10);
  const timeToSubmit = currentTime - loadTime;

  // The spam condition: Honeypot is filled OR submitted in under 3 seconds
  const isSpam = address_line !== '' || timeToSubmit < 3000 || isNaN(loadTime);

  if (isSpam) {
    // Drop the submission but return the exact same success response real users get
    return res.status(200).json({ success: true, message: "Thanks, we'll be in touch." }); 
  }
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Please fill in your name, email and message.' });
  }

  sendToSupport({ name, email, message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});
