const {
  Client, GatewayIntentBits, Partials, Events,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder, ModalBuilder,
  TextInputBuilder, TextInputStyle, LabelBuilder,
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

// Map для хранения состояния: userId -> { eventType, won, eventTime, channelId }
const pendingUploads = new Map()

const EVENT_NAMES = {
  KAPT: 'Семейный капт',
  MCL: 'МЦЛ',
  TOURNAMENT: 'Турнир',
}

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

  // ШАГ 1 — Кнопка "Загрузить скриншот" → показываем выбор типа события
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

  // ШАГ 2 — Выбран тип → показываем ПОБЕДА / ПОРАЖЕНИЕ
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_event_type') {
    const eventType = interaction.values[0]

    pendingUploads.set(interaction.user.id, {
      eventType,
      channelId: interaction.channelId,
    })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('result_win')
        .setLabel('✅ ПОБЕДА')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('result_lose')
        .setLabel('❌ ПОРАЖЕНИЕ')
        .setStyle(ButtonStyle.Danger),
    )

    await interaction.update({
      content: `## Тип события: ${EVENT_NAMES[eventType]}\n\nКаков результат?`,
      components: [row],
    })
    return
  }

  // ШАГ 3 — Выбран результат → показываем Modal с полем времени
  if (interaction.isButton() && (interaction.customId === 'result_win' || interaction.customId === 'result_lose')) {
    const pending = pendingUploads.get(interaction.user.id)
    if (!pending) {
      await interaction.reply({ content: '⚠️ Сессия истекла. Начни заново.', ephemeral: true })
      return
    }

    const won = interaction.customId === 'result_win'
    pendingUploads.set(interaction.user.id, { ...pending, won })

    const timeInput = new TextInputBuilder()
      .setCustomId('event_time_input')
      .setPlaceholder('23:45')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(4)
      .setMaxLength(5)

    const timeLabel = new LabelBuilder()
      .setLabel('Введи время в формате ЧЧ:ММ (например 23:45)')
      .setTextInputComponent(timeInput)

    const modal = new ModalBuilder()
      .setCustomId('modal_event_time')
      .setTitle('Время события')

    modal.addLabelComponents(timeLabel)

    await interaction.showModal(modal)
    return
  }

  // ШАГ 4 — Modal отправлен → сохраняем время, просим скриншот
  if (interaction.isModalSubmit() && interaction.customId === 'modal_event_time') {
    const pending = pendingUploads.get(interaction.user.id)
    if (!pending) {
      await interaction.reply({ content: '⚠️ Сессия истекла. Начни заново.', ephemeral: true })
      return
    }

    const eventTime = interaction.fields.getTextInputValue('event_time_input').trim()

    pendingUploads.set(interaction.user.id, { ...pending, eventTime })

    const wonLabel = pending.won ? '✅ Победа' : '❌ Поражение'

    await interaction.reply({
      content:
        `✅ Тип: **${EVENT_NAMES[pending.eventType]}** | Результат: **${wonLabel}** | Время: **${eventTime}**\n\n` +
        `Теперь отправь скриншот статистики в этот канал`,
      ephemeral: true,
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

  console.log('=== Новое сообщение ===')
  console.log('Channel:', message.channelId)
  console.log('Expected:', process.env.STATS_CHANNEL_ID)
  console.log('Match:', message.channelId === process.env.STATS_CHANNEL_ID)
  console.log('Attachments:', message.attachments.size)

  if (message.channelId !== process.env.STATS_CHANNEL_ID) {
    console.log('Пропускаем - не тот канал')
    return
  }
  if (!message.attachments.size) {
    console.log('Пропускаем - нет вложений')
    return
  }

  const pending = pendingUploads.get(message.author.id)
  console.log('Pending upload:', pending)

  if (!pending) {
    console.log('Нет ожидающей загрузки для', message.author.id)
    console.log('Все pending:', [...pendingUploads.entries()])
    return
  }

  const images = [...message.attachments.values()].filter(
    (a) => a.contentType?.startsWith('image/')
  )
  if (!images.length) return

  pendingUploads.delete(message.author.id)

  const processingMsg = await message.reply(`⏳ Обрабатываю ${images.length > 1 ? `${images.length} скриншота` : 'скриншот'}...`)

  try {
    const allPlayers = []
    let finalStats = null

    for (const attachment of images) {
      console.log('Обрабатываю скриншот:', attachment.url)
      const stats = await parseScreenshot(attachment.url, pending.eventType)

      for (const player of stats.players) {
        const exists = allPlayers.find(
          (p) => p.name.toLowerCase() === player.name.toLowerCase()
        )
        if (!exists) allPlayers.push(player)
      }

      if (!finalStats) finalStats = stats
    }

    const webhookData = {
      eventType: pending.eventType,
      won: pending.won,
      eventTime: pending.eventTime,
      score_ours: finalStats?.score_ours ?? 0,
      score_theirs: finalStats?.score_theirs ?? 0,
      players: allPlayers,
    }

    console.log('Отправляем на webhook:', JSON.stringify(webhookData, null, 2))
    console.log('URL:', `${process.env.DASHBOARD_WEBHOOK_URL}/api/webhook`)

    const response = await fetch(
      `${process.env.DASHBOARD_WEBHOOK_URL}/api/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WEBHOOK_SECRET}`,
        },
        body: JSON.stringify(webhookData),
      }
    )

    const responseText = await response.text()
    console.log('Webhook response status:', response.status)
    console.log('Webhook response body:', responseText)

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status} - ${responseText}`)
    }

    await processingMsg.edit(
      `## ${pending.won ? '✅ ПОБЕДА' : '❌ ПОРАЖЕНИЕ'}\n` +
      `**Тип:** ${EVENT_NAMES[pending.eventType]}\n` +
      `**Время:** ${pending.eventTime}\n` +
      `**Счёт:** ${webhookData.score_ours}:${webhookData.score_theirs}\n` +
      `**Игроков записано:** ${allPlayers.length}\n` +
      `Статистика добавлена на сайт!`
    )

  } catch (error) {
    console.error('Ошибка обработки скриншота:', error)
    await processingMsg.edit(
      '❌ Ошибка при обработке скриншота.\n' +
      'Убедись что скриншоты чёткие и попробуй снова.'
    )
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)
