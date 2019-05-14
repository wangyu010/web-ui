<template lang="pug">
  .quick-input
    span 您可能想问：
    a.item(
      v-for="item in items"
      href="#"
      :data-item="item"
      @click.prevent="onClick"
    ) {{ item }}
</template>

<script>
const QuickInput = {
  props: {
    items: Array,
    onInput: Function,
  },

  methods: {
    onClick(evt) {
      const { item } = evt.currentTarget.dataset;
      this.onInput(item);
    },
  },
};

export default QuickInput;
</script>

<style lang="stylus" scoped>
@import '../palette.styl'

.item
  margin-right 0.5em
  color $link-color
</style>
