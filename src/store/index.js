import Vue from 'vue';
import Vuex from 'vuex';

import chat from './modules/chat';
import faq from './modules/faq';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    chat,
    faq,
  },

  strict: process.env.NODE_ENV !== 'production',
});
