import { createStaticHttp } from '@/demo/staticHttp'
import { demoSnapshot } from '@/demo/snapshot'

const http = import.meta.env.PROD
  ? createStaticHttp(demoSnapshot)
  : (await import('./liveHttp')).createLiveHttp()

export default http
