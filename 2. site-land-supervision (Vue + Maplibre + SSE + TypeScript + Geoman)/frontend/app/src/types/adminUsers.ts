export interface ITerritory {
  id: number
  name: string
}

export interface IRole {
  id: number
  name: string
}

export interface IType {
  id: number
  name: string
}

export interface IAdminUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  father_name: string
  is_admin: boolean
  is_sys_admin: boolean
  is_active: boolean
  teritories: ITerritory[]
  id_role: any
  role: {
    id: number
    name: string
    description: string
  }
  isEditing?: boolean
  file_types?: IType[]
  reset_password?: boolean
}

export interface IAdminUsersState {
  users: IAdminUser[]
  isLoading: boolean
  error: string | null
}
