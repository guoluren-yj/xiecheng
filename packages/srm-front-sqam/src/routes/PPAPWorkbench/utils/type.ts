

export type Operate = 'view' | 'edit' | 'check' | 'create' | 'pending' | 'open' | 'close' | 'change' | 'editDoc' | 'editProject' | 'editStage';

// eslint-disable-next-line no-shadow
export enum ActiveKey {
  ProjectAll = 'project-all', // 项目视图-全部
  ProjectProgress = 'project-progress', // 项目视图-进行中
  ProjectMaintain = 'project-maintain', // 项目视图-可维护
  ProjectApproval = 'project-approval', // 项目视图-待审批

  DocumentAll = 'document-all', // 交付物视图-全部
  DocumentPending = 'document-pending', // 交付物视图-待处理
  DocumentCheck = 'document-check', // 交付物视图-待审核

  StageAll = 'stage-all', // 交付物视图-全部
  StageCheck = 'stage-check', // 交付物视图-待审核
};

const {
  ProjectAll,
  ProjectProgress,
  ProjectMaintain,
  ProjectApproval,
  DocumentAll,
  DocumentPending,
  DocumentCheck,
  StageAll,
  StageCheck,
} = ActiveKey;


export const ActionType: Record<ActiveKey, string> = {
  [ProjectAll]: 'ALL',
  [ProjectProgress]: 'PROCESSING',
  [ProjectMaintain]: 'UPDATE',
  [ProjectApproval]: 'APPROVAL',
  [DocumentAll]: 'ALL',
  [DocumentPending]: 'DEAL',
  [DocumentCheck]: 'REVIEW',
  [StageAll]: 'ALL',
  [StageCheck]: 'REVIEW',
};


// 项目视图列表 个性化编码
export const ProjectListCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH.PROJECT_GRID_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH.PROJECT_GRID_PROGRESS',
  [ProjectMaintain]: 'SQAM.PPAP_WORKBENCH.PROJECT_GRID_MAINTAIN',
  [ProjectApproval]: 'SQAM.PPAP_WORKBENCH.PROJECT_GRID_APPROVAL',
};

// 项目视图列表  查询个性化编码
export const ProjectSearchCode = {
  [ProjectAll]: 'SQAM.PPAP_WORKBENCH.PROJECT_SEARCH_ALL',
  [ProjectProgress]: 'SQAM.PPAP_WORKBENCH.PROJECT_SEARCH_PROGRESS',
  [ProjectMaintain]: 'SQAM.PPAP_WORKBENCH.PROJECT_SEARCH_MAINTAIN',
  [ProjectApproval]: 'SQAM.PPAP_WORKBENCH.PROJECT_SEARCH_APPROVAL',
};

// 交付物视图列表 个性化编码
export const DocumentListCode = {
  [DocumentAll]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_GRID_ALL',
  [DocumentPending]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_GRID_PENDING',
  [DocumentCheck]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_GRID_CHECK',
};

// 交付物视图列表 查询个性化编码
export const DocumentSearchCode = {
  [DocumentAll]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_SEARCH_ALL',
  [DocumentPending]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_SEARCH_PENDING',
  [DocumentCheck]: 'SQAM.PPAP_WORKBENCH.DOCUMENT_SEARCH_CHECK',
};

// 阶段视图列表  个性化编码
export const StageListCode = {
  [StageAll]: 'SQAM.PPAP_WORKBENCH.STAGE_LIST_ALL',
  [StageCheck]: 'SQAM.PPAP_WORKBENCH.STAGE_LIST_CHECK',
};

// 阶段视图列表  个性化编码
export const StageSearchCode = {
  [StageAll]: 'SQAM.PPAP_WORKBENCH.STAGE_SEARCH_ALL',
  [StageCheck]: 'SQAM.PPAP_WORKBENCH.STAGE_SEARCH_CHECK',
};

// 标签组
export const ListTabsCustCode = 'SQAM.PPAP_WORKBENCH.TABS';

// 按钮组
export const ListTableBtnCode = 'SQAM.PPAP_WORKBENCH.BTNS';
export const DetailBtnCode = 'SQAM.PPAP_WORKBENCH_DETAIL.BTNS';

// 创建时列表查询筛选器个性化
export const CreateListCustomizeCode = {
  SearchBarCode: 'SQAM.PPAP_LIST.SEARCH_BAR',
};

// 详情页
export const ActiveKeyDetail = {
  PROJECT: 'project',
  STAGE: 'stage',
  DOCUMENT: 'document',
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
  CANCELLED = 'gray',
  NO_ALTER = 'gray',
  ALTER_APPROVE = 'yellow',
  ALREADY_ALTER = 'green',
  ALTER_REJECTED = 'red',
}

// 项目视图详情个性化
export const DetailProjectFormCode = 'SQAM.PPAP_WORKBENCH_DETAIL.BASIC_INFO';
// 零件列表
export const DetailProjectPartListCode = 'SQAM.PPAP_WORKBENCH_DETAIL.PART_GRID_LIST';
// 项目计划
export const DetailProjectStageListCode = 'SQAM.PPAP_WORKBENCH_DETAIL.STAGE_GRID';
// 交付物清单
export const DetailProjectDocListCode = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMENT_GRID';
// 交付物清单批量编辑
export const DetailProjectDocListBatchEditCode = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMENT_GRID_BATCH_EDIT';

// 交付物视图详情
export const DetailDocumentCode = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMENT_INFO';
// 交付物视图详情附件
export const DetailDocumentAttachCode = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMENT_ATTACHMENT_INFO';

// 阶段视图详情
export const DetailStageFormCode = 'SQAM.PPAP_WORKBENCH_DETAIL.STAGE_INFO';
// 阶段视图下的交付物列表
export const DetailStageDocListCode = 'SQAM.PPAP_WORKBENCH_DETAIL.STAGE_DOCUMENT_GRID';

// 折叠面板
export const DetailProjectCollapse = 'SQAM.PPAP_WORKBENCH_DETAIL.PROJECT_COLLAPSE';
export const DetailDocumentCollapse = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMNET_COLLAPSE';
export const DetailStageCollapse = 'SQAM.PPAP_WORKBENCH_DETAIL.STAGE_COLLAPSE';


// 交付物上传目录
export const documentUploadBucket = 'sqam-ppap-deliver';
// 新审批工作流阶段
export const flowBasicCardStageCode = 'SQAM.PPAP_WORKBENCH_DETAIL.STAGE_FLOW_BASIC_CARD';
export const flowBasicCardDocumentCode = 'SQAM.PPAP_WORKBENCH_DETAIL.DOCUMENT_FLOW_BASIC_CARD';
// 阵营
export const campCode = 'PURCHASER';
