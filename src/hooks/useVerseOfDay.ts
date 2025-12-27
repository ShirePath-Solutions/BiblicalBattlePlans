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

const STORAGE_KEY = 'bbp_verse_of_day'

interface CachedVerse {
  date: string
  verse: VerseOfDay
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

// Get cached verse from localStorage if it's from today
function getCachedVerse(): VerseOfDay | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (!cached) return null

    const { date, verse }: CachedVerse = JSON.parse(cached)
    if (date === getLocalDateString()) {
      return verse
    }
    return null
  } catch {
    return null
  }
}

// Save verse to localStorage with today's date
function cacheVerse(verse: VerseOfDay): void {
  try {
    const cached: CachedVerse = {
      date: getLocalDateString(),
      verse,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached))
  } catch {
    // Ignore storage errors
  }
}

export const verseKeys = {
  daily: (date: string) => ['verseOfDay', date] as const,
}

async function fetchVerseOfDay(): Promise<VerseOfDay> {
  // Check localStorage first - if we have today's verse, use it
  const cached = getCachedVerse()
  if (cached) {
    return cached
  }

  // Fetch from API
  const response = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json')

  if (!response.ok) {
    throw new Error('Failed to fetch verse of the day')
  }

  const data: OurMannaResponse = await response.json()

  const verse: VerseOfDay = {
    text: `"${data.verse.details.text}"`,
    reference: data.verse.details.reference,
  }

  // Cache for the rest of the day
  cacheVerse(verse)

  return verse
}

export function useVerseOfDay() {
  const localDate = getLocalDateString()

  // Check if we have a cached verse to use as initial data (prevents flash)
  const cachedVerse = getCachedVerse()

  return useQuery({
    queryKey: verseKeys.daily(localDate),
    queryFn: fetchVerseOfDay,
    staleTime: getMsUntilMidnight(), // Fresh until local midnight
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 2,
    // Use cached verse as initial data if available, otherwise use fallback
    initialData: cachedVerse || undefined,
    // Only use placeholder if we don't have cached data
    placeholderData: cachedVerse ? undefined : FALLBACK_VERSE,
  })
}
