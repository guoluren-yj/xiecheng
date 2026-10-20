export type Operate = 'view' | 'edit' | 'check' | 'create' | 'pending' | 'open' | 'close';

// eslint-disable-next-line no-shadow
export enum ActiveKey {
  ProjectAll = 'project-all', // 项目视图-全部
  ProjectProgress = 'project-progress', // 项目视图-进行中
  ProjectMaintain = 'project-maintain', // 项目视图-可维护
  ProjectApproval = 'project-approval', // 项目视图-待审批
};

const {
  ProjectAll,
  ProjectProgress,
  ProjectMaintain,
  ProjectApproval,
} = ActiveKey;


export const ActionType: Record<ActiveKey, string> = {
  [ProjectAll]: 'ALL',
  [ProjectProgress]: 'PROCESSING',
  [ProjectMaintain]: 'UPDATE',
  [ProjectApproval]: 'APPROVAL',
};

// 项目视图列表 个性化编码
export const ProjectListCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_GRID_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_GRID_PROGRESS',
  [ProjectMaintain]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_GRID_MAINTAIN',
  [ProjectApproval]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_GRID_APPROVAL',
};

// 项目视图列表  查询个性化编码
export const ProjectSearchCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_SEARCH_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_SEARCH_PROGRESS',
  [ProjectMaintain]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_SEARCH_MAINTAIN',
  [ProjectApproval]: 'SQAM.PPAP_WORKBENCH_SUMMARY.PROJECT_SEARCH_APPROVAL',
};

// eslint-disable-next-line no-shadow
export enum TagColor {
  CLOSE_REJECTED = 'red',
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
export const ListTabsCustCode = 'SQAM.PPAP_WORKBENCH_SUMMARY.TABS';

// 按钮组
export const ListTableBtnCode = 'SQAM.PPAP_WORKBENCH_SUMMARY.BTNS';

// 项目视图详情个性化
export const DetailProjectFormCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.BASIC_INFO';
// 零件清单
export const DetailProjectPartDetailCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.PART_DETAIL_GRID';
// 零件列表
export const DetailProjectPartListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.PART_GRID_LIST';
// 项目计划
export const DetailProjectStageListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.STAGE_GRID';
// 交付物清单
export const DetailProjectDocListCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.DOCUMENT_GRID';

export const DetailBtnCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.BTNS';

// 交付物视图详情
export const DetailDocumentCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.DOCUMENT_INFO';
// 交付物视图详情附件
export const DetailDocumentAttachCode = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.DOCUMENT_ATTACHMENT_INFO';

// 创建时列表查询筛选器个性化
export const CreateListCustomizeCode = {
  SearchBarCode: 'SQAM.PPAP_LIST.SEARCH_BAR',
};
// 折叠面板
export const DetailCollapse = 'SQAM.PPAP_WORKBENCH_SUMMARY_DETAIL.COLLAPSE';
// PPAP汇总工作台详情-

// 交付物上传目录
export const documentUploadBucket = 'sqam-ppap-deliver';
