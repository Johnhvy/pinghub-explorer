
import { defineStore } from "pinia";
import { get } from '../libs/http'
import type { Chain, Asset } from '@ping-pub/chain-registry-client/dist/types'
import { useBlockchain } from "./useBlockchain";

export enum EndpointType {
  rpc,
  rest,
  grpc,
  // webgrpc
}

export interface Endpoint {
  type?: EndpointType,
  address: string,
  provider: string
}

// Chain config structure of cosmos.directory
export interface DirectoryChain {
  assets: Asset[],
  bech32_prefix: string,
  best_apis: {
    rest: Endpoint[]
    rpc: Endpoint[]
  },
  chain_id: string,
  chain_name: string,
  pretty_name: string,
  coingecko_id: string,
  cosmwasm_enabled: boolean,
  decimals: number,
  denom: string,
  display: string,
  explorers: {
    name?: string | undefined;
    kind?: string | undefined;
    url?: string | undefined;
    tx_page?: string | undefined;
    account_page?: string | undefined;
  }[] | undefined,
  height: number,
  image: string,
  name: string,
  network_type: string,
  symbol: string,
  versions?: {
    application_version: string,
    cosmos_sdk_version: string,
    tendermint_version: string,
  }
}

export interface ChainConfig {
  chainName: string,
  prettyName: string,
  bech32Prefix: string,
  chainId: string,
  assets: Asset[],
  themeColor?: string,
  endpoints: {
    rest?: Endpoint[]
    rpc?: Endpoint[]
    grpc?: Endpoint[] 
  },
  logo: string,
  versions: {
    application?: string,
    cosmosSdk?: string,
    tendermint?: string,
  },
}

export interface LocalConfig {
  addr_prefix: string,
  alias: string,
  api: string[] | Endpoint[],
  assets: {base: string, coingecko_id: string, exponent: string, logo: string, symbol: string}[]
  chain_name: string,
  coin_type: string
  logo: string,
  min_tx_fee: string,
  rpc: string[] | Endpoint[],
  sdk_version: string,
}

function apiConverter(api: any[]){
  if(!api) return []
  const array = typeof api === 'string'? [api] : api
  return array.map(x => {
    if(typeof x === 'string') {
      const parts = String(x).split('.')
      return {
        address: x,
        provider: parts.length >=2 ? parts[parts.length-2] : x
      }
    }else{
      return x as Endpoint
    }
  })
}

export function fromLocal(lc: LocalConfig ): ChainConfig {
  const conf = {} as ChainConfig
  conf.assets = lc.assets.map(x => ({
    name: x.base, 
    base: x.base, 
    display: x.symbol, 
    symbol: x.symbol, 
    logo_URIs: { svg: x.logo }, 
    coingecko_id: x.coingecko_id, 
    denom_units: [{denom: x.base, exponent: 0}, {denom: x.symbol.toLowerCase(), exponent: Number(x.exponent)}]
  }))
  conf.bech32Prefix = lc.addr_prefix
  conf.chainName = lc.chain_name
  conf.prettyName = lc.chain_name
  conf.endpoints = {
    rest: apiConverter(lc.api),
    rpc: apiConverter(lc.rpc),
  }
  conf.logo = lc.logo
  return conf
}


export function fromDirectory(source: DirectoryChain): ChainConfig {
  const conf = {} as ChainConfig
  conf.assets = source.assets,
  conf.bech32Prefix = source.bech32_prefix,
  conf.chainId = source.chain_id,
  conf.chainName = source.chain_name,
  conf.prettyName = source.pretty_name,
  conf.versions = {
    application: source.versions?.application_version || '',
    cosmosSdk: source.versions?.cosmos_sdk_version || '',
    tendermint: source.versions?.tendermint_version || '',
  },
  conf.logo = pathConvert(source.image)
  conf.endpoints = source.best_apis
  return conf
}

function pathConvert(path: string | undefined) {
  if(path) {
    path = path.replace('https://raw.githubusercontent.com/cosmos/chain-registry/master', 'https://registry.ping.pub')
  }
  return path || ''
}

export function getLogo(conf: {
  svg?: string,
  png?: string,
  jpeg?: string,
} | undefined) {
  if(conf) {
    return pathConvert(conf.svg || conf.png || conf.jpeg)
  }
  return undefined
}

function createChainFromDirectory(source: DirectoryChain) : Chain {
  const conf: Chain = {} as Chain; 
  conf.apis = source.best_apis
  conf.bech32_prefix = source.bech32_prefix
  conf.chain_id = source.chain_id
  conf.chain_name = source.chain_name
  conf.explorers = source.explorers
  conf.pretty_name = source.pretty_name
  if(source.versions) {
    conf.codebase = {
      recommended_version: source.versions.application_version,
      cosmos_sdk_version: source.versions.cosmos_sdk_version,
      tendermint_version: source.versions.tendermint_version,
    }
  }
  if(source.image) {
    conf.logo_URIs = {
      svg: source.image
    }
  }
  return conf
}

export enum LoadingStatus {
    Empty,
    Loading,
    Loaded,
}
export enum NetworkType {
  Mainnet,
  Testnet,
}
export enum ConfigSource {
  MainnetCosmosDirectory = "https://chains.cosmos.directory",
  TestnetCosmosDirectory = "https://chains.testcosmos.directory",
  Local = 'local',
}

export const useDashboard = defineStore('dashboard', {
  state: () => {
    const fav = JSON.parse(localStorage.getItem('favorite') || '["cosmoshub", "osmosis"]')
      return {
        status: LoadingStatus.Empty,
        source: ConfigSource.MainnetCosmosDirectory,
        networkType: NetworkType.Mainnet, 
        favorite: fav as string[],
        chains: {} as Record<string, ChainConfig>,
      }
  },
  getters: {
    length() : number {
      return Object.keys(this.chains).length
    }
  },
  actions: {
    initial() {
      this.loadingFromLocal()
      // this.loadingFromRegistry()
    },
    async loadingFromRegistry() {
      if(this.status === LoadingStatus.Empty) {
          this.status = LoadingStatus.Loading
          get(this.source).then((res)=> {
              res.chains.forEach(( x: DirectoryChain ) => {
                  this.chains[x.chain_name] = fromDirectory(x)
              });
              this.status = LoadingStatus.Loaded
          })
      }
    },
    async loadingFromLocal() {
      const source: Record<string, LocalConfig> = this.networkType === NetworkType.Mainnet 
          ? import.meta.glob('../../chains/mainnet/*.json', {eager: true})
          : import.meta.glob('../../chains/testnet/*.json', {eager: true})
      Object.values<LocalConfig>(source).forEach((x: LocalConfig) => {        
        this.chains[x.chain_name] = fromLocal(x)
      })
      this.setupDefault()
      this.status = LoadingStatus.Loaded
    },
    setupDefault() {
      if(this.length > 0) {
        const blockchain = useBlockchain()
        for(let i=0; i < this.favorite.length; i++) {
          if(!blockchain.chainName && this.chains[this.favorite[i]]) {
            blockchain.setCurrent(this.favorite[i])
          }
        }
        if(!blockchain.chainName) {
          const [first] = Object.keys(this.chains)
          blockchain.setCurrent(first)
        }
      }
    },
    setConfigSource(newSource: ConfigSource) {
      this.source = newSource
      this.initial()
    }
  }
})
