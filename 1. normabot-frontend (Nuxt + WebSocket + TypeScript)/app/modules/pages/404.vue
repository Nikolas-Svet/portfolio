<script setup lang="ts">
import { Consts } from '~/consts'

useHead({
  title: `Not Found${Consts.prefixNamePage}`,
})
</script>

<template>
  <section class="page-404">
    <h1 class="page-404__title">404 — Страница не найдена</h1>
    <nuxt-link :to="Consts.Routes.home" class="page-404__link">
      ← На главную
    </nuxt-link>
  </section>
</template>

<style lang="scss">
.page-404 {
  &__title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  &__link {
    text-decoration: underline;
  }
}
</style>