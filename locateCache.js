import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default (file = '') =>
  process.env.FAUGRA_CACHE
    ? path.join(process.env.FAUGRA_CACHE, file)
    : path.join(__dirname, `.cache/`, file)
