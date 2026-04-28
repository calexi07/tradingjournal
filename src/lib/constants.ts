export const PAIRS = [
  'XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'USDCAD',
  'AUDUSD', 'NZDUSD', 'USDCHF', 'EURGBP', 'EURJPY', 'NASDAQ',
  'US30', 'SPX500', 'BTCUSD', 'ETHUSD',
]

export const SESSIONS = [
  { value: 'asia', label: '🌏 Asia' },
  { value: 'london', label: '🇬🇧 London' },
  { value: 'new_york', label: '🗽 New York' },
  { value: 'overlap', label: '⚡ London/NY Overlap' },
]

export const SETUP_TYPES = [
  'Supply & Demand',
  'Liquidity Sweep',
  'BOS (Break of Structure)',
  'CHOCH (Change of Character)',
  'Fair Value Gap',
  'Order Block',
  'Inducement',
  'Turtle Soup',
  'London Breakout',
  'NY Reversal',
  'Support/Resistance',
  'Trend Continuation',
  'News Trade',
]

export const EMOTIONS = {
  before: [
    { value: 'calm', label: '😌 Calm' },
    { value: 'confident', label: '💪 Confident' },
    { value: 'anxious', label: '😰 Anxious' },
    { value: 'fomo', label: '🏃 FOMO' },
    { value: 'revenge', label: '😤 Revenge' },
    { value: 'bored', label: '😑 Bored' },
    { value: 'disciplined', label: '🧘 Disciplined' },
  ],
  after: [
    { value: 'satisfied', label: '✅ Satisfied' },
    { value: 'frustrated', label: '😠 Frustrated' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'excited', label: '🎉 Excited' },
    { value: 'regretful', label: '😔 Regretful' },
    { value: 'confident', label: '💪 Confident' },
  ],
}

export const PHASES = [
  { value: 'challenge', label: '🔥 Challenge', color: '#f0c040' },
  { value: 'verification', label: '🔍 Verification', color: '#58a6ff' },
  { value: 'funded', label: '💰 Funded', color: '#00d4aa' },
]

export const BROKERS = [
  'The5ers',
  'FTMO',
  'Apex',
  'TopStep',
  'True Forex Funds',
  'E8 Funding',
  'Funded Next',
  'Other',
]
