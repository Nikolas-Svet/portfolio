// export const HotKeys = {
//   // Горячии клавиши для верхней панели работы со слоем
//   set_cursor_default: {
//     rus: 'м',
//     en: 'v'
//   },
//   set_cursor_move: {
//     rus: 'ь',
//     en: 'm'
//   },
//   message_mode: {
//     rus: 'й',
//     en: 'q'
//   },
//   set_cursor_move_hover: {
//     en: 'space'
//   },
//   drawing_point: {
//     rus: 'е',
//     en: 't'
//   },
//   drawing_polygon: {
//     rus: 'з',
//     en: 'p'
//   },
//   drawing_line: {
//     rus: 'д',
//     en: 'l'
//   },
//   ruler: {
//     rus: 'к',
//     en: 'r'
//   },
//   fly_to_layer: {
//     rus: 'а',
//     en: 'f'
//   },
//   delete_mode: {
//     rus: 'в',
//     en: 'd'
//   },
//   show_measure_distance: {
//     rus: 'ф',
//     en: 'a'
//   },
//   show_measure_distance_hover: {
//     en: 'alt'
//   },
//   save_geometry: {
//     rus: 'ы',
//     en: 's'
//   },
//   cancel_drawing: {
//     en: 'escape'
//   },
//   cancel_save: {
//     en: 'escape'
//   },
//   accept_save: {
//     en: 'enter'
//   }
//   //*************************************************************
// } as const

function createHotKey(rus: string, en: string) {
  return {
    rus,
    en,
    get full() {
      return HotKeys.modifier.default.toUpperCase() + ' + ' + this.en.toUpperCase()
    }
  }
}

export const HotKeys = {
  cancel: 'escape',

  // Модификаторы
  modifier: {
    default: 'ctrl'
  },

  toolbar: {
    // draw и edit, а также вложенные в них ключи, нельзя переименовывать, названия ключа используется для активации инструментов из geoman
    draw: {
      circle_marker: createHotKey('щ', 'o'),
      polygon: createHotKey('з', 'p'),
      line: createHotKey('д', 'l'),
      circle: createHotKey('и', 'b')
    },
    edit: {
      delete: createHotKey('в', 'd'),
      change: createHotKey('у', 'e'),
      rotate: createHotKey('ь', 'm'),
      cut: createHotKey('ж', ';'),
      snap: createHotKey('я', 'z')
    },
    highlight: {
      poly: createHotKey('о', 'j'),
      bbox: createHotKey('л', 'k')
    },
    base: {
      message: createHotKey('р', 'h'),
      measure_distance: createHotKey('ф', 'a'),
      save_geometry: createHotKey('ы', 's'),
      reset_geometry: createHotKey('ч', 'x'),
      ruler: createHotKey('к', 'r'),
      fly_to_layer: createHotKey('а', 'f')
    }

  },

  first: {
    en: 'alt'
  },
  highlightPolygon: {
    rus: 'о',
    en: 'j'
  },
  highlightBbox: {
    rus: 'л',
    en: 'k'
  },
  set_cursor_default: {
    rus: 'none_key',
    en: 'none_key'
  },
  set_cursor_move: {
    rus: 'none_key',
    en: 'none_key'
  },
  message_mode: {
    rus: 'й',
    en: 'q'
  },
  set_cursor_move_hover: {
    en: 'space'
  },
  drawing_point: {
    rus: 'е',
    en: 't'
  },
  drawing_polygon: {
    rus: 'з',
    en: 'p'
  },
  drawing_line: {
    rus: 'д',
    en: 'l'
  },
  drawing_circle: {
    rus: 'и',
    en: 'b'
  },
  ruler: {
    rus: 'к',
    en: 'r'
  },
  fly_to_layer: {
    rus: 'а',
    en: 'f'
  },
  delete_mode: {
    rus: 'в',
    en: 'd'
  },
  edit_mode: {
    rus: 'у',
    en: 'e'
  },
  rotate_mode: {
    rus: 'ц',
    en: 'w'
  },
  cut_mode: {
    rus: 'с',
    en: 'c'
  },
  snap_mode: {
    rus: 'я',
    en: 'z'
  },
  show_measure_distance: {
    rus: 'ф',
    en: 'a'
  },
  show_measure_distance_hover: {
    en: 'alt'
  },
  save_geometry: {
    rus: 'ы',
    en: 's'
  },
  reset_geometry: {
    rus: 'ч',
    en: 'x'
  },
  cancel_drawing: {
    en: 'escape'
  },
  cancel_save: {
    en: 'escape'
  },
  accept_save: {
    en: 'enter'
  }

  //*************************************************************
} as const
