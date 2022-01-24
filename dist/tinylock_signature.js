"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinylock = void 0;
const algosdk_1 = require("algosdk");
const buffer_1 = require("buffer");
const rxjs_1 = require("rxjs");
const constants_1 = require("./constants");
const CONTRACT_BASES = {
    [constants_1.Environment.MainNet]: "I3ByYWdtYSB2ZXJzaW9uIDUKZ2xvYmFsIEdyb3VwU2l6ZQppbnQgNQo9PQpibnogbWFpbl9sOQpnbG9iYWwgR3JvdXBTaXplCmludCAzCj09CmJueiBtYWluX2w2Cmdsb2JhbCBHcm91cFNpemUKaW50IDQKPT0KYnogbWFpbl9sMTIKZ3R4biAwIEFtb3VudAppbnQgMAo+Cmd0eG4gMCBSZWNlaXZlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMCBTZW5kZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMyBUeXBlRW51bQppbnQgYXBwbAo9PQpndHhuIDMgQXBwbGljYXRpb25JRAppbnQgVE1QTF9DT05UUkFDVF9JRAo9PQomJgpndHhuIDMgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4bmEgMyBBcHBsaWNhdGlvbkFyZ3MgMApieXRlICJyZWxvY2siCj09CiYmCmd0eG4gMyBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpndHhuIDIgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMiBTZW5kZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMiBBc3NldFJlY2VpdmVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4biAyIEFzc2V0QW1vdW50CmludCAwCj4KJiYKZ3R4biAyIFhmZXJBc3NldAppbnQgVE1QTF9BU1NFVF9JRAo9PQomJgomJgpibnogbWFpbl9sNQplcnIKbWFpbl9sNToKaW50IDEKcmV0dXJuCm1haW5fbDY6Cmd0eG4gMCBBbW91bnQKaW50IDAKPgpndHhuIDAgUmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDAgU2VuZGVyCmFkZHIgVE1QTF9MT0NLRVJfQUREUkVTUwo9PQomJgpndHhuIDEgVHlwZUVudW0KaW50IGFwcGwKPT0KZ3R4biAxIEFwcGxpY2F0aW9uSUQKaW50IFRNUExfQ09OVFJBQ1RfSUQKPT0KJiYKZ3R4biAxIFNlbmRlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG5hIDEgQXBwbGljYXRpb25BcmdzIDAKYnl0ZSAidW5sb2NrIgo9PQomJgpndHhuIDEgUmVrZXlUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKJiYKZ3R4biAyIFR5cGVFbnVtCmludCBheGZlcgo9PQpndHhuIDIgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4biAyIEFzc2V0UmVjZWl2ZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMiBYZmVyQXNzZXQKaW50IFRNUExfQVNTRVRfSUQKPT0KJiYKZ3R4biAyIEFzc2V0Q2xvc2VUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKZ3R4biAyIFJla2V5VG8KZ2xvYmFsIFplcm9BZGRyZXNzCj09CiYmCiYmCmJueiBtYWluX2w4CmVycgptYWluX2w4OgppbnQgMQpyZXR1cm4KbWFpbl9sOToKZ3R4biAwIEFtb3VudAppbnQgMjAwMAo+PQpndHhuIDAgUmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDAgU2VuZGVyCmFkZHIgVE1QTF9MT0NLRVJfQUREUkVTUwo9PQpndHhuIDAgU2VuZGVyCmFkZHIgWjdERUNQT1RWUjdXRUFCNDdDRllFSFRLQVJPVkhYN1FCWUpDQkRSVkE1Q0M0SkJLU0ZYQktRVEVSRQo9PQp8fAomJgpndHhuIDEgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMSBTZW5kZXIKdHhuIFNlbmRlcgohPQomJgpndHhuIDEgQXNzZXRBbW91bnQKaW50IDAKPgomJgpndHhuIDEgWGZlckFzc2V0CmludCBUTVBMX0ZFRVRPS0VOX0lECj09CiYmCiYmCmd0eG4gMiBUeXBlRW51bQppbnQgYXBwbAo9PQpndHhuIDIgQXBwbGljYXRpb25JRAppbnQgVE1QTF9DT05UUkFDVF9JRAo9PQomJgpndHhuIDIgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4bmEgMiBBcHBsaWNhdGlvbkFyZ3MgMApieXRlICJsb2NrIgo9PQomJgpndHhuYSAyIEFzc2V0cyAwCmludCBUTVBMX0ZFRVRPS0VOX0lECj09CiYmCmd0eG4gMiBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpndHhuIDMgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMyBTZW5kZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDMgQXNzZXRSZWNlaXZlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMyBBbW91bnQKaW50IDAKPT0KJiYKZ3R4biAzIFhmZXJBc3NldAppbnQgVE1QTF9BU1NFVF9JRAo9PQomJgpndHhuIDMgUmVrZXlUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKJiYKZ3R4biA0IFR5cGVFbnVtCmludCBheGZlcgo9PQpndHhuIDQgU2VuZGVyCnR4biBTZW5kZXIKIT0KJiYKZ3R4biA0IEFzc2V0UmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDQgQXNzZXRBbW91bnQKaW50IDAKPgomJgpndHhuIDQgWGZlckFzc2V0CmludCBUTVBMX0FTU0VUX0lECj09CiYmCmd0eG4gNCBBc3NldENsb3NlVG8KZ2xvYmFsIFplcm9BZGRyZXNzCj09CiYmCmd0eG4gNCBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpibnogbWFpbl9sMTEKZXJyCm1haW5fbDExOgppbnQgMQpyZXR1cm4KbWFpbl9sMTI6CmludCAwCnJldHVybg==",
    [constants_1.Environment.TestNet]: "I3ByYWdtYSB2ZXJzaW9uIDUKZ2xvYmFsIEdyb3VwU2l6ZQppbnQgNQo9PQpibnogbWFpbl9sOQpnbG9iYWwgR3JvdXBTaXplCmludCAzCj09CmJueiBtYWluX2w2Cmdsb2JhbCBHcm91cFNpemUKaW50IDQKPT0KYnogbWFpbl9sMTIKZ3R4biAwIEFtb3VudAppbnQgMAo+Cmd0eG4gMCBSZWNlaXZlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMCBTZW5kZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMyBUeXBlRW51bQppbnQgYXBwbAo9PQpndHhuIDMgQXBwbGljYXRpb25JRAppbnQgVE1QTF9DT05UUkFDVF9JRAo9PQomJgpndHhuIDMgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4bmEgMyBBcHBsaWNhdGlvbkFyZ3MgMApieXRlICJyZWxvY2siCj09CiYmCmd0eG4gMyBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpndHhuIDIgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMiBTZW5kZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMiBBc3NldFJlY2VpdmVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4biAyIEFzc2V0QW1vdW50CmludCAwCj4KJiYKZ3R4biAyIFhmZXJBc3NldAppbnQgVE1QTF9BU1NFVF9JRAo9PQomJgomJgpibnogbWFpbl9sNQplcnIKbWFpbl9sNToKaW50IDEKcmV0dXJuCm1haW5fbDY6Cmd0eG4gMCBBbW91bnQKaW50IDAKPgpndHhuIDAgUmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDAgU2VuZGVyCmFkZHIgVE1QTF9MT0NLRVJfQUREUkVTUwo9PQomJgpndHhuIDEgVHlwZUVudW0KaW50IGFwcGwKPT0KZ3R4biAxIEFwcGxpY2F0aW9uSUQKaW50IFRNUExfQ09OVFJBQ1RfSUQKPT0KJiYKZ3R4biAxIFNlbmRlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG5hIDEgQXBwbGljYXRpb25BcmdzIDAKYnl0ZSAidW5sb2NrIgo9PQomJgpndHhuIDEgUmVrZXlUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKJiYKZ3R4biAyIFR5cGVFbnVtCmludCBheGZlcgo9PQpndHhuIDIgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4biAyIEFzc2V0UmVjZWl2ZXIKYWRkciBUTVBMX0xPQ0tFUl9BRERSRVNTCj09CiYmCmd0eG4gMiBYZmVyQXNzZXQKaW50IFRNUExfQVNTRVRfSUQKPT0KJiYKZ3R4biAyIEFzc2V0Q2xvc2VUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKZ3R4biAyIFJla2V5VG8KZ2xvYmFsIFplcm9BZGRyZXNzCj09CiYmCiYmCmJueiBtYWluX2w4CmVycgptYWluX2w4OgppbnQgMQpyZXR1cm4KbWFpbl9sOToKZ3R4biAwIEFtb3VudAppbnQgMjAwMAo+PQpndHhuIDAgUmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDAgU2VuZGVyCmFkZHIgVE1QTF9MT0NLRVJfQUREUkVTUwo9PQpndHhuIDAgU2VuZGVyCmFkZHIgS1M1VVNIQ0hPV1QzNUtGQ1lYSzNNRjdNNFdDRUJVV0NXNkZIVzdVSlo1SFhITkhZT1JCVlhONUNWQQo9PQp8fAomJgpndHhuIDEgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMSBTZW5kZXIKdHhuIFNlbmRlcgohPQomJgpndHhuIDEgQXNzZXRBbW91bnQKaW50IDAKPgomJgpndHhuIDEgWGZlckFzc2V0CmludCBUTVBMX0ZFRVRPS0VOX0lECj09CiYmCiYmCmd0eG4gMiBUeXBlRW51bQppbnQgYXBwbAo9PQpndHhuIDIgQXBwbGljYXRpb25JRAppbnQgVE1QTF9DT05UUkFDVF9JRAo9PQomJgpndHhuIDIgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4bmEgMiBBcHBsaWNhdGlvbkFyZ3MgMApieXRlICJsb2NrIgo9PQomJgpndHhuYSAyIEFzc2V0cyAwCmludCBUTVBMX0ZFRVRPS0VOX0lECj09CiYmCmd0eG4gMiBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpndHhuIDMgVHlwZUVudW0KaW50IGF4ZmVyCj09Cmd0eG4gMyBTZW5kZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDMgQXNzZXRSZWNlaXZlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMyBBbW91bnQKaW50IDAKPT0KJiYKZ3R4biAzIFhmZXJBc3NldAppbnQgVE1QTF9BU1NFVF9JRAo9PQomJgpndHhuIDMgUmVrZXlUbwpnbG9iYWwgWmVyb0FkZHJlc3MKPT0KJiYKJiYKZ3R4biA0IFR5cGVFbnVtCmludCBheGZlcgo9PQpndHhuIDQgU2VuZGVyCnR4biBTZW5kZXIKIT0KJiYKZ3R4biA0IEFzc2V0UmVjZWl2ZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDQgQXNzZXRBbW91bnQKaW50IDAKPgomJgpndHhuIDQgWGZlckFzc2V0CmludCBUTVBMX0FTU0VUX0lECj09CiYmCmd0eG4gNCBBc3NldENsb3NlVG8KZ2xvYmFsIFplcm9BZGRyZXNzCj09CiYmCmd0eG4gNCBSZWtleVRvCmdsb2JhbCBaZXJvQWRkcmVzcwo9PQomJgomJgpibnogbWFpbl9sMTEKZXJyCm1haW5fbDExOgppbnQgMQpyZXR1cm4KbWFpbl9sMTI6CmludCAwCnJldHVybg=="
};
class Tinylock {
    constructor(tinylocker) {
        this.tinylocker = tinylocker;
        this.lookUpMap = {};
        this.textDecoder = new TextDecoder();
        this.textEncoder = new TextEncoder();
        this.sendToCompile = (TMPL_ASSET_ID, TMPL_CONTRACT_ID, TMPL_FEETOKEN_ID, TMPL_LOCKER_ADDRESS) => {
            if ((!TMPL_ASSET_ID || !TMPL_CONTRACT_ID || !TMPL_FEETOKEN_ID || !TMPL_LOCKER_ADDRESS)) {
                throw new Error("Parameters not set!");
            }
            const key = TMPL_ASSET_ID + TMPL_CONTRACT_ID + TMPL_FEETOKEN_ID + TMPL_LOCKER_ADDRESS;
            if (this.lookUpMap[key]) {
                return (0, rxjs_1.of)(this.lookUpMap[key]);
            }
            let modifiedTemplate = this.contractTemplate.replace(/TMPL_ASSET_ID/g, "" + TMPL_ASSET_ID);
            modifiedTemplate = modifiedTemplate.replace(/TMPL_CONTRACT_ID/g, "" + TMPL_CONTRACT_ID);
            modifiedTemplate = modifiedTemplate.replace(/TMPL_FEETOKEN_ID/g, "" + TMPL_FEETOKEN_ID);
            modifiedTemplate = modifiedTemplate.replace(/TMPL_LOCKER_ADDRESS/g, TMPL_LOCKER_ADDRESS);
            const buffer = new Uint8Array(this.textEncoder.encode(modifiedTemplate));
            return this.tinylocker.getClient().pipe((0, rxjs_1.switchMap)((client) => client.compile(buffer).do()), (0, rxjs_1.tap)(compileResult => this.lookUpMap[key] = compileResult), (0, rxjs_1.switchMap)((value) => (0, rxjs_1.of)(new algosdk_1.LogicSigAccount(Uint8Array.from(atob(value.result), c => c.charCodeAt(0))))));
        };
        this.contractTemplate = this.textDecoder.decode(new buffer_1.Buffer(CONTRACT_BASES[tinylocker.environment].trim(), 'base64'));
    }
}
exports.Tinylock = Tinylock;
