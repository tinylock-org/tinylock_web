import { LogicSigAccount } from "algosdk";
import { Observable } from "rxjs";
import { Environment } from "./constants";
import type { Tinylocker } from "./index";
export declare class Tinylock {
    private readonly tinylocker;
    private readonly environment;
    lookUpMap: {
        [key: string]: any;
    };
    contractTemplate: string;
    textDecoder: TextDecoder;
    textEncoder: TextEncoder;
    constructor(tinylocker: Tinylocker, environment: Environment);
    sendToCompile: (TMPL_ASSET_ID: number, TMPL_CONTRACT_ID: number, TMPL_FEETOKEN_ID: number, TMPL_LOCKER_ADDRESS: string) => Observable<LogicSigAccount>;
}
