import { defineStore } from "pinia";
import { useBlockchain } from "./useBlockchain";

import { get } from "@/libs/http";

export const useStakingStore = defineStore('stakingStore', {
    state: () => {
        return {
            validators: [] as Validator[],
            params: {} as QueryParamsResponse,
            pool: {} as Pool | undefined,
        }
    },
    getters: {
        totalPower(): number {
            const sum = (s:number, e: Validator) => { return s + parseInt(e.delegatorShares) }
            return this.validators ? this.validators.reduce(sum, 0): 0
        },
        blockchain() {
            return useBlockchain()
        }
    },
    actions: {
        async init() {
            this.$reset()
            this.fetchPool()
            this.fetchAcitveValdiators()
            return await this.fetchParams()
        },
        async keybase(identity: string) {
            return get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`)
        },
        async fetchParams() {
            const response = await this.blockchain.rpc.stakingParams()
            if(response.params) this.params = response.params
            return this.params
        },
        async fetchPool() {            
            const response = await this.blockchain.rpc.stakingPool()
            this.pool = response.pool
        },
        async fetchAcitveValdiators() {
            return this.fetchValidators('BOND_STATUS_BONDED')
        },
        async fetchInacitveValdiators() {
            return this.fetchValidators('BOND_STATUS_UNBONDED')
        },
        async fetchValidator(validatorAddr: string) {  
            return this.blockchain.rpc.validator(validatorAddr)
        },
        async fetchValidatorDelegation(validatorAddr: string, delegatorAddr: string) {  
            return (await this.blockchain.rpc.validatorDelegation(validatorAddr, delegatorAddr)).delegationResponse
        },
        async fetchValidators(status: string) { 
            return this.blockchain.rpc.validators(status, undefined).then(res => {
                    const vals =  res.validators.sort((a, b) => (Number(b.delegatorShares) - Number(a.delegatorShares)))
                    if(status==='BOND_STATUS_BONDED') {
                        this.validators = vals
                    }
                    return vals   
                })
        }
    }
})