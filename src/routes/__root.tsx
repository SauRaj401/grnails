import { Outlet, Link, createRootRoute, HeadContent } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GR Nails" },
      { name: "description", content: "Analyzes and redesigns websites for improved UI/UX, focusing on user flow and service presentation." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "GR Nails" },
      { property: "og:description", content: "Analyzes and redesigns websites for improved UI/UX, focusing on user flow and service presentation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "GR Nails" },
      { name: "twitter:description", content: "Analyzes and redesigns websites for improved UI/UX, focusing on user flow and service presentation." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3f1eef06-9fea-4aed-91a9-81e791ed582d/id-preview-70deee40--334dc63c-f86f-4aff-a1bb-72ff6968bbec.lovable.app-1776513274696.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3f1eef06-9fea-4aed-91a9-81e791ed582d/id-preview-70deee40--334dc63c-f86f-4aff-a1bb-72ff6968bbec.lovable.app-1776513274696.png" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
