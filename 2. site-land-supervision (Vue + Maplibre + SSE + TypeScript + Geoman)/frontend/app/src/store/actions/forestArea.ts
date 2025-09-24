// store/actions/forestArea.ts

export const forestAreaActions = {
  // Мутации и экшены, чтобы сохранять выбранные слои и год
  SET_ORIGINAL_LAYERS: 'SET_ORIGINAL_LAYERS',
  SET_OVERLAY_LAYERS: 'SET_OVERLAY_LAYERS',
  SET_FLAG_CREATE_LAYER: 'SET_FLAG_CREATE_LAYER',
  SET_CURRENT_ID: 'SET_CURRENT_ID',

  // Мутация/экшен для очистки
  CLEAR_STORE: 'CLEAR_STORE',

  // Экшен для запроса на создание нового слоя ( forest_growth )
  ADD_NEW_LAYER: 'ADD_NEW_LAYER'
}
