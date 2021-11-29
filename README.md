# Tinylock
Show assets locked on Tinylock

# How does it work?
Call and process Algorand Blockchain data to get the latest Info about locked assets on Tinylock.
Tinylock uses the AlgoExplorer API with default configuration.
There is a call rate limiter included to not get past 10 calls per second.

# Install
```
npm i tinylock_web
```

# Problems

If you build an angular application you will encounter a "crypto-browserify" polyfill problem by webpack.
In order to fix this, you need to add the paths to those packages into your tsconfig.json
```
"paths": {
      "crypto": ["./node_modules/crypto-browserify"],
      "stream": ["./node_modules/stream-browserify"],
      "assert": ["./node_modules/assert"],
      "http": ["./node_modules/stream-http"],
      "https": ["./node_modules/https-browserify"],
      "os": ["./node_modules/os-browserify"]
    }
```

Also typescript wants the declaration files of superagent, install it via
```
npm install --save-dev @types/superagent
```


Chances are high that you will also encounter a "Buffer not defined" and "process not defined" error when opening your application in a browser. You will need to add the following lines to your polyfills.ts
```
(window as any).global = window;
global.Buffer = global.Buffer || require('buffer').Buffer;
global.process = require('process');
```

# Quickstart
```typescript
import { Tinylock, SearchResult, PoolData } from 'tinylock-web';

// Note: If environment is not provided tinylock uses MainNet
const tinylock = new Tinylock(
  {
    environment: 'TestNet'
    } // :TinylockerConfig
);

// Find all locks for a token
tinylock.searchToken(47355102)
.subscribe({
  next: (searchResultArray: SearchResult[]) => {
    console.log(searchResultArray);
  }
});

// Find all locks for a pool
tinylock.searchPoolAsa(47355102, 0).pipe(
  switchMap(
    (poolData: PoolData) => tinylock.searchToken(poolData.poolAsaId)
  )
).subscribe({
  next: (searchResultArray: SearchResult[]) => {
    console.log(searchResultArray);
  }
});

```

# Configuration
```typescript
  // Use your own client and indexer
  const yourClient: Algodv2 = ....;
  const yourIndexer: Indexer = ....;
  
  const tinylock = new Tinylock({
    client: yourClient,
    indexer: yourIndexer
  });
  
  // By default there are app id's (MainNet,TestNet) included for Tinyman and Tinylock but you can provide your own
  const yourTinymanAppId = 0;
  const yourTinylockAppId = 0;
  
  const tinylock = new Tinylock({
    tinymanAppId: yourTinymanAppId,
    tinylockAppId: yourTinylockAppId
  });
  
  // You can also specify the algod token, base and port for indexer and client and let tinylock handle the creation
  const yourClientToken = 'aa...aaa';
  const yourClientBase = "https://...../";
  const yourClientPort = 443;
  
  const yourIndexerToken = 'aa...aaa';
  const yourIndexerBase = "https://...../";
  const yourIndexerPort = 443;
  
  const tinylock = new Tinylock({
    clientToken: yourClientToken,
    clientBase: yourClientBase,
    clientPort: yourClientPort,
    indexerToken: yourIndexerToken,
    ...
  });
  
  // Enable/Disable the call rate limiter
  const tinylock = new Tinylock({
    enableAPICallRateLimit: false, // Default is true
    maxCallsPerSecond: 5 // Default is 10
  });
  
```