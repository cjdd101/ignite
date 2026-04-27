import { useNavigate } from 'react-router-dom'
import type { Spark } from '@/types'

interface SparkCardProps {
  spark: Spark
}

export function SparkCard({ spark }: SparkCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/prairie/${spark.id}/kindle`)
  }

  return (
    <div
      className="spark-card cursor-pointer hover:bg-bg-secondary p-3 rounded transition-colors"
      data-testid={`spark-${spark.id}`}
      onClick={handleClick}
    >
      <p>{spark.content}</p>
    </div>
  )
}