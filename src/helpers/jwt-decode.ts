export function decodeJWT(token:string) {

    try {
        const [header, payload, signature] = token.split('.');
        return JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }

}