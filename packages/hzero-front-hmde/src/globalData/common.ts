/**
 * 记录状态
 */
export enum RecordStatus {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

/**
 * 资源层级
 */
export enum FdLevel {
  SITE = 'site',
  ORGANIZATION = 'organization',
}

/**
 * 分配目标类型
 */
export enum TargetType {
  STRUCTURE_TABLE = 'STRUCTURE_TABLE',
  STRUCTURE_API = 'STRUCTURE_API',
  MODEL = 'MODEL',
  VIEW = 'VIEW',
}
