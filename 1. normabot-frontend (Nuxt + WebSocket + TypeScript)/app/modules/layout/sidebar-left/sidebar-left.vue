<script lang="ts" setup>
import logoIcon from '@/assets/images/logo.svg'
import addIcon from '@/assets/images/add.svg'
import documentIcon from '@/assets/images/document.svg'
import favoriteIcon from '@/assets/images/favorite.svg'
import chatIcon from '@/assets/images/chat.svg'
import exitIcon from '@/assets/images/exit.svg'
import CloseIcon from '~/assets/images/close.svg'
import { Consts } from '~/consts'

const route = useRoute()
const router = useRouter()

const startNewChat = () => {
  if (route.path !== Consts.Routes.home) {
    router.push(Consts.Routes.home)
  }
  console.log('Начинается новый чат')
}

const logout = () => {
  console.log('Выход')
}

function truncate(text: string, maxLength = 28): string {
  return text.length > maxLength
    ? text.slice(0, maxLength) + '...'
    : text
}

const closeSidebar = () => {
  const sidebar = document.querySelector<HTMLElement>('.sidebar-left')
  const sidebar_wrap = document.querySelector<HTMLElement>('.sidebar-left__wrap')
  if (sidebar_wrap) {
    sidebar_wrap.style.opacity = '0'
    setTimeout(() => {
      sidebar_wrap.style.zIndex = '-1'
    }, 300)
  }
  if (!sidebar) return
  sidebar.style.left = '-325px'
}

</script>

<template>
  <aside class="sidebar-left">
    <teleport to="body">
      <div @click="closeSidebar" class="sidebar-left__wrap"></div>
    </teleport>
    <header class="sidebar-left__header">
      <NuxtLink class="sidebar-left__logo-link" to="/">
        <div class="sidebar-left__logo"></div>
        <h1 class="sidebar-left__title">Normabot.AI</h1>
        <logoIcon class="sidebar-left__logo-wrap">Normabot.AI</logoIcon>
      </NuxtLink>
      <CloseIcon class="sidebar-left__icon-close" @click="closeSidebar" />
    </header>

    <div class="sidebar-left__actions">
      <button
        v-if="route.path === Consts.Routes.home"
        :class="{'sidebar-left__nav-link--active': route.path === Consts.Routes.home}"
        class="sidebar-left__new-chat-button text text--size--16 text--weight--500"
        type="button"
        @click="startNewChat()"
      >
        <addIcon />
        Новый чат
      </button>

      <button
        v-else
        class="sidebar-left__new-chat-button-2 text text--size--16 text--weight--500"
        type="button"
        @click="startNewChat()"
      >
        Новый чат
        <addIcon />
      </button>
    </div>

    <nav aria-label="Основная навигация" class="sidebar-left__nav">
      <ul class="sidebar-left__nav-list">
        <li class="sidebar-left__nav-item">
          <NuxtLink :class="{'sidebar-left__nav-link--active': route.path === Consts.Routes.documents}"
                    :to="Consts.Routes.documents" class="sidebar-left__nav-link text text--size--16 text--weight--500">
            <div class="sidebar-left__nav-icon">
              <documentIcon />
            </div>
            Документы
          </NuxtLink>
        </li>
        <li class="sidebar-left__nav-item">
          <NuxtLink :class="{'sidebar-left__nav-link--active': route.path === Consts.Routes.favorites}"
                    :to="Consts.Routes.favorites" class="sidebar-left__nav-link text text--size--16 text--weight--500">
            <div class="sidebar-left__nav-icon">
              <favoriteIcon />
            </div>
            Избранное
          </NuxtLink>
        </li>
        <li class="sidebar-left__nav-item">
          <NuxtLink :class="{'sidebar-left__nav-link--active': route.path === Consts.Routes.chats}"
                    :to="Consts.Routes.chats" class="sidebar-left__nav-link text text--size--16 text--weight--500">
            <div class="sidebar-left__nav-icon">
              <chatIcon />
            </div>
            Чаты
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="sidebar-left__chats">
      <h3 class="sidebar-left__chats-title text text--size--12 text--weight--400">Последние чаты</h3>
      <ul class="sidebar-left__chats-list">
        <li class="sidebar-left__chats-item text text--weight--400 text--size--16">{{ truncate('Новый чат 5') }}</li>
        <li class="sidebar-left__chats-item text text--weight--400 text--size--16">
          {{ truncate('Новый чат 5 Новый чат 5 Новый чат 5 Новый чат 5 Новый чат 5 Новый чат 5 Новый чат 5') }}
        </li>
      </ul>
    </div>

    <div class="sidebar-left__user">
      <NuxtLink :to="Consts.Routes.profile" class="sidebar-left__user-link">
        <div class="sidebar-left__user-avatar text text--size--16 text--weight--400">
          ИК
        </div>
        <span class="sidebar-left__user-name text text--size--18 text--weight--500">
          Иванов Федор Константинович
        </span>
      </NuxtLink>
      <button
        class="sidebar-left__logout-button text text--size--16 text--weight--400"
        type="button"
        @click="logout()"
      >
        <exitIcon />
        Выход
      </button>
    </div>
  </aside>
</template>

<style lang="scss">
.sidebar-left {
  background-color: $color-bg-sidebar;
  max-width: 324px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  &__wrap {
    display: none;
    transition: all 0.3s ease;
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.15);
    left: 0;
    top: 0;
    opacity: 0;
    z-index: -1;
  }

  &__header {
    width: 100%;
    padding: 20px 30px 0 30px;
    margin-bottom: 24px;
    display: flex;
    position: relative;

    &:after {
      position: absolute;
      content: '';
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 60px);
      height: 1px;
      background-color: $color-border-sidebar;
    }
  }

  &__icon {
    &-close {
      display: none;
      width: 24px;
      height: 24px;
      cursor: w-resize;
      border-radius: 4px;
      transform: scale(1.4) translateY(2px);
      transition: all 0.3s ease;

      * {
        transition: all 0.3s ease;
        //stroke: $color-border-docs-secondary;
        stroke: $color-primary;
        transform: translate(4px, 4px);
      }

      &:hover {
        background-color: $color-hover-sidebar;

        * {
          stroke: $color-primary;
        }
      }
    }
  }

  &__logo {
    margin-right: 16px;
    height: 48px;
    min-width: 48px;
    border-radius: 7px;
    background-color: $color-bg-primary;

    &-link {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      //border-bottom: 1px solid $color-border-sidebar;
    }

    &-wrap {
      width: 170px;
      position: absolute;
      right: 30px;
      top: calc(50% - 10px);
      transform: translateY(-50%);
    }
  }

  &__title {
    opacity: 0;
  }

  $padding-left-action: 30px;
  $margin-bottom-action: 16px;

  &__actions {
    margin-bottom: $margin-bottom-action;
    min-height: 40px;
    width: 100%;
    padding-right: 30px;
  }

  &__new-chat-button {
    position: relative;
    padding-left: $padding-left-action;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background-color: transparent;
    border: none;
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 0 7px 7px 0;
    color: $color-text-primary;

    &:hover {
      background-color: $color-hover-sidebar;
      color: $color-primary;
    }

    svg {
      margin-right: 16px;
      height: 24px;
      width: 24px;
    }

    &-2 {
      margin-left: 30px;
      width: calc(100% - 30px);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      height: 40px;
      color: $color-bg-primary;
      background-color: $color-primary;
      transition: all 0.3s ease;

      &:hover {
        opacity: 0.9;
      }

      svg {
        width: 24px;
        height: 24px;
        margin-left: 16px;

        * {
          stroke: $color-bg-primary;;
        }
      }
    }
  }

  &__nav {
    display: flex;
    width: 100%;
    flex-direction: column;
    margin-bottom: 49px;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      bottom: -24px;
      left: 50%;
      height: 1px;
      width: calc(100% - 60px);
      transform: translateX(-50%);
      background-color: $color-border-sidebar;
    }

    &-list {
      width: 100%;
      list-style-type: none;
      padding-right: 30px;
      display: flex;
      flex-direction: column;
      gap: $margin-bottom-action;
    }

    &-item {
      min-height: 40px;
      width: 100%;
    }

    &-link {
      display: flex;
      cursor: pointer;
      position: relative;
      height: 100%;
      width: 100%;
      padding-left: $padding-left-action;
      transition: all 0.3s ease;
      border-radius: 0 7px 7px 0;
      color: $color-text-primary;
      text-decoration: none;
      align-items: center;
      gap: 16px;


      svg {
        display: flex;
        align-items: center;
      }

      &:hover {
        background-color: $color-hover-sidebar;
        color: $color-primary;
      }

      &--active {
        background-color: $color-hover-sidebar;
        color: $color-primary;

        &:after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 100%;
          width: 4px;
          border-radius: 0 6px 6px 0;
          background-color: $color-primary;
        }
      }
    }

    &-icon {
      min-width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__chats {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    padding-left: $padding-left-action;
    margin-bottom: 24px;

    &-title {
      color: $color-text-tertiary;
      margin-bottom: 16px;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      list-style-type: none;
    }

    &-item {
      color: $color-text-primary;
    }
  }

  &__user {
    padding: 30px;
    width: 100%;
    background-color: $color-primary;
    border-radius: 10px 10px 0 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;

    &-link {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-start;
      margin-bottom: 24px;
      text-decoration: none;
    }

    &-avatar {
      min-width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: $color-text-on-primary;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $color-primary;
    }

    &-name {
      line-height: 1.35;
      color: $color-text-on-primary;
    }
  }

  &__logout {
    &-button {
      background-color: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: $color-text-on-primary;

      svg {
        width: 20px;
        height: 18px;
      }
    }
  }
}

@media(width < 1024px) {
  .sidebar-left {
    position: fixed;
    left: -325px;
    top: 0;
    z-index: 10;
    transition: all 0.3s ease;

    &__wrap {
      display: flex;

    }

    &__logo {
      min-width: 32px;
      height: 32px;

      &-wrap {
        transform: translateY(-50%) scale(0.7);
        right: auto;
        left: 20px;
      }
    }

    &__icon {
      &-close {
        display: flex;
      }
    }
  }
}
</style>