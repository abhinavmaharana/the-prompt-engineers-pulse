// Sentiment Analysis Utility for Mood Map
export interface SentimentResult {
  mood: 'positive' | 'negative' | 'neutral' | 'frustrated' | 'concerned' | 'satisfied'
  score: number // -1 to 1
  confidence: number // 0 to 1
  keywords: string[]
  emotion: string
}

// Keywords for different moods
const MOOD_KEYWORDS = {
  positive: ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'smooth', 'clear', 'fixed', 'resolved', 'improved'],
  negative: ['bad', 'terrible', 'awful', 'horrible', 'disgusting', 'filthy', 'broken', 'damaged', 'destroyed'],
  frustrated: ['frustrated', 'angry', 'annoyed', 'irritated', 'fed up', 'tired', 'sick of', 'hate', 'dislike', 'upset'],
  concerned: ['worried', 'concerned', 'scared', 'afraid', 'dangerous', 'unsafe', 'risky', 'problem', 'issue', 'trouble'],
  satisfied: ['happy', 'pleased', 'satisfied', 'content', 'relieved', 'thankful', 'grateful', 'appreciate'],
  neutral: ['normal', 'okay', 'fine', 'average', 'usual', 'regular', 'standard']
}



export const analyzeSentiment = (text: string): SentimentResult => {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  
  let positiveScore = 0
  let negativeScore = 0
  let frustratedScore = 0
  let concernedScore = 0
  let satisfiedScore = 0
  let neutralScore = 0
  
  const foundKeywords: string[] = []
  
  // Analyze each word
  words.forEach(word => {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[^\w]/g, '')
    
    // Check positive keywords
    if (MOOD_KEYWORDS.positive.includes(cleanWord)) {
      positiveScore += 1
      foundKeywords.push(cleanWord)
    }
    
    // Check negative keywords
    if (MOOD_KEYWORDS.negative.includes(cleanWord)) {
      negativeScore += 1
      foundKeywords.push(cleanWord)
    }
    
    // Check frustrated keywords
    if (MOOD_KEYWORDS.frustrated.includes(cleanWord)) {
      frustratedScore += 1.5 // Higher weight for frustration
      foundKeywords.push(cleanWord)
    }
    
    // Check concerned keywords
    if (MOOD_KEYWORDS.concerned.includes(cleanWord)) {
      concernedScore += 1.2
      foundKeywords.push(cleanWord)
    }
    
    // Check satisfied keywords
    if (MOOD_KEYWORDS.satisfied.includes(cleanWord)) {
      satisfiedScore += 1
      foundKeywords.push(cleanWord)
    }
    
    // Check neutral keywords
    if (MOOD_KEYWORDS.neutral.includes(cleanWord)) {
      neutralScore += 0.5
      foundKeywords.push(cleanWord)
    }
  })
  
  // Calculate overall sentiment score
  const totalScore = positiveScore + negativeScore + frustratedScore + concernedScore + satisfiedScore + neutralScore
  
  // Determine dominant mood
  const scores = {
    positive: positiveScore,
    negative: negativeScore,
    frustrated: frustratedScore,
    concerned: concernedScore,
    satisfied: satisfiedScore,
    neutral: neutralScore
  }
  
  const dominantMood = Object.entries(scores).reduce((a, b) => {
    const aKey = a[0] as keyof typeof scores
    const bKey = b[0] as keyof typeof scores
    return scores[aKey] > scores[bKey] ? a : b
  })[0] as keyof typeof scores
  
  // Calculate confidence based on keyword density
  const confidence = Math.min(totalScore / words.length * 10, 1)
  
  // Calculate sentiment score (-1 to 1)
  let sentimentScore = 0
  if (dominantMood === 'positive' || dominantMood === 'satisfied') {
    sentimentScore = Math.min((positiveScore + satisfiedScore) / 5, 1)
  } else if (dominantMood === 'negative' || dominantMood === 'frustrated') {
    sentimentScore = -Math.min((negativeScore + frustratedScore) / 5, 1)
  } else if (dominantMood === 'concerned') {
    sentimentScore = -0.3
  } else {
    sentimentScore = 0
  }
  
  // Map mood to emotion
  const emotionMap = {
    positive: 'Happy',
    negative: 'Angry',
    frustrated: 'Frustrated',
    concerned: 'Worried',
    satisfied: 'Satisfied',
    neutral: 'Neutral'
  }
  
  return {
    mood: dominantMood,
    score: sentimentScore,
    confidence: confidence,
    keywords: [...new Set(foundKeywords)], // Remove duplicates
    emotion: emotionMap[dominantMood]
  }
}

// Get mood color for visualization
export const getMoodColor = (mood: string): string => {
  switch (mood) {
    case 'positive':
    case 'satisfied':
      return '#10B981' // Green
    case 'negative':
    case 'frustrated':
      return '#EF4444' // Red
    case 'concerned':
      return '#F59E0B' // Amber
    case 'neutral':
    default:
      return '#6B7280' // Gray
  }
}

// Get mood emoji for display
export const getMoodEmoji = (mood: string): string => {
  switch (mood) {
    case 'positive':
      return '😊'
    case 'satisfied':
      return '😌'
    case 'negative':
      return '😠'
    case 'frustrated':
      return '😤'
    case 'concerned':
      return '😟'
    case 'neutral':
    default:
      return '😐'
  }
}

// Analyze multiple reports for mood trends
export const analyzeMoodTrends = (reports: Array<{ description: string; timestamp: Date }>) => {
  const moodCounts = {
    positive: 0,
    negative: 0,
    frustrated: 0,
    concerned: 0,
    satisfied: 0,
    neutral: 0
  }
  
  const sentiments = reports.map(report => {
    const sentiment = analyzeSentiment(report.description)
    moodCounts[sentiment.mood]++
    return {
      ...sentiment,
      timestamp: report.timestamp
    }
  })
  
  const totalReports = reports.length
  const moodPercentages = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    percentage: (count / totalReports) * 100,
    count
  }))
  
  const dominantMood = moodPercentages.reduce((a, b) => a.percentage > b.percentage ? a : b)
  
  return {
    sentiments,
    moodCounts,
    moodPercentages,
    dominantMood: dominantMood.mood,
    totalReports,
    averageSentiment: sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
  }
} 