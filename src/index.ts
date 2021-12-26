import { Algodv2, Indexer, getApplicationAddress, LogicSigAccount } from "algosdk";
import { AlgodTokenHeader, CustomTokenHeader, IndexerTokenHeader } from "algosdk/dist/types/src/client/client";
import { Buffer } from "buffer";
import { defer, delay, from, mergeMap, of, switchMap, toArray, filter, merge, catchError } from "rxjs";
import { Asset } from "algosdk/dist/types/src/client/v2/algod/models/types";
import { Tinylock } from "./tinylock_signature";
import { Tinyman } from "./tinyman_signature";
import { algoExplorerClientUrl, algoExplorerIndexerUrl, algoExplorerPort, Environment, migrationData, Tinylock_App_Id, Tinylock_Asa_Id, Tinyman_App_Id } from "./constants";

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

export class Tinylocker {

    client: Algodv2;
    indexer: Indexer;

    environment: Environment;
    tinymanAppId: number;
    tinylockAppId: number;
    tinylockAsaId: number;

    enableAPICallRateLimit: boolean;

    rateLimiter = {
        maxCallsPerSecond: 10,
        maxCallsDelay: 100,
        callsPerSecond: 0,
        calls: 0,
        startingTime: 0,
        lastTime: 0
    }

    tinymanSignatureGenerator: Tinyman;
    tinylockSignatureGenerator: Tinylock;

    textDecoder = new TextDecoder();

    constructor(
        private readonly settings = {} as TinylockerConfig
    ) {
        this.environment = settings.environment ?? Environment.MainNet as any;
        this.tinymanAppId = settings.tinymanAppId ?? Tinyman_App_Id[this.environment];
        this.tinylockAppId = settings.tinylockAppId ?? Tinylock_App_Id[this.environment];
        this.enableAPICallRateLimit = settings.enableAPICallRateLimit ?? true;
        this.tinymanSignatureGenerator = new Tinyman(this.tinymanAppId);
        this.tinylockAsaId = Tinylock_Asa_Id[this.environment];
        this.tinylockSignatureGenerator = new Tinylock(this, this.environment);

        if (settings.maxCallsPerSecond) {
            this.rateLimiter.maxCallsPerSecond = settings.maxCallsPerSecond;
            this.rateLimiter.maxCallsDelay = 1000 / this.rateLimiter.maxCallsPerSecond;
        }

        if (settings.client) {
            this.client = settings.client;
        } else {
            this.client = new Algodv2(
                settings.clientToken ?? '',
                settings.clientBase ?? algoExplorerClientUrl[this.environment],
                settings.clientPort ?? algoExplorerPort
            )
        }

        if (settings.indexer) {
            this.indexer = settings.indexer;
        } else {
            this.indexer = new Indexer(
                settings.indexerToken ?? '',
                settings.indexerBase ?? algoExplorerIndexerUrl[this.environment],
                settings.indexerPort ?? algoExplorerPort
            );
        }
    }

    private requestLimiter = () => {
        if (this.rateLimiter.callsPerSecond == 0) {
            this.rateLimiter.startingTime = Date.now();
        }

        this.rateLimiter.lastTime = Date.now();

        if (this.rateLimiter.lastTime - this.rateLimiter.startingTime >= 1100) {
            this.rateLimiter.callsPerSecond = 0;
            this.rateLimiter.calls = 1;
            this.rateLimiter.startingTime = Date.now();
        } else {
            this.rateLimiter.calls++;
        }

        this.rateLimiter.callsPerSecond = (this.rateLimiter.calls * (this.rateLimiter.lastTime / (this.rateLimiter.startingTime + 1000)));

        if (this.rateLimiter.callsPerSecond < this.rateLimiter.maxCallsPerSecond) {
            return 0;
        } else {
            const delay = this.rateLimiter.maxCallsDelay * (this.rateLimiter.callsPerSecond - this.rateLimiter.maxCallsPerSecond) + 50;
            return delay;
        }

    }

    public getClient = () => of(this.client).pipe(
        delay(this.enableAPICallRateLimit ? this.requestLimiter() : 0)
    )

    public getIndexer = () => of(this.indexer).pipe(
        delay(this.enableAPICallRateLimit ? this.requestLimiter() : 0)
    )


    public getAccountInfoByAddress = (address: string) =>
        this.getIndexer().pipe(
            mergeMap(
                (indexer: Indexer) => {
                    return from(indexer.lookupAccountByID(address).do())
                }
            )
        );

    private findTinylockAppTransactions = () => {
        return this.getIndexer().pipe(
            switchMap(
                (indexer: Indexer) => indexer.searchForTransactions()
                    .txType("axfer")
                    .address(getApplicationAddress(this.tinylockAppId))
                    .addressRole("receiver")
                    .assetID(this.tinylockAsaId)
                    .do()
            ),
            switchMap(
                (result: any) => of(result["transactions"])
            )
        )
    }

    private findTinylockMigrationTransactions = (asa?: number) => {
        return this.getIndexer().pipe(
            switchMap(
                indexer => {
                    const request = indexer.searchForTransactions()
                        .txType("axfer")
                        .address(migrationData[this.environment].sig_tmpl_v2_migration_account)
                        .addressRole("sender")
                        .minRound(migrationData[this.environment].sig_tmpl_v2_migration_start)
                        .maxRound(migrationData[this.environment].sig_tmpl_v2_round)

                    if (asa) {
                        request.assetID(asa)
                    }

                    return request.do()
                }
            ),
            switchMap(
                result => of(result["transactions"])
            )
        )
    }

    public fetchAssetInfoById = (asaID: number) =>
        this.getIndexer().pipe(
            switchMap(
                indexer => indexer.lookupAssetByID(asaID).do()
            )
        );

    assets: { [key: number]: Asset } = {};

    public getAssetInfoById = (asaId: number) => {
        // console.log("getAssetInfoById: ", asaId);

        return of(this.assets[asaId]).pipe(
            mergeMap(
                (asset: Asset) =>
                    defer(
                        () => asset == null
                            ? this.fetchAssetInfoById(asaId).pipe(
                                switchMap(
                                    (result: any) => {
                                        this.assets[asaId] = Object.assign(this.assets[asaId] ?? {}, result["asset"]);
                                        // console.log("Fetched Asset: ", result["result"],  this.assets[asaId]);
                                        return of(this.assets[asaId])
                                    }
                                )
                            )
                            : of(asset)
                    )
            )
        )
    }

    public searchToken = (asa: number, issuedLiquidityTokens?: bigint) => {

        return merge(
            this.findTinylockMigrationTransactions(asa),
            this.findTinylockAppTransactions()
        ).pipe(
            switchMap(
                (transactions: any[]) => {
                    if (transactions.length == 0) {
                        return from([]);
                    }

                    const asaSeen: { [key: number]: string[] } = {

                    };

                    return from(transactions).pipe(
                        mergeMap(
                            (transaction: any) => {
                                const result = {} as SearchResultEntry;

                                let signatureAsa = -1;

                                if (!transaction.note) {
                                    return of(null);
                                }

                                const noteBuffer = Buffer.from(transaction.note, 'base64');
                                const noteUTF8 = noteBuffer.toString('utf-8');
                                if (noteUTF8.length == 58) {
                                    result.account = noteUTF8;
                                    signatureAsa = asa;
                                    result.migrated = true;

                                } else {
                                    const noteHex = noteBuffer.toString('hex');
                                    const noteNumber = parseInt(noteHex, 16);

                                    if (noteNumber !== asa) {
                                        // console.log("Transaction not what we are looking for", noteNumber);
                                        return of(null);
                                    }
                                    signatureAsa = noteNumber;
                                    result.account = transaction.sender;
                                }

                                if (asaSeen[asa]) {
                                    if (asaSeen[asa].indexOf(result.account) >= 0) {
                                        // console.log("Using already fetched information for asa: ", asa);
                                        return of(null);
                                    }
                                    asaSeen[asa].push(result.account);

                                } else {
                                    asaSeen[asa] = [result.account];
                                }

                                return this.tinylockSignatureGenerator.sendToCompile(
                                    signatureAsa,
                                    this.tinylockAppId,
                                    this.tinylockAsaId,
                                    result.account
                                )
                                    .pipe(
                                        mergeMap(
                                            (signature: LogicSigAccount) => this.getAccountInfoByAddress(signature.address())
                                        ),
                                        mergeMap(
                                            (signatureAccountInfo: any) => {
                                                // console.log("Signature Acc: ", signatureAccountInfo);

                                                const localStateArray = signatureAccountInfo["account"]["apps-local-state"];
                                                const assets = signatureAccountInfo["account"]["assets"];

                                                const amount = BigInt(assets[0]["amount"]);
                                                if (amount <= 0) {
                                                    return of(result);
                                                }

                                                const timeEntry = localStateArray[0]["key-value"][0];
                                                const time = timeEntry["value"]["uint"] * 1000;

                                                result.date = new Date(time).toDateString();

                                                result.unlocked = time <= Date.now();

                                                const assetID = assets[0]["asset-id"];
                                                result.asa = assetID;

                                                return this.getAssetInfoById(assetID).pipe(
                                                    mergeMap(
                                                        (asset: Asset) => {
                                                            // console.log("Asset: ", asset);
                                                            result.name = asset.params.name!;

                                                            if (issuedLiquidityTokens) {
                                                                result.amount = (amount * BigInt(100) / issuedLiquidityTokens) as any;
                                                            } else {
                                                                // console.log(asset.params.total);
                                                                result.amount = ((amount * BigInt(100)) / BigInt(asset.params.total)) as any;
                                                            }

                                                            return of(result)
                                                        }
                                                    )

                                                );
                                            }
                                        ),
                                        catchError(
                                          (error: any) => {
                                            console.debug("Error: ", error.message, " Entry: ", result, " TX: ", transaction);
                                            return of(null);
                                          }
                                        )
                                    )
                            }
                        ),
                        filter(value => value != null && Object.getOwnPropertyNames(value).length !== 0 ),
                        toArray()
                    )
                }
            )
        )
    }


    public searchPoolAsa = (asa1: number, asa2: number) => {
        if (asa1 < asa2) {
            let tmp = asa1;
            asa1 = asa2;
            asa2 = tmp;
        }

        const poolSignature = this.tinymanSignatureGenerator.getTinymanPoolSignatureAccount(
            asa1,
            asa2
        );

        return this.getAccountInfoByAddress(poolSignature.address()).pipe(
            switchMap(
                (accountInfo: any) => {
                    const poolAccount = accountInfo["account"];
                    const poolAsaId: number = poolAccount["created-assets"][0].index;

                    const localstateArray: any[] = poolAccount["apps-local-state"][0]["key-value"];

                    const filteredKeyValues = localstateArray.filter(
                        (value: any) => {
                            const buffer = Buffer.from(value.key, 'base64');
                            const stringKey = this.textDecoder.decode(buffer);

                            return stringKey === 'ilt';
                        }
                    );

                    const issuedLiquidityTokens = BigInt(filteredKeyValues[0].value.uint) - BigInt(1000);

                    return of({
                        poolAccount,
                        poolAsaId,
                        issuedLiquidityTokens
                    });
                }
            )
        )
    }


}