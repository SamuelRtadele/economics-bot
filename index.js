const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================================================
// CONFIGURATION – Edit these to customize your bot
// ============================================================

// Job categories with their keywords
const JOB_FIELDS = {
  economics: {
    name: '📊 Economics',
    keywords: [
      'economics', 'economist', 'economic', 'finance', 'financial',
      'business', 'analyst', 'data analysis', 'market', 'policy',
      'research', 'statistics', 'econometric', 'macro', 'micro',
      'banking', 'investment', 'consulting', 'advisory'
    ]
  },
  tech: {
    name: '💻 Technology',
    keywords: [
      'software', 'developer', 'engineer', 'programming', 'coding',
      'javascript', 'python', 'java', 'react', 'node', 'full stack',
      'frontend', 'backend', 'devops', 'cloud', 'aws', 'data science',
      'machine learning', 'ai', 'artificial intelligence'
    ]
  },
  finance: {
    name: '💰 Finance',
    keywords: [
      'finance', 'financial', 'investment', 'banking', 'analyst',
      'portfolio', 'asset management', 'wealth', 'trading',
      'equity', 'fixed income', 'derivatives', 'risk', 'compliance'
    ]
  },
  marketing: {
    name: '📢 Marketing',
    keywords: [
      'marketing', 'digital marketing', 'seo', 'social media',
      'content', 'brand', 'advertising', 'pr', 'communications',
      'campaign', 'analytics', 'growth', 'influencer'
    ]
  },
  healthcare: {
    name: '🏥 Healthcare',
    keywords: [
      'healthcare', 'medical', 'clinical', 'nursing', 'doctor',
      'pharmaceutical', 'public health', 'health', 'wellness',
      'hospital', 'patient', 'care', 'research', 'biology'
    ]
  },
  engineering: {
    name: '🔧 Engineering',
    keywords: [
      'engineering', 'civil', 'mechanical', 'electrical', 'chemical',
      'structural', 'aerospace', 'automotive', 'industrial',
      'design', 'manufacturing', 'production', 'quality'
    ]
  }
};

// Entry-level keywords (always applied)
const ENTRY_LEVEL_KEYWORDS = [
  'entry level', 'entry-level', 'junior', 'graduate',
  'no experience', 'no prior experience', 'fresh graduate',
  'recent graduate', 'internship', 'trainee', 'apprentice',
  '0 years', 'zero years', 'entry', 'starting', 'beginner',
  'associate', 'early career'
];

// Exclusion keywords (block these)
const EXCLUSION_KEYWORDS = [
  'senior', 'director', 'manager', 'lead', 'head',
  'principal', 'sr ', 'vp', 'vice president',
  'executive', 'chief', 'cto', 'ceo', 'cfo',
  '5 years', '7 years', '10 years', 'experience required',
  'staff', 'principal'
];

// ============================================================
// USER PREFERENCES (stored in memory – resets on restart)
// ============================================================

const userPrefs = {};

function getUserPrefs(userId) {
  if (!userPrefs[userId]) {
    userPrefs[userId] = {
      fields: ['economics'], // default field
      excludeSenior: true,
      showPreview: true,
      notifyOnMatch: true
    };
  }
  return userPrefs[userId];
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

function containsKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function isEntryLevel(text) {
  return containsKeywords(text, ENTRY_LEVEL_KEYWORDS);
}

function isExcluded(text, userPrefs) {
  if (!userPrefs.excludeSenior) return false;
  return containsKeywords(text, EXCLUSION_KEYWORDS);
}

function isRelevantToFields(text, fields) {
  let allKeywords = [];
  fields.forEach(field => {
    if (JOB_FIELDS[field]) {
      allKeywords = allKeywords.concat(JOB_FIELDS[field].keywords);
    }
  });
  return containsKeywords(text, allKeywords);
}

function isMatch(text, userPrefs) {
  const relevant = isRelevantToFields(text, userPrefs.fields);
  const entry = isEntryLevel(text);
  const excluded = isExcluded(text, userPrefs);
  
  return relevant && entry && !excluded;
}

// Smart splitter for bulk messages
function splitJobListings(text) {
  let parts = text.split(/\n\s*\n\s*\n/);

  if (parts.length <= 1) {
    parts = text.split(/\d+\.\s+/).filter(p => p.trim().length > 10);
    if (parts.length > 1) {
      parts = parts.map((p, i) => `${i+1}. ${p.trim()}`);
    }
  }

  if (parts.length <= 1) {
    parts = text.split(/[\n\r]+\s*[-•*]\s+/).filter(p => p.trim().length > 10);
  }

  if (parts.length <= 1) {
    parts = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
  }

  return parts.length > 1 ? parts : [text];
}

// Extract matching jobs and build summary
function extractMatchingSummary(text, userPrefs) {
  const chunks = splitJobListings(text);
  const matchedJobs = [];

  chunks.forEach(chunk => {
    const clean = chunk.trim();
    if (clean.length > 20 && isMatch(clean, userPrefs)) {
      matchedJobs.push(clean);
    }
  });

  if (matchedJobs.length === 0) {
    return null;
  }

  let summary = '';
  
  // Get field names for display
  const fieldNames = userPrefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');
  
  summary += `✅ *Found ${matchedJobs.length} matching job(s)*\n`;
  summary += `📌 *Fields:* ${fieldNames}\n`;
  summary += `📌 *Excluding Senior:* ${userPrefs.excludeSenior ? '✅ Yes' : '❌ No'}\n\n`;
  summary += `────────────────────\n\n`;

  if (userPrefs.showPreview) {
    summary += `📋 *Quick Preview:*\n`;
    matchedJobs.forEach((job, index) => {
      const preview = job.substring(0, 70) + (job.length > 70 ? '...' : '');
      summary += `${index + 1}. ${preview}\n`;
    });
    summary += `\n────────────────────\n\n`;
  }

  summary += `📄 *Full Details:*\n\n`;
  matchedJobs.forEach((job, index) => {
    summary += `📌 *Job ${index + 1}*\n${job}\n\n`;
    summary += `────────────────────\n\n`;
  });

  return summary;
}

// ============================================================
// STATISTICS
// ============================================================

const stats = {
  totalProcessed: 0,
  totalMatched: 0,
  totalRejected: 0,
  byField: {}
};

function updateStats(fields, matched) {
  stats.totalProcessed++;
  if (matched) {
    stats.totalMatched++;
  } else {
    stats.totalRejected++;
  }
  
  fields.forEach(field => {
    if (!stats.byField[field]) {
      stats.byField[field] = { matched: 0, rejected: 0 };
    }
    if (matched) {
      stats.byField[field].matched++;
    } else {
      stats.byField[field].rejected++;
    }
  });
}

// ============================================================
// BOT COMMANDS & HANDLERS
// ============================================================

// Start command – shows main menu
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  await ctx.reply(
    `🤖 *Job Filter Bot*\n\n` +
    `I filter job postings for entry-level positions.\n\n` +
    `📌 *Current Settings:*\n` +
    `• Fields: ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}\n` +
    `• Excluding Senior: ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `• Show Preview: ${prefs.showPreview ? '✅ Yes' : '❌ No'}\n\n` +
    `Forward me a job digest and I'll reply with matching jobs!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Change Fields', 'menu_fields')],
        [Markup.button.callback('⚙️ Settings', 'menu_settings')],
        [Markup.button.callback('📊 Stats', 'menu_stats')],
        [Markup.button.callback('📋 Show My Settings', 'menu_prefs')]
      ])
    }
  );
});

// ============================================================
// INLINE KEYBOARD MENUS
// ============================================================

// Fields menu – shows all categories with toggle buttons
bot.action('menu_fields', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  let buttons = [];
  Object.keys(JOB_FIELDS).forEach(key => {
    const isActive = prefs.fields.includes(key);
    buttons.push([
      Markup.button.callback(
        `${isActive ? '✅' : '⬜'} ${JOB_FIELDS[key].name}`,
        `toggle_field_${key}`
      )
    ]);
  });
  
  buttons.push([
    Markup.button.callback('🔙 Back to Main', 'menu_main')
  ]);
  
  await ctx.editMessageText(
    `📊 *Select Job Categories*\n\n` +
    `Toggle fields on/off. The bot will search for jobs matching ALL selected fields.\n\n` +
    `Selected: ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    }
  );
  await ctx.answerCbQuery();
});

// Toggle fields
Object.keys(JOB_FIELDS).forEach(key => {
  bot.action(`toggle_field_${key}`, async (ctx) => {
    const userId = ctx.from.id;
    const prefs = getUserPrefs(userId);
    
    if (prefs.fields.includes(key)) {
      if (prefs.fields.length === 1) {
        await ctx.answerCbQuery('❌ You must keep at least one field selected!', { showAlert: true });
        return;
      }
      prefs.fields = prefs.fields.filter(f => f !== key);
    } else {
      prefs.fields.push(key);
    }
    
    // Update the menu
    let buttons = [];
    Object.keys(JOB_FIELDS).forEach(k => {
      const isActive = prefs.fields.includes(k);
      buttons.push([
        Markup.button.callback(
          `${isActive ? '✅' : '⬜'} ${JOB_FIELDS[k].name}`,
          `toggle_field_${k}`
        )
      ]);
    });
    buttons.push([
      Markup.button.callback('🔙 Back to Main', 'menu_main')
    ]);
    
    await ctx.editMessageText(
      `📊 *Select Job Categories*\n\n` +
      `Toggle fields on/off. The bot will search for jobs matching ALL selected fields.\n\n` +
      `Selected: ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      }
    );
    await ctx.answerCbQuery();
  });
});

// Settings menu
bot.action('menu_settings', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  await ctx.editMessageText(
    `⚙️ *Settings*\n\n` +
    `Customize how the bot works.\n\n` +
    `📌 *Exclude Senior Roles:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Show Preview:* ${prefs.showPreview ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notify on Match:* ${prefs.notifyOnMatch ? '✅ Yes' : '❌ No'}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(
          `Toggle Senior Exclusion ${prefs.excludeSenior ? '🔴' : '🟢'}`,
          'toggle_exclude'
        )],
        [Markup.button.callback(
          `Toggle Preview ${prefs.showPreview ? '🔴' : '🟢'}`,
          'toggle_preview'
        )],
        [Markup.button.callback(`Toggle Notify ${prefs.notifyOnMatch ? '🔴' : '🟢'}`, 'toggle_notify')],
        [Markup.button.callback('🔙 Back to Main', 'menu_main')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// Toggle exclusions
bot.action('toggle_exclude', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  prefs.excludeSenior = !prefs.excludeSenior;
  await ctx.answerCbQuery(`Senior exclusion ${prefs.excludeSenior ? '✅ ENABLED' : '❌ DISABLED'}`);
  await ctx.editMessageText(
    `✅ Senior exclusion ${prefs.excludeSenior ? 'ENABLED' : 'DISABLED'}!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Settings', 'menu_settings')],
        [Markup.button.callback('🏠 Back to Main', 'menu_main')]
      ])
    }
  );
});

// Toggle preview
bot.action('toggle_preview', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  prefs.showPreview = !prefs.showPreview;
  await ctx.answerCbQuery(`Preview ${prefs.showPreview ? '✅ ENABLED' : '❌ DISABLED'}`);
  await ctx.editMessageText(
    `✅ Preview ${prefs.showPreview ? 'ENABLED' : 'DISABLED'}!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Settings', 'menu_settings')],
        [Markup.button.callback('🏠 Back to Main', 'menu_main')]
      ])
    }
  );
});

// Toggle notify
bot.action('toggle_notify', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  prefs.notifyOnMatch = !prefs.notifyOnMatch;
  await ctx.answerCbQuery(`Notify ${prefs.notifyOnMatch ? '✅ ENABLED' : '❌ DISABLED'}`);
  await ctx.editMessageText(
    `✅ Notify ${prefs.notifyOnMatch ? 'ENABLED' : 'DISABLED'}!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Settings', 'menu_settings')],
        [Markup.button.callback('🏠 Back to Main', 'menu_main')]
      ])
    }
  );
});

// Stats menu
bot.action('menu_stats', async (ctx) => {
  const matchRate = stats.totalProcessed > 0 
    ? Math.round((stats.totalMatched / stats.totalProcessed) * 100) 
    : 0;
  
  let fieldStats = '';
  Object.keys(stats.byField).forEach(key => {
    const s = stats.byField[key];
    const total = s.matched + s.rejected;
    const rate = total > 0 ? Math.round((s.matched / total) * 100) : 0;
    fieldStats += `📌 ${JOB_FIELDS[key]?.name || key}: ${s.matched}/${total} (${rate}%)\n`;
  });
  
  await ctx.editMessageText(
    `📊 *Bot Statistics*\n\n` +
    `📨 Total processed: ${stats.totalProcessed}\n` +
    `✅ Matched: ${stats.totalMatched}\n` +
    `❌ Rejected: ${stats.totalRejected}\n` +
    `📈 Match rate: ${matchRate}%\n\n` +
    `*By Field:*\n${fieldStats}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Reset Stats', 'reset_stats')],
        [Markup.button.callback('🔙 Back to Main', 'menu_main')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// Reset stats
bot.action('reset_stats', async (ctx) => {
  stats.totalProcessed = 0;
  stats.totalMatched = 0;
  stats.totalRejected = 0;
  stats.byField = {};
  await ctx.answerCbQuery('📊 Stats reset!');
  await ctx.editMessageText(
    '✅ *Statistics have been reset!*',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 View Stats', 'menu_stats')],
        [Markup.button.callback('🏠 Back to Main', 'menu_main')]
      ])
    }
  );
});

// Show user preferences
bot.action('menu_prefs', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  await ctx.editMessageText(
    `📋 *Your Settings*\n\n` +
    `📌 *Fields:* ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Show Preview:* ${prefs.showPreview ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notify on Match:* ${prefs.notifyOnMatch ? '✅ Yes' : '❌ No'}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back to Main', 'menu_main')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// Back to main menu
bot.action('menu_main', async (ctx) => {
  await ctx.editMessageText(
    `🏠 *Main Menu*\n\nSelect an option below:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Change Fields', 'menu_fields')],
        [Markup.button.callback('⚙️ Settings', 'menu_settings')],
        [Markup.button.callback('📊 Stats', 'menu_stats')],
        [Markup.button.callback('📋 Show My Settings', 'menu_prefs')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// ============================================================
// COMMANDS (Text-based)
// ============================================================

// Help command
bot.command('help', (ctx) => {
  ctx.reply(
    `🤖 *Job Filter Bot - Help*\n\n` +
    `📌 *Commands:*\n` +
    `/start - Show main menu\n` +
    `/help - Show this help\n` +
    `/fields - Show selected fields\n` +
    `/stats - Show statistics\n` +
    `/settings - Show current settings\n` +
    `/prefs - Show your preferences\n\n` +
    `📌 *How to use:*\n` +
    `Forward any job digest to me and I'll filter it.\n` +
    `Use the buttons below to customize my behavior!`,
    { parse_mode: 'Markdown' }
  );
});

// Fields command
bot.command('fields', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  const fields = prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');
  ctx.reply(`📊 *Selected Fields:* ${fields}`, { parse_mode: 'Markdown' });
});

// Stats command
bot.command('stats', (ctx) => {
  const matchRate = stats.totalProcessed > 0 
    ? Math.round((stats.totalMatched / stats.totalProcessed) * 100) 
    : 0;
  ctx.reply(
    `📊 *Bot Statistics*\n\n` +
    `📨 Total processed: ${stats.totalProcessed}\n` +
    `✅ Matched: ${stats.totalMatched}\n` +
    `❌ Rejected: ${stats.totalRejected}\n` +
    `📈 Match rate: ${matchRate}%`,
    { parse_mode: 'Markdown' }
  );
});

// Settings command
bot.command('settings', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  ctx.reply(
    `⚙️ *Settings*\n\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Show Preview:* ${prefs.showPreview ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notify on Match:* ${prefs.notifyOnMatch ? '✅ Yes' : '❌ No'}`,
    { parse_mode: 'Markdown' }
  );
});

// Preferences command
bot.command('prefs', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  const fields = prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');
  ctx.reply(
    `📋 *Your Preferences*\n\n` +
    `📌 *Fields:* ${fields}\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Show Preview:* ${prefs.showPreview ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notify on Match:* ${prefs.notifyOnMatch ? '✅ Yes' : '❌ No'}`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// MESSAGE HANDLER
// ============================================================

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  const messageText = ctx.message.text;

  if (messageText.startsWith('/')) return;

  // Show typing indicator
  await ctx.sendChatAction('typing');

  const summary = extractMatchingSummary(messageText, prefs);
  updateStats(prefs.fields, !!summary);

  if (summary) {
    await ctx.reply(summary, { parse_mode: 'Markdown' });
    if (prefs.notifyOnMatch) {
      await ctx.reply('🔔 *New match found!* Forward more job digests!', { parse_mode: 'Markdown' });
    }
  } else {
    await ctx.reply('❌ No matching entry-level jobs found in this batch.');
  }
});

// ============================================================
// START BOT
// ============================================================

bot.launch()
  .then(() => console.log('🚀 Bot is running...'))
  .catch(err => console.error('Error starting bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
