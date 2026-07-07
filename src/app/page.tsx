import { ExplainShell } from "@/components/principles/ExplainShell";
import { PrinciplesPage } from "@/components/principles/PrinciplesPage";

/**
 * The principles page IS the site index, so the GitHub Pages root
 * (https://vaesposito.github.io/tome-ux-principles/) is never empty. The same
 * content is also served at /principles so the in-page wordmark/nav links
 * (which point at /principles) resolve correctly under the base path.
 */
export default function Home() {
  return (
    <ExplainShell>
      <PrinciplesPage />
    </ExplainShell>
  );
}
