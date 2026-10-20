/* eslint-disable no-shadow */


export type Operate = 'view' | 'edit' | 'check' | 'create' | 'pending';

export enum ActiveKey {
  ProjectAll = 'project-all', // 项目视图-全部

  DocumentAll = 'document-all', // 交付物视图-全部
  DocumentPending = 'document-pending', // 交付物视图-待处理
  DocumentCheck = 'document-check', // 交付物视图-待审核

  StageAll = 'stage-all', // 交付物视图-全部
};

const {
  ProjectAll,
  DocumentAll,
  DocumentPending,
  DocumentCheck,
  StageAll,
} = ActiveKey;


export const ActionType: Record<ActiveKey, string> = {
  [ProjectAll]: 'ALL',
  [DocumentAll]: 'ALL',
  [DocumentPending]: 'DEAL',
  [DocumentCheck]: 'REVIEW',
  [StageAll]: 'ALL',
};


// 项目视图列表 个性化编码
export const ProjectListCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUP.PROJECT_GRID_ALL',
};

// 项目视图列表  查询个性化编码
export const ProjectSearchCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH_SUP.PROJECT_SEARCH_ALL',
};

// 交付物视图列表 个性化编码
export const DocumentListCode = {
  [DocumentAll]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_GRID_ALL',
  [DocumentPending]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_GRID_PENDING',
  [DocumentCheck]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_GRID_CHECK',
};

// 交付物视图列表 查询个性化编码
export const DocumentSearchCode = {
  [DocumentAll]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_SEARCH_ALL',
  [DocumentPending]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_SEARCH_PENDING',
  [DocumentCheck]: 'SQAM.PPAP_WORKBENCH_SUP.DOCUMENT_SEARCH_CHECK',
};

// 阶段视图列表  个性化编码
export const StageListCode = {
  [StageAll]: 'SQAM.PPAP_WORKBENCH_SUP.STAGE_LIST_ALL',
};

// 阶段视图列表  个性化编码
export const StageSearchCode = {
  [StageAll]: 'SQAM.PPAP_WORKBENCH_SUP.STAGE_SEARCH_ALL',
};

// 标签组(BTNS是标签组没错)
export const ListTabsCustCode = 'SQAM.PPAP_WORKBENCH_SUP.BTNS';

// 按钮组
export const DetailBtnCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.BTNS';

// 详情页
export const ActiveKeyDetail = {
  PROJECT: 'project',
  STAGE: 'stage',
  DOCUMENT: 'document',
};

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
  CANCELLED = 'gray',
}

// 项目视图详情个性化
export const DetailProjectFormCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.BASIC_INFO';
// 零件列表
export const DetailProjectPartListCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.PART_GRID_LIST';
// 项目计划
export const DetailProjectStageListCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.STAGE_GRID';
// 交付物清单
export const DetailProjectDocListCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.DOCUMENT_GRID';

// 交付物视图详情
export const DetailDocumentCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.DOCUMENT_INFO';
// 交付物视图详情附件
export const DetailDocumentAttachCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.DOCUMENT_ATTACHMENT_INFO';

// 阶段视图详情
export const DetailStageFormCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.STAGE_INFO';
// 阶段视图下的交付物列表
export const DetailStageDocListCode = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.STAGE_DOCUMENT_GRID';

// 折叠面板
export const DetailProjectCollapse = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.PROJECT_COLLAPSE';
export const DetailDocumentCollapse = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.DOCUMNET_COLLAPSE';
export const DetailStageCollapse = 'SQAM.PPAP_WORKBENCH_SUP_DETAIL.STAGE_COLLAPSE';

export const campCode = 'SUPPLIER';
// 交付物上传目录
export const documentUploadBucket = 'sqam-ppap-deliver';

