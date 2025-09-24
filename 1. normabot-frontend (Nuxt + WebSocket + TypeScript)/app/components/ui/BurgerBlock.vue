<script setup lang="ts">
import BurgerIcon from '~/assets/images/burger.svg'

const openSidebar = () => {
  const sidebar = document.querySelector<HTMLElement>('.sidebar-left');
  const sidebar_wrap = document.querySelector<HTMLElement>('.sidebar-left__wrap');
  if (sidebar_wrap) {
    sidebar_wrap.style.zIndex = '8'
    setTimeout(() => {
      sidebar_wrap.style.opacity = '1'
    }, 1)
  }
  if (!sidebar) return;

  sidebar.style.left = '0';
}
</script>

<template>
  <BurgerIcon @click="openSidebar" class="icon-burger"/>
</template>

<style scoped lang="scss">
.icon {
  &-burger {
    display: none;
    position: absolute;
    left: 30px;
    top: 50%;
    transform: translateY(-50%) scale(1.2);
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 4px;
    z-index: 2;

    &:hover {
      background-color: $color-hover-sidebar;
    }

    * {
      stroke: $color-primary;
    }
  }
}

@media (width < 1024px) {
  .icon {
    &-burger {
      display: flex;
    }
  }
}
</style>