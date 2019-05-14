/**
 * @name VueJS vChatScroll (vue-chat-scroll) MIT License
 * @description Monitors an element and scrolls to the bottom if a new child is added
 * @author Theodore Messinezis <theo@theomessin.com>
 * @file v-chat-scroll  directive definition
 * Copied from https://github.com/theomessin/vue-chat-scroll/ with ESlint format.
 * with couples of custom patches.
 */

const scrollToBottom = (el, smooth) => {
  if (el.scrollTo) {
    // SB 搜狗浏览器不支持 scrollTo
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
  } else {
    el.scrollTop = el.scrollHeight; // eslint-disable-line no-param-reassign
  }
};

const vChatScroll = {
  bind: (el, binding) => {
    let scrolled = false;

    el.addEventListener('scroll', () => {
      scrolled = el.scrollTop + el.clientHeight + 1 < el.scrollHeight;
    });

    new MutationObserver((e) => {
      const config = binding.value || {};
      const pause = config.always === false && scrolled;

      if (pause || e[e.length - 1].addedNodes.length !== 1) {
        return;
      }

      scrollToBottom(el, config.smooth);
    }).observe(el, { childList: true });
  },

  inserted: scrollToBottom,
};

const VueChatScroll = {
  install: (Vue) => {
    Vue.directive('chat-scroll', vChatScroll);
  },
};

export default VueChatScroll;
