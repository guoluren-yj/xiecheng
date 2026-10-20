import intl from 'utils/intl';

// 获取操作icon
const defaultIcon = 'check';
export const operationIconMap = {
  NEW: 'add', // 新建
  FEEDBACKED: 'check_circle', // 待确认
  CONFIRMED: 'authorize', // 已确认
  RETURNED: 'reply', // 已退回
  FUNC_RETURN: 'reply', // 已退回
  APPROVE: 'authorize', // 已审批
  PUBLISHED: 'publish2', // 待反馈
  RELEASE_APPROVING: 'check', // 审批中(发布)
  CONFIRM_APPROVING: 'check', // 审批中(确认)
  RELEASE_REJECT: 'authorize', // 审批拒绝(发布)
  CONFIRM_REJECT: 'authorize', // 审批拒绝(确认)
  FEEDBACK_APPROVED: 'authorize', // 反馈审批通过
  FEEDBACK_REJECTED: 'authorize', // 反馈审批拒绝
  NEW_APPROVED: 'authorize', // 新建审批通过
  NEW_REJECTED: 'authorize', // 新建审批拒绝
  WFL_APPROVE: 'authorize', // 工作流审批通过
  WFL_REJECT: 'authorize', // 工作流审批拒绝
  CONFIRM_REJECTED: 'authorize', // 审批拒绝
  FEEDBACKED_NEW: 'add', // 新建反馈
  CLOSED: 'not_interested', // 已关闭
  APPROVING: 'check', // 审批中
  CANCEL_SUBMIT: 'reply', // 撤销
  SCORE_CANCEL: 'reply', // 撤回评分
  RELEASE: 'publish2', // 发布
  SUBMIT: 'check', // 提交
  REJECT: 'authorize', // 拒绝
  SUBMIT_APPROVE: 'check', // 提交工作流审批
  DOC_FORWARD: 'call_missed_outgoing', // 转交
  EVALUATE: 'check', // 执行评分
  FINAL_COLLECT: 'bar_chart', // 汇总统计
  PUBLISH: 'publish2', // 发布
  WAITINGREJECTED: 'check', // 提交反馈
  APPROVED: 'authorize', // 审批通过
  FINISHED: 'authorize',
  DISCARD: 'cancel', // 废弃
  'FINISHED@EXT': 'authorize', // 外部系统审批通过
  'FINISHED@WFL': 'authorize', // 工作流审批通过
  'FINISHED@SELF': 'authorize',
  'FINISHED@FUNC': 'authorize',
  'REJECTED@EXT': 'authorize', // 外部系统审批拒绝
  'REJECTED@WFL': 'authorize', // 工作流审批拒绝
  'REJECTED@SELF': 'authorize',
  'REJECTED@FUNC': 'authorize',
  'APPROVING@WFL': 'check',
  'APPROVING@EXT': 'check',
  'APPROVING@SELF': 'check',
  'APPROVING@FUNC': 'check',
  APPEAL_APPROVALING: 'check',
  REJECTED: 'authorize', // 审批拒绝
  BACK_SCORE: 'reply', // 退回评分
  WITHDRAW: 'reply', // 撤销
  CANCEL: 'cancel', // 取消
  FEEDBACK: 'record_test', // 反馈
  BACK: 'reply', // 已退回
  SUBMITTED: 'check', // 已提交
  FINAL_COLLECTED: 'inventory', // 汇总完成
  ABANDON: 'cancel', // 废弃
  COMPLETED: 'publish2', // 完成
  TRANSFORM: 'call_missed_outgoing', // 转交
  APPEALING: 'check', // 提交申诉
  APPEAL_PUBLISHED: 'publish2', // 申诉发布
  DEFAULT: defaultIcon,
  NEW_SUBMIT: 'check', // 新建提交审批
  FEEDBACK_SUBMIT: 'check', // 提交汇总信息审批
  APPEAL: 'drive_file_rename_outline-o', // 申诉
  OBSOLETED: 'cancel', // 已废弃
  CANCEL_LINE: 'cancel',
  CANCEL_ALL: 'cancel',
  WAIT_CONFIRMED: 'check', // 待审批
  WAIT_TENANT_CONFIRMED: 'check', // 待租户确认
  CONFIRMING: 'check', // 租户审批中
  FUNC_REJECTED: 'close', // 拒绝
  FUNC_APPROVE: 'check', // 同意
  FUNC_SUBMIT: 'check', // 提交审批
  WAIT_APPROVED: 'check', // 待平台审批
  FILLING_SUBMITTED: 'check', // 提交
  FILLING_REJECTED: 'authorize', // 审批拒绝
  FILLING_APPROVED: 'authorize', // 审批通过
  FILLING_CANCEL_SUBMIT: 'reply', // 撤销
  CHANGE: 'mode_edit', // 变更
  UPDATE: 'mode_edit', // 修改
  RE_EVALUATE: 'update', // 重新计算
  NEW_APPROVING: 'check', // 新建提交审批
  ROLLBACK: 'reply', // 撤销审批
};

// 获取时间轴的颜色
export const getTimelineColor = processStatus => {
  const rejectedFlag = getRejectedStatus(processStatus);
  const approvedFlag = getApprovedStatus(processStatus);
  if (rejectedFlag) {
    return '#F56349';
  } else if (approvedFlag) {
    return '#47B881';
  } else {
    return '#E5E5E5';
  }
};

// 获取操作文本颜色
export const getOperationColor = () => {
  return 'rgba(0,0,0,0.65)';
};

// 渲染操作人
export const getOperationUser = data => {
  const { processUserName, createUser, realName, operatedName } = data;
  const userName = processUserName || createUser || realName || operatedName || '-';
  return userName;
};

// 渲染操作
export const getOperation = data => {
  const {
    processStatusMeaning,
    processTypeMeaning,
    operationMeaning,
    operationCodeMeaning,
    optionStatusMeaning,
  } = data;
  const operation =
    optionStatusMeaning ||
    processStatusMeaning ||
    processTypeMeaning ||
    operationMeaning ||
    operationCodeMeaning;
  return operation || '-';
};

// 渲染操作记录操作类型
export const getOperationType = operationType => {
  switch (operationType) {
    case 'INVESTIGATE':
      return intl.get('sslm.common.view.message.investg').d('调查表');
    case 'SAMPLE_SEND_REQ':
      return intl.get('sslm.common.view.message.sample').d('送样申请');
    case 'SITE_EVAL':
    case 'SITE_EVAL_SUBMIT':
      return intl.get('sslm.common.view.message.siteReport').d('现场考察报告');
    case 'REPORT_EVAL':
    case 'REPORT_EVAL_SUBMIT':
      return intl.get('sslm.common.view.message.siteReportNew').d('评估报告');
    case 'EVAL_MANAGE':
    case 'KPI_EVAL':
      return intl.get('sslm.common.view.message.evaluation').d('绩效考评');
    case 'simpleSupplier':
      return intl.get('sslm.common.view.message.simpleSupplier').d('简易供应商');
    case 'expandAbility':
      return intl.get('sslm.common.view.message.expandAbility').d('拓展中供货能力');
    case 'SUPPLIER_ENTRY':
      return intl.get('sslm.common.view.message.supplierEntry').d('供应商录入');
    case 'ENTERPRISE_APPROVAL_PLATFORM':
      return intl.get('sslm.common.view.message.certificationApproval').d('注册企业审批');
    case 'ENTERPRISE_APPROVAL_TENANT':
      return intl.get('sslm.common.view.message.enterpriseCertificationApproval').d('企业认证审批');
    case 'SUPPLIER_INFO_CHANGE':
      return intl.get('sslm.common.view.message.supplierInform').d('供应商信息变更');
    case 'ENTERPRISE_PLATFORM_CONFIRM':
      return intl.get('sslm.common.view.message.enterpriseTenantConfirm').d('企业信息变更确认');
    case 'ENTERPRISE_TENANT_CONFIRM':
      return intl.get('sslm.common.view.message.enterpriseChange').d('企业信息变更');
    case 'SUPPLIER_INVESTIGATION_WORKBENCH':
      return intl.get('sslm.common.view.message.investg').d('【调查表】');
    case 'EVAL_PLAN':
      return intl.get('sslm.vendorEvaluationPlan.view.message.supplierEvalPlan').d('评估计划');
    case 'LIFE_CYCLE_MANAGE':
      return intl.get('sslm.lifeCycleManage.view.message.lifeCycleApplication').d('生命周期申请单');
    case 'KPI_EVAL_SUBMIT':
    case 'EVAL_MANAGE_SUBMIT':
      return intl.get('sslm.common.model.field.score').d('评分');
    case 'SUPPLY_ABILITY_MANAGE':
      return intl.get('sslm.common.view.message.supply_ability_manage').d('供货能力清单');
    case 'QUOTA_APPLICATION':
      return intl.get('sslm.common.view.message.quotaManage').d('配额申请单');
    case 'SUPPLY_ABILITY_CHANGE_REQ':
      return intl.get('sslm.common.view.message.supplyAbilityDoc').d('供货能力申请单');
    case 'MEMBER_SUPPLIER':
      return intl.get('sslm.common.view.message.memberSupplierInfo').d('会员供应商信息');
    default:
      return '-';
  }
};

// 渲染操作备注
export const getOperationRemark = data => {
  const { processRemark, approveRemark, remark, operatedRemark } = data;
  const operationRemark = processRemark || approveRemark || remark || operatedRemark;
  return operationRemark;
};

// 渲染操作时间
export const getOperationTime = data => {
  const { processedDate, processDate, lastUpdateDate, operatedDate, creationDate } = data;
  const operationTime =
    processDate || processedDate || lastUpdateDate || operatedDate || creationDate || '-';
  return operationTime;
};

// 获取审批中状态
export const getSubmitStatus = processStatus => {
  const submitStatus = [
    'CONFIRMING',
    'SUBMITTED',
    'SUBMIT_APPROVE',
    'CONFIRM_APPROVING',
    'RELEASE_APPROVING',
    'SUBMIT',
    'FEEDBACK',
    'FEEDBACKED',
    'APPROVING',
    'FUNC_SUBMIT',
    'APPROVING@EXT',
    'APPROVING@WFL',
    'APPROVING@SELF',
    'APPROVING@FUNC',
    'NEW_SUBMIT',
    'FEEDBACK_SUBMIT',
    'FILLING_SUBMITTED',
    'FILLING_CANCEL_SUBMIT',
    'FUNC_RETURN',
    'APPEAL_APPROVALING',
    'WAIT_TENANT_CONFIRMED',
  ].includes(processStatus);
  return submitStatus;
};

// 获取通过状态
export const getApprovedStatus = processStatus => {
  const approvedStatus = [
    'FEEDBACK_APPROVED',
    'APPROVE',
    'APPROVED',
    'NEW_APPROVED',
    'WFL_APPROVE',
    'CONFIRMED',
    'PUBLISH',
    'PUBLISHED',
    'Approved',
    'FINISHED',
    'FINISHED@EXT',
    'FINISHED@WFL',
    'FINISHED@SELF',
    'FINISHED@FUNC',
    'COMPLETED',
    'RELEASE',
    'FILLING_APPROVED',
    'APPEAL_PUBLISHED',
    'APPROVE_WFL',
  ].includes(processStatus);
  return approvedStatus;
};

// 获取拒绝状态
export const getRejectedStatus = processStatus => {
  const rejectedStatus = [
    'REJECT',
    'RELEASE_REJECT',
    'CONFIRM_REJECT',
    'REJECTED',
    'FEEDBACK_REJECTED',
    'NEW_REJECTED',
    'WFL_REJECT',
    'Rejected',
    'REJECTED@EXT', // 外部系统审批拒绝
    'REJECTED@WFL', // 工作流审批拒绝
    'REJECTED@SELF',
    'REJECTED@FUNC',
    'CANCEL',
    'FILLING_REJECTED',
    'CONFIRM_REJECTED', // 功能审批拒绝
    'REJECTED_WFL',
  ].includes(processStatus);
  return rejectedStatus;
};
