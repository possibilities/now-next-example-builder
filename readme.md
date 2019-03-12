# Example/demo app builder for Next.js libraries

When you create a library for [Next.js](https://nextjs.org/docs) with an example app in the repository it can be difficult to deploy to [now.sh](https://zeit.co/docs) if the example app is located in a subdirectory (`./example`) depending on the library located the root of repo (`./). This builder provides a workaround by inverting the nested relationship so that the library will be installed in the example app (rather than in the parent dir) when the builder finally passes the build off to the official [@now/next builder](https://zeit.co/docs/v2/deployments/official-builders/next-js-now-next).

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
```

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
```

Finally run `now` as you normally would.

## Development

Minimal example repo for manual testing: https://github.com/possibilities/now-next-example-builder-fixture
