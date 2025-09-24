export enum ROUTES {


  ADMIN = '/admin/',
  ADMIN_GROUP_FOR_LAYERS = ROUTES.ADMIN + 'group_for_layers/',
  ADMIN_DICTS_GROUP = ROUTES.ADMIN + 'dicts/group/',
  ADMIN_DICTS_ROLE = ROUTES.ADMIN + 'dicts/role/',
  ADMIN_DICTS_FILES = ROUTES.ADMIN + 'dicts/files/',
  ADMIN_DICTS_SYSTEM_COORD = ROUTES.ADMIN + 'dicts/system-coord/',
  ADMIN_DICTS = ROUTES.ADMIN + 'dicts/',
  ADMIN_MANAGE_ACCESS = ROUTES.ADMIN + 'manage-access/',
  ADMIN_USER_EDIT = ROUTES.ADMIN + 'users/edit/',
  ADMIN_USER = ROUTES.ADMIN + 'users/',
  ADMIN_LAYERS = ROUTES.ADMIN + 'layers/',
  ADMIN_LAYER_EDIT = ROUTES.ADMIN + 'layers/edit/',
  ADMIN_UPLOAD_LAYER = ROUTES.ADMIN + 'upload-layer/',
  ADMIN_TERRITORIES = ROUTES.ADMIN + 'territories/',

  // Auth
  AUTH_RESET_PASSWORD = '/reset-password/',
  AUTH_SIGN_IN = '/sign-in/',
}

export enum RouterNames {
  MAIN = 'index',
  SIGN_IN = 'SignIn',
  SIGN_UP = 'SignUp',
  DOCUMENTS = 'documents',
  WORK_AREA = 'work-area',
  ADMIN = 'Admin',
  ADMIN_MAIN = 'AdminMain',
  ADMIN_USERS = 'AdminUsers',
  ADMIN_TERRITORIES = 'AdminTerritories',
  ADMIN_UPLOAD_LAYER = 'AdminUploadLayer',
  ADMIN_LAYERS = 'AdminLayers',
  ADMIN_LAYER_EDIT = 'AdminLayerEdit'
}