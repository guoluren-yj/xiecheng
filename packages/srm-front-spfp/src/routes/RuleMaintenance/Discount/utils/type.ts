export type Operate = 'view' | 'update' | 'history' | 'readOnly';

export enum StatusColorMap {
  UN_PUBLISHED = 'warn',
  PUBLISHED = 'green',
  DISABLED = 'error',
  WAITING_APPROVAL = 'warn'
};
