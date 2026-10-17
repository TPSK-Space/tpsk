// Type declarations for CSS imports.
// This silences TS2882 ("Cannot find module ... for side-effect import of '.css'")
// for plain (non-module) CSS imports in Next.js.

declare module "*.css" {
  const content: string;
  export default content;
}
