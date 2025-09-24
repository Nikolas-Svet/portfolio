<script lang="ts" setup>
import Input from '~/components/ui/Input.vue'
import FilterIcon from '@/assets/images/filter.svg'

const searchText = ref<string>('')

const props = defineProps<{
  documents: any[]
  isShowCategories?: boolean
}>()
</script>

<template>
  <div class="container-chat documents-filter">
    <div class="documents-filter__search">
      <Input v-model="searchText" :isSearchIcon="true" placeholder="Введите текст"/>
      <button class="documents-filter__button-filters text text--size--14 text--weight--500">
        Фильтры
        <FilterIcon/>
      </button>
    </div>
    <div v-if="props.isShowCategories" class="documents-filter__block">
      <div class="documents-filter__block-category">

      </div>

      <div class="documents-filter__block-summary text text--weight--400 text--size--12">
        Всего документов: {{ props.documents.length }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.documents {
  &-filter {
    margin-top: 40px;
    width: 100%;

    &__search {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    &__button {
      &-filters {
        width: 137px;
        background-color: $color-hover-sidebar;
        border-radius: 8px;
        border: none;
        height: 42px;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.3s ease;

        &:hover {
          opacity: 0.8;
        }

        svg {
          width: 18px;
          height: 16px;
        }
      }
    }

    &__block {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }
}
</style>