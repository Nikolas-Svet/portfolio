<script setup lang="ts">
import FavoriteIcon from '~/assets/images/favorite.svg'
</script>

<template>
  <FavoriteIcon class="icon-favorite"/>
</template>

<style scoped lang="scss">
.icon {
  &-favorite {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: 4px;

    * {
      stroke: $color-border-docs-secondary;
      transform: translate(2px, 2px);
      transition: all 0.3s ease;
    }

    &:hover {
      background-color: $color-bg-chat-reply;
      * {
        stroke: $color-primary;
      }
    }
  }
}
</style>