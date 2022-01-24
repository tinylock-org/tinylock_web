export declare enum Environment {
    MainNet = "MainNet",
    TestNet = "TestNet"
}
export declare enum TinylockVersion {
    V1 = 0,
    V1_1 = 1
}
export declare const Tinyman_App_Id: {
    0: {
        TestNet: number;
        MainNet: number;
    };
    1: {
        TestNet: number;
        MainNet: number;
    };
};
export declare const Tinylock_App_Id: {
    0: {
        TestNet: number;
        MainNet: number;
    };
    1: {
        TestNet: number;
        MainNet: number;
    };
};
export declare const Tinylock_Asa_Id: {
    0: {
        TestNet: number;
        MainNet: number;
    };
    1: {
        TestNet: number;
        MainNet: number;
    };
};
export declare const algoExplorerPort = 443;
export declare const algoExplorerClientUrl: {
    TestNet: string;
    MainNet: string;
};
export declare const algoExplorerIndexerUrl: {
    TestNet: string;
    MainNet: string;
};
export declare const migrationData: {
    MainNet: {
        sig_tmpl_v2_round: number;
        sig_tmpl_v2_migration_account: string;
        sig_tmpl_v2_migration_start: number;
    };
    TestNet: {
        sig_tmpl_v2_round: number;
        sig_tmpl_v2_migration_account: string;
        sig_tmpl_v2_migration_start: number;
    };
};
