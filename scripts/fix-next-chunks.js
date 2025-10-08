const fs = require('fs').promises
const path = require('path')

async function walk(dir) {
  let entries = await fs.readdir(dir, { withFileTypes: true })
  let files = []
  for (const e of entries) {
    const res = path.join(dir, e.name)
    if (e.isDirectory()) files = files.concat(await walk(res))
    else files.push(res)
  }
  return files
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..')
  const chunksDir = path.join(repoRoot, '.next', 'static', 'chunks')

  try {
    const exists = await fs.stat(chunksDir).catch(() => null)
    if (!exists) {
      console.error('No .next/static/chunks directory found. Build the project first (npm run build).')
      process.exit(1)
    }

    const files = await walk(chunksDir)

    // Map: simpleName -> first matching hashed file
    const desiredNames = [
      'main-app.js',
      'main.js',
      'app-pages-internals.js',
    ]

    // Also handle app page chunks like app/.../page.js
    // We'll scan for files matching page-*.js inside app subdirs

    const created = []

    for (const desired of desiredNames) {
      const prefix = desired.replace(/\.js$/, '')
      const match = files.find((f) => path.basename(f).startsWith(prefix + '-') && f.endsWith('.js'))
      if (match) {
        const dest = path.join(chunksDir, desired)
        await fs.copyFile(match, dest)
        created.push(dest)
      }
    }

    // handle app/*/page-*.js -> app/*/page.js
    for (const f of files) {
      const rel = path.relative(chunksDir, f)
      // match patterns like 'app/insights/page-*.js' or 'app/page-*.js'
      const parts = rel.split(path.sep)
      if (parts.includes('app') && parts[parts.length - 1].startsWith('page-') && parts[parts.length - 1].endsWith('.js')) {
        const destPath = path.join(chunksDir, ...parts.slice(0, -1), 'page.js')
        // ensure destination dir exists
        await fs.mkdir(path.dirname(destPath), { recursive: true })
        await fs.copyFile(f, destPath)
        created.push(destPath)
      }
      // handle nested pages like 'app/insights/page-*.js' already covered
    }

    if (created.length === 0) console.log('No matching hashed chunk files found to copy.');
    else {
      console.log('Created/updated files:')
      created.forEach((p) => console.log('  -', p))
    }
  } catch (err) {
    console.error('Error while fixing chunks:', err)
    process.exit(1)
  }
}

main()
