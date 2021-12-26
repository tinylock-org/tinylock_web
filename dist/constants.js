"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationData = exports.algoExplorerIndexerUrl = exports.algoExplorerClientUrl = exports.algoExplorerPort = exports.Tinylock_Asa_Id = exports.Tinylock_App_Id = exports.Tinyman_App_Id = exports.Environment = void 0;
var Environment;
(function (Environment) {
    Environment["MainNet"] = "MainNet";
    Environment["TestNet"] = "TestNet";
})(Environment = exports.Environment || (exports.Environment = {}));
exports.Tinyman_App_Id = {
    TestNet: 21580889,
    MainNet: 350338509
};
exports.Tinylock_App_Id = {
    TestNet: 47355461,
    MainNet: 445602322
};
exports.Tinylock_Asa_Id = {
    TestNet: 47355102,
    MainNet: 410703201
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
