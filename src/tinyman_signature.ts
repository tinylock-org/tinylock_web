import { LogicSigAccount } from 'algosdk';
const BIN_PROTOCOL = require('bin-protocol');
import { Buffer } from 'buffer';

const binProtocol = new BIN_PROTOCOL();

export interface CompileResult {
    hash: string;
    result: string;
}

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
        "index": 17,
        "length": 10
    },
    {
        "name": "TMPL_VALIDATOR_APP_ID",
        "type": "int",
        "index": 75,
        "length": 10
    }
];

const BYTE_CODE = "BCAIAQCBgICAgICAgPABAwSAgICAgICAgPABBQYhBSQNRDEJMgMSRDEVMgMSRDEgMgMSRDIEIg1EMwEAMQASRDMBECEHEkQzARiBgoCAgICAgIDwARJEMwEZIhIzARslEhA3ARoAgAlib290c3RyYXASEEAAXDMBGSMSRDMBG4ECEjcBGgCABHN3YXASEEACEzMBGyISRDcBGgCABG1pbnQSQAE5NwEaAIAEYnVybhJAAYM3ARoAgAZyZWRlZW0SQAIzNwEaAIAEZmVlcxJAAlAAIQYhBCQjEk0yBBJENwEaARchBRI3ARoCFyQSEEQzAgAxABJEMwIQJRJEMwIhIxJEMwIiIxwSRDMCIyEHEkQzAiQjEkQzAiWAB1RNMVBPT0wSRDMCJlEADYANVGlueW1hbiBQb29sIBJEMwIngBNodHRwczovL3RpbnltYW4ub3JnEkQzAikyAxJEMwIqMgMSRDMCKzIDEkQzAiwyAxJEMwMAMQASRDMDECEEEkQzAxEhBRJEMwMUMQASRDMDEiMSRCQjE0AAEDMBATMCAQgzAwEINQFCAYkzBAAxABJEMwQQIQQSRDMEESQSRDMEFDEAEkQzBBIjEkQzAQEzAgEIMwMBCDMEAQg1AUIBVDIEIQYSRDcBHAExABNENwEcATMEFBJEMwIAMQATRDMCFDEAEkQzAwAzAgASRDMDFDMDBzMDECISTTEAEkQzBAAxABJEMwQUMwIAEkQzAQEzBAEINQFCAPwyBCEGEkQ3ARwBMQATRDcBHAEzAhQSRDMDFDMDBzMDECISTTcBHAESRDMCADEAEkQzAhQzBAASRDMDADEAEkQzAxQzAwczAxAiEk0zBAASRDMEADEAE0QzBBQxABJEMwEBMwIBCDMDAQg1AUIAjjIEIQQSRDcBHAExABNEMwIANwEcARJEMwIAMQATRDMDADEAEkQzAhQzAgczAhAiEk0xABJEMwMUMwMHMwMQIhJNMwIAEkQzAQEzAwEINQFCADwyBCUSRDcBHAExABNEMwIUMwIHMwIQIhJNNwEcARJEMwEBMwIBCDUBQgARMgQlEkQzAQEzAgEINQFCAAAzAAAxABNEMwAHMQASRDMACDQBD0M=";

const sliceInsert = (uint8arr: Uint8Array, start: number, end: number, toInsert: any[]) => {
    const arrCopy = [...Array.from(uint8arr)]
    const left = arrCopy.slice(0, start)
    const right = arrCopy.slice(end, uint8arr.length)
    return new Uint8Array(left.concat(toInsert).concat(right))
}

export class Tinyman {

    constructor(
        public readonly tinymanValidatorAppId: number
    ) {
        if (this.tinymanValidatorAppId === null) {
            throw new Error("Tinyman ID not set!");
        }
    }

    getTinymanPoolSignatureAccount(
        TMPL_ASSET_ID_1: number,
        TMPL_ASSET_ID_2: number
    ): LogicSigAccount {
        if (TMPL_ASSET_ID_1 == null || TMPL_ASSET_ID_2 == null) {
            throw new Error("Parameters not set!");
        }

        if (TMPL_ASSET_ID_1 < TMPL_ASSET_ID_2) {
            const tmp = TMPL_ASSET_ID_1;
            TMPL_ASSET_ID_1 = TMPL_ASSET_ID_2
            TMPL_ASSET_ID_2 = tmp;
        }

        console.log("Generating Tinyman V1 Pool Signature with: ", TMPL_ASSET_ID_1, TMPL_ASSET_ID_2, this.tinymanValidatorAppId);

        const valueLookUpObject: any = {
            "TMPL_ASSET_ID_1": TMPL_ASSET_ID_1,
            "TMPL_ASSET_ID_2": TMPL_ASSET_ID_2,
            "TMPL_VALIDATOR_APP_ID": this.tinymanValidatorAppId
          };

        let template_bytes: any = Buffer.from(BYTE_CODE, "base64");

        let offset = 0;

          for(let templateData of TEMPLATE_OBJECT){
            const value = valueLookUpObject[templateData.name] as number;

            const start = templateData.index - offset;
            const end = start + templateData.length;

            const encodedValue = binProtocol.write().UVarint(value).result;
            const encodedValueLength = encodedValue.length;

            const diff = templateData.length - encodedValueLength;
            offset += diff;

            template_bytes = sliceInsert(template_bytes, start, end, Array.from(encodedValue));
          }

          const signature = new LogicSigAccount(template_bytes);

          console.log("Generated Tinyman V1 Pool Signature address: ", signature.address());
          
          return signature;
    }

    
}