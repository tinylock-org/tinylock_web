"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinylock = void 0;
const algosdk_1 = require("algosdk");
const buffer_1 = require("buffer");
const rxjs_1 = require("rxjs");
const CONTRACT_BASE64 = `
I3ByYWdtYSB2ZXJzaW9uIDUKZ2xvYmFsIEdyb3VwU2l6ZQppbnQgNQo9PQpibnogbWFpbl9sOQpn
bG9iYWwgR3JvdXBTaXplCmludCAzCj09CmJueiBtYWluX2w2Cmdsb2JhbCBHcm91cFNpemUKaW50
IDQKPT0KYnogbWFpbl9sMTIKZ3R4biAwIEFtb3VudAppbnQgMAo+Cmd0eG4gMCBSZWNlaXZlcgp0
eG4gU2VuZGVyCj09CiYmCmd0eG4gMCBTZW5kZXIKdHhuIFNlbmRlcgohPQomJgpndHhuIDMgVHlw
ZUVudW0KaW50IGFwcGwKPT0KZ3R4biAzIEFwcGxpY2F0aW9uSUQKaW50IFRNUExfQ09OVFJBQ1Rf
SUQKPT0KJiYKZ3R4biAzIFNlbmRlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG5hIDMgQXBwbGljYXRp
b25BcmdzIDAKYnl0ZSAicmVsb2NrIgo9PQomJgomJgpndHhuIDIgVHlwZUVudW0KaW50IGF4ZmVy
Cj09Cmd0eG4gMiBTZW5kZXIKdHhuIFNlbmRlcgohPQomJgpndHhuIDIgQXNzZXRSZWNlaXZlcgp0
eG4gU2VuZGVyCj09CiYmCmd0eG4gMiBBc3NldEFtb3VudAppbnQgMAo+CiYmCmd0eG4gMiBYZmVy
QXNzZXQKaW50IFRNUExfQVNTRVRfSUQKPT0KJiYKJiYKYm56IG1haW5fbDUKZXJyCm1haW5fbDU6
CmludCAxCnJldHVybgptYWluX2w2OgpndHhuIDAgQW1vdW50CmludCAwCj4KZ3R4biAwIFJlY2Vp
dmVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4biAwIFNlbmRlcgp0eG4gU2VuZGVyCiE9CiYmCmd0eG4g
MSBUeXBlRW51bQppbnQgYXBwbAo9PQpndHhuIDEgQXBwbGljYXRpb25JRAppbnQgVE1QTF9DT05U
UkFDVF9JRAo9PQomJgpndHhuIDEgU2VuZGVyCnR4biBTZW5kZXIKPT0KJiYKZ3R4bmEgMSBBcHBs
aWNhdGlvbkFyZ3MgMApieXRlICJ1bmxvY2siCj09CiYmCiYmCmd0eG4gMiBUeXBlRW51bQppbnQg
YXhmZXIKPT0KZ3R4biAyIFNlbmRlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMiBBc3NldFJlY2Vp
dmVyCmFkZHIgVE1QTF9MT0NLRVJfQUREUkVTUwo9PQomJgpndHhuIDIgWGZlckFzc2V0CmludCBU
TVBMX0FTU0VUX0lECj09CiYmCiYmCmJueiBtYWluX2w4CmVycgptYWluX2w4OgppbnQgMQpyZXR1
cm4KbWFpbl9sOToKZ3R4biAwIEFtb3VudAppbnQgMjAwMAo+PQpndHhuIDAgUmVjZWl2ZXIKdHhu
IFNlbmRlcgo9PQomJgpndHhuIDAgU2VuZGVyCnR4biBTZW5kZXIKIT0KJiYKZ3R4biAxIFR5cGVF
bnVtCmludCBheGZlcgo9PQpndHhuIDEgU2VuZGVyCnR4biBTZW5kZXIKIT0KJiYKZ3R4biAxIEFz
c2V0QW1vdW50CmludCAwCj4KJiYKZ3R4biAxIFhmZXJBc3NldAppbnQgVE1QTF9GRUVUT0tFTl9J
RAo9PQomJgomJgpndHhuIDIgVHlwZUVudW0KaW50IGFwcGwKPT0KZ3R4biAyIEFwcGxpY2F0aW9u
SUQKaW50IFRNUExfQ09OVFJBQ1RfSUQKPT0KJiYKZ3R4biAyIFNlbmRlcgp0eG4gU2VuZGVyCj09
CiYmCmd0eG5hIDIgQXBwbGljYXRpb25BcmdzIDAKYnl0ZSAibG9jayIKPT0KJiYKZ3R4bmEgMiBB
c3NldHMgMAppbnQgVE1QTF9GRUVUT0tFTl9JRAo9PQomJgomJgpndHhuIDMgVHlwZUVudW0KaW50
IGF4ZmVyCj09Cmd0eG4gMyBTZW5kZXIKdHhuIFNlbmRlcgo9PQomJgpndHhuIDMgQXNzZXRSZWNl
aXZlcgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gMyBBbW91bnQKaW50IDAKPT0KJiYKZ3R4biAzIFhm
ZXJBc3NldAppbnQgVE1QTF9BU1NFVF9JRAo9PQomJgomJgpndHhuIDQgVHlwZUVudW0KaW50IGF4
ZmVyCj09Cmd0eG4gNCBTZW5kZXIKdHhuIFNlbmRlcgohPQomJgpndHhuIDQgQXNzZXRSZWNlaXZl
cgp0eG4gU2VuZGVyCj09CiYmCmd0eG4gNCBBc3NldEFtb3VudAppbnQgMAo+CiYmCmd0eG4gNCBY
ZmVyQXNzZXQKaW50IFRNUExfQVNTRVRfSUQKPT0KJiYKJiYKYm56IG1haW5fbDExCmVycgptYWlu
X2wxMToKaW50IDEKcmV0dXJuCm1haW5fbDEyOgppbnQgMApyZXR1cm4=
`;
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
        this.contractTemplate = this.textDecoder.decode(new buffer_1.Buffer(CONTRACT_BASE64.trim(), 'base64'));
    }
}
exports.Tinylock = Tinylock;
