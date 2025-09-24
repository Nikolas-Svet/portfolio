<template>
  <div class="admin">
    <nav class="nav admin-view__nav">
      <div v-for="(item, index) in menu" :key="index + '-admin-menu-main'" class="nav__item">
        <router-link
          v-if="item.to && (checkUser() || item.name === 'Общая информация')"
          :class="[
            { admin__active: $route.path === Consts.ROUTES.ADMIN && item.name === 'Общая информация' },
            {
              admin__active:
                $route.path.startsWith(Consts.ROUTES.ADMIN) &&
                $route.path !== Consts.ROUTES.ADMIN &&
                item.name === 'Администрирование' &&
                !$route.path.startsWith(Consts.ROUTES.ADMIN_DICTS)
            },
            {
              admin__active:
                $route.path.startsWith(Consts.ROUTES.ADMIN_DICTS) &&
                $route.path !== Consts.ROUTES.ADMIN &&
                item.name === 'Типы данных'
            }
          ]"
          :to="item.to"
          class="nav__link nav__name__link"
          @mouseup="() => openMenu(item)"
        >
          {{ item.name }}
        </router-link>

        <div
          :class="{
            open: $route.path.startsWith(Consts.ROUTES.ADMIN)
          }"
          class="nav__wrapper"
          v-if="checkUser()"
        >
          <ul v-if="item.children?.length" class="nav__list">
            <li
              v-for="(elem, counter) in item.children"
              :key="counter + '-admin-menu-sub'"
              class="nav__list__item"
            >
              <router-link
                :class="{ admin__active: $route.path === `${elem.to}` }"
                :to="elem.to"
                class="nav__link nav__link__list"
              >
                {{ elem.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div :class="['content', { overflow: isUsersPage }]">
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IAdminMenu } from '@/types/admin'
import { Consts } from '@/consts/index.consts'
import store from '@/store'
import { user } from '@/store/actions/user'

const route = useRoute()
const isUsersPage = computed(() => route.path === '/admin/users/')

const menu = ref(<IAdminMenu[]>[
  {
    name: 'Общая информация',
    to: Consts.ROUTES.ADMIN,
    isOpen: false
  },
  {
    name: 'Администрирование',
    to: Consts.ROUTES.ADMIN_USER,
    names: [
      Consts.RouterNames.ADMIN_USERS,
      Consts.RouterNames.ADMIN_TERRITORIES,
      Consts.RouterNames.ADMIN_UPLOAD_LAYER
    ],
    children: [
      {
        to: Consts.ROUTES.ADMIN_USER,
        name: 'Пользователи'
      },
      {
        to: Consts.ROUTES.ADMIN_TERRITORIES,
        name: 'Территории'
      },
      {
        to: Consts.ROUTES.ADMIN_LAYERS,
        name: 'Слои'
      },
      {
        to: Consts.ROUTES.ADMIN_UPLOAD_LAYER,
        name: 'Загрузить слой'
      },
      {
        to: Consts.ROUTES.ADMIN_MANAGE_ACCESS,
        name: 'Настройка прав доступа'
      },
      {
        to: Consts.ROUTES.ADMIN_GROUP_FOR_LAYERS,
        name: 'Настройка групп'
      }
    ],
    isOpen: false
  },
  {
    name: 'Типы данных',
    to: Consts.ROUTES.ADMIN_DICTS_GROUP,
    children: [
      {
        to: Consts.ROUTES.ADMIN_DICTS_GROUP,
        name: 'Группы'
      },
      {
        to: Consts.ROUTES.ADMIN_DICTS_ROLE,
        name: 'Роли'
      },
      {
        to: Consts.ROUTES.ADMIN_DICTS_FILES,
        name: 'Файлы'
      },
      {
        to: Consts.ROUTES.ADMIN_DICTS_SYSTEM_COORD,
        name: 'Системы координат'
      }
    ],
    isOpen: false
  }
])

function openMenu(item: IAdminMenu) {
  menu.value.forEach((el: any) => (el.isOpen = false))
  item.isOpen = true
}

const checkUser = () => {
  if (store.state.user.user?.is_admin && store.state.user.user?.is_sys_admin) {
    return true
  } else {
    return false
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  store.commit(user.decode, token)
})
</script>

<style lang="scss" scoped>
.overflow {
  overflow: auto;
}

.admin {
  overflow: auto;
  display: flex;
  width: 100%;
  margin: 0 auto;
  height: 100%;
}

.nav {
  position: sticky;
  top: 0;
  width: 400px;
  display: grid;
  place-items: flex-start;
  padding: 60px 60px;
  grid-gap: 1.25rem 0;
  align-content: baseline;
  height: 100%;
  background-color: $admin-nav-color;

  &__name,
  &__name__link {
    font-size: 1rem;
    font-family: $Golos_Text_Medium;
    font-weight: 500;
  }

  &__link {
    text-decoration: none;

    &__list {
      font-size: 1rem;
      font-weight: 400;
    }
  }

  &__list {
    display: grid;
    grid-gap: 0.875rem 0;
    list-style: none;
    padding-left: 1.25rem;
    padding-top: 1.25rem;
    overflow: hidden;
  }

  &__wrapper {
    height: 100%;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;

    &.open {
      max-height: max-content;
    }
  }
}

.content {
  flex: 1;
}

.router-link-exact-active,
.active {
  color: $primary-color;
}

@media (width < 1351px) {
  .admin {
    grid-template-columns: 400px 1fr;
  }
}
</style>
