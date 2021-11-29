import { LogicSigAccount } from 'algosdk';
export interface CompileResult {
    hash: string;
    result: string;
}
export declare class Tinyman {
    readonly tinymanValidatorAppId: number;
    constructor(tinymanValidatorAppId: number);
    getTinymanPoolSignatureAccount(TMPL_ASSET_ID_1: number, TMPL_ASSET_ID_2: number): LogicSigAccount;
}
