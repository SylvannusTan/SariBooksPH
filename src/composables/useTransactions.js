import { ref } from "vue"
import { supabase } from "@/lib/supabase"

export function useTransactions() {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetch transactions
  const fetchTransactions = async (userId, businessId, options = {}) => {
    if (!userId || !businessId) return []

    loading.value = true
    error.value = null

    try {
      let query = supabase.from("transactions").select("*").eq("user_id", userId).eq("business_id", businessId)

      // Apply date range filter
      if (options.startDate) {
        query = query.gte("transaction_date", options.startDate)
      }

      if (options.endDate) {
        query = query.lte("transaction_date", options.endDate)
      }

      // Apply type filter
      if (options.type) {
        query = query.eq("type", options.type)
      }

      // Apply search filter
      if (options.search) {
        query = query.ilike("description", `%${options.search}%`)
      }

      // Apply sorting
      const sortField = options.sortField || "transaction_date"
      const sortOrder = options.sortOrder || { ascending: false }
      query = query.order(sortField, sortOrder)

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      transactions.value = data || []
      return data
    } catch (err) {
      error.value = err.message
      console.error("Error fetching transactions:", err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Add transaction
  const addTransaction = async (transactionData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert([
          {
            ...transactionData,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Update local state
      transactions.value = [data, ...transactions.value]
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update transaction
  const updateTransaction = async (transactionId, transactionData) => {
    if (!transactionId) throw new Error("Transaction ID is required")

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from("transactions")
        .update({
          ...transactionData,
          updated_at: new Date(),
        })
        .eq("id", transactionId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      const index = transactions.value.findIndex((t) => t.id === transactionId)
      if (index !== -1) {
        transactions.value[index] = data
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    if (!transactionId) throw new Error("Transaction ID is required")

    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase.from("transactions").delete().eq("id", transactionId)

      if (deleteError) throw deleteError

      // Update local state
      transactions.value = transactions.value.filter((t) => t.id !== transactionId)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calculate summary statistics
  const calculateSummary = (transactionsList = null) => {
    const data = transactionsList || transactions.value

    const totalSales = data.filter((t) => t.type === "sale").reduce((sum, t) => sum + Number(t.amount), 0)

    const totalExpenses = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)

    const netAmount = totalSales - totalExpenses

    return {
      totalSales,
      totalExpenses,
      netAmount,
    }
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    calculateSummary,
  }
}
