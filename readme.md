# @softmg/vite-plugin-react-lazy-component

This plugin allows you to use renderToString with Suspense.

On client using react lazy. On ssr using root level await.

## Getting Started

Install the package as a dev dependency.

```bash
# npm
npm install --save-dev @softmg/vite-plugin-react-lazy-component

# pnpm
pnpm install --save-dev @softmg/vite-plugin-react-lazy-component

# yarn
yarn add --dev @softmg/vite-plugin-react-lazy-component

# bun
add add --D @softmg/vite-plugin-react-lazy-component
```

Add the plugin to your vite.config.ts file.

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import lazyComponentPlugin from "@softmg/vite-plugin-react-lazy-component";

// https://vitejs.dev/config/
export default defineConfig((config) => {
  return {
    build: {
      target: config.isSsrBuild ? "node20" : false, // target node required for root level await
    },
    plugins: [
      lazyComponentPlugin(),
      react(),
    ],
  };
});
```

Add the reference to your vite-env.d.ts file.
```dts
/// <reference types="@softmg/vite-plugin-react-lazy-component/client" />
```

## Using

```ts
import { Suspense } from "react";
import { lazy } from "virtual:lazy-component";

const Example = lazy(() => import("./Example"));

function App() {
  return (
    <>
      <Suspense>
        <Example data="data" />
      </Suspense>
    </>
  );
}

export default App;
```