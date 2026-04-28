const DEEPSEEK_API = 'https://api.deepseek.com'
const DEEPSEEK_MODEL = 'deepseek-chat'

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

// DeepSeek API Key
const API_KEY = 'sk-fe556b6e70de42b08a8c4ba57510ac5b'

async function callDeepSeek(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new APIError('DeepSeek API key not configured. Set VITE_DEEPSEEK_API_KEY in .env', 0)
  }

  const response = await fetch(`${DEEPSEEK_API}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    throw new APIError(`DeepSeek API Error: ${response.status}`, response.status)
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>
  }

  const rawContent =
    data.choices?.[0]?.message?.content ||
    data.choices?.[0]?.message?.reasoning_content ||
    '{}'

  return rawContent.replace(/```json|```/g, '').trim()
}

function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T
  } catch {
    throw new APIError('Invalid JSON response from AI', 0)
  }
}

// Ignite: Generate exploration perspectives
async function handleIgnite(body: IgniteRequest): Promise<IgniteResponse> {
  const prompt = `用户有一个想法或问题，想把它变成具体的探索行动。请按以下三步帮助用户：
第一步：为这个想法生成3-5个不同的探索视角。视角类型可以包括：读一本书或文章、看一个视频或纪录片、写一篇自己的思考、找人讨论或采访、动手实践或体验。
第二步：为每个视角推荐一个具体的、低门槛的第一步行动建议。每个行动附上一个可在B站、知乎、小红书等平台搜索的自然语言短语。
第三步：汇总为一份行动草稿。
用户的想法：${body.sparkContent}
用户已有的草原：${body.existingPrairies.join('、') || '无'}
返回格式（严格JSON，不要任何额外文字）：
{
  "perspectives": [
    {
      "type": "视角类型",
      "description": "视角描述",
      "firstStep": "第一步行动建议",
      "searchPhrase": "可搜索的自然语言短语"
    }
  ],
  "suggestedPrairie": "从已有草原中选最匹配的，或null",
  "newPrairieSuggestion": "若都不匹配，建议新草原名，或null"
}`

  const content = await callDeepSeek(prompt)
  return parseJSON<IgniteResponse>(content)
}

// Rekindle: Generate new questions from completed exploration
async function handleRekindle(body: RekindleRequest): Promise<RekindleResponse> {
  const prompt = `用户完成了一个探索任务，并写下了感想。请生成3个新的问题或灵感，帮助继续探索。
任务标题：${body.taskTitle}
任务描述：${body.taskDescription || '无'}
用户感想：${body.userRecord || '无'}
所属草原：${body.sourcePrairie || '无'}
每个新问题/灵感应：
- 与探索内容相关
- 提供新视角，非总结
- 可进一步探索的方向
- 1-2句话，自然流畅
返回格式（严格JSON）：
{
  "newQuestions": ["问题1", "问题2", "问题3"]
}`

  const content = await callDeepSeek(prompt)
  const data = parseJSON<{ newQuestions: string[] }>(content)
  return { newQuestions: data.newQuestions, sparks: [] }
}

// Organize: Suggest prairie categorization for wild flames
async function handleOrganize(body: OrganizeRequest): Promise<OrganizeResponse> {
  const tasks = body.unclassifiedTasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')
  const prompt = `用户有一些尚未分类的探索任务，以及一些已有的草原。请分析这些未分类任务，判断它们是否可以归入已有草原，或围绕某个新方向创建新草原。
未分类任务列表：
${tasks}
已有草原：${body.existingPrairies.join('、') || '无'}
规则：
- 高度相关的可归入已有草原
- 多任务围绕一个共同的新方向可建议创建新草原
- 不确定的保持沉默
- 同一任务不出现在两个建议中
返回格式（严格JSON）：
{
  "suggestions": [
    {"action": "merge", "taskIndices": [0], "targetPrairie": "草原名", "reason": "理由"},
    {"action": "create", "taskIndices": [1,2], "newPrairieName": "新草原名", "reason": "理由"}
  ]
}`

  const content = await callDeepSeek(prompt)
  return parseJSON<OrganizeResponse>(content)
}

// Explore: Generate sparks from a query
async function handleExplore(body: ExploreRequest): Promise<ExploreResponse> {
  const prompt = `用户对以下关键词或问题感兴趣，想进行探索。请围绕这个主题，生成5-8粒火种（灵感/问题/探索方向）。
用户输入：${body.query}
用户已有草原：${body.existingPrairies.join('、') || '无'}
每粒火种应：
- 从不同角度切入（历史/科学/文化/实践等）
- 标注视角类型（阅读/观看/实践/讨论/思考）
- 1-2句话，引发好奇心
返回格式（严格JSON）：
{
  "sparks": [{"content": "火种文本", "type": "视角类型"}],
  "suggestedPrairie": "匹配的已有草原或null",
  "newPrairieSuggestion": "新草原建议或null"
}`

  const content = await callDeepSeek(prompt)
  return parseJSON<ExploreResponse>(content)
}

// SeedBuffer: Generate inspiring questions
async function handleSeedBuffer(body: SeedBufferRequest): Promise<SeedBufferResponse> {
  const prompt = `请生成5个有趣的知识探索问题，作为用户的灵感来源。
用户近期关注：${body.recentSparks.join('、') || '无'}
用户已有草原：${body.existingPrairies.join('、') || '无'}
每个问题应：
- 指向具体可探索的知识缺口
- 涵盖不同领域
- 1-2句话
返回格式（严格JSON）：
{
  "questions": ["问题1", "问题2", "问题3", "问题4", "问题5"]
}`

  const content = await callDeepSeek(prompt)
  const data = parseJSON<{ questions: string[] }>(content)
  return { questions: data.questions }
}

export const api = {
  ignite: (body: IgniteRequest) => handleIgnite(body),
  rekindle: (body: RekindleRequest) => handleRekindle(body),
  organize: (body: OrganizeRequest) => handleOrganize(body),
  explore: (body: ExploreRequest) => handleExplore(body),
  seedBuffer: (body: SeedBufferRequest) => handleSeedBuffer(body),
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
