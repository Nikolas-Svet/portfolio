<template>
  <section class="addParametr">
    <h3 v-if="!flagCreateLayer && attributes.length" class="title">Параметры</h3>
    <div
      v-if="!flagCreateLayer && attributes.length"
      class="addParametr__subtitle addParametr__block"
    >
      <span>Имя</span>
      <span>Значение</span>
    </div>
    <div class="addParametr__block" v-for="(attribute, index) in attributeValues" :key="index">
      <div class="addParametr__name">
        <span :title="attribute.name" class="addParametr__value">{{ attribute.name }}</span>
      </div>
      <div class="angle__container">
        <input class="input" v-model="attribute.value" :placeholder="'Введите ' + attribute.type" />
      </div>
    </div>
    <nav class="addParametr__nav">
      <button class="defaultButtonTwo" @click="submitAttributes">Продолжить</button>
      <button class="defaultButtonTwo addParametr__nav--stop" @click="endDraw">Завершить</button>
    </nav>
  </section>
</template>

<script lang="ts">
import { Attribute } from '@/types/layersVector'
import { defineComponent } from 'vue'
import store from '@/store'

export default defineComponent({
  props: {
    attributes: {
      type: Array<Attribute>,
      required: true
    }
  },
  emits: ['submit-attributes', 'end-draw'],
  data() {
    return {
      attributeValues: {} as Record<string, Attribute>
    }
  },
  computed: {
    flagCreateLayer() {
      return store.state.forestArea.flagCreateLayer
    }
  },
  mounted() {
    this.attributeValues = {} // Сбрасываем старые значения

    this.attributes.forEach((attr: any) => {
      this.attributeValues[attr.name] = {
        name: attr.name,
        value: '',
        type: attr.type
      } // Инициализация пустых значений
    })
  },
  methods: {
    submitAttributes() {
      this.$emit('submit-attributes', this.attributeValues)
    },
    endDraw() {
      this.$emit('end-draw', this.attributeValues)
    }
  }
})
</script>

<style lang="scss" scoped>
.addParametr {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 385px;
  //min-height: 100px;

  h3 {
    width: 100%;
    margin-bottom: 0;
    font-size: 20px;
    text-align: left;
  }

  &__name {
    display: grid;
    align-items: center;
  }

  &__value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__block {
    display: grid;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 12px;
    grid-template-columns: 150px 1fr;
    grid-gap: 0 0.7rem;

    .input {
      height: 30px;
      padding-inline: 7px;
      width: 100%;
      outline: none;
      background-color: rgba(255, 255, 255, 0.05);
      border: 0;
    }
  }

  &__subtitle {
    display: flex;
    align-items: center;
    width: 100%;
    margin: 20px 0 1.1rem 0;

    span {
      font-size: 14px;

      &:first-child {
        margin-right: 82px;
      }
    }
  }

  button {
    height: auto;
    padding: 0.4rem 0.7rem;
    font-size: 1rem;
    width: auto;
    letter-spacing: 0.06rem;
    border-radius: 0.1rem;
  }

  &__nav {
    display: grid;
    grid-auto-flow: column;
    grid-gap: 0 1.63rem;

    &--stop {
      border: 2px solid rgb(150, 150, 150);
      background-color: rgb(150, 150, 150);
      color: white;

      &:hover {
        color: white;
      }
    }
  }
}
</style>
