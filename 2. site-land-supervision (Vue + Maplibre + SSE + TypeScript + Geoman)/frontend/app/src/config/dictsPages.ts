// dictsPages.ts

export const dictsPages = [
  {
    name: 'Группы',
    name_page: 'group',
    table: [
      {
        name_column: 'Имя',
        name_variable: 'name'
      },
      {
        name_column: 'Описание',
        name_variable: 'description'
      }
    ],
    type: 'Data',
    is_delete: true,
    type_dict: 'DictTypesData'
  },
  {
    name: 'Роли',
    name_page: 'role',
    table: [
      {
        name_column: 'Название роли',
        name_variable: 'name'
      },
      {
        name_column: 'Описание роли',
        name_variable: 'description'
      }
    ],
    is_delete: true,
    type_dict: 'DictRoles'
  },
  {
    name: 'Файлы',
    name_page: 'files',
    table: [
      {
        name_column: 'Название',
        name_variable: 'name'
      },
      {
        name_column: 'Описание',
        name_variable: 'description'
      }
    ],
    type: 'File',
    is_delete: true,
    type_dict: 'DictTypesFiles'
  },
  {
    name: 'Система координат',
    name_page: 'system-coord',
    table: [
      {
        name_column: 'Название',
        name_variable: 'name'
      },
      {
        name_column: 'Описание',
        name_variable: 'description'
      }
    ],
    is_delete: true,
    type_dict: 'DictUserSpatialRefSys'
  }
  // ...и т.д.
]
