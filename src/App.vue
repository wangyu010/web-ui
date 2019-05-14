<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'web robot',
    htmlAttrs: {
      lang: 'zh_CN',
    },
  },
};
</script>

<style lang="stylus">
html, body
  font-size 14px
  height 100%
  width 100%

ol, ul, dl
  margin-top 0
  margin-bottom 0

#app
  width 100%
  height 100%
  display flex
  align-items center
  justify-content center
</style>
