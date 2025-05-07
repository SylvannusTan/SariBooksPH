"use client"

import { ref, computed } from "vue"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  const initialize = async () => {
    loading.value = true
    error.value = null

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        user.value = session.user
      }
    } catch (err) {
      error.value = err.message
      console.error("Auth initialization error:", err)
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  const signUp = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?mode=login`,
        },
      })

      if (authError) throw authError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) throw authError

      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      })

      if (authError) throw authError
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Resend email verification
  const resendEmailVerification = async (email) => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?mode=login`,
        },
      })

      if (authError) throw authError
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: profileData,
      })

      if (updateError) throw updateError

      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      user.value = session.user
    } else if (event === "SIGNED_OUT") {
      user.value = null
    } else if (event === "USER_UPDATED" && session) {
      user.value = session.user
    }
  })

  // Initialize on composable creation
  initialize()

  return {
    user,
    loading,
    error,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendEmailVerification,
    updateProfile,
  }
}
