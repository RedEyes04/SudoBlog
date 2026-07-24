import type { Friend } from '../types'
import friendsData from '../../../data/friends.json'

/**
 * Friends data loaded from data/friends.json at build time.
 * The prebuild script (copy-data.cjs) copies ../data/friends.json into src/data/.
 * Only approved friends are exported for display.
 */
export const friends: Friend[] = (friendsData as Friend[]).filter(
  (f) => f.status === 'approved',
)
