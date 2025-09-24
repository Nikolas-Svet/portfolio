import { Module } from 'vuex'
import { adminUsersApi } from '@/api/adminUsers'
import { IAdminUser } from '@/types/adminUsers'

export interface IAdminUsersState {
  users: IAdminUser[]
  currentUser: any
}

export const adminUsersStore: Module<IAdminUsersState, unknown> = {
  namespaced: true,
  state: {
    users: [],
    currentUser: {}
  },
  mutations: {
    SET_ADMIN_USERS(state, users: IAdminUser[]) {
      state.users = users
    },
    SET_CURRENT_USER(state, user: IAdminUser) {
      console.log('SET_CURRENT_USER', user)
      state.currentUser = user
    }
  },
  actions: {
    async FETCH_ADMIN_USERS({ commit }) {
      try {
        const users = await adminUsersApi.getUsers()
        commit('SET_ADMIN_USERS', users)
      } catch (error) {
        console.error(error)
      }
    },
    async SET_CURRENT_USER({ commit }, payload: IAdminUser) {
      // Просто сохраняем пользователя в state
      try {
        commit('SET_CURRENT_USER', payload)
      } catch (error) {
        console.error(error)
      }
    }
  },
  getters: {
    users: (state) => state.users,
    currentUser: (state) => state.currentUser
  }
}
