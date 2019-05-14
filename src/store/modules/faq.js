import axios from 'axios';
import config from '@/config';

const defaultState = {
  pending: false,
  questions: [],
  words: [],
};

const actions = {
  fetchData({ commit }, productId) {
    commit('fetchPending');

    axios
      .get(`/api/stats/${productId}`)
      .then(({ data }) => {
        commit('fetchComplete', data);
        if (config.features.faqQuickInput && data.hot_faq && data.hot_faq.length) {
          commit(
            'chat/addMessage',
            { questions: data.hot_faq, type: 'faq', responseId: 'fake' },
            { root: true },
          );
        }
      })
      .catch((error) => {
        console.error('failed to fetch faq data:', error);
        commit('fetchComplete', {});
      });
  },
};

/* eslint-disable no-param-reassign */
const mutations = {
  fetchPending(state) {
    state.pending = true;
  },

  fetchComplete(state, data) {
    const { hotwords: words } = data;

    if (words) {
      state.words = words.map(({ word }) => word);
    }

    state.pending = false;
  },
};
/* eslint-enable */

export default {
  namespaced: true,
  state: defaultState,
  actions,
  mutations,
};
