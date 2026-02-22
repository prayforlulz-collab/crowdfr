import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
}

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl
    const hostname = req.headers.get("host") || "crowdfr.com"

    // Get the subdomain
    let currentHost
    if (process.env.NODE_ENV === "production") {
        const baseDomain = "crowdfr.com"
        const vercelDomain = "vercel.app"

        if (hostname.includes(baseDomain)) {
            currentHost = hostname.replace(`.${baseDomain}`, "")
        } else if (hostname.includes(vercelDomain)) {
            // Handle Vercel preview/branch URLs or main .vercel.app
            const parts = hostname.split(".")
            // If it's just [name].vercel.app, currentHost is [name]
            // If it's [sub].[name].vercel.app, we want [sub]
            if (parts.length > 2) {
                currentHost = parts[0]
            } else {
                currentHost = parts[0]
            }
        } else {
            currentHost = hostname.split('.')[0]
        }
    } else {
        if (hostname.includes("localhost")) {
            const parts = hostname.split(".")
            if (parts.length > 1 && parts[0] !== "localhost") {
                currentHost = parts[0]
            }
        }
    }

    const baseDomain = "crowdfr.com"
    const excludedSubdomains = [
        "www",
        "app",
        "dashboard",
        "pricing",
        "login",
        "register",
        "api",
        "localhost:3000",
        "crowdfr"
    ]

    // If we are on the main domain, redirect internal routes to subdomains
    if (!currentHost || excludedSubdomains.includes(currentHost) || currentHost === "crowdfr.com") {
        const path = url.pathname

        // Redirect /a/[slug] -> [slug].crowdfr.com
        if (path.startsWith("/a/")) {
            const slug = path.split("/")[2]
            if (slug) {
                return NextResponse.redirect(new URL(`https://${slug}.${baseDomain}`, req.url))
            }
        }

        // Redirect /r/[slug] -> [slug_artist].crowdfr.com/r/[slug]
        // Note: This requires knowing the artist slug, which we don't have without a DB call.
        // For now, we'll keep /r/ on the main domain or allow it.
        // Release slugs are unique so they work anywhere.

        return NextResponse.next()
    }

    // If we have a valid subdomain (artist slug)
    if (currentHost) {
        const newUrl = req.nextUrl.clone()

        // If visiting subdomain root -> show artist page "/a/[subdomain]"
        if (url.pathname === "/") {
            newUrl.pathname = `/a/${currentHost}`
            return NextResponse.rewrite(newUrl)
        }

        // If visiting subdomain /r/[slug] -> already handled naturally by Next.js if /r/ exists
        return NextResponse.next()
    }

    return NextResponse.next()
}
