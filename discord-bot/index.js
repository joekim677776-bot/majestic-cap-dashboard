const {
  Client, GatewayIntentBits, Partials, Events,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js')
const { parseScreenshot } = require('./handlers/screenshotHandler')
require('dotenv').config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

// Map для хранения ожидающих загрузок { userId -> { eventType, channelId } }
const pendingUploads = new Map()

client.on(Events.ClientReady, async (readyClient) => {
  console.log(`Bot logged in as ${readyClient.user.tag}`)

  try {
    const channel = await client.channels.fetch(process.env.STATS_CHANNEL_ID)

    if (!channel) {
      console.error('Канал не найден! Проверь STATS_CHANNEL_ID')
      return
    }

    console.log(`Канал найден: ${channel.name}`)

    const embed = new EmbedBuilder()
      .setTitle('NOCAP CREW // СТАТИСТИКА КАПТОВ')
      .setDescription(
        'Нажми кнопку ниже и следуй инструкциям\n' +
        'чтобы загрузить скриншот результатов капты'
      )
      .setColor(0xFFFFFF)
      .setFooter({ text: 'Majestic RP • NoCap Crew' })

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('upload_screenshot')
          .setLabel('📸 Загрузить скриншот')
          .setStyle(ButtonStyle.Secondary)
      )

    await channel.send({ embeds: [embed], components: [row] })
    console.log('✅ Сообщение с кнопкой отправлено в канал')

  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error)
  }
})

client.on(Events.InteractionCreate, async (interaction) => {

  // Нажата кнопка "Загрузить скриншот"
  if (interaction.isButton() && interaction.customId === 'upload_screenshot') {

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_event_type')
      .setPlaceholder('Выбери тип события')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Семейный капт')
          .setValue('KAPT')
          .setEmoji('⚔️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('МЦЛ')
          .setValue('MCL')
          .setEmoji('🏆'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Турнир')
          .setValue('TOURNAMENT')
          .setEmoji('🎯')
      )

    const row = new ActionRowBuilder().addComponents(selectMenu)

    await interaction.reply({
      content: '## Выбери тип события:',
      components: [row],
      ephemeral: true,
    })
    return
  }

  // Выбран тип события
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_event_type') {

    const eventType = interaction.values[0]

    const eventNames = {
      KAPT: 'Семейный капт',
      MCL: 'МЦЛ',
      TOURNAMENT: 'Турнир',
    }

    pendingUploads.set(interaction.user.id, {
      eventType,
      channelId: interaction.channelId,
    })

    await interaction.update({
      content:
        `## ✅ Тип события: ${eventNames[eventType]}\n\n` +
        `Теперь отправь скриншот результатов капты ` +
        `в этот канал обычным сообщением с прикреплённым изображением.\n\n` +
        `⏱️ У тебя есть 5 минут.`,
      components: [],
    })

    // Автоматически удалить ожидание через 5 минут
    setTimeout(() => {
      pendingUploads.delete(interaction.user.id)
    }, 5 * 60 * 1000)

    return
  }
})

// Обработка сообщений со скриншотами
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return
  if (message.channelId !== process.env.STATS_CHANNEL_ID) return
  if (!message.attachments.size) return

  const pending = pendingUploads.get(message.author.id)
  if (!pending) return

  const image = message.attachments.first()
  if (!image.contentType?.startsWith('image/')) return

  pendingUploads.delete(message.author.id)

  const processingMsg = await message.reply('⏳ Обрабатываю скриншот...')

  try {
    const stats = await parseScreenshot(image.url, pending.eventType)

    const response = await fetch(
      `${process.env.DASHBOARD_WEBHOOK_URL}/api/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
        },
        body: JSON.stringify(stats),
      }
    )

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`)
    }

    const eventNames = { KAPT: 'Капт', MCL: 'МЦЛ', TOURNAMENT: 'Турнир' }

    await processingMsg.edit(
      `## ${stats.won ? '✅ ПОБЕДА' : '❌ ПОРАЖЕНИЕ'}\n` +
      `**Тип:** ${eventNames[stats.eventType]}\n` +
      `**Счёт:** ${stats.score_ours} : ${stats.score_theirs}\n` +
      `**Игроков записано:** ${stats.players.length}\n` +
      `Статистика добавлена на сайт!`
    )

  } catch (error) {
    console.error('Ошибка обработки скриншота:', error)
    await processingMsg.edit(
      '❌ Ошибка при обработке скриншота.\n' +
      'Убедись что скриншот чёткий и попробуй снова.'
    )
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)
