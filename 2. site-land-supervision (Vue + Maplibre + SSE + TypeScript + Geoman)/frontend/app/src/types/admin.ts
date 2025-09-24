export interface IAdminMenu {
  name: string
  to: string
  isOpen: boolean
  names?: string[]
  children?: {
    to: string
    name: string
  }[]
}

export interface IUserSettingsField {
  title: string
  value: string | number
  name: string
}

export interface IUpdateInput {
  id: string | number
  value: string | number
}

export interface ISelectOption {
  id: string | number
  name: string | number
}

export interface IVectorDataset {
  id_dict_type: number
  name: string
  description: string
  date_of_shooting: string
}
