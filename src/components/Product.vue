<template lang="pug">
  .product
    .product__main
      .product__avatar
        img(:src="product.avatar || logoPlaceholder")
      .product__name(v-text="product.name")
      .product__slogan(v-if='product.extra.slogan' v-text="product.extra.slogan")
      .product__contact
        phone.phone.icon
        span 官方客服：
        span.product__phone 201903301749 {{ product.extra.phone }}
    .product__footer(v-if="product.extra")
      ul.product__links
        li.product__link(v-for="link in product.extra.links")
          a(:href="link.href", v-text="link.title", target="_blank")
      .product__qrcode
        img(:src="product.extra.qr")

    .product__footer(v-if="!product.extra")
      ul.product__links
        li.product__link(v-for="link in ein.links")
          a(:href="link.href", v-text="link.title", target="_blank")
      .product__qrcode
        img(:src="ein.qr")

</template>

<script>
import qrcode from '@/assets/qrcode.jpg';
import logoPlaceholder from '@/assets/logo-placeholder.svg';
import Phone from './Phone';

export default {
  props: {
    product: Object,
  },
  data() {
    return {
      ein: {
        links: [
          { title: '爱因官网', href: 'https://www.einplus.cn/' },
        ],
        qr: qrcode,
      },
      logoPlaceholder,
    };
  },
  components: { Phone },
};
</script>

<style lang="stylus" scoped>
@import '../palette.styl'

.icon
  display inline-block
  width 1.25em
  height 1.25em
  fill $primary-color
  vertical-align middle

  &.phone
    padding-right 4px

ul
  margin 0
  padding 0

li
  list-style none
  text-align center

.product
  display flex
  flex-direction column
  border-left 1px solid #ddd

  &__main
    flex 1
    display flex
    flex-direction column
    align-items center
    padding-left 1rem
    padding-right 1rem

  &__avatar
    margin 1rem
    margin-top 50px
    width 136px
    height 136px

    > img
      height 100%
      width 100%

  &__name
    text-align center
    font-size 20px

  &__slogan
    flex 1
    line-height 2rem

  &__contact
    margin-top 20px
    font-size 16px

    span
      vertical-align middle

  &__phone
    color #5996c6

  &__footer
    overflow hidden

  &__qrcode
    text-align center
    margin-bottom 3.5rem

    > img
      width 9rem
      height auto
</style>
