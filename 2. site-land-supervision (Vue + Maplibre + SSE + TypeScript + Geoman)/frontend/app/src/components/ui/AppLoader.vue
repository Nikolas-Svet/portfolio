<script setup lang="ts">
const props = defineProps({
  text: String,
  styles: String
})
</script>

<template>
  <div :style="{position: props.styles === 'absolute' ? 'absolute' : 'fixed'}" class="layer-list__loader">
    <span class="loader"></span>
    <span v-if="props.text !== ''">{{ text }}</span>
  </div>
  <div :style="{position: props.styles === 'absolute' ? 'absolute' : 'fixed'}" class="layer-list__wrap"></div>
</template>

<style scoped lang="scss">
.layer-list {
  &__loader {
    z-index: 112;
    position: fixed;
    bottom: 64px;
    left: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__wrap {
    position: fixed;
    width: 100%;
    inset: 0;
    height: 100%;
    z-index: 111;
    backdrop-filter: blur(2px);
  }
}
</style>