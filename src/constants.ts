export enum Environment {
    MainNet = "MainNet",
    TestNet = "TestNet"
}

export enum TinylockVersion {
    V1,
    V1_1
}

export const Tinyman_App_Id = {
    [TinylockVersion.V1] : {
        TestNet: 21580889,
        MainNet: 350338509
    },
    [TinylockVersion.V1_1] : {
        TestNet: 62368684,
        MainNet: 552635992
    }
}

export const Tinylock_App_Id = {
    [TinylockVersion.V1]: {
        TestNet: 47355461,
        MainNet: 445602322
    },
    [TinylockVersion.V1_1]: {
        TestNet: 62630861,
        MainNet: 551903720
    }
    
}

export const Tinylock_Asa_Id = {
    [TinylockVersion.V1]: {
        TestNet: 47355102,
        MainNet: 410703201
    },
    [TinylockVersion.V1_1]: {
        TestNet: 62630104,
        MainNet: 551903529
    }
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