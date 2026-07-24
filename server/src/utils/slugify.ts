/**
 * Generate a URL-safe slug from a string.
 * Supports basic ASCII and falls back to a timestamp for non-ASCII input.
 */
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces/hyphens
    .replace(/[\s_]+/g, '-')  // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')      // collapse multiple hyphens
    .replace(/^-|-$/g, '')    // trim leading/trailing hyphens

  // If slug is empty (e.g., pure Chinese title), use timestamp
  if (!slug) {
    return `post-${Date.now()}`
  }

  return slug
}
