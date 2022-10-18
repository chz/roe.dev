import { query } from './github'
interface Sponsor {
  id: string
  avatarUrl?: string
  name?: string
}

interface CacheEntry {
  value: Sponsor[]
  expires: number
  mtime: number
}

export async function getSponsors (): Promise<Sponsor[]> {
  const entry: CacheEntry =
    ((await useStorage().getItem('sponsors')) as any) || {}

  const ttl = 60
  entry.expires = Date.now() + ttl

  const expired = Date.now() - (entry.mtime || 0) > ttl
  if (!entry.value || expired) {
    entry.value = await query(
      useRuntimeConfig().github.token,
      sponsorQuery
    ).then(r => r.data?.user.sponsors.edges.map(e => e.node) || [])

    // my ID
    entry.value.push({ id: useRuntimeConfig().github.id })

    entry.mtime = Date.now()
    useStorage()
      .setItem('sponsors', entry)
      .catch(error => console.error('[nitro] [cache]', error))
  }

  return entry.value
}

const sponsorQuery = /* graqhql */ `
{
  user(login: "danielroe") {
    sponsors(first: 100) {
      edges {
        node {
          ... on User {
            id
            avatarUrl
            name
          }
           ... on Organization {
             id
             avatarUrl
             name
           }
        }
      }
    }
  }
}`
