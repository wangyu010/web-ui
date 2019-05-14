<template lang="pug">
  .chat-box.animated.fadeIn
    .chat-box-header
      .chat-header-title
        img.header-logo(src='@/assets/logo.png')
        span.header-title(v-text="title")
      .chat-box-toggle
    .chat-box-body
      .chat-logs-container
        .chat-logs(v-chat-scroll="{always: true, smooth: true}")
          .chat-msg.animated.fadeIn(
            v-for="message in messages",
            :class="message.responseId ? 'user' : 'self'"
          )
            .msg-avatar(:class='{invisible: message.type === "faq"}')
              img(src="../assets/ein-bot.png", v-if="message.responseId && !product.avatar")
              img(:src="product.avatar", v-if="message.responseId && product.avatar")
              img(src="../assets/user-avatar.png", v-if="!message.responseId")
              span.msg-sender(v-if="message.responseId") {{ title }}
              span.msg-sender(v-if="!message.responseId") 用户{{ chat.name.slice(0, 2) }}
            chat-message(
              :message="message"
              :clickLink="send"
              @image-fullscreen="onImageFullscreen")

        .extra-actions(v-if="showFeedback || showQuickInput")
          quick-input.quick-input(
            v-if="showQuickInput"
            :items="quickInputItems"
            :onInput="handleQuickInput"
          )

          feedback-widget.feedback-widget(
            v-if="showFeedback"

            :onUpVote="handleUpVote"
            :onDownVote="handleDownVote"
            :pending="feedbackPending"
            :sent="feedbackSent"
          )

        .msg-prompt-container(v-if='topics && topics.length')
          ul.msg-prompt-list
            li.msg-prompt(
              v-for='(topic, index) in topics'
              :data-topic-id='topic.id'
              :data-index='index'
              :data-topic-title='topic.title'
              v-bind:class="{ active: activeTopicId === topic.id }"
              @mouseenter="onMouseEnter"
              @click="onTopicClick") {{ topic.title }}

        form.chat-input(:class="{ 'disabled': !inputActive }")
          textarea(
            type='text',
            placeholder='请输入消息...',
            ref="input"
            v-model="input",
            @keydown.enter.prevent="onSubmit"
            @keydown.up.prevent="onKeyUp"
            @keydown.down.prevent="onKeyDown")
          button.chat-submit(
            type="submit",
            :class="{ 'disabled': submitDisabled }"
            @click.prevent="onClick",
            :disabled="submitDisabled"
            ) 发送
      .chat-product
        product(:product="product")
    .full-screen-modal(v-if="fullscreenImage" @click="fullscreenImage=null")
      .full-screen-close.fa.fa-fw.fa-close
      .full-screen-image-container
        img.full-screen-image(:src='fullscreenImage')
</template>

<script>
import debounce from 'lodash.debounce';
import { mapActions, mapState } from 'vuex';
import config from '@/config';
import ChatMessage from '@/components/ChatMessage';
import FeedbackWidget from '@/components/FeedbackWidget';
import Product from '@/components/Product';
import QuickInput from '@/components/QuickInput';

export default {
  data() {
    return {
      input: '',
      fullscreenImage: null,
      headerImg: '',
      activeIndex: null,
      activeTopicId: null,
    };
  },

  computed: {
    ...mapState('chat', [
      'messages',
      'product',
      'title',
      'messagePending',
      'inputActive',
      'chat',
      'feedbackPending',
      'feedbackSent',
      'topics',
    ]),

    ...mapState('faq', {
      hotQuestions: 'questions',
      hotWords: 'words',
    }),

    features() {
      return config.features;
    },

    showFeedback() {
      const { features, lastResponse } = this;
      return features.feedback && lastResponse;
    },

    showQuickInput() {
      const { features, quickInputItems } = this;
      return features.faqQuickInput && quickInputItems.length > 0;
    },

    lastResponse() {
      for (let idx = this.messages.length - 1; idx >= 0; idx -= 1) {
        const msg = this.messages[idx];

        if (msg.responseId && msg.relatedMessage) {
          return msg;
        }
      }

      return null;
    },

    quickInputItems() {
      return this.hotWords;
    },

    productId() {
      return this.$route.params.id;
    },

    submitDisabled() {
      if (!this.input) {
        return true;
      }
      if (this.messagePending) {
        // 改为 WebSocket 后去掉该项
        return true;
      }
      return false;
    },
  },

  created() {
    // limit expensive operation
    function watchInput(val) {
      if (val) {
        this.getRelatedTopics({ productId: this.productId, msg: val });
        this.activeIndex = null;
        this.activeTopicId = null;
      } else {
        this.resetTopics();
      }
    }
    this.debouncedWatchInput = debounce(watchInput, 500);
    const { productId } = this;
    this.getMetaData(productId);
    this.fetchFAQ(productId);
  },

  methods: {
    ...mapActions('chat', ['sendMessage', 'getMetaData', 'judge', 'getRelatedTopics']),

    ...mapActions('faq', {
      fetchFAQ: 'fetchData',
    }),

    send(message) {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        return;
      }
      this.sendMessage({ productId: this.productId, message: trimmedMessage });
      this.input = '';
    },

    sendJudgement(judgement) {
      const { lastResponse } = this;

      this.judge({
        productId: this.productId,
        chatId: this.chat.id,
        chatName: this.chat.name,
        relatedMessage: lastResponse.relatedMessage,
        relatedResponse: lastResponse.responseId,
        judgement,
      });
    },

    handleQuickInput(text) {
      this.send(text);
    },

    handleUpVote() {
      this.sendJudgement('survey.satisfaction.high');
    },

    handleDownVote() {
      this.sendJudgement('survey.satisfaction.low');
    },
    onImageFullscreen(img) {
      this.fullscreenImage = img;
    },
    onKeyUp() {
      if (this.activeIndex === null || this.activeIndex === 0) {
        this.activeIndex = this.topics.length - 1;
      } else {
        this.activeIndex -= 1;
      }
      this.activeTopicId = this.topics[this.activeIndex].id;
    },
    onKeyDown() {
      if (this.activeIndex === null || this.activeIndex === this.topics.length - 1) {
        this.activeIndex = 0;
      } else {
        this.activeIndex += 1;
      }
      this.activeTopicId = this.topics[this.activeIndex].id;
    },
    onMouseEnter(evt) {
      const { topicId, index } = evt.target.dataset;
      this.activeTopicId = parseInt(topicId, 10);
      this.activeIndex = parseInt(index, 10);
    },
    onTopicClick(evt) {
      const { topicTitle } = evt.target.dataset;
      console.log(evt, topicTitle);
      this.input = topicTitle;
    },
    onSubmit() {
      if (this.activeTopicId) {
        this.input = this.topics[this.activeIndex].title;
      } else {
        this.send(this.input);
      }
      this.resetTopics();
    },
    onClick() {
      this.send(this.input);
    },
    resetTopics() {
      this.activeIndex = null;
      this.activeTopicId = null;
      this.$store.commit('chat/resetTopics');
    },
  },

  watch: {
    inputActive(val) {
      if (val === false) {
        this.input = '';
      }
    },
    input(val) {
      this.debouncedWatchInput(val);
    },
  },

  components: {
    ChatMessage,
    FeedbackWidget,
    Product,
    QuickInput,
  },

  metaInfo() {
    const productName = this.product ? this.product.name : undefined;
    const title = productName ? `${productName} - web robot` : 'web robot';
    return {
      title,
    };
  },
};
</script>

<style lang="stylus" scoped>
@import '../palette.styl'

$theme-main-color = #5c9fd3
$header-height = 45px
$chat-input-height = 96px
$submit-button-width = 80px
$chatter-width = 1024px

.full-screen-modal
  position fixed
  left 0
  right 0
  top 0
  bottom 0
  overflow-y auto
  display flex
  justify-content center

  .full-screen-close
    position absolute
    cursor pointer
    right 0
    top 0
    height 2.5rem
    width 2.5rem
    background-image url('../assets/close.svg')
    background-repeat no-repeat
    background-size contain

  .full-screen-image
    display block
    margin 0 auto
    padding 5rem 0 3rem
    width auto
    height auto
    max-width calc(90%)

.chat-box
  width $chatter-width
  height 720px
  max-width 100%
  max-height 100%
  box-shadow 0px 5px 35px 9px #ccc
  display flex
  flex-direction column

.chat-box-toggle
  flex 1
  text-align right

.chat-box-name
  flex 1
  text-align left

  img
    max-height 100%
    border-radius 50%

.chat-header-title
  text-align center

  .header-logo
    margin 0 10px
    width auto
    height 1em

  .header-title
    vertical-align middle

.chat-box-header
  display flex
  flex-direction row
  flex-wrap wrap
  justify-content flex-start
  align-items center
  padding 0 15px
  background $primary-color
  height $header-height
  color white
  text-align center
  font-size 20px

.chat-box-body
  display flex
  flex 1
  flex-direction row

.chat-product
  background #f7f7f7
  width 300px

  & > div
    height 100%

.chat-input
  display flex
  align-items center
  background white
  padding-right 8px
  border-top 1px solid #ddd
  height $chat-input-height
  position relative

  &.disabled
    textarea
      cursor not-allowed

  textarea
    flex 1
    width 100%
    height 100%
    padding 10px 15px 10px 15px
    border none
    outline none
    color #888
    resize none

    &::placeholder
      color #ccc

.chat-submit
  display flex
  align-items center
  justify-content center
  background transparent
  box-shadow none
  border none
  border-radius 18px
  background $primary-color
  width $submit-button-width
  height 36px
  color #f7f7f7
  cursor pointer

  &.disabled
    cursor not-allowed
    background-color $secondary-color

  .send-icon
    width 24px
    height 24px

.chat-logs-container
  display flex
  flex 1
  flex-direction column
  height 660px

.chat-logs
  flex 1
  width 100%
  padding 30px 0 0
  overflow-y auto
  position relative

  &::-webkit-scrollbar-track
    background-color $scrollbar-color

  &::-webkit-scrollbar
    width 12px
    background-color $scrollbar-color

  &::-webkit-scrollbar-thumb
    background-color $scrollbar-background-color

.msg-prompt-container
  height 0
  position relative

  .msg-prompt-list
    position absolute
    bottom 0
    width 80%
    margin 0 0 1px 10px
    padding 0
    border 1px solid #ddd

    .msg-prompt
      margin 0
      padding 6px 1rem
      list-style-type none
      color #999
      background white

      &.active
        color white
        background $message-prompt-background-color

.chat-msg
  display flex
  flex-direction row
  margin 0 30px 2.5rem

  &.user
    justify-content flex-start

  &.self
    flex-direction row-reverse

  .msg-avatar
    display flex
    flex-direction column
    align-items center
    width 5rem
    height 64px
    overflow initial
    position relative

    &.invisible
      visibility hidden

    img
      display block
      margin-bottom 4px
      fill blue
      width 64px
      height 64px
      border-radius 50%

    .msg-sender
      position absolute
      bottom -24px
      overflow hidden
      white-space nowrap
      color #999

.close-icon
  cursor pointer

.extra-actions
  display flex
  align-items center
  padding 1em 30px

.quick-input
  margin-right 1em

.quick-input:last-child
  margin-right 0

.feedback-widget
  margin-left auto
  min-width 270px

@media (max-height: 720px)
  .chat-box
    max-height 100%
    height 100%

  .chat-logs-container
    height "calc(100vh - %s)" % $header-height

@media (max-width: 768px)
  .chat-box
    height 100%
    max-width 100%
    width 100%

    &-header
      border-radius 0

    .chat-product
      display none

    .chat-input
      input::placeholder
        opacity 0

  .chat-logs-container
    height "calc(100vh - %s)" % $header-height

  .extra-actions
    flex-wrap wrap

  .quick-input
    margin-right 0

  .feedback-widget
    margin-left 0
</style>
