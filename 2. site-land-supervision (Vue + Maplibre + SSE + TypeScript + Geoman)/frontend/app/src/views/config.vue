<script setup lang="ts"></script>

<template>
  <section class="config">
    <h2 class="title">Конфигурация</h2>
    <div class="config__content"></div>
  </section>
</template>

<style scoped lang="scss">
.textarea {
  display: flex;
  height: 185px;
  outline: none;
  width: 100%;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  color: $text-color;
  font-size: 14px;
  resize: none;
  border: 1px solid #a7a7a7ff;
}

.input {
  outline: none;
  width: 100%;
  height: 40px;
  background-color: transparent;
  border: 1px solid;
  padding: 1.25rem;
  border-radius: 0;
  color: $text-color;
  font-size: 14px;
  border: 1px solid #a7a7a7ff;
}

.angle {
  height: 8px;
  width: 8px;

  &__container {
    width: 400px;
  }
}

.title {
  padding-left: 64px;
}

.config {
  height: 100%;
  padding-top: 30px;
  max-height: calc(100vh - 87px);
  display: flex;
  flex-direction: column;

  &__content {
    overflow: auto;
    flex: 1;
    width: 100%;
    aspect-ratio: calc(10 / 7);
  }

  &__block {
  }
}
</style>
