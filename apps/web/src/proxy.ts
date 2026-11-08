import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Proxy Next.js 16 (ex-middleware).
 * Toutes les routes applicatives exigent une session Clerk.
 * Restent publiques : la page de connexion, les assets et le healthcheck.
 */
const isPublicRoute = createRouteMatcher([
  "/connexion(.*)",
  "/inscription(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/trace(.*)",
  "/api/health(.*)",
  "/manifest.webmanifest(.*)",
  "/icon.svg",
  "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
