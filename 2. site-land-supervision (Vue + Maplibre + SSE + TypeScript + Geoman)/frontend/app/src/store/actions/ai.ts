// store/actions/ai.ts

export const aiActions = {
  // Мутации и экшены, чтобы сохранять выбранные слои и год
  SET_ORIGINAL_LAYERS: 'SET_ORIGINAL_LAYERS',
  SET_OVERLAY_LAYERS: 'SET_OVERLAY_LAYERS',
  SET_YEAR: 'SET_YEAR',
  SET_NAME_LAYER: 'SET_NAME_LAYER',
  SET_CREATE_FLAG_LAYER: 'SET_CREATE_FLAG_LAYER',

  // Мутация/экшен для очистки
  CLEAR_STORE: 'CLEAR_STORE',

  // Экшен для запроса на создание нового слоя ( forest_growth )
  ADD_NEW_LAYER: 'ADD_NEW_LAYER'
}
