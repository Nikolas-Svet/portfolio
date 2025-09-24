<script setup lang="ts">
const messages = ref<any[]>([])
</script>

<template>
<section class="chat-window__body">
  <div v-if="!messages.length" class="chat-window__welcome-block">
    <div class="chat-window__welcome-title">
      <p class="text text--size--36 text--weight--600">Рад вас видеть! <span class="gradient text text--size--36 text--weight--600">О чём поговорим?</span></p>
      <span class="text text--weight--400 text--size--20">Стандарты, регламенты, своды правил — отвечаю с ссылками на документы!</span>
    </div>
  </div>
</section>
</template>

<style scoped lang="scss">
.chat-window {
  &__body {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  &__welcome {
    &-block {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-title {
      text-align: center;
      padding: 0 30px;
      p {
        color: $color-text-primary;
        margin-bottom: 16px;

        .gradient {
          display: inline-block;
          @include gradient-text(
              $color-primary,
              $color-accent-purple,
              89.48deg
          );
        }
      }

      span {
        color: $color-text-secondary;
      }
    }
  }
}
</style>