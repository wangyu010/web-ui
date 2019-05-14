<template lang="pug">
  .feedback(v-if="!sent")
    span 您对本次会话是否满意：

    button.upvote(
      type="submit"
      :disabled="pending"
      @click.prevent="onUpVote")
      heart.icon.heart

    button.downvote(
      type="submit"
      :disabled="pending"
      @click.prevent="onDownVote")
      dislike.icon.down-vote

  .feedback-done(v-else)
    span 感谢您的反馈！
</template>

<script>
import Heart from './Heart';
import Dislike from './Dislike';

const FeedbackWidget = {
  props: {
    pending: Boolean,
    sent: Boolean,

    onUpVote: Function,
    onDownVote: Function,
  },
  components: { Heart, Dislike },
};

export default FeedbackWidget;
</script>

<style lang="stylus" scoped>
.icon
  display inline-block
  width 1rem
  height 1rem
  fill rgb(130, 175, 205)

.feedback, .feedback-done
  color #999
  text-align right

.upvote
  margin-right 0.5rem

.upvote, .downvote
  text-align center
  cursor pointer
  color rgb(130, 175, 205)
  border none
  background transparent // 覆盖按钮的背景颜色
  -webkit-appearance unset
</style>
