"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tinylocker = void 0;
const algosdk_1 = require("algosdk");
const buffer_1 = require("buffer");
const rxjs_1 = require("rxjs");
const tinylock_signature_1 = require("./tinylock_signature");
const tinyman_signature_1 = require("./tinyman_signature");
var Environment;
(function (Environment) {
    Environment["MainNet"] = "MainNet";
    Environment["TestNet"] = "TestNet";
})(Environment || (Environment = {}));
const algoExplorerPort = 443;
const algoExplorerClientUrl = {
    TestNet: "https://testnet.algoexplorerapi.io/",
    MainNet: "https://algoexplorerapi.io/"
};
const algoExplorerIndexerUrl = {
    TestNet: algoExplorerClientUrl[Environment.TestNet] + "idx2",
    MainNet: algoExplorerClientUrl[Environment.MainNet] + "idx2"
};
const Tinyman_App_Id = {
    TestNet: 21580889,
    MainNet: 350338509
};
const Tinylock_App_Id = {
    TestNet: 47355461,
    MainNet: 0
};
const Tinylock_Asa_Id = {
    TestNet: 47355102,
    MainNet: 410703201
};
class Tinylocker {
    constructor(settings) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
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
        this.findTinylockAppTransactions = () => {
            return this.getIndexer().pipe((0, rxjs_1.switchMap)((indexer) => indexer.searchForTransactions()
                .txType("axfer")
                .address((0, algosdk_1.getApplicationAddress)(this.tinylockAppId))
                .addressRole("receiver")
                .assetID(this.tinylockAsaId)
                .do()), (0, rxjs_1.switchMap)((result) => (0, rxjs_1.of)(result["transactions"])));
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
        this.searchToken = (asa, issuedLiquidityTokens) => {
            return this.findTinylockAppTransactions().pipe((0, rxjs_1.switchMap)((transactions) => {
                if (transactions.length == 0) {
                    return (0, rxjs_1.from)([]);
                }
                const asaSeen = {};
                return (0, rxjs_1.from)(transactions).pipe((0, rxjs_1.mergeMap)((transaction) => {
                    const result = {};
                    const noteBuffer = buffer_1.Buffer.from(transaction.note, 'base64');
                    const noteNumber = Number(noteBuffer.toString('utf-8'));
                    if (noteNumber !== asa) {
                        // console.log("Transaction not what we are looking for", noteNumber);
                        return (0, rxjs_1.of)(result);
                    }
                    result.account = transaction.sender;
                    if (asaSeen[asa]) {
                        if (asaSeen[asa].indexOf(result.account) >= 0) {
                            // console.log("Using already fetched information for asa: ", asa);
                            return (0, rxjs_1.of)(result);
                        }
                        asaSeen[asa].push(result.account);
                    }
                    else {
                        asaSeen[asa] = [result.account];
                    }
                    return this.tinylockSignatureGenerator.sendToCompile(noteNumber, this.tinylockAppId, this.tinylockAsaId, result.account)
                        .pipe((0, rxjs_1.mergeMap)((signature) => this.getAccountInfoByAddress(signature.address())), (0, rxjs_1.mergeMap)((signatureAccountInfo) => {
                        console.log("Signature Acc: ", signatureAccountInfo);
                        const localStateArray = signatureAccountInfo["account"]["apps-local-state"];
                        const assets = signatureAccountInfo["account"]["assets"];
                        const amount = BigInt(assets[0]["amount"]);
                        if (amount <= 0) {
                            return (0, rxjs_1.of)(result);
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
                    }));
                }), (0, rxjs_1.filter)(value => Object.getOwnPropertyNames(value).length !== 0), (0, rxjs_1.toArray)());
            }));
        };
        this.searchPoolAsa = (asa1, asa2) => {
            if (asa1 < asa2) {
                let tmp = asa1;
                asa1 = asa2;
                asa2 = asa1;
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
        this.environment = (_a = settings.environment) !== null && _a !== void 0 ? _a : Environment.MainNet;
        this.tinymanAppId = (_b = settings.tinymanAppId) !== null && _b !== void 0 ? _b : Tinyman_App_Id[this.environment];
        this.tinylockAppId = (_c = settings.tinylockAppId) !== null && _c !== void 0 ? _c : Tinylock_App_Id[this.environment];
        this.enableAPICallRateLimit = (_d = settings.enableAPICallRateLimit) !== null && _d !== void 0 ? _d : true;
        this.tinymanSignatureGenerator = new tinyman_signature_1.Tinyman(this.tinymanAppId);
        this.tinylockAsaId = Tinylock_Asa_Id[this.environment];
        this.tinylockSignatureGenerator = new tinylock_signature_1.Tinylock(this);
        if (settings.maxCallsPerSecond) {
            this.rateLimiter.maxCallsPerSecond = settings.maxCallsPerSecond;
            this.rateLimiter.maxCallsDelay = 1000 / this.rateLimiter.maxCallsPerSecond;
        }
        if (settings.client) {
            this.client = settings.client;
        }
        else {
            this.client = new algosdk_1.Algodv2((_e = settings.clientToken) !== null && _e !== void 0 ? _e : '', (_f = settings.clientBase) !== null && _f !== void 0 ? _f : algoExplorerClientUrl[this.environment], (_g = settings.clientPort) !== null && _g !== void 0 ? _g : algoExplorerPort);
        }
        if (settings.indexer) {
            this.indexer = settings.indexer;
        }
        else {
            this.indexer = new algosdk_1.Indexer((_h = settings.indexerToken) !== null && _h !== void 0 ? _h : '', (_j = settings.indexerBase) !== null && _j !== void 0 ? _j : algoExplorerIndexerUrl[this.environment], (_k = settings.indexerPort) !== null && _k !== void 0 ? _k : algoExplorerPort);
        }
    }
}
exports.Tinylocker = Tinylocker;