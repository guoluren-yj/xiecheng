export type Operate = 'view' | 'edit' | 'check' | 'create' | 'pending' | 'open' | 'close';

// eslint-disable-next-line no-shadow
export enum ActiveKey {
  ProjectAll = 'project-all', // 项目视图-全部
  ProjectProgress = 'project-progress', // 项目视图-进行中
};

const {
  ProjectAll,
  ProjectProgress,
} = ActiveKey;


export const ActionType: Record<ActiveKey, string> = {
  [ProjectAll]: 'ALL',
  [ProjectProgress]: 'PROCESSING',
};

// 项目视图列表 个性化编码
export const ProjectListCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUMMARY_SUP.PROJECT_GRID_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH_SUMMARY_SUP.PROJECT_GRID_PROGRESS',
};

// 项目视图列表  查询个性化编码
export const ProjectSearchCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUMMARY_SUP.PROJECT_SEARCH_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH_SUMMARY_SUP.PROJECT_SEARCH_PROGRESS',
};

// eslint-disable-next-line no-shadow
export enum TagColor {
  CANCELED = 'gray',
  NEW = 'yellow',
  PUBLISHED = 'green',
  PUBLISH_REJECTED = 'red',
  PUBLISH_COMFIRMING = 'yellow',
  PUBLISH_COMFIRM_WORKFLOW = 'yellow',
  CLOSE_COMFIRM_FUNCTION = 'yellow',
  CLOSE_COMFIRM_WORKFLOW = 'yellow',
  NOT_STARTED = 'gray',
  IN_PROGRESS = 'yellow',
  CLOSED = 'gray',
  CLOSED_REJECTED = 'red',
  CLOSE_APPROVAL = 'yellow',
  UNUPLOADED = 'yellow',
  COMPLETED = 'green',
  SUBMITTED = 'green',
  REJECTED = 'red',
}

// 标签组
export const ListTabsCustCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_SUP.TABS';

// 项目视图详情个性化
export const DetailProjectFormCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.BASIC_INFO';
// 零件清单
export const DetailProjectPartDetailCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.PART_DETAIL_GRID';
// 零件列表
export const DetailProjectPartListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.PART_GRID_LIST';
// 项目计划
export const DetailProjectStageListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.STAGE_GRID';
// 交付物清单
export const DetailProjectDocListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.DOCUMENT_GRID';

export const DetailBtnCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.BTNS';

// 交付物视图详情
export const DetailDocumentCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.DOCUMENT_INFO';
// 交付物视图详情附件
export const DetailDocumentAttachCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.DOCUMENT_ATTACHMENT_INFO';

// 折叠面板
export const DetailCollapse = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL_SUP.COLLAPSE';

// 交付物上传目录
export const documentUploadBucket = 'sqam-ppap-deliver';
