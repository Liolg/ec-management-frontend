import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

interface TokenPair {
  access: string
  refresh: string
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const { data } = await axios.post<TokenPair>(`${BASE_URL}/api/auth/token/`, { username, password })
  return data
}
