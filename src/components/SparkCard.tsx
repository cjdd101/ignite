import type { Spark } from '@/types'

interface SparkCardProps {
  spark: Spark
}

export function SparkCard({ spark }: SparkCardProps) {
  return (
    <div className="spark-card" data-testid={`spark-${spark.id}`}>
      <p>{spark.content}</p>
    </div>
  )
}