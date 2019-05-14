import axios from 'axios';

const defaultState = {
  title: '客服机器人',
  product: {
    name: undefined,
    avatar: undefined,
    extra: {},
  },
  chat: {
    id: undefined,
    name: undefined,
  },
  messages: [],
  messagePending: false,
  inputActive: true,

  feedbackPending: false,
  feedbackSent: false,

  topics: [],
};

// actions
const chatActions = {
  sendMessage({ commit, state }, { productId, message }) {
    commit('toggleInput', false);
    const now = new Date();
    const msg = {
      content: message,
      type: 'txt',
      createAt: now,
      status: 'pending',
    };
    commit('addMessage', msg);
    const { chat } = state;
    const data = {
      chat,
      content: {
        type: 'txt',
        body: message,
      },
      posted_at: now.toISOString(),
    };

    axios
      .post(`/api/messages/${productId}`, data)
      .then((resp) => {
        const receivedMessage = resp.data;
        commit('addMessage', {
          content: receivedMessage.content.body,
          type: receivedMessage.content.type,
          relatedMessage: receivedMessage.related_message,
          createAt: receivedMessage.create_at,
          responseId: receivedMessage.response_id,
        });
        commit('setMessageState', { message: msg, status: 'success' });
        commit('toggleInput', true);
      })
      .catch(() => {
        commit('setMessageState', { message: msg, status: 'failed' });
        commit('toggleInput', true);
      });
  },
  getMetaData({ commit }, productId) {
    axios.post('/api/chats', { product_id: productId }).then((resp) => {
      const metaData = resp.data;
      commit('setProduct', metaData.bot);
      commit('setChat', metaData.chat);
      commit('addMessage', {
        content: metaData.bot.greeting,
        type: 'html',
        responseId: 'fake',
      });
      commit('toggleInput', true);
    });
  },
  judge({ commit }, {
    productId, chatId, chatName, relatedMessage, relatedResponse, judgement,
  }) {
    const data = {
      chat: {
        id: chatId,
        name: chatName,
      },
      related_message: relatedMessage,
      related_response: relatedResponse,
      content: {
        type: 'txt',
        body: judgement,
      },
      posted_at: new Date().toISOString(),
    };
    commit('judgementStarting');
    axios.post(`/api/training/${productId}`, data).then(() => {
      commit('judgementFinished');
    });
  },
  getRelatedTopics({ commit }, { productId, msg }) {
    commit('fetchTopicsPending');
    axios
      .get(`/suggest/?limit=5&page=1&product_id=${productId}&words_match=and&question=${msg}`)
      .then((resp) => {
        const receivedMessage = resp.data;
        //const len = getJsonLength(receivedMessage['topics']);
        const len = Object.keys(receivedMessage['topics']).length;
        let suggests = [];
        if (len > 0) {
          for (let i = 0; i < len; i += 1) {
            const title  = receivedMessage['topics'][i]['rounds'][0]['questions'][0]['content'];
            const id = receivedMessage['topics'][i]['rounds'][0]['questions'][0]['id'];
            const topic = {title: title, id: id}
            suggests.push(topic);
          }
        }
        commit('fetchTopicsComplete', suggests);
      })
      .catch(() => {
        commit('fetchTopicsError');
      });
  },
};

// mutations
/* eslint-disable no-param-reassign */
const chatMutations = {
  addMessage(state, payload) {
    state.messages.push(payload);
  },
  setMessageState(_, { message, status }) {
    message.status = status;
  },

  toggleInput(state, payload) {
    state.inputActive = payload;
  },

  toggleMessagePending(state, payload) {
    state.messagePending = payload;
  },
  setProduct(state, payload) {
    state.product = { ...payload };
  },
  setChat(state, payload) {
    state.chat = { ...payload };
  },

  judgementStarting(state) {
    state.feedbackPending = true;
  },

  judgementFinished(state) {
    state.feedbackPending = false;
    state.feedbackSent = true;
  },
  fetchTopicsPending() {},
  // eslint-disable-next-line
  fetchTopicsComplete(state, topics) {
    state.topics = topics;
  },
  fetchTopicsError(state) {

  },
  resetTopics(state) {
    state.topics = [];
  },
};
/* eslint-enable */

export default {
  namespaced: true,
  state: defaultState,
  actions: chatActions,
  mutations: chatMutations,
};
