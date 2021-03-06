"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinylocker = void 0;
const algosdk_1 = require("algosdk");
const buffer_1 = require("buffer");
const rxjs_1 = require("rxjs");
const tinylock_signature_1 = require("./tinylock_signature");
const tinyman_signature_1 = require("./tinyman_signature");
const constants_1 = require("./constants");
class Tinylocker {
    constructor(settings = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this.settings = settings;
        this.rateLimiter = {
            maxCallsPerSecond: 10,
            maxCallsDelay: 100,
            callsPerSecond: 0,
            calls: 0,
            startingTime: 0,
            lastTime: 0
        };
        this.textDecoder = new TextDecoder();
        this.requestLimiter = () => {
            if (this.rateLimiter.callsPerSecond == 0) {
                this.rateLimiter.startingTime = Date.now();
            }
            this.rateLimiter.lastTime = Date.now();
            if (this.rateLimiter.lastTime - this.rateLimiter.startingTime >= 1100) {
                this.rateLimiter.callsPerSecond = 0;
                this.rateLimiter.calls = 1;
                this.rateLimiter.startingTime = Date.now();
            }
            else {
                this.rateLimiter.calls++;
            }
            this.rateLimiter.callsPerSecond = (this.rateLimiter.calls * (this.rateLimiter.lastTime / (this.rateLimiter.startingTime + 1000)));
            if (this.rateLimiter.callsPerSecond < this.rateLimiter.maxCallsPerSecond) {
                return 0;
            }
            else {
                const delay = this.rateLimiter.maxCallsDelay * (this.rateLimiter.callsPerSecond - this.rateLimiter.maxCallsPerSecond) + 50;
                return delay;
            }
        };
        this.getClient = () => (0, rxjs_1.of)(this.client).pipe((0, rxjs_1.delay)(this.enableAPICallRateLimit ? this.requestLimiter() : 0));
        this.getIndexer = () => (0, rxjs_1.of)(this.indexer).pipe((0, rxjs_1.delay)(this.enableAPICallRateLimit ? this.requestLimiter() : 0));
        this.getAccountInfoByAddress = (address) => this.getIndexer().pipe((0, rxjs_1.mergeMap)((indexer) => {
            return (0, rxjs_1.from)(indexer.lookupAccountByID(address).do());
        }));
        this.findTinylockAppTransactions = (tinylockAsaId, tinylockAppId) => {
            this.log("Trying to find app transactions with: ", tinylockAsaId, " , ", tinylockAppId);
            return this.getIndexer().pipe((0, rxjs_1.switchMap)((indexer) => indexer.searchForTransactions()
                .txType("axfer")
                .address((0, algosdk_1.getApplicationAddress)(tinylockAppId))
                .addressRole("receiver")
                .assetID(tinylockAsaId)
                .minRound(constants_1.migrationData[this.environment].sig_tmpl_v2_round)
                .do()), (0, rxjs_1.switchMap)((result) => (0, rxjs_1.of)(result["transactions"])));
        };
        this.findTinylockMigrationTransactions = (asa) => {
            return this.getIndexer().pipe((0, rxjs_1.switchMap)(indexer => {
                const request = indexer.searchForTransactions()
                    .txType("axfer")
                    .address(constants_1.migrationData[this.environment].sig_tmpl_v2_migration_account)
                    .addressRole("sender")
                    .minRound(constants_1.migrationData[this.environment].sig_tmpl_v2_migration_start)
                    .maxRound(constants_1.migrationData[this.environment].sig_tmpl_v2_round);
                if (asa) {
                    request.assetID(asa);
                }
                return request.do();
            }), (0, rxjs_1.switchMap)(result => (0, rxjs_1.of)(result["transactions"])));
        };
        this.fetchAssetInfoById = (asaID) => this.getIndexer().pipe((0, rxjs_1.switchMap)(indexer => indexer.lookupAssetByID(asaID).do()));
        this.assets = {};
        this.getAssetInfoById = (asaId) => {
            // console.log("getAssetInfoById: ", asaId);
            return (0, rxjs_1.of)(this.assets[asaId]).pipe((0, rxjs_1.mergeMap)((asset) => (0, rxjs_1.defer)(() => asset == null
                ? this.fetchAssetInfoById(asaId).pipe((0, rxjs_1.switchMap)((result) => {
                    var _a;
                    this.assets[asaId] = Object.assign((_a = this.assets[asaId]) !== null && _a !== void 0 ? _a : {}, result["asset"]);
                    // console.log("Fetched Asset: ", result["result"],  this.assets[asaId]);
                    return (0, rxjs_1.of)(this.assets[asaId]);
                }))
                : (0, rxjs_1.of)(asset))));
        };
        this.wrapFindTinylockAppTransactions = (tinylock_asa = this.tinylockAsaId, tinylock_app = this.tinylockAppId) => {
            return this.findTinylockAppTransactions(tinylock_asa, tinylock_app).pipe((0, rxjs_1.switchMap)(transactions => (0, rxjs_1.of)({
                transactions,
                tinylock_asa,
                tinylock_app
            })));
        };
        this.searchToken = (asa, issuedLiquidityTokens) => {
            return (0, rxjs_1.merge)(this.findTinylockMigrationTransactions(asa).pipe((0, rxjs_1.switchMap)(transactions => (0, rxjs_1.of)({
                transactions,
                tinylock_asa: constants_1.Tinylock_Asa_Id[constants_1.TinylockVersion.V1][this.environment],
                tinylock_app: constants_1.Tinylock_App_Id[constants_1.TinylockVersion.V1][this.environment]
            }))), this.wrapFindTinylockAppTransactions(), this.wrapFindTinylockAppTransactions(constants_1.Tinylock_Asa_Id[constants_1.TinylockVersion.V1][this.environment], constants_1.Tinylock_App_Id[constants_1.TinylockVersion.V1][this.environment])).pipe((0, rxjs_1.mergeMap)((transactionsWrapper) => {
                if (transactionsWrapper.transactions.length == 0) {
                    return (0, rxjs_1.from)([]);
                }
                const asaSeen = {};
                return (0, rxjs_1.from)(transactionsWrapper.transactions).pipe((0, rxjs_1.mergeMap)((transaction) => {
                    const result = {};
                    let signatureAsa = -1;
                    if (!transaction.note) {
                        return (0, rxjs_1.of)(null);
                    }
                    const noteResult = this.parseNote(transaction.note, asa);
                    if (noteResult.isAddress) {
                        result.account = noteResult.result;
                        signatureAsa = asa;
                        result.migrated = true;
                    }
                    else if (noteResult.isNumber) {
                        signatureAsa = noteResult.result;
                        result.account = transaction.sender;
                    }
                    else {
                        this.log("Transaction not what we are looking for", noteResult.result);
                        return (0, rxjs_1.of)(null);
                    }
                    if (asaSeen[asa]) {
                        if (asaSeen[asa].indexOf(result.account) >= 0) {
                            // console.log("Using already fetched information for asa: ", asa);
                            return (0, rxjs_1.of)(null);
                        }
                        asaSeen[asa].push(result.account);
                    }
                    else {
                        asaSeen[asa] = [result.account];
                    }
                    this.log(signatureAsa, " ", this.tinylockAppId, " ", this.tinylockAsaId, " ", result.account);
                    return this.tinylockSignatureGenerator.sendToCompile(signatureAsa, transactionsWrapper.tinylock_app, transactionsWrapper.tinylock_asa, result.account)
                        .pipe((0, rxjs_1.mergeMap)((signature) => this.getAccountInfoByAddress(signature.address())), (0, rxjs_1.mergeMap)((signatureAccountInfo) => {
                        // console.log("Signature Acc: ", signatureAccountInfo);
                        const localStateArray = signatureAccountInfo["account"]["apps-local-state"];
                        const assets = signatureAccountInfo["account"]["assets"];
                        const amount = BigInt(assets[0]["amount"]);
                        if (amount <= 0) {
                            return (0, rxjs_1.of)(null);
                        }
                        const timeEntry = localStateArray[0]["key-value"][0];
                        const time = timeEntry["value"]["uint"] * 1000;
                        result.date = new Date(time).toDateString();
                        result.unlocked = time <= Date.now();
                        const assetID = assets[0]["asset-id"];
                        result.asa = assetID;
                        return this.getAssetInfoById(assetID).pipe((0, rxjs_1.mergeMap)((asset) => {
                            // console.log("Asset: ", asset);
                            result.name = asset.params.name;
                            if (issuedLiquidityTokens) {
                                result.amount = (amount * BigInt(100) / issuedLiquidityTokens);
                            }
                            else {
                                // console.log(asset.params.total);
                                result.amount = ((amount * BigInt(100)) / BigInt(asset.params.total));
                            }
                            return (0, rxjs_1.of)(result);
                        }));
                    }), (0, rxjs_1.catchError)((error) => {
                        this.log("Error: ", error.message, " Entry: ", result, " TX: ", transaction);
                        return (0, rxjs_1.of)(null);
                    }));
                }), (0, rxjs_1.filter)(value => value != null && Object.getOwnPropertyNames(value).length !== 0), (0, rxjs_1.toArray)());
            }), (0, rxjs_1.concatAll)(), (0, rxjs_1.toArray)());
        };
        this.searchPoolAsa = (asa1, asa2) => {
            if (asa1 < asa2) {
                let tmp = asa1;
                asa1 = asa2;
                asa2 = tmp;
            }
            const poolSignature = this.tinymanSignatureGenerator.getTinymanPoolSignatureAccount(asa1, asa2);
            return this.getAccountInfoByAddress(poolSignature.address()).pipe((0, rxjs_1.switchMap)((accountInfo) => {
                const poolAccount = accountInfo["account"];
                const poolAsaId = poolAccount["created-assets"][0].index;
                const localstateArray = poolAccount["apps-local-state"][0]["key-value"];
                const filteredKeyValues = localstateArray.filter((value) => {
                    const buffer = buffer_1.Buffer.from(value.key, 'base64');
                    const stringKey = this.textDecoder.decode(buffer);
                    return stringKey === 'ilt';
                });
                const issuedLiquidityTokens = BigInt(filteredKeyValues[0].value.uint) - BigInt(1000);
                return (0, rxjs_1.of)({
                    poolAccount,
                    poolAsaId,
                    issuedLiquidityTokens
                });
            }));
        };
        this.environment = (_a = settings.environment) !== null && _a !== void 0 ? _a : constants_1.Environment.MainNet;
        this.tinymanAppId = (_b = settings.tinymanAppId) !== null && _b !== void 0 ? _b : constants_1.Tinyman_App_Id[constants_1.TinylockVersion.V1_1][this.environment];
        this.tinylockAppId = (_c = settings.tinylockAppId) !== null && _c !== void 0 ? _c : constants_1.Tinylock_App_Id[constants_1.TinylockVersion.V1_1][this.environment];
        this.enableAPICallRateLimit = (_d = settings.enableAPICallRateLimit) !== null && _d !== void 0 ? _d : true;
        this.tinylockAsaId = constants_1.Tinylock_Asa_Id[constants_1.TinylockVersion.V1_1][this.environment];
        this.logEnabled = (_e = settings.log) !== null && _e !== void 0 ? _e : true;
        if (settings.maxCallsPerSecond) {
            this.rateLimiter.maxCallsPerSecond = settings.maxCallsPerSecond;
            this.rateLimiter.maxCallsDelay = 1000 / this.rateLimiter.maxCallsPerSecond;
        }
        if (settings.client) {
            this.client = settings.client;
        }
        else {
            this.client = new algosdk_1.Algodv2((_f = settings.clientToken) !== null && _f !== void 0 ? _f : '', (_g = settings.clientBase) !== null && _g !== void 0 ? _g : constants_1.algoExplorerClientUrl[this.environment], (_h = settings.clientPort) !== null && _h !== void 0 ? _h : constants_1.algoExplorerPort);
        }
        if (settings.indexer) {
            this.indexer = settings.indexer;
        }
        else {
            this.indexer = new algosdk_1.Indexer((_j = settings.indexerToken) !== null && _j !== void 0 ? _j : '', (_k = settings.indexerBase) !== null && _k !== void 0 ? _k : constants_1.algoExplorerIndexerUrl[this.environment], (_l = settings.indexerPort) !== null && _l !== void 0 ? _l : constants_1.algoExplorerPort);
        }
        this.tinymanSignatureGenerator = new tinyman_signature_1.Tinyman(this.tinymanAppId);
        this.tinylockSignatureGenerator = new tinylock_signature_1.Tinylock(this);
    }
    log(text, ...misc) {
        if (this.logEnabled) {
            console.log(text, ...misc);
        }
    }
    parseNote(note, asa) {
        const noteBuffer = buffer_1.Buffer.from(note, 'base64');
        const noteUTF8 = noteBuffer.toString('utf-8');
        const result = {
            isNumber: false,
            isAddress: false,
            result: null
        };
        if (noteUTF8.length == 58) {
            result.isAddress = true;
            result.result = noteUTF8;
            return result;
        }
        let noteNumber = parseInt(noteUTF8, 10);
        if (Number.isNaN(noteNumber) || (asa && noteNumber != asa)) {
            noteNumber = parseInt(noteBuffer.toString('hex'), 16);
            if (Number.isNaN(noteNumber) || (asa && noteNumber != asa)) {
                return result;
            }
        }
        result.isNumber = true;
        result.result = noteNumber;
        return result;
    }
}
exports.Tinylocker = Tinylocker;
