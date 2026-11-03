/**
 * A relying party's side of WebAuthn, written apart from Passhold's code and
 * on Node's own crypto: what a website's server would check of a passkey
 * Passhold made, and of a signature it gave. Shared by the unit tests and the
 * end-to-end ones, which hold the real extension to the same checks.
 */
import { createPublicKey } from 'node:crypto';
type Value = number | string | Uint8Array | Value[] | Map<Value, Value>;
/** Enough of RFC 8949 to read what an authenticator writes. */
export declare function decodeCbor(bytes: Uint8Array): Value;
export interface AuthData {
    rpIdHash: Uint8Array;
    flags: {
        up: boolean;
        uv: boolean;
        be: boolean;
        bs: boolean;
        at: boolean;
        ed: boolean;
    };
    signCount: number;
    aaguid?: string;
    credentialId?: string;
    publicKey?: Map<Value, Value>;
}
export declare function readAuthData(data: Uint8Array): AuthData;
/** The COSE key as a Node key: what the server stores for this passkey. */
export declare function coseToKey(cose: Map<Value, Value>): import("crypto").KeyObject;
export interface Registered {
    credentialId: string;
    key: ReturnType<typeof createPublicKey>;
    auth: AuthData;
    clientData: {
        type: string;
        challenge: string;
        origin: string;
        crossOrigin: boolean;
    };
}
/** A registration as a server checks it: for this site, this challenge, from this origin. */
export declare function checkRegistration(response: {
    clientDataJSON: Uint8Array;
    attestationObject: Uint8Array;
}, expected: {
    rpId: string;
    challenge: string;
    origin: string;
}): Registered;
/** A sign-in as a server checks it: the signature, over this site and this challenge, by the key it registered. */
export declare function checkAssertion(response: {
    clientDataJSON: Uint8Array;
    authenticatorData: Uint8Array;
    signature: Uint8Array;
}, registered: Pick<Registered, 'key'>, expected: {
    rpId: string;
    challenge: string;
    origin: string;
}): AuthData;
export {};
