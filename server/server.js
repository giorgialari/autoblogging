const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
app.use(express.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

app.post('/api/openai', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-16k-0613",
        messages: [{role: 'user', content: prompt}],
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Extract the content of the assistant's response
      const assistantMessage = response.data.choices[0].message.content;
      // Send the assistant's message as the response
      res.send({ message: assistantMessage });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is up and running on port 3000');
});
