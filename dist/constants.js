"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationData = exports.algoExplorerIndexerUrl = exports.algoExplorerClientUrl = exports.algoExplorerPort = exports.Tinylock_Asa_Id = exports.Tinylock_App_Id = exports.Tinyman_App_Id = exports.TinylockVersion = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["MainNet"] = "MainNet";
    Environment["TestNet"] = "TestNet";
})(Environment = exports.Environment || (exports.Environment = {}));
var TinylockVersion;
(function (TinylockVersion) {
    TinylockVersion[TinylockVersion["V1"] = 0] = "V1";
    TinylockVersion[TinylockVersion["V1_1"] = 1] = "V1_1";
})(TinylockVersion = exports.TinylockVersion || (exports.TinylockVersion = {}));
exports.Tinyman_App_Id = {
    [TinylockVersion.V1]: {
        TestNet: 21580889,
        MainNet: 350338509
    },
    [TinylockVersion.V1_1]: {
        TestNet: 62368684,
        MainNet: 552635992
    }
};
exports.Tinylock_App_Id = {
    [TinylockVersion.V1]: {
        TestNet: 47355461,
        MainNet: 445602322
    },
    [TinylockVersion.V1_1]: {
        TestNet: 62630861,
        MainNet: 551903720
    }
};
exports.Tinylock_Asa_Id = {
    [TinylockVersion.V1]: {
        TestNet: 47355102,
        MainNet: 410703201
    },
    [TinylockVersion.V1_1]: {
        TestNet: 62630104,
        MainNet: 551903529
    }
};
exports.algoExplorerPort = 443;
exports.algoExplorerClientUrl = {
    TestNet: "https://testnet.algoexplorerapi.io/",
    MainNet: "https://algoexplorerapi.io/"
};
exports.algoExplorerIndexerUrl = {
    [Environment.TestNet]: exports.algoExplorerClientUrl[Environment.TestNet] + "idx2",
    [Environment.MainNet]: exports.algoExplorerClientUrl[Environment.MainNet] + "idx2"
};
exports.migrationData = {
    [Environment.MainNet]: {
        sig_tmpl_v2_round: 18251708,
        sig_tmpl_v2_migration_account: "Z7DECPOTVR7WEAB47CFYEHTKAROVHX7QBYJCBDRVA5CC4JBKSFXBKQTERE",
        sig_tmpl_v2_migration_start: 18218596
    },
    [Environment.TestNet]: {
        sig_tmpl_v2_round: 18742362,
        sig_tmpl_v2_migration_account: "KS5USHCHOWT35KFCYXK3MF7M4WCEBUWCW6FHW7UJZ5HXHNHYORBVXN5CVA",
        sig_tmpl_v2_migration_start: 18701971
    }
};
