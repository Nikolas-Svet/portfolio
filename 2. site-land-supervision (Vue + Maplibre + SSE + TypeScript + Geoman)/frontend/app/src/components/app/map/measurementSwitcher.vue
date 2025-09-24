<template>
  <div class="info-coordinates">
    <!-- Переключатель единиц измерения -->
    <div class="coord-switch">
      <button @click="prevUnit" class="arrow left">&lt;</button>
      <div class="coord-switch__text">
        <span :key="selectedUnit.value">{{ selectedUnit.name }}</span>
      </div>
      <button @click="nextUnit" class="arrow right">&gt;</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import store from '@/store'

export default defineComponent({
  name: 'MeasurementSwitcher',
  computed: {
    selectedUnit() {
      return store.getters['measurement/selectedUnit']
    }
  },
  methods: {
    nextUnit() {
      store.dispatch('measurement/nextUnit')
    },
    prevUnit() {
      store.dispatch('measurement/prevUnit')
    }
  }
})
</script>

<style scoped lang="scss">
.left,
.right {
  position: relative;
  z-index: 1;
}

.info-coordinates {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  max-width: 100px !important;
  padding-right: 8px;
  position: fixed;
  bottom: 0;
  right: 440px !important;
  z-index: 11;

  span {
    font-size: 17px !important;
    min-width: 20px !important;
    margin-top: -5px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 40px;
  }
}

.coord-switch {
  width: 40%;
  display: flex;
  align-items: center;
  border-radius: 4px;
  user-select: none;
  text-align: center;
  font-size: 14px;
  min-width: 100px !important;
  position: relative;

  * {
    border: none !important;
  }

  .arrow {
    background: transparent;
    border: none;
    min-width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }

  &__text {
    flex: 1;
    display: flex;
    align-items: center;
    width: calc(100% - 40px);
    justify-content: center;
    overflow: hidden;

    span {
      height: 14px;
      width: 100%;
      max-width: 100px;
      display: inline-block;
      position: absolute;
    }
  }
}
</style>
