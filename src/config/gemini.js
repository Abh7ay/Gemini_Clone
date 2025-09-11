import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

export const genAI = new GoogleGenerativeAI(apiKey || '')

export function getGenerativeModel() {
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Add it to a .env file and restart the dev server.')
  }
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}
