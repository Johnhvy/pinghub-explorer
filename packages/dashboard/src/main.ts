/* eslint-disable import/order */
import "@/plugins/vuetify/@iconify/icons-bundle";
import App from "@/App.vue";
import layoutsPlugin from "@/plugins/vuetify/layouts";
import vuetify from "@/plugins/vuetify";
import i18n from "@/plugins/i18n";
import { loadFonts } from "@/plugins/vuetify/webfontloader";
import "@/plugins/vuetify/@core/scss/template/index.scss";
import "@/plugins/vuetify/styles/styles.scss";
import { createApp } from "vue";
import { createPinia } from "pinia";
// import router from "@/plugins/vuetify/router";
import router from "./router";
import { useBaseStore } from "./stores/useBaseStore";

loadFonts();

// Create vue app
const app = createApp(App);
// Use plugins
app.use(i18n)
app.use(vuetify);
app.use(createPinia());
app.use(layoutsPlugin);
app.use(router);


// Mount vue app
app.mount("#app");

// fetch latest block every 6s
// const blockStore = useBaseStore()
// setInterval(() => {blockStore.fetchLatest()}, 6000)
