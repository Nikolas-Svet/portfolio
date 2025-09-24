// store/modules/notifications.ts

import { Module } from 'vuex'
import { notificationsActions } from '@/store/actions/notifications'
import { INotificationEvent } from '@/types/notifications'

/**
 * Состояние модуля уведомлений
 */

// export interface INotificationEvent {
//   id: number;
//   name: string;
//   process: string;
//   state: boolean;
//   result: any;
//   created_date: string;
//   updated_date: string | null;
// }

export interface INotificationsState {
  events: INotificationEvent[] // список всех событий
  number_events: number
}

export const notificationsStore: Module<INotificationsState, unknown> = {
  namespaced: false,
  state: {
    events: [], // изначально нет событий
    number_events: 0
  },
  mutations: {
    /**
     * Добавить одно новое событие (в конец массива)
     */
    [notificationsActions.addNotificationEvent](state, payload: INotificationEvent) {
      const existingIndex = state.events.findIndex((event) => event.id === payload.id)

      console.log('[SSE] обновляем список', state.events)

      if (existingIndex !== -1) {
        // Если событие с таким id уже существует, обновляем его
        state.events.splice(existingIndex, 1, payload)
      } else {
        // Если события с таким id нет, добавляем его
        state.events.push(payload)
      }

      state.number_events += 1

      console.log('[SSE] обновленный список', state.events)
    },

    /**
     * Удалить событие по ID
     */
    [notificationsActions.removeNotificationEvent](state, eventId: number) {
      state.events = state.events.filter((evt) => evt.id !== eventId)
    },

    /**
     * Полностью заменить массив событий на новый
     */
    [notificationsActions.setNotificationEvents](state, payload: INotificationEvent[]) {
      state.events = payload
    },

    [notificationsActions.setNumberEvents](state, payload: number) {
      state.number_events = payload
    }
  },
  actions: {
    /**
     * Экшен: добавить одно новое событие
     */
    [notificationsActions.addNotificationEvent]({ commit }, payload: INotificationEvent) {
      console.log('addNotificationEvent', payload)
      commit(notificationsActions.addNotificationEvent, payload)
    },

    /**
     * Экшен: удалить событие по ID
     */
    [notificationsActions.removeNotificationEvent]({ commit }, eventId: number) {
      console.log('removeNotificationEvent', eventId)
      commit(notificationsActions.removeNotificationEvent, eventId)
    },

    /**
     * Экшен: установить целиком новый список событий
     */
    [notificationsActions.setNotificationEvents]({ commit }, payload: INotificationEvent[]) {
      console.log('setNotificationEvents', payload)
      commit(notificationsActions.setNotificationEvents, payload)
    },

    [notificationsActions.setNumberEvents]({ commit }, payload: number) {
      console.log('setNumberEvents', payload)
      commit(notificationsActions.setNumberEvents, payload)
    }
  },
  getters: {
    /**
     * Вернуть все события (как есть)
     */
    events: (state) => state.events,
    number_events: (state) => state.number_events
  }
}
