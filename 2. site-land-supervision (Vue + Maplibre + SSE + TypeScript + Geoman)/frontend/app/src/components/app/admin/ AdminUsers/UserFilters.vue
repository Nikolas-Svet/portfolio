<template>
  <div class="users__filters">
    <div class="angle__container search__container" style="width: 30%">
      <input
        v-model="name"
        placeholder="Поиск по имени"
        type="text"
      />
      <div class="angle" v-for="i in 4" :key="i"></div>
      <div
        v-if="name"
        class="icon-close"
        @click="clear('name')"
      />
      <div class="icon-search"><span /></div>
    </div>

    <div class="angle__container select__container" style="width: 30%">
      <v-select
        v-model="selectedRole"
        :options="rolesOptions"
        placeholder="Роль"
        label="name"
      />
      <div class="angle" v-for="i in 4" :key="i"></div>
      <div
        v-if="selectedRole"
        class="icon-close"
        @click="clear('selectedRole')"
      />
    </div>

    <!-- Выбор территории -->
    <div class="angle__container select__container" style="width: 30%">
      <v-select
        v-model="selectedTerritory"
        :options="territoriesOptions"
        placeholder="Территория"
        label="name"
      />
      <div class="angle" v-for="i in 4" :key="i"></div>
      <div
        v-if="selectedTerritory"
        class="icon-close"
        @click="clear('selectedTerritory')"
      />
    </div>

    <!-- Чекбоксы -->
    <div class="checkboxes__container">
      <label class="checkbox__container">
        <div class="checkbox">
          <input
            id="admin-checkbox"
            type="checkbox"
            v-model="isAdmin"
          />
          <label for="admin-checkbox"></label>
        </div>
        Администратор
      </label>

      <label class="checkbox__container">
        <div class="checkbox">
          <input
            id="sysadmin-checkbox"
            type="checkbox"
            v-model="isSysAdmin"
          />
          <label for="sysadmin-checkbox"></label>
        </div>
        Суперпользователь
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { computed } from 'vue'

interface Filters {
  name: string
  is_admin: boolean
  is_sys_admin: boolean
  selectedRole: any | null
  selectedTerritory: any | null
}

const props = defineProps({
  modelValue: {
    type: Object as PropType<Filters>,
    required: true
  },
  rolesOptions: {
    type: Array as PropType<any[]>,
    required: true
  },
  territoriesOptions: {
    type: Array as PropType<any[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Filters): void
}>()

const name = computed({
  get: () => props.modelValue.name,
  set: val => emit('update:modelValue', { ...props.modelValue, name: val })
})

const selectedRole = computed({
  get: () => props.modelValue.selectedRole,
  set: val => emit('update:modelValue', { ...props.modelValue, selectedRole: val })
})

const selectedTerritory = computed({
  get: () => props.modelValue.selectedTerritory,
  set: val => emit('update:modelValue', { ...props.modelValue, selectedTerritory: val })
})

const isAdmin = computed({
  get: () => props.modelValue.is_admin,
  set: val => emit('update:modelValue', { ...props.modelValue, is_admin: val })
})

const isSysAdmin = computed({
  get: () => props.modelValue.is_sys_admin,
  set: val => emit('update:modelValue', { ...props.modelValue, is_sys_admin: val })
})

/**
 * Сброс конкретного фильтра
 */
function clear(field: keyof Filters) {
  switch (field) {
    case 'name':
      name.value = ''
      break
    case 'selectedRole':
      selectedRole.value = null
      break
    case 'selectedTerritory':
      selectedTerritory.value = null
      break
    case 'is_admin':
      isAdmin.value = false
      break
    case 'is_sys_admin':
      isSysAdmin.value = false
      break
  }
}
</script>

<style scoped lang="scss">
.angle {
  height: 7px;
  width: 7px;
}

.search__container {
  .icon-close {
    right: 0 !important;
  }
}

.checkbox__container {
  display: flex;
  align-items: center;
}

.checkboxes__container {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.icon-close {
  z-index: 100;
  cursor: pointer;
  position: absolute;
  right: 20px;
  height: 30px;
  width: 30px;
  top: 50%;
  transform: translateY(-50%);
}

.users {
  --vs-line-height: 1.75;

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 32px;
    margin-bottom: 32px;
    padding: 0 50px;

    width: 100%;

    input {
      font-size: 16px;

      &::placeholder {
        font-size: 16px;
      }
    }

    .icon {
      position: absolute;
      top: 50%;
      height: 16px;
      width: 16px;
      left: 7px;
      transform: translateY(-50%);
      display: flex;
      align-items: flex-start;
      justify-content: left;
    }

    input {
      width: 100%;
      height: 40px;
      border-radius: 0;
      background-color: transparent;
      outline: none;
      padding: 0 28px;

      &::placeholder {
        //color: #ffffff;
        position: absolute;
      }
    }
  }
}
</style>