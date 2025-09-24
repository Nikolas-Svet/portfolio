<script setup lang="ts">
const props = defineProps({
  title: String
})
</script>

<template>
  <h2 class="title">{{ props.title }}</h2>
</template>

<style lang="scss">
.title {
  padding-left: 64px;
  font-family: $Golos_Text_Medium;
  font-size: 20px;
  font-weight: 400;
  margin: 30px 0;
}
</style>