<script lang="ts" setup>
import { dictsApi } from '@/api/dicts'
import { IDictType } from '@/types/dicts.ts'
import { Consts } from '@/consts/index.consts.ts'

const items = ref<IDictType[]>([])
const loading = ref(false)
const currentIdGroup = ref(-1)

onMounted(async () => {
  loading.value = true
  try {
    const responseDict = await dictsApi.getDict(Consts.DictsPrefixAPI.DictTypesData)
    const data = responseDict.success ? responseDict.data : []
    items.value = data.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      is_seeders: g.is_seeders
    }))
  } catch (err) {
    console.error('Ошибка при загрузке групп:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="form">
    <AppAdminTitle title="Настройка групп" />

    <div v-if="!items.length" class="empty-state">
      <p>Нет групп для отображения</p>
    </div>

    <div v-else class="group-layers">
      <AppTable>
        <template #THeader>
          <thead>
          <tr>
            <th>Имя</th>
            <th>Описание</th>
          </tr>
          </thead>
        </template>

        <template #TBody>
          <tbody>
          <template v-for="item in items" :key="item.id">
            <tr :class="{'group-layers__active': currentIdGroup == item.id}" style="position: relative"
                @click="currentIdGroup = (currentIdGroup === item.id ? -1 : item.id)">
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
            </tr>

            <tr class="group-layers__block">
              <td class="group__cell" colspan="2">
                <div
                  :class="{ 'group__empty': currentIdGroup !== item.id, 'group__layers': currentIdGroup === item.id }"
                >
                  <add-layer-in-group :currentIdGroup="currentIdGroup" :is-open="currentIdGroup === item.id"
                                      @update:currentIdGroupUpdate="currentIdGroup = -1" />
                </div>
              </td>
            </tr>
          </template>
          </tbody>
        </template>
      </AppTable>
    </div>
    <AppLoader styles="absolute" v-if="loading" text="Загрузка групп" />
  </section>
</template>

<style lang="scss" scoped>
* {
  transition: height 0.3s ease !important;
}

td {
  text-wrap: wrap;
  text-align: left;
}

tr {
  cursor: pointer;
}

.empty-state {
  padding-left: 32px;
}

.group {
  &__cell {
    position: relative;
    padding: 0;
  }

  &__layers {
    position: relative;
    top: 100%;
    left: 0;
    width: calc(100vw - 400px);
    transition: height 0.3s ease !important;
    height: 500px;
  }

  &__empty {
    transition: height 0.3s ease !important;
    opacity: 0;
    width: calc(100vw - 400px);
    height: 0;
  }
}

.group-layers {
  overflow: auto;

  thead {
    z-index: 111;
  }

  &__block {
    background-color: transparent !important;
    cursor: default !important;
  }

  &__table {
    width: calc(100vw - 400px);
    table-layout: fixed;
    border-collapse: collapse;

    th, td {
      width: 50%;
    }
  }
}

.form {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;

  .loader {
    position: absolute !important;
  }

  svg {
    height: 30px;
    width: 30px;
    cursor: pointer;
  }

  &__label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  &__item {
    margin-bottom: 20px;
  }

  &__save {
    border: none;
    margin-bottom: 32px;
    margin-left: 64px;
  }

  &__loader {
    flex: 1;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 24px;

    span {
      font-family: $Golos_Text_Medium;
    }
  }
}
</style>
