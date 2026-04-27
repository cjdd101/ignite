import { useState } from 'react'
import { useSparkStore } from '@/stores/sparkStore'

interface SparkInputProps {
  onSubmit?: () => void
}

export function SparkInput({ onSubmit }: SparkInputProps) {
  const [content, setContent] = useState('')
  const addSpark = useSparkStore(state => state.addSpark)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    await addSpark(content.trim(), 'user')
    setContent('')
    onSubmit?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="写下一粒火种..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <button type="submit">投入火盆</button>
    </form>
  )
}