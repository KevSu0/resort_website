import path from "node:path"
import { fileURLToPath } from "node:url"
import baseConfig from "./config/tailwind.config.js"

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const toPosixPath = (filePath) => filePath.replace(/\\/g, "/")

const stripLeadingRelative = (pattern) => {
  if (pattern.startsWith("../")) {
    return pattern.slice(3)
  }

  if (pattern.startsWith("./")) {
    return pattern.slice(2)
  }

  return pattern
}

const normalizedContent = (baseConfig.content ?? []).map((pattern) => {
  if (path.isAbsolute(pattern)) {
    return toPosixPath(pattern)
  }

  const relativePattern = stripLeadingRelative(pattern)
  return toPosixPath(path.join(rootDir, relativePattern))
})

export default {
  ...baseConfig,
  content: normalizedContent,
}
