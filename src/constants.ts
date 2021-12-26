export enum Environment {
    MainNet = "MainNet",
    TestNet = "TestNet"
}

export const Tinyman_App_Id = {
    TestNet: 21580889,
    MainNet: 350338509
}

export const Tinylock_App_Id = {
    TestNet: 47355461,
    MainNet: 445602322
}

export const Tinylock_Asa_Id = {
    TestNet: 47355102,
    MainNet: 410703201
}

export const algoExplorerPort = 443;

export const algoExplorerClientUrl = {
    TestNet: "https://testnet.algoexplorerapi.io/",
    MainNet: "https://algoexplorerapi.io/"
}

export const algoExplorerIndexerUrl = {
    [Environment.TestNet]: algoExplorerClientUrl[Environment.TestNet] + "idx2",
    [Environment.MainNet]: algoExplorerClientUrl[Environment.MainNet] + "idx2"
};

export const migrationData = {
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
}