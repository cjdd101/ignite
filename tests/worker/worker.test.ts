import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'

describe('Worker configuration', () => {
  it('should have wrangler configuration file', () => {
    expect(existsSync('worker/wrangler.toml')).toBe(true)
    const content = readFileSync('worker/wrangler.toml', 'utf-8')
    expect(content).toContain('name = "ignite-worker"')
    expect(content).toContain('MINIMAX_API_KEY')
  })
  
  it('should have worker entry point with all handlers', () => {
    expect(existsSync('worker/src/index.ts')).toBe(true)
    const content = readFileSync('worker/src/index.ts', 'utf-8')
    expect(content).toContain('handleIgnite')
    expect(content).toContain('handleRekindle')
    expect(content).toContain('handleOrganize')
    expect(content).toContain('handleExplore')
    expect(content).toContain('handleSeedBuffer')
    expect(content).toContain('MiniMax')
  })
  
  it('should have package.json for worker', () => {
    expect(existsSync('worker/package.json')).toBe(true)
    const pkg = JSON.parse(readFileSync('worker/package.json', 'utf-8'))
    expect(pkg.name).toBe('ignite-worker')
    expect(pkg.devDependencies).toHaveProperty('wrangler')
  })
})
