const express = require('express');
const { JSDOM } = require('jsdom');
const https = require('https');

const app = express();
const PORT = 3000;

app.get('/gamepasses/:userId', (req, res) => {
  const userId = req.params.userId;
  const url = `https://www.roblox.com/users/${userId}/inventory/#!/game-passes`;

  https.get(url, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const dom = new JSDOM(data);
        const document = dom.window.document;
        const items = [...document.querySelectorAll('.item-card')];

        const gamepasses = items.map(el => {
          const title = el.querySelector('.text-overflow')?.textContent.trim();
          const link = el.querySelector('a')?.href;
          return { title, link };
        });

        res.json({ userId, gamepasses });
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse gamepasses.' });
      }
    });
  }).on('error', err => {
    res.status(500).json({ error: 'Request failed.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
