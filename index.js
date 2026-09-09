const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================================================
// ECONOMICS KEYWORDS (extensive – English, Amharic, Afan Oromo)
// ============================================================

const ECONOMICS_KEYWORDS = [
  // English
  'economics', 'economist', 'economic', 'finance', 'financial',
  'business', 'analyst', 'data analysis', 'market', 'policy',
  'research', 'statistics', 'econometric', 'macro', 'micro',
  'banking', 'investment', 'consulting', 'advisory', 'budget',
  'forecast', 'model', 'pricing', 'strategy', 'development',
  'trade', 'commerce', 'accounting', 'audit', 'tax',
  // Amharic
  'ኢኮኖሚክስ', 'ኢኮኖሚ', 'ፋይናንስ', 'ባንክ', 'ንግድ', 'ገበያ',
  'ምርምር', 'ስታቲስቲክስ', 'ኢንቨስትመንት', 'አማካሪ', 'በጀት',
  'ትንበያ', 'ሞዴል', 'የዋጋ አወጣጥ', 'ስትራቴጂ', 'ልማት',
  // Afan Oromo
  'ekinomics', 'qonna', 'maallaqa', 'bankii', 'daldala',
  'qorannoo', 'tilmaama', 'invastimenti', 'gorsa', 'baajata',
  'odeeffannoo', 'akkoomsa', 'guddina', 'daldala biyyaalessaa'
];

// ============================================================
// ENTRY LEVEL KEYWORDS (multi‑language)
// ============================================================

const ENTRY_LEVEL_KEYWORDS = [
  'entry level', 'entry-level', 'junior', 'graduate',
  'no experience', 'no prior experience', 'fresh graduate',
  'recent graduate', 'internship', 'trainee', 'apprentice',
  '0 years', 'zero years', 'entry', 'starting', 'beginner',
  'associate', 'early career',
  'ጅምር', 'አዲስ', 'ልምድ የሌለ', 'ተለማማጅ', 'ተማሪ', 'ጀማሪ',
  'ያለ ልምድ', 'አዲስ ተመራቂ',
  'jirmi', 'haaraa', 'muuxannoo hin qabne', 'leennii',
  'barnootaa', 'kan jalqabe', 'muuxannoo malee',
  'haaraa eebbifame'
];

// ============================================================
// EXCLUSION KEYWORDS (block senior/manager)
// ============================================================

const EXCLUSION_KEYWORDS = [
  'senior', 'director', 'manager', 'lead', 'head',
  'principal', 'sr ', 'vp', 'vice president',
  'executive', 'chief', 'cto', 'ceo', 'cfo',
  '5 years', '7 years', '10 years', 'experience required',
  'staff', 'principal',
  'ከፍተኛ', 'ዳይሬክተር', 'ማናጀር', 'ርዕሰ', 'መሪ',
  'ልምድ የሚጠይቅ', 'አስፈፃሚ', 'አለቃ',
  "ol'aanaa", 'daayireektara', 'manaajara', 'hojjataa',
  'muuxannoo barbaada', 'hooggantoo'
];

// ============================================================
// USER DATA (in‑memory – resets on restart)
// ============================================================

const userPrefs = {};       // settings per user
const userSaved = {};       // saved jobs per user

function getPrefs(userId) {
  if (!userPrefs[userId]) {
    userPrefs[userId] = {
      excludeSenior: true,
    };
  }
  return userPrefs[userId];
}

function getSaved(userId) {
  if (!userSaved[userId]) {
    userSaved[userId] = [];
  }
  return userSaved[userId];
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}

function isEntryLevel(text) {
  return containsAny(text, ENTRY_LEVEL_KEYWORDS);
}

function isExcluded(text, prefs) {
  if (!prefs.excludeSenior) return false;
  return containsAny(text, EXCLUSION_KEYWORDS);
}

function isEconomics(text) {
  return containsAny(text, ECONOMICS_KEYWORDS);
}

// Relevance score: count how many economics keywords appear
function getScore(text) {
  const lower = text.toLowerCase();
  let count = 0;
  for (const kw of ECONOMICS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) count++;
  }
  // cap at 10 for rating
  if (count >= 6) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

function isMatch(text, prefs) {
  const relevant = isEconomics(text) && isEntryLevel(text);
  const excluded = isExcluded(text, prefs);
  return relevant && !excluded;
}

// Split bulk text into job chunks
function splitJobs(text) {
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

// ============================================================
// PROCESSING & SUMMARY
// ============================================================

function processDigest(text, userId) {
  const prefs = getPrefs(userId);
  const chunks = splitJobs(text);
  const matched = [];

  chunks.forEach(chunk => {
    const clean = chunk.trim();
    if (clean.length > 20 && isMatch(clean, prefs)) {
      const score = getScore(clean);
      matched.push({ text: clean, score });
    }
  });

  if (matched.length === 0) return null;

  // Sort by score (highest first)
  matched.sort((a, b) => b.score - a.score);

  // Build compact summary
  let summary = `✅ Found *${matched.length}* Economics job(s)\n\n`;
  matched.forEach((job, i) => {
    const stars = '★'.repeat(job.score) + '☆'.repeat(3 - job.score);
    const lines = job.text.split('\n').filter(l => l.trim().length > 0);
    const title = lines[0] ? lines[0].trim() : job.text.substring(0, 60);
    summary += `${i+1}. ${title}  ${stars}\n`;
  });

  // Store matches for detail view and saving
  const matchId = Date.now().toString();
  if (!global.jobCache) global.jobCache = {};
  if (!global.jobCache[userId]) global.jobCache[userId] = {};
  global.jobCache[userId][matchId] = matched.map(j => j.text);

  return {
    summary,
    matchId,
    count: matched.length,
  };
}

// ============================================================
// STATISTICS
// ============================================================

const stats = { processed: 0, matched: 0, rejected: 0 };

// ============================================================
// BOT COMMANDS & ACTIONS
// ============================================================

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getPrefs(userId);
  const saved = getSaved(userId);

  await ctx.reply(
    `📈 *Economics Job Filter*\n\n` +
    `I scan job digests for *entry‑level Economics* positions.\n` +
    `🔹 Supports English, Amharic, Afan Oromo\n` +
    `🔹 Excludes senior/manager roles ${prefs.excludeSenior ? '✅' : '❌'}\n` +
    `🔹 ${saved.length} saved job(s)\n\n` +
    `Forward me a job list – I’ll give a quick summary with ★ ratings!`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 View Stats', 'stats')],
        [Markup.button.callback('💾 Saved Jobs', 'saved')],
        [Markup.button.callback('⚙️ Toggle Senior Exclusion', 'toggle_senior')],
        [Markup.button.callback('🔄 Clear Saved', 'clear_saved')]
      ])
    }
  );
});

// ---------- Stats ----------
bot.action('stats', async (ctx) => {
  const rate = stats.processed > 0 ? Math.round((stats.matched / stats.processed) * 100) : 0;
  await ctx.editMessageText(
    `📊 *Statistics*\n\n` +
    `📨 Processed: ${stats.processed}\n` +
    `✅ Matched: ${stats.matched}\n` +
    `❌ Rejected: ${stats.rejected}\n` +
    `📈 Match rate: ${rate}%`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back', 'back_main')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// ---------- Toggle senior exclusion ----------
bot.action('toggle_senior', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getPrefs(userId);
  prefs.excludeSenior = !prefs.excludeSenior;
  await ctx.answerCbQuery(`Senior exclusion ${prefs.excludeSenior ? '✅ ON' : '❌ OFF'}`);
  await ctx.editMessageText(
    `✅ Senior exclusion is now ${prefs.excludeSenior ? 'ON' : 'OFF'}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back', 'back_main')]
      ])
    }
  );
});

// ---------- Saved jobs ----------
bot.action('saved', async (ctx) => {
  const userId = ctx.from.id;
  const saved = getSaved(userId);
  if (saved.length === 0) {
    await ctx.answerCbQuery('No saved jobs yet.', { showAlert: true });
    return;
  }
  let msg = `💾 *Saved Jobs (${saved.length})*\n\n`;
  saved.forEach((job, i) => {
    const title = job.split('\n')[0].trim() || job.substring(0, 40);
    msg += `${i+1}. ${title}\n`;
  });
  msg += `\nTap a number below to delete it.`;

  const buttons = saved.map((_, i) => [
    Markup.button.callback(`❌ Delete #${i+1}`, `del_saved_${i}`)
  ]);
  buttons.push([Markup.button.callback('🔙 Back', 'back_main')]);

  await ctx.editMessageText(msg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(buttons)
  });
  await ctx.answerCbQuery();
});

// ---------- Delete individual saved job ----------
bot.action(/del_saved_(\d+)/, async (ctx) => {
  const userId = ctx.from.id;
  const idx = parseInt(ctx.match[1]);
  const saved = getSaved(userId);
  if (idx >= 0 && idx < saved.length) {
    const removed = saved.splice(idx, 1)[0];
    await ctx.answerCbQuery(`🗑️ Deleted: ${removed.split('\n')[0].substring(0, 30)}...`);
  } else {
    await ctx.answerCbQuery('Job not found.', { showAlert: true });
  }
  // Refresh saved list
  await ctx.editMessageText(
    `💾 Saved list updated. ${saved.length} job(s) remaining.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📋 View Saved', 'saved')],
        [Markup.button.callback('🔙 Back', 'back_main')]
      ])
    }
  );
});

// ---------- Clear all saved ----------
bot.action('clear_saved', async (ctx) => {
  const userId = ctx.from.id;
  const saved = getSaved(userId);
  saved.length = 0; // empty array
  await ctx.answerCbQuery('🗑️ All saved jobs cleared.');
  await ctx.editMessageText(
    '✅ All saved jobs have been deleted.',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🔙 Back', 'back_main')]
      ])
    }
  );
});

// ---------- Show details and save all ----------
bot.action(/details_(.+)/, async (ctx) => {
  const userId = ctx.from.id;
  const matchId = ctx.match[1];
  const cache = global.jobCache?.[userId]?.[matchId];
  if (!cache || cache.length === 0) {
    await ctx.answerCbQuery('❌ Expired. Forward a new digest.', { showAlert: true });
    return;
  }

  let detailMsg = `📄 *Full Job Details*\n\n`;
  cache.forEach((job, i) => {
    const stars = '★'.repeat(getScore(job)) + '☆'.repeat(3 - getScore(job));
    detailMsg += `📌 *Job ${i+1}*  ${stars}\n${job}\n\n────────────\n\n`;
  });

  if (detailMsg.length > 4000) {
    detailMsg = detailMsg.substring(0, 3900) + '\n\n... (truncated)';
  }

  // Buttons: Save All + Back
  await ctx.reply(detailMsg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`💾 Save All (${cache.length})`, `save_all_${matchId}`)],
      [Markup.button.callback('🔙 Back to Summary', 'back_main')]
    ])
  });
  await ctx.answerCbQuery();
});

// ---------- Save all from a digest ----------
bot.action(/save_all_(.+)/, async (ctx) => {
  const userId = ctx.from.id;
  const matchId = ctx.match[1];
  const cache = global.jobCache?.[userId]?.[matchId];
  if (!cache || cache.length === 0) {
    await ctx.answerCbQuery('❌ No jobs to save.', { showAlert: true });
    return;
  }
  const saved = getSaved(userId);
  cache.forEach(job => {
    if (!saved.includes(job)) saved.push(job);
  });
  await ctx.answerCbQuery(`💾 ${cache.length} job(s) saved!`);
  await ctx.editMessageText(
    `✅ *Saved ${cache.length} job(s)!*\n\n` +
    `You now have ${saved.length} total saved jobs.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💾 View Saved', 'saved')],
        [Markup.button.callback('🔙 Back', 'back_main')]
      ])
    }
  );
});

// ---------- Back to main ----------
bot.action('back_main', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getPrefs(userId);
  const saved = getSaved(userId);
  await ctx.editMessageText(
    `📈 *Economics Job Filter*\n\n` +
    `🔹 Excludes senior/manager ${prefs.excludeSenior ? '✅' : '❌'}\n` +
    `🔹 ${saved.length} saved job(s)\n\n` +
    `Forward a digest to get started.`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📊 Stats', 'stats')],
        [Markup.button.callback('💾 Saved Jobs', 'saved')],
        [Markup.button.callback('⚙️ Toggle Senior', 'toggle_senior')],
        [Markup.button.callback('🔄 Clear Saved', 'clear_saved')]
      ])
    }
  );
  await ctx.answerCbQuery();
});

// ============================================================
// TEXT MESSAGE HANDLER
// ============================================================

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  if (text.startsWith('/')) return;

  stats.processed++;
  await ctx.sendChatAction('typing');

  const result = processDigest(text, userId);
  if (!result) {
    stats.rejected++;
    // 🔇 Silent – no reply on no matches
    return;
  }

  stats.matched++;
  const summary = result.summary;

  // Show compact summary with a "Details" button
  await ctx.reply(summary, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(`📄 View Details & Save All (${result.count})`, `details_${result.matchId}`)],
      [Markup.button.callback('💾 Save All', `save_all_${result.matchId}`)]
    ])
  });
});

// ============================================================
// COMMANDS (persistent menu)
// ============================================================

bot.command('start', (ctx) => {
  // We already have start, but we can redirect to main menu
  ctx.reply('Use the buttons below or forward a job digest.', {
    ...Markup.inlineKeyboard([
      [Markup.button.callback('🏠 Main Menu', 'back_main')]
    ])
  });
});

// ============================================================
// LAUNCH BOT
// ============================================================

bot.launch()
  .then(async () => {
    console.log('🚀 Economics Job Bot is running...');
    await bot.telegram.setMyCommands([
      { command: 'start', description: '🏠 Main menu' },
    ]);
    console.log('✅ Commands registered');
  })
  .catch(err => console.error('Error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
