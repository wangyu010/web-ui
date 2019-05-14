import Vue from 'vue';
import Meta from 'vue-meta';

import 'bootstrap/dist/css/bootstrap-reboot.css';
import 'animate.css';

import VueChatScroll from '@/vue-chat-scroll';
import App from './App.vue';

import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueChatScroll);
Vue.use(Meta);

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
