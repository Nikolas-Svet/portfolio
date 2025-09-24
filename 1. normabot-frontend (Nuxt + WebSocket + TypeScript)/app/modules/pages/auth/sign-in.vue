<script setup lang="ts">
import { Consts } from '~/consts'

definePageMeta({
  layout: 'layout-default'
})
useHead({
  title: `Sign In${Consts.prefixNamePage}`,
})
</script>

<template>
  <p>
    Sign in page
  </p>
</template>

<style lang="scss">
p {
  color: $color-primary;
}
</style>