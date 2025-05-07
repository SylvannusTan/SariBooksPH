import { ref } from "vue"
import { supabase } from "@/lib/supabase"

export function useBusinessProfile() {
  const businessProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Fetch business profile
  const fetchBusinessProfile = async (userId) => {
    if (!userId) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned" which is not an error for us
        throw fetchError
      }

      businessProfile.value = data || null
      return data
    } catch (err) {
      error.value = err.message
      console.error("Error fetching business profile:", err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Create business profile
  const createBusinessProfile = async (userId, profileData) => {
    if (!userId) throw new Error("User ID is required")

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from("business_profiles")
        .insert([
          {
            user_id: userId,
            ...profileData,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      businessProfile.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update business profile
  const updateBusinessProfile = async (profileId, profileData) => {
    if (!profileId) throw new Error("Profile ID is required")

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from("business_profiles")
        .update({
          ...profileData,
          updated_at: new Date(),
        })
        .eq("id", profileId)
        .select()
        .single()

      if (updateError) throw updateError

      businessProfile.value = data
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    businessProfile,
    loading,
    error,
    fetchBusinessProfile,
    createBusinessProfile,
    updateBusinessProfile,
  }
}
