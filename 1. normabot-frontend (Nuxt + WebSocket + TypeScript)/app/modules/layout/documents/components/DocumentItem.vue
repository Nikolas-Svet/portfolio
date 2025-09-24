<script lang="ts" setup>
import ActiveBlock from '~/components/ui/ActiveBlock.vue'
import InactiveBlock from '~/components/ui/InactiveBlock.vue'
import FavoriteBlock from '~/components/ui/FavoriteBlock.vue'

const isHoverItem = ref<boolean>(false)
</script>

<template>
  <div class="documents-item" :class="{'documents-item--active': isHoverItem}">
    <div class="documents-item__block-active text text--weight--400 text--size--12">
      <ActiveBlock/>
      Действительный
    </div>

    <div style="display: none;" class="documents-item__block-disabled text text--weight--400 text--size--12">
      <InactiveBlock/>
      Недействительный
    </div>

    <FavoriteBlock/>

    <h3 class="documents-item__gost text text--size--16 text--weight--600">
      ГОСТ 31937-2011
    </h3>

    <h4 class="documents-item__description text text--size--14 text--weight--400">
      Здания и сооружения. Правила обследования и мониторинга технического состояния.
    </h4>

    <div class="documents-item__block">
      <div class="documents-item__block-categories">
        <div class="text text--size--12 text--weight--400">ГОСТ</div>
        <div class="text text--size--12 text--weight--400">Здания и сооружения</div>
      </div>
      <button
        @mouseleave="isHoverItem = false"
        @mousemove="isHoverItem = true"
        class="documents-item__button-open  text text--weight--500 text--size--14">
          Открыть документ
      </button>
    </div>

  </div>
</template>

<style lang="scss">
.documents {
  &-item {
    width: 100%;
    border: 1px solid $color-border-docs-secondary;
    border-radius: 8px;
    padding: 16px 24px;
    display: flex;
    position: relative;
    flex-direction: column;
    transition: all 0.3s ease;

    &--active {
      border: 1px solid $color-primary;
    }

    &__block {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;

      &-active {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        color: $color-text-secondary;

      }

      &-disabled {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        color: $color-text-secondary;
      }

      &-categories {
        display: flex;
        align-items: center;
        gap: 20px;

        div {
          background-color: $color-light-blue;
          border-radius: 10px;
          color: $color-text-primary;
          padding: 8px 10px;
          width: max-content;
        }
      }
    }

    &__gost {
      margin-bottom: 10px;
      color: $color-primary;
      text-transform: uppercase;
    }

    &__description {
      margin-bottom: 20px;
      color: $color-text-primary;
    }

    .icon-favorite {
      position: absolute;
      right: 24px;
      top: 16px;
    }

    &__button {
      &-open {
        border: none;
        width: 200px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $color-primary;
        border-radius: 6px;
        color: $color-bg-primary;
        transition: all 0.3s ease;

        &:hover {
          background-color: $color-primary-hover;
        }
      }
    }
  }
}
</style>