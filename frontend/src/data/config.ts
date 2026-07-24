import type { SiteConfig } from '../types'
import configData from '../../../data/config.json'

/**
 * Site configuration loaded from data/config.json at build time.
 * The prebuild script (copy-data.cjs) copies ../data/config.json into src/data/.
 */

interface RawConfig {
  site: {
    title: string
    username: string
    hostname: string
    avatar: string
    name: string
    bio: string
    beian: string
  }
  asciiBanner: string
}

const raw = configData as RawConfig

export const siteConfig: SiteConfig = {
  title: raw.site.title,
  username: raw.site.username,
  hostname: raw.site.hostname,
  avatar: raw.site.avatar,
  name: raw.site.name,
  bio: raw.site.bio,
  beian: raw.site.beian,
}

export const aboutData = {
  avatar: raw.site.avatar,
  name: raw.site.name,
  bio: raw.site.bio,
}

export const asciiBanner: string = raw.asciiBanner || ''
