const glob = require('@now/build-utils/fs/glob.js')
const download = require('@now/build-utils/fs/download.js')
const nowNextBuilder = require('@now/next')
const { readJson, writeJson } = require('fs-extra')
const { join } = require('path')
const getWritableDirectory = require('@now/build-utils/fs/get-writable-directory')
const { ulid } = require('ulid')

// Inverts the relationship of a library (`./`) and its demo app (`./example`)
// to prepare app it for a standard `@now/next` build.

// Lodash-alike helpers
const toPairs = obj => Object.keys(obj).map(key => [key, obj[key]])
const fromPairs = pairs => pairs
  .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {})
const mapKeys = (obj, iteratee) => fromPairs(
  toPairs(obj)
    .map(([key, value]) => [iteratee(value, key), value])
)

// Starts with a library containing a directory called `./example` that
// contains a nextj.s app. We want to invert that relationship where we end up
// with e.g. `./library` directory inside the `./examples` directory.
// Effectively similar to:
// ```
// mv ./example ./examples-backup
// mkdir ./library
// mv ./* ./library
// mv ./example-backup/* ./
// ```
// We perform this transformation on the data and in an additional step
// `now.sh` will make the filesystem match.
// See: https://zeit.co/docs/v2/deployments/builders/developer-guide/#types
const moveFile = buildName => (value, key) =>
  key.startsWith('example/') ? key.slice(8) : `${buildName}/${key}`
const moveFiles = (files, buildName) => mapKeys(files, moveFile(buildName))

// We need to change the location of the library because in a previous step
// we've changed the relative relationship between the example app and the
// library.
const moveDependenciesInManifest = async (buildDir, buildName) => {
  const libraryManifestPath = join(buildDir, buildName, 'package.json')
  const libraryManifest = await readJson(libraryManifestPath)
  const exampleManifestPath = join(buildDir, 'package.json')
  const originalExampleManifest = await readJson(exampleManifestPath)
  const dependencies = {
    ...originalExampleManifest.dependencies,
    // We've moved the library so we update the path
    [libraryManifest.name]: `file:./${buildName}`
  }
  const exampleManifest = { ...originalExampleManifest, dependencies }
  await writeJson(exampleManifestPath, exampleManifest)
}

exports.build = async (context) => {
  // Use a unique build name so we can create a directory in the project
  // without worry that we'll overwrite anything
  const buildName = ulid()
  // Invert the relationship of the library (`./`) and example app
  // (`./example`)
  const buildDir = await getWritableDirectory()
  const movedFiles = moveFiles(context.files, buildName)
  await download(movedFiles, buildDir)
  await moveDependenciesInManifest(buildDir, buildName)
  // Rename the entrypoint to match
  const entrypoint = 'next.config.js'
  // Grab the files from the build dir
  const files = await glob('**', buildDir)
  // And pipe everything to the `@now/next` builder
  return nowNextBuilder.build({ ...context, entrypoint, files })
}

// Pass through to `@now/next`
exports.analyze = nowNextBuilder.analyze
exports.prepareCache = nowNextBuilder.prepareCache
