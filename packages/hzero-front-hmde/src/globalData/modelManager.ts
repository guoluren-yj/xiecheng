// export enum EPageFunType {
//     model = 'model',
//     source = 'source',
// }
export enum ETableType {
  apiTable = 'apiTable',
  modelTable = 'modelTable',
}
export enum EModelType {
  PREDEFINE = 'PREDEFINE', // 预置
  PLATFORM_SHARED = 'PLATFORM_SHARED',
  PLATFORM = 'PLATFORM',
  TENANT = 'TENANT', // 自定义
}
export enum EIsLeftShow {
  true = 'true', // 显示
  false = 'false', // 空tab页
  no = 'no', // 不展示
}
export enum EModeStatus {
  PUBLISHED = 'PUBLISHED', // 已发布
  MODIFIED = 'MODIFIED', // 已修改
}
export enum EWhoFieldsList {
  TENANT_ID = 'TENANT_ID',
  LAST_UPDATED_BY = 'LAST_UPDATED_BY',
  CREATED_BY = 'CREATED_BY',
  OBJECT_VERSION_NUMBER = 'OBJECT_VERSION_NUMBER',
}
export enum ESourceCategory {
  TABLE = 'TABLE',
  API = 'API',
}
export enum EFieldType {
  TABLE_FIELD = 'TABLE_FIELD',
  VIRTUAL_FIELD = 'VIRTUAL_FIELD',
}
export enum EAuthorization {
  BASIC_TABLE = 'BASIC_TABLE',
  API = 'API',
}
export enum ELayer {
  PLATFORM_LAYER = 'PLATFORM_LAYER', // 平台层
  TENANT_LAYER = 'TENANT_LAYER', // 租户层
}
export enum ESource {
  source = 'source', // 视图
  sourceAuthorization = 'sourceAuthorization', // 视图授权
}
