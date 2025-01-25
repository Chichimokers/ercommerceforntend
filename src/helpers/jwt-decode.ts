export function decodeJWT(token:string) {

    try {
        const [header, payload, signature] = token.split('.');
        const decodedPayload = JSON.parse(
            atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        );
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }

}