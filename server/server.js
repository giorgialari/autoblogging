const express = require('express');
const cors = require('cors');
const path = require('path');

const {
  Configuration,
  OpenAIApi
} = require('openai');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../dist/autoblogging')));

app.post('/api/openai', async (req, res) => {
  try {
    const apiKey = req.body.apiKey;
    const prompt = req.body.prompt;
    const model = req.body.model;
    const maxTokens = req.body.maxTokens;
    const configuration = new Configuration({
      apiKey
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createChatCompletion({
      model: model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.8,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Extract the content of the assistant's response
    const assistantMessage = response.data.choices[0].message.content;
    // Send the assistant's message as the response
    res.send({
      message: assistantMessage
    });
  } catch (error) {
    res.status(500).send({
      message: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/autoblogging/index.html'));
});
// app.listen(3000, () => {
//   console.log('Server is up and running on port 3000');
// });
