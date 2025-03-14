import { cookies } from 'next/headers';

export async function createAccessTokenCookie(
    token: string,
    expiresAt?: number
) {
    const secureCookie = process.env.NODE_ENV === "production";
    const cookieName = secureCookie
        ? "__Secure-next-auth.access-token"
        : "next-auth.access-token";

    const maxAge = expiresAt
        ? Math.floor((expiresAt - Date.now()) / 1000)
        : 24 * 60 * 60;

    const cookieStore = await cookies();
    cookieStore.set({
        name: cookieName,
        value: token,
        httpOnly: true,
        secure: secureCookie,
        sameSite: 'lax',
        path: '/',
        maxAge,
    });
}
export async function getAccessTokenFromCookies() {
    const secureCookie = process.env.NODE_ENV === "production";
    const cookieName = secureCookie
        ? "__Secure-next-auth.access-token"
        : "next-auth.access-token";

    const cookieStore = await cookies();
    return cookieStore.get(cookieName)?.value;
}
