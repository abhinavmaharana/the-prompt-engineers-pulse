import { Button } from '@/components/ui/button'


interface MoodFilterProps {
  moodFilter: 'all' | 'positive' | 'negative' | 'frustrated' | 'concerned' | 'satisfied' | 'neutral'
  onMoodFilterChange: (mood: 'all' | 'positive' | 'negative' | 'frustrated' | 'concerned' | 'satisfied' | 'neutral') => void
}

const MoodFilter = ({ moodFilter, onMoodFilterChange }: MoodFilterProps) => {
  const moods = [
    { key: 'all', label: 'All Moods', emoji: '🎭' },
    { key: 'positive', label: 'Happy', emoji: '😊' },
    { key: 'satisfied', label: 'Satisfied', emoji: '😌' },
    { key: 'neutral', label: 'Neutral', emoji: '😐' },
    { key: 'concerned', label: 'Concerned', emoji: '😟' },
    { key: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { key: 'negative', label: 'Angry', emoji: '😠' }
  ] as const

  return (
    <div className="absolute top-4 right-4 lg:right-20 z-10 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
      <div className="text-xs font-semibold text-gray-700 mb-2">Filter by Mood</div>
      <div className="flex flex-wrap gap-1">
        {moods.map((mood) => (
          <Button
            key={mood.key}
            variant={moodFilter === mood.key ? 'default' : 'ghost'}
            size="sm"
            className={`text-xs px-2 py-1 h-8 ${
              moodFilter === mood.key
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'text-gray-600 hover:text-black hover:bg-gray-100'
            }`}
            onClick={() => onMoodFilterChange(mood.key)}
          >
            <span className="mr-1">{mood.emoji}</span>
            {mood.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default MoodFilter 