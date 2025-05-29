
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }
  const { prompt } = req.body;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful voice assistant called Nayas Voice Assistant." },
          { role: "user", content: prompt }
        ]
      })
    });
    const data = await response.json();
    if (data && data.choices && data.choices[0]) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      return res.status(500).json({ error: "Invalid response from OpenRouter" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Failed to fetch from OpenRouter" });
  }
};
