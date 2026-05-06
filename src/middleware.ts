import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  // For now: allow all routes (Supabase auth integrated when keys are added)
  // TODO: uncomment below when Supabase is configured
  /*
  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session && !isAuthPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
