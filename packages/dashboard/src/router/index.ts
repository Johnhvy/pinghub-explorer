import { useBlockchain } from "@/stores";
import { setupLayouts } from "virtual:generated-layouts";
import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...setupLayouts(routes)],
});

//update current blockchain
router.beforeEach((to) => {
    const { chain } = to.params
    if(chain){
      const blockchain = useBlockchain()
      blockchain.setCurrent(chain.toString())
    } 
})

// Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards

export default router;