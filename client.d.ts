declare module "virtual:lazy-component" {
  import * as React from "react";

  function lazy<T extends React.ComponentType<any>>(
    params: () => Promise<{ default: T }>
  ): T;

  export { lazy };
}
