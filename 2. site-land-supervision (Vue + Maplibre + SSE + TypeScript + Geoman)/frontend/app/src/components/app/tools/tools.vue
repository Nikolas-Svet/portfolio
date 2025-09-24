<template>
  <div @click="show_tools" class="tools" v-if="flagTools"></div>
  <div class="tools__content" v-if="flagTools">
    <div class="tools__content__title">Инструменты</div>
    <table class="tools__content__body">
      <thead>
        <tr>
          <th>
            <p>Тип</p>
          </th>
          <th>Наименование</th>
          <th>Описание</th>
        </tr>
      </thead>
      <tbody>
        <tr @click="toggleSubtractionVector()">
          <td><p>Векторные</p></td>
          <td><p>вычитание векторов</p></td>
          <td><p>Из одного вектора вычитается другой</p></td>
        </tr>
        <tr @click="openAI()">
          <td><p>AI</p></td>
          <td><p>Поиск заселенности</p></td>
          <td><p>Поиск лесных участков на заданной области</p></td>
        </tr>
      </tbody>
    </table>
  </div>
  <!--  <subtractionVector-->
  <!--    :subtractionVectorFlag="subtractionVectorFlag"-->
  <!--    @update:subtractionVectorFlag="subtractionVectorFlag = $event"-->
  <!--  />-->
</template>

<script>
import subtractionVector from './subtractionVector.vue'

export default {
  name: 'tools',
  props: {
    flagTools: false
  },
  emits: ['show_tools'],
  components: {
    subtractionVector
  },
  data() {
    return {
      subtractionVectorFlag: false,
      AIflag: false
    }
  },
  methods: {
    show_tools() {
      this.$emit('show_tools', !this.flagTools)
    },
    toggleSubtractionVector() {
      this.subtractionVectorFlag = !this.subtractionVectorFlag
    },
    openAI() {}
  }
}
</script>

<style scoped lang="scss">
.tools {
  position: absolute;
  z-index: 1;
  top: 0;
  height: 100%;
  width: 100%;

  &__content {
    height: 660px;
    max-width: 1024px;
    width: 100%;
    background-color: #212121;
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 100;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px 0 35px 0;

    &__title {
      padding-left: 20px;
      padding-bottom: 20px;
      font-size: 24px;
      text-align: left;
    }

    &__body {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;

      &:first-child {
        th {
          margin-top: 0;
        }
      }

      tr {
        display: flex;
      }

      th {
        background: #ffffff12;

        &:first-child {
          justify-content: left;
          width: 30%;
          display: flex;
          padding-left: 20px;

          p {
            margin-left: 35px;
          }
        }
      }

      td {
        background-color: transparent;
        font-size: 22px;
      }

      svg {
        max-width: 45px;
        max-height: 45px;
        margin-left: 16px;
        cursor: pointer;

        &:hover {
          path {
            fill: #de9c87 !important;
          }
        }
      }

      & th,
      td {
        align-items: center;
        border: none;
        text-align: center;
        display: flex;
        justify-content: center;
        padding: 8px 0;
        width: 40%;
        font-weight: 400;

        &:first-child {
          width: 20%;
        }
      }

      tbody {
        tr {
          &:hover {
            cursor: pointer;
            background-color: rgba(157, 157, 157, 0.1);
          }
        }
      }
    }
  }
}
</style>
