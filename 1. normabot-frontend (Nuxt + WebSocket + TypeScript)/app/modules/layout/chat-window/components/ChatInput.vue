<script setup lang="ts">
import SearchIcon from '@/assets/images/search.svg'
import SendIcon from '@/assets/images/send.svg'
const textMessage = ref<string>('')
</script>

<template>
  <section class="container-chat chat-window__input">
    <div class="chat-window__input-container">
      <!--    <textarea v-model="textMessage" placeholder="Введите текст" class="chat-window__input-item text text&#45;&#45;size&#45;&#45;16 text&#45;&#45;weight&#45;&#45;400"></textarea>-->
      <SearchIcon class="chat-window__input-icon chat-window__input-icon--search"/>
      <v-textarea
        style="position: relative; z-index: 11; margin-top: -16px; margin-bottom: -22px"
        v-model="textMessage"
        row-height="20"
        rows="1"
        max-rows="5"
        placeholder="Введите текст"
        bg-color="#ffffff"
        variant="plain"
        auto-grow
      />
      <SendIcon :style="{opacity: textMessage === '' ? '0' : '1'}" class="chat-window__input-icon chat-window__input-icon--send"/>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chat-window {
  &__input {
    width: 100%;
    position: relative;
    margin-bottom: 32px;

    //color: $color-text-primary;

    &-container {
      position: relative;
      display: flex;
      align-items: flex-end;
      z-index: 1;
      background-color: $color-bg-primary;
      border-radius: 10px;
      border: 1px solid $color-border-chat-secondary;
      padding: 16px;
    }

    &:after {
      content: '';
      z-index: 0;
      position: absolute;
      top: 50%;
      height: 80px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      opacity: 0.6;
      border-radius: 10px;
      background: linear-gradient(125.06deg, rgba(0, 97, 255, 0.1) -2.31%, rgba(96, 239, 255, 0.1) 97.12%);
      filter: blur(20px);
    }

    &-item {
      position: relative;
      z-index: 1;
      min-height: 66px;
      width: 100%;
      border-radius: 10px;
      padding: 24px 62px 0 62px;
      color: $color-text-primary;
      resize: none;
      border: 1px solid $color-border-chat-secondary;
      &::placeholder {

        color: $color-border-chat;
      }
    }

    &-icon {
      min-width: 24px;
      height: 24px;

      &--search {
        transform: translateY(-5px);
        margin-right: 16px;
      }

      &--send {
        transform: translateY(-1px);
        margin-left: 16px;
        transition: all 0.3s ease;
      }
    }
  }
}

@media (width < 1024px) {
  .chat-window {
    &__input {
      margin-bottom: 24px;
    }
  }
}

@media (width < 768px) {
  .chat-window {
    &__input {
      margin-bottom: 16px;

      &-container {
        padding: 16px;
      }
    }
  }
}
</style>