import { Algodv2, Indexer } from "algosdk";
import { AlgodTokenHeader, CustomTokenHeader, IndexerTokenHeader } from "algosdk/dist/types/src/client/client";
import { Asset } from "algosdk/dist/types/src/client/v2/algod/models/types";
import { Tinylock } from "./tinylock_signature";
import { Tinyman } from "./tinyman_signature";
import { Environment } from "./constants";
export interface TinylockerConfig {
    enableAPICallRateLimit?: boolean;
    maxCallsPerSecond?: number;
    environment?: keyof typeof Environment;
    client?: Algodv2;
    indexer?: Indexer;
    clientToken?: string | AlgodTokenHeader | CustomTokenHeader;
    indexerToken?: string | IndexerTokenHeader | CustomTokenHeader;
    clientBase?: string;
    clientPort?: string | number;
    indexerBase?: string;
    indexerPort?: string | number;
    tinymanAppId?: number;
    tinylockAppId?: number;
}
export interface SearchResultEntry {
    unlocked: boolean;
    name: string;
    asa: number;
    date: string;
    amount: number;
    account: string;
    migrated?: boolean;
}
export interface PoolData {
    poolAccount: any;
    poolAsaId: number;
    issuedLiquidityTokens: BigInt;
}
export declare class Tinylocker {
    private readonly settings;
    client: Algodv2;
    indexer: Indexer;
    environment: Environment;
    tinymanAppId: number;
    tinylockAppId: number;
    tinylockAsaId: number;
    enableAPICallRateLimit: boolean;
    rateLimiter: {
        maxCallsPerSecond: number;
        maxCallsDelay: number;
        callsPerSecond: number;
        calls: number;
        startingTime: number;
        lastTime: number;
    };
    tinymanSignatureGenerator: Tinyman;
    tinylockSignatureGenerator: Tinylock;
    textDecoder: TextDecoder;
    constructor(settings?: TinylockerConfig);
    private requestLimiter;
    getClient: () => import("rxjs").Observable<Algodv2>;
    getIndexer: () => import("rxjs").Observable<Indexer>;
    getAccountInfoByAddress: (address: string) => import("rxjs").Observable<Record<string, any>>;
    private findTinylockAppTransactions;
    private findTinylockMigrationTransactions;
    fetchAssetInfoById: (asaID: number) => import("rxjs").Observable<Record<string, any>>;
    assets: {
        [key: number]: Asset;
    };
    getAssetInfoById: (asaId: number) => import("rxjs").Observable<Asset>;
    searchToken: (asa: number, issuedLiquidityTokens?: bigint | undefined) => import("rxjs").Observable<(SearchResultEntry | null)[]>;
    searchPoolAsa: (asa1: number, asa2: number) => import("rxjs").Observable<{
        poolAccount: any;
        poolAsaId: number;
        issuedLiquidityTokens: bigint;
    }>;
    private parseNote;
}
