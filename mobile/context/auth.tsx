import React, { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as WebBrowser from "expo-web-browser"
import * as AuthSession from "expo-auth-session"
import * as Google from "expo-auth-session/providers/google"
import Constants from "expo-constants"

WebBrowser.maybeCompleteAuthSession()

const GOOGLE_CLIENT_ID: string =
  Constants.expoConfig?.extra?.googleClientId ?? ""

const API_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000"

export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string
}

interface AuthContext {
  user: AuthUser | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const Context = createContext<AuthContext>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    // Add Android/iOS client IDs here when published to stores
  })

  // Restore session on app launch
  useEffect(() => {
    AsyncStorage.getItem("saya_user").then((stored) => {
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
    })
  }, [])

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response
      if (authentication?.accessToken) {
        fetchGoogleProfile(authentication.accessToken)
      }
    }
  }, [response])

  async function fetchGoogleProfile(accessToken: string) {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const profile = await res.json()

      // Upsert user in backend
      await fetch(`${API_URL}/api/auth/mobile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
        }),
      })

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
      }

      await AsyncStorage.setItem("saya_user", JSON.stringify(authUser))
      setUser(authUser)
    } catch (err) {
      console.error("Auth error:", err)
    }
  }

  async function signIn() {
    await promptAsync()
  }

  async function signOut() {
    await AsyncStorage.removeItem("saya_user")
    setUser(null)
  }

  return (
    <Context.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </Context.Provider>
  )
}

export function useAuth() {
  return useContext(Context)
}
