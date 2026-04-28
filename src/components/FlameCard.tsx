import { useNavigate } from 'react-router-dom'
import { Flame } from '@/types'
import { useFlameStore } from '@/stores/flameStore'

interface FlameCardProps {
  flame: Flame
  onDelete?: (id: string) => void
}

export function FlameCard({ flame, onDelete }: FlameCardProps) {
  const navigate = useNavigate()
  const { deleteFlame } = useFlameStore()

  const handleClick = () => {
    navigate(`/prairie/flame/${flame.id}`)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(flame.id)
    } else {
      await deleteFlame(flame.id)
    }
  }

  return (
    <div
      className="bg-bg-card rounded-lg p-4 cursor-pointer hover:bg-bg-secondary transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-fire-flame">{flame.title}</h3>
        {flame.status === 'active' && (
          <span className="text-xs bg-fire-flame/20 text-fire-flame px-2 py-0.5 rounded">
            燃烧中
          </span>
        )}
      </div>
      {flame.description && (
        <p className="text-sm text-gray-400 mt-1">{flame.description}</p>
      )}
      <div className="flex justify-between items-center mt-3">
        <span className="text-xs text-gray-500">
          {new Date(flame.createdAt).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="text-sm text-gray-500 hover:text-red-400"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}