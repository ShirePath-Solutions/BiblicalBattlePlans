import { useQuery } from '@tanstack/react-query'

interface VerseOfDay {
  text: string
  reference: string
}

interface OurMannaResponse {
  verse: {
    details: {
      text: string
      reference: string
    }
  }
}

// Fallback verse in case the API fails
const FALLBACK_VERSE: VerseOfDay = {
  text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
  reference: 'Jeremiah 29:11',
}

// Get local date string (YYYY-MM-DD) for cache key
function getLocalDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Calculate milliseconds until local midnight
function getMsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return midnight.getTime() - now.getTime()
}

export const verseKeys = {
  daily: (date: string) => ['verseOfDay', date] as const,
}

async function fetchVerseOfDay(): Promise<VerseOfDay> {
  const response = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json')

  if (!response.ok) {
    throw new Error('Failed to fetch verse of the day')
  }

  const data: OurMannaResponse = await response.json()

  return {
    text: `"${data.verse.details.text}"`,
    reference: data.verse.details.reference,
  }
}

export function useVerseOfDay() {
  const localDate = getLocalDateString()

  return useQuery({
    queryKey: verseKeys.daily(localDate),
    queryFn: fetchVerseOfDay,
    staleTime: getMsUntilMidnight(), // Fresh until local midnight
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
    placeholderData: FALLBACK_VERSE,
  })
}
