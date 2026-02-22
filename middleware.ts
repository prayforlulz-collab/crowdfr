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

    // Handle main domain, www, app, and dashboard - do not rewrite
    const excludedSubdomains = [
        "www",
        "app",
        "dashboard",
        "pricing",
        "login",
        "register",
        "api",
        "localhost:3000",
        "crowdfr" // Exclude the main project name itself
    ]

    if (!currentHost || excludedSubdomains.includes(currentHost) || currentHost === "crowdfr.com") {
        return NextResponse.next()
    }

    // If we have a valid subdomain (artist slug)
    if (currentHost) {
        const newUrl = req.nextUrl.clone()

        // Rewrite root path "/" -> show artist page "/a/[subdomain]"
        if (url.pathname === "/") {
            newUrl.pathname = `/a/${currentHost}`
            return NextResponse.rewrite(newUrl)
        }

        // Allow other paths (like /r/albumname) to pass through naturally.
        // The browser url remains subdomain.domain.com/r/albumname
        // Next.js router handles /r/albumname route.
        return NextResponse.next()
    }

    return NextResponse.next()
}
