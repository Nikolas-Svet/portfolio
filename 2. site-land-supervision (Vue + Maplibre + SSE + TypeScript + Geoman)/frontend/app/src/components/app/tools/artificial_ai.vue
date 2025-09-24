<script setup lang="ts">
import { computed, defineEmits, onMounted, ref } from 'vue'
import store from '@/store'
import { artificialAiActions } from '@/store/actions/artificial_ai'
import { toolsStoreActions } from '@/store/actions/tools.ts'

const computedId = `select1-${Date.now()}-${Math.random()}`
const computedId2 = `select2-${Date.now()}-${Math.random()}`

const emit = defineEmits<{
  (event: 'update:addArtificialAi', value: boolean): void
  (event: 'draw-place', data: string): void
}>()

const dragAndDropFlag = computed(() => {
  return store.getters.dragAndDrop
})

const localLayerValue = ref('')
const localLayerName = ref('')

const selectedLayerValue = computed({
  get() {
    return store.getters['artificial_ai/ai'] || localLayerValue.value
  },
  set(value: string) {
    localLayerValue.value = value
    store.dispatch(`artificial_ai/${artificialAiActions.SET_AI}`, value)
  }
})

const selectedLayerName = computed({
  get() {
    return store.getters['artificial_ai/nameLayer'] || localLayerName.value
  },
  set(value: string) {
    localLayerName.value = value
    store.dispatch(`artificial_ai/${artificialAiActions.SET_NAME_LAYER}`, value)
  }
})

function close() {
  store.commit(toolsStoreActions.showArtificialAi, false)
}

async function save() {
  if (!selectedLayerValue.value) {
    window.$notify('Выберите нейросеть.', true)
    return
  }

  await store.dispatch(`artificial_ai/${artificialAiActions.SET_AI}`, selectedLayerValue.value)
  await store.dispatch(
    `artificial_ai/${artificialAiActions.SET_NAME_LAYER}`,
    selectedLayerName.value
  )

  const response = await store.dispatch(`artificial_ai/${artificialAiActions.ADD_NEW_LAYER}`)

  if (response === false) {
    return
  } else {
    emit('update:addArtificialAi', false)
    close()
  }
}

function drawPlace(data: string) {
  store.dispatch(`artificial_ai/${artificialAiActions.SET_AI}`, selectedLayerValue.value)
  store.dispatch(`artificial_ai/${artificialAiActions.SET_NAME_LAYER}`, selectedLayerName.value)
  emit('draw-place', data)
}

const handleKeydown = (event: any) => {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  const checkboxes = document.querySelectorAll(
    'input[name="neuralNetwork"]'
  ) as NodeListOf<HTMLInputElement>
  checkboxes.forEach((checkbox) => {
    if (checkbox.value === selectedLayerValue.value) {
      checkbox.checked = true
    }
  })

  window.addEventListener('keydown', handleKeydown)
})
onBeforeMount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function selectLayer(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedLayerValue.value = target.value
  }

  const checkboxes = document.querySelectorAll(
    'input[name="neuralNetwork"]'
  ) as NodeListOf<HTMLInputElement>
  checkboxes.forEach((checkbox) => {
    checkbox.checked = checkbox === target
  })
}
</script>

<template>
  <div
    :class="{ dragAndDrop__wrap: dragAndDropFlag }"
    class="wrap artificial_ai_wrap"
  >
    <section
      :class="{ dragAndDrop__container: dragAndDropFlag }"
      class="artificial_ai"
    >
      <h2 class="artificial_ai__title">Анализ ИИ</h2>

      <div class="artificial_ai__content">
        <!-- Область предсказания -->
        <div class="artificial_ai__block">
          <span>Область предсказания:</span>
          <button @click="() => drawPlace('Место добавлено')">Указать</button>
        </div>

        <!-- Результирующий слой -->
        <div class="artificial_ai__block">
          <span style="width: calc(45% - 20px)">Имя результирующего слоя:</span>
          <div class="angle__container">
            <input
              v-model="selectedLayerName"
              type="text"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </div>

        <!-- Выбор нейросети -->
        <div class="artificial_ai__bl">
          <span style="width: calc(45% - 20px)">Выбор нейросети:</span>
          <div class="artificial_ai__bl-ai">
            <div class="artificial_ai__bl-ai__select">
              <div class="checkbox">
                <input
                  :id="computedId2"
                  type="checkbox"
                  name="neuralNetwork"
                  value="nn_pashni"
                  @change="selectLayer($event)"
                />
                <label :for="computedId2"></label>
              </div>
              <span>Пашни</span>
            </div>
            <div class="artificial_ai__bl-ai__select">
              <div class="checkbox">
                <input
                  :id="computedId"
                  type="checkbox"
                  name="neuralNetwork"
                  value="nn_forest"
                  @change="selectLayer($event)"
                />
                <label :for="computedId"></label>
              </div>
              <span>Лес</span>
            </div>
            <div
              style="display: none"
              class="artificial_ai__bl-ai__select"
            >
              <div class="checkbox">
                <input
                  id="roofs"
                  type="checkbox"
                  name="neuralNetwork"
                  value="geoscan_yolo_polygon"
                  @change="selectLayer($event)"
                />
                <label for="roofs"></label>
              </div>
              <span>Крыши домов</span>
            </div>
          </div>
        </div>

        <!-- Кнопки управления -->
        <div class="artificial_ai__buttons">
          <button
            class="artificial_ai__button artificial_ai__button--accept defaultButtonTwo"
            @click="save"
          >
            Добавить новый слой
          </button>
          <button
            class="artificial_ai__button artificial_ai__button--cancel defaultButton"
            @click="close"
          >
            Отменить
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.modal-svg {
  width: 25px;
  height: 25px;
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.artificial_ai {
  position: absolute;
  z-index: 102;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  min-width: 500px;
  max-height: 100%;
  padding: 20px;

  .angle {
    &__container {
      width: 45%;
    }

    &:nth-child(2) {
      height: 5px;
      width: 5px;
    }

    &:nth-child(3) {
      height: 5px;
      width: 5px;
    }

    &:nth-child(4) {
      height: 5px;
      width: 5px;
    }

    &:nth-child(5) {
      height: 5px;
      width: 5px;
    }
  }

  &__title {
    font-size: 20px;
    text-align: left;
    width: 100%;
    margin-bottom: 24px;
    font-family: $Golos_Text_Medium;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }

  &__bl {
    flex-direction: column;

    &-ai {
      display: flex;
      margin: 16px;
      flex-direction: column;
      gap: 12px;

      &__select {
        display: flex;
        align-items: center;

        .checkbox input[type='checkbox']:not(:checked) + label[data-v-30272357] {
          border-radius: 50%;
        }

        .checkbox input[type='checkbox']:checked + label[data-v-30272357]::after {
          border-radius: 50%;
        }

        .checkbox input[type='checkbox']:checked + label[data-v-30272357]::before {
          top: 25%;
        }
      }
    }
  }

  &__block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    span {
      width: 45%;
      text-wrap: wrap;
      line-height: 1.2;
    }

    button {
      width: 45%;
      height: 30px;
      transition: all 0.15s ease;
      border: none;
      outline: none;
      font-size: 14px;
      font-weight: 700;
      line-height: 100%;
      text-align: center;

      &:hover {
        opacity: 0.9;
      }
    }

    input {
      height: 30px;
      background-color: transparent;
      width: 100%;
      outline: none;
      padding: 0 8px;
    }

    svg {
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__buttons {
    display: grid;
    bottom: 0;
    grid-auto-flow: column;
    grid-gap: 0 15px;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-inline: 30px;
  }

  &__button {
    width: 180px;
    height: 50px;
    transition: all 0.15s ease;
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;
    text-align: center;

    &:hover {
      opacity: 0.9;
    }

    &--cancel {
      background-color: transparent;
    }
  }
}

.wrap {
  position: absolute;
  z-index: 101;
  right: 0;
  bottom: 0;
  width: calc(100% - 473px - $width-panel);
  height: 100%;
  backdrop-filter: blur(5px);
}
</style>
