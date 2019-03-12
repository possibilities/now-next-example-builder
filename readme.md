# Example app builder for Next.js libraries

When you create a library for [Next.js](https://nextjs.org/docs) with an example app in the repository it can be difficult to deploy to [now.sh](https://zeit.co/docs) and have the example app located in a subdirectory (`./example`) use the library from the root of repo (`./). This builder provides a workaround in this scenario by inverting this nested relationship so that the library will be installed in the example app when the builder finally passes the build off to `@now/next` 

## Usage

First must have the expected filesystem.

1. Next.js-centric library in the root
1. A Next.js example app that sources the library in `package.json`

```Shell
├── example
│   ├── next.config.js
│   ├── package.json
│   ├── pages
│   │   ├── about.js
│   │   └── index.js
│   └── yarn.lock
├── index.js
├── now.json
└── package.json

Next declare the `now-next-example-builder` where you'd normally use `@now/next`

```
{

  "version": 2,
  "name": "experiment",
  "public": true,
  "builds": [
    { "src": "example/next.config.js", "use": "now-next-example-builder" }
  ]
}

Finally run `now` as you normally would.
