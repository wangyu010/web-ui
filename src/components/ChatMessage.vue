<template lang="pug">
  .chat-message(:class="{ 'right': !message.responseId, 'failed': message.status === 'failed', faq: message.type === 'faq' }")
    .chat-message-text(v-text="message.content", v-if="message.type == 'txt'")
    .chat-message-html(v-html="toLinks(message.content)", v-if="message.type == 'html'")
    .chat-message-faq(v-if="message.type === 'faq'")
      h4 热门问题
      ol
        li(v-for="obj in message.questions")
          a(href="#", @click="onClick", v-text="obj.question")
</template>

<script>
import './rte.stylus';
import './rte-colors.stylus';

function toLinks(text) {
  return (text || '').replace(
    /([^\S]|^)(((https?:\/\/)|(www\.))(\S+))/gi,
    (match, space, url) => {
      let hyperlink = url;
      if (!hyperlink.match('^https?://')) {
        hyperlink = `http://${hyperlink}`;
      }
      return `${space}<a href="${hyperlink}" target="_blank">${url}</a>`;
    },
  );
}

export default {
  props: {
    message: Object,
    clickLink: Function,
  },

  mounted() {
    this.bindChoiceLinks();
    this.bindImgZoomIn();
  },

  methods: {
    onClick(evt) {
      evt.preventDefault();
      this.clickLink(evt.currentTarget.text);
    },
    onImgZoomIn(evt) {
      evt.preventDefault();
      this.$emit('image-fullscreen', evt.target.src);
    },
    bindChoiceLinks() {
      const elems = this.$el.querySelectorAll('a[data-type="choice"]');

      // eslint-disable-next-line no-restricted-syntax
      for (const elem of elems) {
        elem.addEventListener('click', this.onClick);
      }
    },
    bindImgZoomIn() {
      const elems = this.$el.querySelectorAll('figure > img');

      elems.forEach((elem) => {
        elem.addEventListener('click', this.onImgZoomIn);
      });
    },

    toLinks,
  },
};
</script>

<style lang="stylus" scoped>
@import '../palette.styl'

.chat-message
  flex-shrink 0
  background white
  padding 1rem
  color #444
  max-width 75%
  position relative
  margin-left 10px
  margin-bottom 10px
  border-radius 5px
  word-break break-word
  background $message-background-color
  position relative

  &:before
    content ''
    width 0
    height 0
    border-left 5px solid transparent
    border-top 5px solid transparent
    border-bottom 5px solid transparent
    border-right 5px solid $message-background-color
    position absolute
    left -10px
    top 1.5rem

  &.faq
    background white
    border 1px solid #ddd
    margin-left 5px

    &:before
      display none

  &.right
    margin-right 10px
    background #eee

    &:before
      content ''
      width 0
      height 0
      border-right 5px solid transparent
      border-top 5px solid transparent
      border-bottom 5px solid transparent
      border-left 5px solid #eee
      position absolute
      right -10px
      left unset
      top 1.5rem

  &.failed :before
    content '发送失败'
    position absolute
    color red
    left -4.5rem

.chat-message-faq
  ul, ol
    padding-left 0
    min-width 10rem

  li
    border-bottom 1px solid #ddd
    list-style-position inside
    line-height 1.6rem
    padding 0.5rem 0

    &:last-child
      border none
      padding-bottom 0

  a
    color $link-color

.chat-message >>> .chat-message-html
  p
    margin 0

  a
    color $link-color
    cursor pointer

    &:hover
      color $link-hover-color
      text-decoration underline

  // a, span
  // display inline-block // commented for list-style issue
  img
    display block
    margin 1em auto
    max-width 100%
    cursor zoom-in

  ol, ul
    margin-bottom 1rem
    padding-left 2.5em
</style>
