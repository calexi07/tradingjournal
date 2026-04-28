'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { format } from 'date-fns'

interface Trade {
  opened_at: string
  pnl_usd: number | null
}

interface EquityCurveProps {
  trades: Trade[]
  initialBalance: number
  maxDrawdown: number
}

export function EquityCurve({ trades, initialBalance, maxDrawdown }: EquityCurveProps) {
  const data = useMemo(() => {
    let balance = initialBalance
    const points = [{ date: 'Start', balance }]

    const sorted = [...trades].sort(
      (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
    )

    for (const t of sorted) {
      balance += t.pnl_usd ?? 0
      points.push({
        date: format(new Date(t.opened_at), 'MMM d'),
        balance: parseFloat(balance.toFixed(2)),
      })
    }
    return points
  }, [trades, initialBalance])

  const lastBalance = data[data.length - 1]?.balance ?? initialBalance
  const isPositive = lastBalance >= initialBalance
  const maxDrawdownLine = initialBalance * (1 - maxDrawdown / 100)
  const color = isPositive ? '#00d4aa' : '#f85149'

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6e7681', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6e7681', fontSize: 11 }}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#0d1117',
              border: '1px solid #21262d',
              borderRadius: '8px',
              color: '#e6edf3',
            }}
            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Balanță']}
          />
          <ReferenceLine
            y={maxDrawdownLine}
            stroke="#f85149"
            strokeDasharray="4 4"
            label={{ value: 'Max DD', fill: '#f85149', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={2}
            fill="url(#equityGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
