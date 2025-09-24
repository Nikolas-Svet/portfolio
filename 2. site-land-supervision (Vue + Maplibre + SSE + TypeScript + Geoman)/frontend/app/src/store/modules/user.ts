import { userApi } from '@/api/user'
import { user } from '@/store/actions/user'
import { IUser, IUserState } from '@/types/user'
import { jwtDecode } from 'jwt-decode'
import { ActionContext } from 'vuex'

export const userStore = {
  state: {
    user: undefined,
    flag_update: false
  },
  mutations: {
    [user.set](state: IUserState, user: IUser) {
      state.user = user
    },
    [user.updatePhoto](state: any, payload: any) {
      state.flag_update = payload
    },
    [user.update](state: IUserState, user: Partial<IUser>) {
      state.user = Object.assign(state.user, user)
    },
    [user.decode](state: IUserState, token: string) {
      const decodedToken = jwtDecode(token)
      if (!decodedToken.sub) throw new Error('Failed to decode token')

      console.log(JSON.parse(decodedToken.sub))
      state.user = JSON.parse(decodedToken.sub)
    }
  },
  actions: {
    async [user.set]({ commit }: ActionContext<IUserState, unknown>, payload: IUser) {
      commit(user.set, payload)
    },
    async [user.updatePhoto]({ commit }: ActionContext<any, unknown>, payload: any) {
      commit(user.updatePhoto, payload)
    },
    async [user.updateSettings]({ commit }: ActionContext<IUserState, unknown>, payload: IUser) {
      try {
        const response = await userApi.update(payload)
        const userData = response.data

        if (userData.token?.access_token)
          localStorage.setItem('token', userData.token?.access_token)

        delete userData.token
        commit(user.update, userData)

        window.$notify(`Данные успешно обновлены`, true)
      } catch {
        throw new Error('Failed to update')
      }
    }
  },
  getters: {
    user: (state: IUserState) => state.user,
    flag_update: (state: IUserState) => state.flag_update
  }
}
