// 当交付物附件上传标识=项目发布，and项目状态=已发布，and交付物状态=待提交or审核拒绝时，附件上传按钮展示
// 当交付物附件上传标识=阶段开启，and阶段状态=进行中，and交付物状态=待提交or审核拒绝时，附件上传按钮展示
export const getAttachmentUploadFlag = ({documentUploadPoint, projectStatus, documentStatus, stageStatus}: any) => {
  return (documentUploadPoint === 'PROJECT_PUBLISH' && ['PUBLISHED'].includes(projectStatus) && ['REJECTED', 'UNUPLOADED'].includes(documentStatus)) ||
  (documentUploadPoint === 'STAGE_OPEN' && ['IN_PROGRESS'].includes(stageStatus) && ['REJECTED', 'UNUPLOADED'].includes(documentStatus));
};
