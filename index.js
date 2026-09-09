const { Telegraf } = require('telegraf');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// ------------------- Keyword Lists -------------------
const entryLevelKeywords = [
'entry level', 'entry-level', 'junior',
'no experience', 'no prior experience',
'fresh graduate', 'recent graduate',
'internship', 'trainee', 'apprentice',
'0 years', 'zero years', 'graduate',
'entry', 'starting', 'beginner'
];

const economicsKeywords = [
'economics', 'economist', 'economic',
'finance', 'financial', 'business',
'analyst', 'data analysis', 'market',
'policy', 'research', 'statistics',
'econometric', 'macro', 'micro'
];

// ------------------- Helper Functions -------------------
function containsKeywords(text, keywords) {
const lower = text.toLowerCase();
return keywords.some(keyword => lower.includes(keyword));
}

function isEntryLevel(text) {
return containsKeywords(text, entryLevelKeywords);
}

function isEconomicsRelated(text) {
return containsKeywords(text, economicsKeywords);
}

function isMatch(text) {
return isEntryLevel(text) && isEconomicsRelated(text);
}

// ----- Smart splitter: breaks bulk text into individual jobs -----
function splitJobListings(text) {
let parts = text.split(/\n\s*\n\s*\n/);

if (parts.length <= 1) {
parts = text.split(/\d+.\s+/).filter(p => p.trim().length > 10);
if (parts.length > 1) {
// FIXED LINE BELOW (uses backticks)
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

// ----- Extract matching jobs and build a summary -----
function extractMatchingSummary(text) {
const chunks = splitJobListings(text);
const matchedJobs = [];

chunks.forEach(chunk => {
const clean = chunk.trim();
if (clean.length > 20 && isMatch(clean)) {
matchedJobs.push(clean);
}
});

if (matchedJobs.length === 0) {
return null;
}

let summary = `✅ Found *${matchedJobs.length}* matching entry-level Economics job(s):\n\n`; 

matchedJobs.forEach((job, index) =>{
     summary +=`📌 *Job ${index + 1}*\n${job}\n\n`;
     summary += `────────────────────\n\n`;
});

return summary;
}

// ------------------- Bot Handlers -------------------
bot.start((ctx) => {
ctx.reply(
'👋 Hello! Forward me any job digest (multiple vacancies at once).\n\n' +
'I will scan every single job inside, filter for:\n' +
'• Entry‑level / no experience required\n' +
'• Relevant to a BA in Economics\n\n' +
'Then I reply with a summary list of only the matching ones!'
);
});

bot.on('text', async (ctx) => {
const messageText = ctx.message.text;

if (messageText.startsWith('/')) return;

const summary = extractMatchingSummary(messageText);

if (summary) {
await ctx.reply(summary, { parse_mode: 'Markdown' });
} else {
await ctx.reply('❌ No entry-level Economics jobs found in this batch.');
}
});

// ------------------- Start Bot -------------------
bot.launch()
.then(() => console.log('Bot is running...'))
.catch(err => console.error('Error starting bot:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));