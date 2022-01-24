"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinyman = void 0;
const algosdk_1 = require("algosdk");
const BIN_PROTOCOL = require('bin-protocol');
const buffer_1 = require("buffer");
const binProtocol = new BIN_PROTOCOL();
const TEMPLATE_OBJECT = [
    {
        "name": "TMPL_ASSET_ID_2",
        "type": "int",
        "index": 5,
        "length": 10
    },
    {
        "name": "TMPL_ASSET_ID_1",
        "type": "int",
        "index": 15,
        "length": 10
    },
    {
        "name": "TMPL_VALIDATOR_APP_ID",
        "type": "int",
        "index": 74,
        "length": 10
    }
];
const BYTE_CODE = "BCAIAQCBgICAgICAgPABgICAgICAgIDwAQMEBQYlJA1EMQkyAxJEMRUyAxJEMSAyAxJEMgQiDUQzAQAxABJEMwEQIQcSRDMBGIGCgICAgICAgPABEkQzARkiEjMBGyEEEhA3ARoAgAlib290c3RyYXASEEAAXDMBGSMSRDMBG4ECEjcBGgCABHN3YXASEEACOzMBGyISRDcBGgCABG1pbnQSQAE7NwEaAIAEYnVybhJAAZg3ARoAgAZyZWRlZW0SQAJbNwEaAIAEZmVlcxJAAnkAIQYhBSQjEk0yBBJENwEaARclEjcBGgIXJBIQRDMCADEAEkQzAhAhBBJEMwIhIxJEMwIiIxwSRDMCIyEHEkQzAiQjEkQzAiWACFRNUE9PTDExEkQzAiZRAA+AD1RpbnltYW5Qb29sMS4xIBJEMwIngBNodHRwczovL3RpbnltYW4ub3JnEkQzAikyAxJEMwIqMgMSRDMCKzIDEkQzAiwyAxJEMwMAMQASRDMDECEFEkQzAxElEkQzAxQxABJEMwMSIxJEJCMTQAAQMwEBMwIBCDMDAQg1AUIBsTMEADEAEkQzBBAhBRJEMwQRJBJEMwQUMQASRDMEEiMSRDMBATMCAQgzAwEIMwQBCDUBQgF8MgQhBhJENwEcATEAE0Q3ARwBMwQUEkQzAgAxABNEMwIUMQASRDMDADMCABJEMwIRJRJEMwMUMwMHMwMQIhJNMQASRDMDESMzAxAiEk0kEkQzBAAxABJEMwQUMwIAEkQzAQEzBAEINQFCAREyBCEGEkQ3ARwBMQATRDcBHAEzAhQSRDMDFDMDBzMDECISTTcBHAESRDMCADEAEkQzAhQzBAASRDMCESUSRDMDADEAEkQzAxQzAwczAxAiEk0zBAASRDMDESMzAxAiEk0kEkQzBAAxABNEMwQUMQASRDMBATMCAQgzAwEINQFCAJAyBCEFEkQ3ARwBMQATRDMCADcBHAESRDMCADEAE0QzAwAxABJEMwIUMwIHMwIQIhJNMQASRDMDFDMDBzMDECISTTMCABJEMwEBMwMBCDUBQgA+MgQhBBJENwEcATEAE0QzAhQzAgczAhAiEk03ARwBEkQzAQEzAgEINQFCABIyBCEEEkQzAQEzAgEINQFCAAAzAAAxABNEMwAHMQASRDMACDQBD0M=";
const sliceInsert = (uint8arr, start, end, toInsert) => {
    const arrCopy = [...Array.from(uint8arr)];
    const left = arrCopy.slice(0, start);
    const right = arrCopy.slice(end, uint8arr.length);
    return new Uint8Array(left.concat(toInsert).concat(right));
};
class Tinyman {
    constructor(tinymanValidatorAppId) {
        this.tinymanValidatorAppId = tinymanValidatorAppId;
        if (this.tinymanValidatorAppId === null) {
            throw new Error("Tinyman ID not set!");
        }
    }
    getTinymanPoolSignatureAccount(TMPL_ASSET_ID_1, TMPL_ASSET_ID_2) {
        if (TMPL_ASSET_ID_1 == null || TMPL_ASSET_ID_2 == null) {
            throw new Error("Parameters not set!");
        }
        if (TMPL_ASSET_ID_1 < TMPL_ASSET_ID_2) {
            const tmp = TMPL_ASSET_ID_1;
            TMPL_ASSET_ID_1 = TMPL_ASSET_ID_2;
            TMPL_ASSET_ID_2 = tmp;
        }
        console.log("Generating Tinyman V1.1 Pool Signature with: ", TMPL_ASSET_ID_1, TMPL_ASSET_ID_2, this.tinymanValidatorAppId);
        const valueLookUpObject = {
            "TMPL_ASSET_ID_1": TMPL_ASSET_ID_1,
            "TMPL_ASSET_ID_2": TMPL_ASSET_ID_2,
            "TMPL_VALIDATOR_APP_ID": this.tinymanValidatorAppId
        };
        let template_bytes = buffer_1.Buffer.from(BYTE_CODE, "base64");
        let offset = 0;
        for (let templateData of TEMPLATE_OBJECT) {
            const value = valueLookUpObject[templateData.name];
            const start = templateData.index - offset;
            const end = start + templateData.length;
            const encodedValue = binProtocol.write().UVarint(value).result;
            const encodedValueLength = encodedValue.length;
            const diff = templateData.length - encodedValueLength;
            offset += diff;
            template_bytes = sliceInsert(template_bytes, start, end, Array.from(encodedValue));
        }
        const signature = new algosdk_1.LogicSigAccount(template_bytes);
        console.log("Generated Tinyman V1.1 Pool Signature address: ", signature.address());
        return signature;
    }
}
exports.Tinyman = Tinyman;
