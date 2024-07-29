import { ref, computed } from "vue";
import { defineStore } from "pinia";
<<<<<<< HEAD
import { getLogo, useDashboard } from "./useDashboard";
import { useTheme } from 'vuetify'

export const useBlockchain = defineStore("blockchain", () => {
  const dbstore = useDashboard()

  const rest = ref('')
  const status = ref({} as Record<string, string>)

  const current = computed(()=>{
    return dbstore.getCurrentChain()
  });
  const logo = computed(() => {
    return getLogo(current.value?.logo_URIs)
  })
  const name = computed(() => {
    return current.value.chain_name
  })
  const primaryColor = computed(() => {
    const colors = ['#fff', '#fea', '#123', '#68f', '#aca', 'bbe', '#666CFF']
    const color = colors[Math.floor(Math.random() * colors.length)]

    const vuetifyTheme = useTheme()
    const currentThemeName = vuetifyTheme.name.value
    vuetifyTheme.themes.value[currentThemeName].colors.primary = color
    return color
  })
  const availableEndpoint = computed(() => {
    const all = current.value?.apis?.rest
    if(all) {
      if(!rest.value || all.findIndex(x => x.address === rest.value) < 0) {        
        const rn = Math.random()
        const endpoint = all[Math.floor(rn * all.length)]
        rest.value = endpoint?.address || ''
      }
=======
import { getLogo, useDashboard, type ChainConfig } from "./useDashboard";
import { useTheme } from 'vuetify'
import { LCDClient } from '@osmonauts/lcd'
import { cosmos } from '@ping-pub/codegen'
import { createBaseClientForChain } from "@/libs/client";

export const useBlockchain = defineStore("blockchain", {
  state: () => {
    return {
      status: {} as Record<string, string>,
      rest: ''
    }
  },
  getters: {
    current() {
      return useDashboard().getCurrentChain()
    },
    logo() {
      return this.current?.logo || ''
    },
    name() {
      return this.current?.chainName || ''
    },
    primaryColor() {
      const color = this.current.themeColor || '#666CFF'
      const vuetifyTheme = useTheme()
      const currentThemeName = vuetifyTheme.name.value
      vuetifyTheme.themes.value[currentThemeName].colors.primary = color
      return color
    },
    availableEndpoint() : string {
      const all = this.current?.endpoints?.rest
      if(all) {
        if(this.rest || all.findIndex(x => x.address === this.rest) < 0) {        
          const rn = Math.random()
          const endpoint = all[Math.floor(rn * all.length)]
          this.rest = endpoint?.address || ''
        }
      }      
      return this.rest
    },
    restClient() {
      return new LCDClient({restEndpoint: this.availableEndpoint()})
    },
  },
  actions: {
    setRestEndpoint(endpoint: string) {
      this.rest = endpoint
    },
    calltest() {
      console.log('call test')
      const base = createBaseClientForChain(this.current.chainName, new LCDClient({restEndpoint: 'https://api.evmos.nodestake.top/'}))
      console.log('base: ', base)
      base.getLatestBlock().then(x => console.log(x))
>>>>>>> origin/main
    }
  }
<<<<<<< HEAD

  return { 
    // states
    availableEndpoint,
    // getters
    name, current, logo, primaryColor,
    // actions
    setRestEndpoint
  };
});
=======
})
>>>>>>> origin/main
