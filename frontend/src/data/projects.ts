import { ref } from 'vue'
import type { Project } from '../types'

/** Reactive list of developer projects */
export const projects = ref<Project[]>([])

/** GitHub username for contribution heatmap */
export const githubUsername = ref('')

/** Load projects from API */
export async function loadProjects(): Promise<void> {
  try {
    const res = await fetch('/api/projects')
    if (!res.ok) return
    const data: Project[] = await res.json()
    projects.value = data
  } catch {
    // API unavailable — leave projects empty
  }
}
