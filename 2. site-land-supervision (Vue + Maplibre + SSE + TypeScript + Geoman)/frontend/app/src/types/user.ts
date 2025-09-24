import { IUserSettingsField } from './admin'

export interface IUserState {
  user: IUser
  flag_update: boolean
}

export interface IUserFormData {
  userData: IUserSettingsField[]
  password: string
  newPass: string
  confirmPass: string
  iconUrl: string
  imageUrl: string | null
  selectedFile: File | null
}

export interface IUser {
  last_name: string
  first_name: string
  father_name: string
  email: string
  old_password: string
  password: string

  [key: string]: string | number
}

export interface IUserUpdate {
  username: string
  email: string
  first_name: string
  last_name: string
  father_name: string
  token?: {
    access_token: string
    token_type: string
  }
}
