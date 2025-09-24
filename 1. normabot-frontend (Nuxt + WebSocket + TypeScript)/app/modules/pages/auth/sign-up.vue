<script setup lang="ts">
import { Consts } from '~/consts'

definePageMeta({
  layout: 'layout-default'
})
useHead({
  title: `Sign Up${Consts.prefixNamePage}`,
})
</script>

<template>
  <p>
    Sign up page
  </p>
</template>

<style lang="scss">
p {
  color: $color-primary;
}
</style>