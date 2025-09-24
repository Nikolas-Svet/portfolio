<template>
  <div v-if="isVisible" class="window">
    <div class="add-desktop">
      <div class="add-desktop__title">
        <p>Добавить рабочую область</p>
      </div>
      <div class="add-desktop__content">
        <form @submit.prevent="handleSubmit">
          <div class="angle__container">
            <input
              v-model="newDesktop.name"
              :class="{
              error__input: validationFlag && (newDesktop.name === '' || newDesktop.name === null)
            }"
              placeholder="Название рабочей области"
              type="text"
            />
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
          <div class="angle__container">
          <textarea
            v-model="newDesktop.description"
            cols="30"
            placeholder="Описание"
            rows="10"
          ></textarea>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
            <div class="angle"></div>
          </div>
        </form>
      </div>
      <div class="add-desktop__buttons">
        <button @click="close()" @keyup.esc="close">Отменить</button>
        <button class="primary-color" @click="save" @keyup.enter="save">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { defineComponent } from 'vue'
import store from '@/store'
import { IRasterLayer, IVectorLayer } from '@/types/layersVector.ts'
import { desktopApi } from '@/api/desktop.ts'

export default defineComponent({
  name: 'addDesktop',
  data() {
    return {
      validationFlag: false,
      newDesktop: {
        name: null as string | null,
        description: null as string | null,
        layers: [] as (IRasterLayer | IVectorLayer)[],
        style: {} as Record<string, any>
      }
    }
  },
  inject: ['API_URL'],
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  computed: {
    ...mapState('currentDatasets', ['currentLayers']),
    ...mapGetters('defaultStyleLayer', [
      'getAllLayerStyle',
      'getRandomLayerStyle',
      'getLayerStyle'
    ]),
    ...mapGetters('currentDatasets', ['getLayerOrder']),
    name() {
      return this.newDesktop.name
    }
  },
  watch: {
    name: {
      handler() {
        if (this.newDesktop.name !== '' || this.newDesktop.name !== null) {
          this.validationFlag = false
        }
      }
    }
  },
  methods: {
    handleSubmit(event: any) {
      event.preventDefault()
    },
    handleKeydown(event: any) {
      if (event.key === 'Escape' && this.isVisible) {
        this.close()
      }
      if (event.key === 'Enter' && this.isVisible) {
        this.save()
      }
    },
    clearForm() {
      this.newDesktop = {
        name: null,
        description: null,
        layers: [],
        style: {}
      }
    },
    close() {
      this.$emit('close')
    },
    async save() {
      if (this.$route.path === '/') {
        this.newDesktop.layers = store.state.layersMain?.layersMain || []

        this.newDesktop.style = {
          orderLayer: store.state.layersMain?.layerOrderMain || []
        }
      } else {
        this.newDesktop.layers = []

        this.newDesktop.style = []
      }

      if (this.newDesktop.name === '' || this.newDesktop.name === null) {
        ;(window as any).$notify('Заполните все обязательные поля.', true)
        this.validationFlag = true
        return
      }

      try {
        const body = {
          name: this.newDesktop.name || '',
          description: this.newDesktop.description || '',
          style: JSON.stringify(this.newDesktop.style), // Преобразуем массив объектов в строку
          layers: JSON.stringify(this.newDesktop.layers) // Преобразуем массив объектов в строку
        }

        await desktopApi.createDesktop(JSON.stringify(body))
        // if (this.$route.path === '/') {
        //   localStorage.setItem('currentDesktop', result.id)
        //   localStorage.setItem('name', result.name)
        //   localStorage.setItem('description', result.description)
        //   this.$emit('desktop-added')
        // }

        this.$emit('desktop-added')
        this.clearForm()

        this.$emit('close')
      } catch (error) {
        console.error('Ошибка при сохранении рабочего стола:', error)
      }

      this.newDesktop.layers = this.newDesktop.layers.map((layer: any) => ({
        ...layer,
        id: typeof layer.id === 'string' ? parseInt(layer.id, 10) : layer.id
      }))
    }
  }
})
</script>

<style lang="scss" scoped>
.window {
  z-index: 111;
}

.angle {
  &__container {
    width: 100%;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 30px;
    }

    input {
      width: 100%;
      background-color: transparent;
      border: 1px solid rgb(104, 104, 104);
      border-radius: 1px;
      height: 50px;
      padding-left: 10px;
      outline: none;
    }

    textarea {
      display: flex;
      width: 100%;
      background-color: transparent;
      border: 1px solid rgb(104, 104, 104);
      border-radius: 1px;
      min-height: 100px;
      padding: 10px;
      resize: vertical;
      outline: none;

      &::placeholder {
        color: #ffffff;
      }
    }
  }

  &:nth-child(2) {
    height: 6px;
    width: 10px;
  }

  &:nth-child(3) {
    height: 6px;
    width: 10px;
  }

  &:nth-child(4) {
    height: 6px;
    width: 10px;
  }

  &:nth-child(5) {
    height: 6px;
    width: 10px;
  }
}

.add-desktop {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  max-width: 490px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 50px;

  &__title {
    p {
      font-family: $Golos_Text_Medium;
      font-size: 22px;
      font-weight: 500;
      margin-bottom: 30px;
    }
  }

  &__content {
    width: 100%;
  }

  &__buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    border-radius: 0;
    outline: none;

    button {
      width: 40%;
      height: 40px;

      &:first-child {
        background-color: transparent;
      }

      &:last-child {
        border: none;

        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
