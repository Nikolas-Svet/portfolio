<template>
  <div class="info-box-content">
    <!-- Если переданы данные для отображения, выводим список информации -->
    <div v-if="data_info && data_info.length">
      <h3>{{ title }}</h3>
      <ul>
        <li v-for="(info, index) in data_info" :key="index">
          <strong>{{ info?.name }}:</strong> <span>{{ info?.value }}</span>
        </li>
      </ul>
    </div>
    <!-- Если data_info не переданы, считаем, что это режим редактирования стилей слоя -->
    <div v-else>
      <h3>Редактирование стилей слоя</h3>
      <div class="form-group">
        <label>
          <span>Прозрачность:</span>
          <div class="slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="currentOpacity"
              @input="updateLayerStyle"
            />
            <span class="slider-value">{{ Math.round(currentOpacity * 100) }}%</span>
          </div>
        </label>
      </div>
      <div class="form-group" v-if="selectedLayerType === 'vector'">
        <label>
          <span>Цвет:</span>
          <!-- Предполагается, что у вас есть компонент ColorPicker -->
          <ColorPicker
            v-model:pureColor="currentColor"
            @update:pureColor="updateLayerStyle"
            inline
          />
        </label>
      </div>
      <div class="form-group" v-else-if="selectedLayerType === 'raster'">
        <label>
          <span>Насыщенность:</span>
          <div class="slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              v-model.number="currentSaturation"
              @input="updateLayerStyle"
            />
            <span class="slider-value">{{ Math.round(currentSaturation * 100) }}%</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// Если у вас ColorPicker импортируется из отдельного модуля, не забудьте его импортировать:
// import ColorPicker from '@/components/ColorPicker.vue';

interface InfoItem {
  name: string
  value: string
}

export default defineComponent({
  name: 'InfoBoxContent',
  // При открытии модального окна в openModal передаются пропсы:
  props: {
    title: {
      type: String,
      default: 'Информация'
    },
    data_info: {
      type: Array as () => InfoItem[],
      default: () => []
    },
    // Пропсы для режима редактирования стилей слоя:
    currentOpacity: {
      type: Number,
      default: 1
    },
    currentSaturation: {
      type: Number,
      default: 1
    },
    currentColor: {
      type: String,
      default: '#ffffff'
    },
    selectedLayerType: {
      type: String,
      default: 'vector' // либо 'raster'
    }
  },
  methods: {
    updateLayerStyle() {
      // Можно выбросить событие для оповещения родительского компонента об изменениях
      this.$emit('update-layer-style')
    }
  }
})
</script>

<style scoped lang="scss">
.info-box-content {
  padding: 10px;
  font-family: $Golos_Text_Regular;
}

.info-box-content h3 {
  margin-bottom: 10px;
}

.info-box-content ul {
  list-style-type: none;
  padding: 0;
}

.info-box-content li {
  margin-bottom: 5px;
}

.form-group {
  margin-bottom: 10px;
}

.slider-container {
  display: flex;
  align-items: center;
}

.slider-container input[type='range'] {
  flex: 1;
}

.slider-value {
  margin-left: 8px;
  min-width: 40px;
  text-align: right;
}
</style>
