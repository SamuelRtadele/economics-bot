const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ============================================================
// JOB FIELDS WITH MULTI-LANGUAGE SUPPORT
// ============================================================

const JOB_FIELDS = {
  economics: {
    name: '📊 Economics',
    keywords: [
      // English
      'economics', 'economist', 'economic', 'finance', 'financial',
      'business', 'analyst', 'data analysis', 'market', 'policy',
      'research', 'statistics', 'econometric', 'macro', 'micro',
      'banking', 'investment', 'consulting', 'advisory',
      // Ethiopia-specific
      'revenues bureau', 'tax audit', 'public finance', 'development economics',
      'microfinance', 'bank', 'insurance', 'trade', 'industry',
      // Amharic
      'ኢኮኖሚክስ', 'ኢኮኖሚ', 'ፋይናንስ', 'ባንክ', 'ንግድ', 'ገበያ',
      'ምርምር', 'ስታቲስቲክስ', 'ኢንቨስትመንት', 'አማካሪ',
      'የገቢዎች ቢሮ', 'የግብር ኦዲት', 'ህዝባዊ ፋይናንስ', 'ልማት ኢኮኖሚክስ',
      'ማይክሮፋይናንስ', 'ባንክ', 'ኢንሹራንስ', 'ንግድ', 'ኢንዱስትሪ',
      // Afan Oromo
      'ekinomics', 'qonna', 'maallaqa', 'bankii', 'daldala',
      'qorannoo', 'tilmaama', 'invastimenti', 'gorsa',
      'buuroo galii', 'qorannoo qaraxii', 'maallaqa ummataa', 'ekinomics misooma',
      'maallaqa xinnoo', 'baankii', 'inshuraansii', 'daldala', 'industirii'
    ]
  },
  tech: {
    name: '💻 Technology',
    keywords: [
      // English
      'software', 'developer', 'engineer', 'programming', 'coding',
      'javascript', 'python', 'java', 'react', 'node', 'full stack',
      'frontend', 'backend', 'devops', 'cloud', 'aws', 'data science',
      'machine learning', 'ai', 'artificial intelligence',
      // Amharic
      'ሶፍትዌር', 'ፕሮግራም', 'ኮድ', 'ጃቫስክሪፕት', 'ፓይተን',
      'ዳታ', 'ማሽን', 'ክላውድ', 'ኢንጂነር',
      // Afan Oromo
      'softiweerii', 'prograamii', 'koodii', 'jazzavaskiripti',
      'paayiton', 'daataa', 'maashinii', 'kilaawudii', 'injiniyera'
    ]
  },
  finance: {
    name: '💰 Finance',
    keywords: [
      // English
      'finance', 'financial', 'investment', 'banking', 'analyst',
      'portfolio', 'asset management', 'wealth', 'trading',
      'equity', 'fixed income', 'derivatives', 'risk', 'compliance',
      // Amharic
      'ፋይናንስ', 'ኢንቨስትመንት', 'ባንክ', 'ንብረት', 'ንግድ',
      'አደጋ', 'ተገዢነት',
      // Afan Oromo
      'maallaqa', 'invastimenti', 'bankii', 'qabeenyaa', 'daldala',
      'rakkoo', 'fudhatama'
    ]
  },
  marketing: {
    name: '📢 Marketing',
    keywords: [
      // English
      'marketing', 'digital marketing', 'seo', 'social media',
      'content', 'brand', 'advertising', 'pr', 'communications',
      'campaign', 'analytics', 'growth', 'influencer',
      // Amharic
      'ግብይት', 'ዲጂታል', 'ማህበራዊ', 'ብራንድ', 'ማስታወቂያ',
      'ግንኙነት', 'ዘመቻ', 'እድገት',
      // Afan Oromo (FIXED: double quotes around olka'ina)
      'gabbii', 'dijitaala', 'hawaasa', 'balbala', 'beeksisa',
      'quunnamtii', "olka'ina"
    ]
  },
  healthcare: {
    name: '🏥 Healthcare',
    keywords: [
      // English
      'healthcare', 'medical', 'clinical', 'nursing', 'doctor',
      'pharmaceutical', 'public health', 'health', 'wellness',
      'hospital', 'patient', 'care', 'research', 'biology',
      // Amharic
      'ጤና', 'ህክምና', 'ክሊኒካል', 'ነርሲንግ', 'ዶክተር',
      'ፋርማሲ', 'ሆስፒታል', 'ታካሚ', 'ምርምር',
      // Afan Oromo
      'fayyaa', 'yaala', 'klinikaala', 'narsingii', 'doktara',
      'farmaasii', 'hospitaala', 'dhukkubsataa', 'qorannoo'
    ]
  },
  engineering: {
    name: '🔧 Engineering',
    keywords: [
      // English
      'engineering', 'civil', 'mechanical', 'electrical', 'chemical',
      'structural', 'aerospace', 'automotive', 'industrial',
      'design', 'manufacturing', 'production', 'quality',
      // Amharic
      'ኢንጂነሪንግ', 'ሲቪል', 'ሜካኒካል', 'ኤሌክትሪካል', 'ኬሚካል',
      'ንድፍ', 'ማምረቻ', 'ጥራት',
      // Afan Oromo
      'injiniyera', 'siviili', 'mekaaniikaala', 'elektirikaala', 'keemikaala',
      'faayidaa', 'oomisha', 'gaabbii'
    ]
  }
};

// ============================================================
// ENTRY LEVEL KEYWORDS (Multi-language)
// ============================================================

const ENTRY_LEVEL_KEYWORDS = [
  // English
  'entry level', 'entry-level', 'junior', 'graduate',
  'no experience', 'no prior experience', 'fresh graduate',
  'recent graduate', 'internship', 'trainee', 'apprentice',
  '0 years', 'zero years', 'entry', 'starting', 'beginner',
  'associate', 'early career',
  // Ethiopia-specific
  'fresh', '0 year', 'zero year', 'graduate trainee', 'trainee',
  // Amharic
  'ጅምር', 'አዲስ', 'ልምድ የሌለ', 'ተለማማጅ', 'ተማሪ', 'ጀማሪ',
  'ያለ ልምድ', 'አዲስ ተመራቂ', '0 ዓመት', 'ዜሮ ዓመት',
  // Afan Oromo
  'jirmi', 'haaraa', 'muuxannoo hin qabne', 'leennii', 'barnootaa',
  'kan jalqabe', 'muuxannoo malee', 'haaraa eebbifame'
];

// ============================================================
// EXCLUSION KEYWORDS (Multi-language)
// ============================================================

const EXCLUSION_KEYWORDS = [
  // English
  'senior', 'director', 'manager', 'lead', 'head',
  'principal', 'sr ', 'vp', 'vice president',
  'executive', 'chief', 'cto', 'ceo', 'cfo',
  '5 years', '7 years', '10 years', 'experience required',
  'staff', 'principal',
  // Amharic
  'ከፍተኛ', 'ዳይሬክተር', 'ማናጀር', 'ርዕሰ', 'መሪ',
  'ልምድ የሚጠይቅ', 'አስፈፃሚ', 'አለቃ',
  // Afan Oromo
  "ol'aanaa", 'daayireektara', 'manaajara', 'hojjataa', 'qabxii',
  'muuxannoo barbaada', 'hooggantoo'
];

// ============================================================
// USER PREFERENCES
// ============================================================

const userPrefs = {};
const jobMatches = {};

function getUserPrefs(userId) {
  if (!userPrefs[userId]) {
    userPrefs[userId] = {
      fields: ['economics'],
      excludeSenior: true,
      notifyOnMatch: true,
    };
  }
  return userPrefs[userId];
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

function containsKeywords(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword.toLowerCase()));
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

// Smart splitter
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

// Extract matching jobs with clean formatting
function extractMatchingSummary(text, userPrefs, userId) {
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

  // Store matches for detail view
  if (!jobMatches[userId]) {
    jobMatches[userId] = {};
  }
  const matchId = Date.now().toString();
  jobMatches[userId][matchId] = matchedJobs;

  const fieldNames = userPrefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');

  let summary = '';
  
  summary += `✅ *${matchedJobs.length} job(s) found*\n`;
  summary += `📌 ${fieldNames}\n`;
  if (userPrefs.excludeSenior) summary += `🚫 Senior roles excluded\n`;
  summary += `────────────────────\n\n`;

  matchedJobs.forEach((job, index) => {
    const lines = job.split('\n').filter(line => line.trim().length > 0);
    const title = lines.length > 0 ? lines[0].trim() : job.substring(0, 60);
    
    const hasSalary = /[\$\€\£]|salary|ቤታ|kaffaltii/i.test(job);
    
    summary += `${index + 1}. `;
    summary += title.length > 80 ? title.substring(0, 80) + '...' : title;
    if (hasSalary) summary += ' 💰';
    summary += '\n';
  });

  const buttons = [
    [Markup.button.callback(`📄 Show Full Details (${matchedJobs.length})`, `show_details_${matchId}`)],
    [Markup.button.callback('🔙 Back to Main', 'menu_main')]
  ];

  return {
    summary,
    buttons,
    matchId,
    hasMatches: true
  };
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

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  await ctx.reply(
    `🤖 *Job Filter Bot - Ethiopia Edition*\n\n` +
    `I filter job postings for entry-level positions.\n` +
    `Supports: English, Amharic, Afan Oromo\n\n` +
    `📌 *Current Settings:*\n` +
    `• Fields: ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}\n` +
    `• Excluding Senior: ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `• Notifications: ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}\n\n` +
    `📌 *Commands:*\n` +
    `/search - Show Ethiopian job sites\n` +
    `/notify - Toggle notifications\n` +
    `/stats - Show statistics\n\n` +
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
// WEB SEARCH COMMAND (Ethiopia-focused)
// ============================================================

bot.command('search', async (ctx) => {
  await ctx.reply(
    `🔍 *Searching for Economics Jobs in Ethiopia*\n\n` +
    `I'll search for fresh graduate Economics positions from Ethiopian job portals.\n\n` +
    `📌 *Recommended sites:*\n` +
    `• EthiopianWork.com - Fresh graduate vacancies\n` +
    `• GeezJobs.com - Economics/Statistics jobs\n` +
    `• ElelanJobs.com - Fresh graduate jobs\n` +
    `• GizeJobs.com - Economics category\n` +
    `• Ethio-jobs.net.et - Economics jobs\n` +
    `• EthiopianReporterJobs.com - Economics jobs\n\n` +
    `💡 *Tip:* Forward job postings from these sites to me and I'll filter them automatically!`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// NOTIFICATION COMMAND
// ============================================================

bot.command('notify', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  prefs.notifyOnMatch = !prefs.notifyOnMatch;
  
  await ctx.reply(
    `🔔 *Notification ${prefs.notifyOnMatch ? 'ENABLED ✅' : 'DISABLED ❌'}*\n\n` +
    `When enabled, I'll send you an alert when I find a matching job in a forwarded message.`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================================
// SHOW DETAILS BUTTON HANDLER
// ============================================================

bot.action(/show_details_(.+)/, async (ctx) => {
  const userId = ctx.from.id;
  const matchId = ctx.match[1];
  
  if (!jobMatches[userId] || !jobMatches[userId][matchId]) {
    await ctx.answerCbQuery('❌ Matches expired. Forward a new digest!', { showAlert: true });
    return;
  }

  const matches = jobMatches[userId][matchId];
  let details = `📄 *Full Job Details*\n\n`;
  
  matches.forEach((job, index) => {
    details += `📌 *Job ${index + 1}*\n${job}\n\n`;
    details += `────────────────────\n\n`;
  });

  if (details.length > 4000) {
    details = details.substring(0, 3900) + '\n\n... (truncated)';
  }

  await ctx.reply(details, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📊 Change Fields', 'menu_fields')],
      [Markup.button.callback('🔙 Back to Main', 'menu_main')]
    ])
  });

  await ctx.answerCbQuery();
});

// ============================================================
// INLINE KEYBOARD MENUS
// ============================================================

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
    `Selected: ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}\n\n` +
    `🔄 *Tip:* Click a button to toggle it.`,
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
      `Toggle fields on/off.\n\n` +
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
    `📌 *Exclude Senior Roles:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notifications:* ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(
          `Toggle Senior Exclusion ${prefs.excludeSenior ? '🔴' : '🟢'}`,
          'toggle_exclude'
        )],
        [Markup.button.callback(
          `Toggle Notifications ${prefs.notifyOnMatch ? '🔴' : '🟢'}`,
          'toggle_notify'
        )],
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

// Toggle notify
bot.action('toggle_notify', async (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  prefs.notifyOnMatch = !prefs.notifyOnMatch;
  await ctx.answerCbQuery(`Notifications ${prefs.notifyOnMatch ? '✅ ENABLED' : '❌ DISABLED'}`);
  
  await ctx.editMessageText(
    `✅ Notifications ${prefs.notifyOnMatch ? 'ENABLED' : 'DISABLED'}!`,
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
    `*By Field:*\n${fieldStats || 'No data yet'}`,
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
    `📌 *Notifications:* ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}\n\n` +
    `🌍 *Languages Supported:* English, Amharic, Afan Oromo\n\n` +
    `📌 *Ethiopian Job Sites:* EthiopianWork, GeezJobs, ElelanJobs, GizeJobs, Ethiojobs, EthiopianReporterJobs`,
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
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  
  await ctx.editMessageText(
    `🏠 *Main Menu*\n\n` +
    `📌 *Fields:* ${prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ')}\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notifications:* ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}\n\n` +
    `Select an option below:`,
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
// COMMANDS
// ============================================================

bot.command('help', (ctx) => {
  ctx.reply(
    `🤖 *Job Filter Bot - Help*\n\n` +
    `📌 *Commands:*\n` +
    `/start - Show main menu\n` +
    `/help - Show this help\n` +
    `/search - Show Ethiopian job sites\n` +
    `/notify - Toggle notifications\n` +
    `/fields - Show selected fields\n` +
    `/stats - Show statistics\n` +
    `/settings - Show current settings\n` +
    `/prefs - Show your preferences\n\n` +
    `📌 *Languages:* English, Amharic, Afan Oromo\n\n` +
    `📌 *How to use:*\n` +
    `Forward any job digest to me and I'll filter it.\n` +
    `I'll show a compact list with a "Show Details" button!`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('fields', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  const fields = prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');
  ctx.reply(`📊 *Selected Fields:* ${fields}`, { parse_mode: 'Markdown' });
});

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

bot.command('settings', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  ctx.reply(
    `⚙️ *Settings*\n\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notifications:* ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('prefs', (ctx) => {
  const userId = ctx.from.id;
  const prefs = getUserPrefs(userId);
  const fields = prefs.fields.map(f => JOB_FIELDS[f]?.name || f).join(', ');
  ctx.reply(
    `📋 *Your Preferences*\n\n` +
    `📌 *Fields:* ${fields}\n` +
    `📌 *Exclude Senior:* ${prefs.excludeSenior ? '✅ Yes' : '❌ No'}\n` +
    `📌 *Notifications:* ${prefs.notifyOnMatch ? '✅ On' : '❌ Off'}\n\n` +
    `🌍 *Languages:* English, Amharic, Afan Oromo\n\n` +
    `📌 *Ethiopian Job Sites:* EthiopianWork, GeezJobs, ElelanJobs, GizeJobs, Ethiojobs, EthiopianReporterJobs`,
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

  await ctx.sendChatAction('typing');

  const result = extractMatchingSummary(messageText, prefs, userId);
  updateStats(prefs.fields, !!result);

  if (result) {
    await ctx.reply(result.summary, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(result.buttons)
    });
    
    if (prefs.notifyOnMatch) {
      await ctx.reply(
        `🔔 *New job match found!*\n\n` +
        `Forward more job digests to keep finding opportunities!`,
        { parse_mode: 'Markdown' }
      );
    }
  } else {
    await ctx.reply('❌ No matching entry-level Economics jobs found in this batch.');
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
