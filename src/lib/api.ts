const API_BASE = 'https://ignite-worker.13261056632.workers.dev/api'

export interface IgniteRequest {
  sparkContent: string
  existingPrairies: string[]
}

export interface IgniteResponse {
  perspectives: Array<{
    type: string
    description: string
    firstStep: string
    searchPhrase: string
  }>
  suggestedPrairie: string | null
  newPrairieSuggestion: string | null
}

export interface RekindleRequest {
  taskTitle: string
  taskDescription: string
  userRecord: string
  sourcePrairie: string
}

export interface RekindleResponse {
  newQuestions: string[]
  sparks: Array<{ content: string; type: string }>
}

export interface OrganizeRequest {
  unclassifiedTasks: Array<{ title: string }>
  existingPrairies: string[]
}

export interface OrganizeResponse {
  suggestions: Array<{
    action: 'merge' | 'create'
    taskIndices: number[]
    targetPrairie?: string
    newPrairieName?: string
    reason: string
  }>
}

export interface ExploreRequest {
  query: string
  existingPrairies: string[]
}

export interface ExploreResponse {
  sparks: Array<{
    content: string
    type: string
  }>
  suggestedPrairie: string | null
  newPrairieSuggestion: string | null
}

export interface SeedBufferRequest {
  recentSparks: string[]
  existingPrairies: string[]
}

export interface SeedBufferResponse {
  questions: string[]
}

class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'APIError'
  }
}

async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new APIError(`API Error: ${response.status}`, response.status)
  }

  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new APIError('Invalid JSON response', response.status)
  }
}

export const api = {
  ignite: (body: IgniteRequest) => post<IgniteResponse>('/ai/ignite', body),
  rekindle: (body: RekindleRequest) => post<RekindleResponse>('/ai/rekindle', body),
  organize: (body: OrganizeRequest) => post<OrganizeResponse>('/ai/organize', body),
  explore: (body: ExploreRequest) => post<ExploreResponse>('/ai/explore', body),
  seedBuffer: (body: SeedBufferRequest) => post<SeedBufferResponse>('/ai/seed-buffer', body),
}

// GitHub Issue API
const GITHUB_API = 'https://api.github.com'

export interface GitHubIssueInput {
  title: string
  body: string
  labels?: string[]
}

export async function createGitHubIssue(
  repo: string,
  token: string,
  issue: GitHubIssueInput
): Promise<{ number: number; html_url: string }> {
  const response = await fetch(`${GITHUB_API}/repos/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github+json',
    },
    body: JSON.stringify({
      title: issue.title,
      body: issue.body,
      labels: issue.labels || ['bug'],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create issue: ${response.status} - ${error}`)
  }

  return response.json()
}