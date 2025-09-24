<template>
  <div class="container">
    <div class="desktops">
      <div class="desktops__title">
        <p>Инструменты</p>
      </div>
      <div class="desktops__content">
        <table>
          <thead>
            <tr>
              <th>Тип</th>
              <th>Наименование</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr @click="toggleSubtractionVector()">
              <td><p>Векторные</p></td>
              <td><p>Вычитание векторов</p></td>
              <td><p>Из одного вектора вычитается другой</p></td>
            </tr>
            <tr @click="openAI()">
              <td><p>AI</p></td>
              <td><p>Поиск заселенности</p></td>
              <td><p>Поиск лесных участков на заданной области</p></td>
            </tr>
            <tr @click="openAddVector()">
              <td><p>Векторные</p></td>
              <td><p>Создать векторный слой</p></td>
              <td><p>Описание</p></td>
            </tr>
            <tr @click="openForestArea()">
              <td><p>Векторные</p></td>
              <td><p>Площадь леса в области</p></td>
              <td><p>Описание</p></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store'
import { toolsStoreActions } from '@/store/actions/tools'

export default {
  name: 'tools',
  emits: ['show_tools'],
  data() {
    return {
      AIflag: false
    }
  },
  methods: {
    // show_tools() {
    //   this.$emit('show_tools', !this.flagTools)
    // },
    toggleSubtractionVector() {
      this.$router.push('/')
      store.commit(toolsStoreActions.showSubstractionVectors, true)
    },
    openAI() {
      this.$router.push('/')
      store.commit(toolsStoreActions.showAi, true)
    },
    openAddVector() {
      this.$router.push('/')
      store.commit(toolsStoreActions.showAddVector, true)
    },
    openForestArea() {
      this.$router.push('/')
      store.commit(toolsStoreActions.showForestArea, true)
    }
  }
}
</script>

<style scoped lang="scss">
tbody {
  tr {
    height: 60px;
    cursor: pointer;

    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
}

.desktops {
  padding-top: 60px;

  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 300px;
    width: 100%;
    margin-bottom: 30px;

    p {
      font-size: 24px;
      font-family: $Golos_Text_Medium;
    }

    span {
      width: 24px;
      height: 24px;

      &:after {
        width: 10px;
        height: 1px;
      }

      &:before {
        width: 10px;
        height: 1px;
      }
    }
  }

  &__content {
    table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;

      img {
        height: 30px;
        width: 30px;

        &:last-child {
          margin-right: 23px;
          margin-left: 20px;
        }
      }

      thead {
        border-top: 1px solid rgb(104, 104, 104);

        tr {
          border: none;
        }
      }

      tr {
        display: flex;
        border-bottom: 1px solid rgb(104, 104, 104);
      }

      th {
        font-family: $Golos_Text_Medium;
        background: rgba(255, 255, 255, 0.07);
        height: 59px;
      }

      td {
        background-color: transparent;
      }

      & th,
      td {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        padding: 8px 0;
        width: 33.3%;
        font-weight: 400;

        &:first-child {
          padding-left: 50px;
          justify-content: left;
        }

        &:last-child {
          justify-content: left;
          padding-right: 67px;
        }
      }
    }
  }
}
</style>
