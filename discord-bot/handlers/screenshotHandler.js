require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
})

const Anthropic = require('@anthropic-ai/sdk')

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

async function parseScreenshot(imageUrl, eventType) {
  const response = await fetch(imageUrl)
  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/png',
            data: base64
          }
        },
        {
          type: 'text',
          text: `Это скриншот результатов события с сервера Majestic RP GTA 5.
Тип события: ${eventType}.
Извлеки данные и верни ТОЛЬКО JSON без пояснений:
{
  "eventType": "${eventType}",
  "won": true или false,
  "score_ours": число,
  "score_theirs": число,
  "players": [
    {"name": "ник игрока", "kills": число, "damage": число}
  ]
}
Верни только JSON, без markdown, без пояснений.`
        }
      ]
    }]
  })

  const jsonText = result.content[0].text.trim()
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  return JSON.parse(jsonText)
}

module.exports = { parseScreenshot }
