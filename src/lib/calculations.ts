export interface TradeCalcInput {
  entryPrice: number
  exitPrice: number
  stopLoss?: number
  direction: 'buy' | 'sell'
  lotSize: number
  accountBalance: number
  pipValue?: number
}

export function calculatePnlUsd(input: TradeCalcInput): number {
  const { entryPrice, exitPrice, direction, lotSize, pipValue = 10 } = input
  const priceDiff = direction === 'buy'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice
  const pips = priceDiff / 0.0001
  return parseFloat((pips * pipValue * lotSize).toFixed(2))
}

export function calculatePnlPct(pnlUsd: number, balance: number): number {
  if (balance === 0) return 0
  return parseFloat(((pnlUsd / balance) * 100).toFixed(4))
}

export function calculateRR(input: TradeCalcInput): number | null {
  const { entryPrice, exitPrice, stopLoss, direction } = input
  if (!stopLoss) return null

  const risk = direction === 'buy'
    ? entryPrice - stopLoss
    : stopLoss - entryPrice

  const reward = direction === 'buy'
    ? exitPrice - entryPrice
    : entryPrice - exitPrice

  if (risk <= 0) return null
  return parseFloat((reward / risk).toFixed(2))
}

export function determineResult(pnlUsd: number): 'win' | 'loss' | 'breakeven' {
  if (pnlUsd > 0.01) return 'win'
  if (pnlUsd < -0.01) return 'loss'
  return 'breakeven'
}

export interface TradeForStats {
  result: string | null
  pnl_usd: number | null
  rr_ratio: number | null
}

export interface AccountStats {
  totalTrades: number
  winRate: number
  avgRR: number
  profitFactor: number
  totalPnlUsd: number
  totalPnlPct: number
  maxDrawdownPct: number
  currentBalance: number
  bestTrade: number
  worstTrade: number
  consecutiveWins: number
  avgWinUsd: number
  avgLossUsd: number
}

export function computeAccountStats(
  trades: TradeForStats[],
  initialBalance: number
): AccountStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0, winRate: 0, avgRR: 0, profitFactor: 0,
      totalPnlUsd: 0, totalPnlPct: 0, maxDrawdownPct: 0,
      currentBalance: initialBalance, bestTrade: 0, worstTrade: 0,
      consecutiveWins: 0, avgWinUsd: 0, avgLossUsd: 0,
    }
  }

  const wins = trades.filter(t => t.result === 'win')
  const losses = trades.filter(t => t.result === 'loss')
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl_usd ?? 0), 0)
  const grossWin = wins.reduce((sum, t) => sum + (t.pnl_usd ?? 0), 0)
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl_usd ?? 0), 0))

  let peak = initialBalance, maxDD = 0, running = initialBalance
  for (const t of trades) {
    running += t.pnl_usd ?? 0
    if (running > peak) peak = running
    const dd = ((peak - running) / peak) * 100
    if (dd > maxDD) maxDD = dd
  }

  let streak = 0
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].result === 'win') streak++
    else break
  }

  const rrValues = trades
    .map(t => t.rr_ratio)
    .filter((r): r is number => r !== null)

  return {
    totalTrades: trades.length,
    winRate: parseFloat(((wins.length / trades.length) * 100).toFixed(1)),
    avgRR: rrValues.length > 0
      ? parseFloat((rrValues.reduce((a, b) => a + b, 0) / rrValues.length).toFixed(2))
      : 0,
    profitFactor: grossLoss > 0
      ? parseFloat((grossWin / grossLoss).toFixed(2))
      : grossWin > 0 ? 999 : 0,
    totalPnlUsd: parseFloat(totalPnl.toFixed(2)),
    totalPnlPct: parseFloat(((totalPnl / initialBalance) * 100).toFixed(2)),
    maxDrawdownPct: parseFloat(maxDD.toFixed(2)),
    currentBalance: parseFloat((initialBalance + totalPnl).toFixed(2)),
    bestTrade: trades.length > 0 ? Math.max(...trades.map(t => t.pnl_usd ?? 0)) : 0,
    worstTrade: trades.length > 0 ? Math.min(...trades.map(t => t.pnl_usd ?? 0)) : 0,
    consecutiveWins: streak,
    avgWinUsd: wins.length > 0 ? parseFloat((grossWin / wins.length).toFixed(2)) : 0,
    avgLossUsd: losses.length > 0 ? -parseFloat((grossLoss / losses.length).toFixed(2)) : 0,
  }
}
