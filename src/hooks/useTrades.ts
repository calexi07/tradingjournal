'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { computeAccountStats } from '@/lib/calculations'

export interface TradeFilters {
  pair?: string
  session?: string
  result?: string
  setupType?: string
  dateFrom?: string
  dateTo?: string
  isAplus?: boolean
}

export function useTrades(accountId: string, filters: TradeFilters = {}) {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrades = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('trades')
      .select('*, trade_tags(tag_id, tags(id, name, color))')
      .eq('account_id', accountId)
      .order('opened_at', { ascending: false })

    if (filters.pair) query = query.eq('pair', filters.pair)
    if (filters.session) query = query.eq('session', filters.session)
    if (filters.result) query = query.eq('result', filters.result)
    if (filters.setupType) query = query.eq('setup_type', filters.setupType)
    if (filters.isAplus) query = query.eq('is_aplus', true)
    if (filters.dateFrom) query = query.gte('opened_at', filters.dateFrom)
    if (filters.dateTo) query = query.lte('opened_at', filters.dateTo)

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setTrades(data ?? [])
    }
    setLoading(false)
  }, [accountId, JSON.stringify(filters)])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  useEffect(() => {
    const channel = supabase
      .channel(`trades:${accountId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trades',
        filter: `account_id=eq.${accountId}`,
      }, () => fetchTrades())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [accountId, fetchTrades])

  return { trades, loading, error, refetch: fetchTrades }
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAccounts() {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false })
      setAccounts(data ?? [])
      setLoading(false)
    }
    fetchAccounts()
  }, [])

  return { accounts, loading }
}
