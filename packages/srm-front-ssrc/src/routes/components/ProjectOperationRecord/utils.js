/**
 * 通用工具类
 * @date: 2021-07-29
 */
import intl from 'utils/intl';

import { processOperationDescMap } from './constants';

const getComputedColor = (action) => {
  switch (action) {
    case 'Approved':
    case 'APPROVE':
    case 'RELEASE_APPROVED':
    case 'CHECK_APPROVED':
    case 'ALTER_APPROVE':
      return '#47B881';
    case 'Rejected':
    case 'REJECT':
    case 'RELEASE_REFUSED':
    case 'CHECK_REFUSED':
    case 'ALTER_REJECT':
      return '#F56349';
    default:
      return '#E5E5E5';
  }
};

const renderOperationDesc = (item) => {
  let desc = '';
  switch (processOperationDescMap[item.processOperation]) {
    case 'operation':
      desc = `${intl.get('ssrc.projectSetup.model.projectSetup.prejectRemark').d('项目说明')}:`;
      if (['CUX_CANCEL'].includes(item.processOperation)) {
        desc = `Invalid Reason`; /** ********* 万国数据采购员点击【作废】按钮-勿动!!! *********** */
      }
      if (['CUX_RETURNED'].includes(item.processOperation)) {
        desc = `Return Reason`; /** ********* 万国数据技术人员点击【退回Return to Purchaser】-勿动!!! *********** */
      }
      if (['CUX_UPGRADE', 'CUX_CHANGE'].includes(item.processOperation)) {
        desc = `Reason`; /** ********* 万国数据升版动作、变更动作记录-勿动!!! *********** */
      }
      break;
    case 'approval':
      desc = `, ${intl.get('ssrc.common.view.message.approvalResult').d('审批结果为')}: `;
      break;
    default:
      break;
  }
  return desc;
};

// 渲染RF的外部审批和工作流审批描述
const renderApproveNode = (
  processSystemCode,
  realNameTitle,
  rfxTitle,
  status = 'approved',
  loginName = ''
) => {
  if (!processSystemCode) {
    if (status === 'approved') {
      return [intl.get('ssrc.common.view.message.workflowApproved').d('工作流审批通过')];
    } else {
      return [intl.get('ssrc.common.view.message.workflowRejected').d('工作流审批拒绝')];
    }
  }
  const result =
    status === 'approved'
      ? intl.get('ssrc.common.view.message.approved').d('通过')
      : intl.get('ssrc.common.view.message.rejected').d('拒绝');
  switch (processSystemCode) {
    case 'SRM':
      return status === 'approved'
        ? [intl.get('ssrc.common.view.message.workflowApproved').d('工作流审批通过')]
        : [intl.get('ssrc.common.view.message.workflowRejected').d('工作流审批拒绝')];
    case 'OA':
      if (!loginName) {
        return status === 'approved'
          ? [intl.get('ssrc.common.view.message.externalSystemApproved').d('外部系统审批通过')]
          : [intl.get('ssrc.common.view.message.externalSystemRejected').d('外部系统审批拒绝')];
      } else {
        return [
          realNameTitle,
          `${intl.get('ssrc.common.view.message.finallyApproved').d('最终审批了')}`,
          rfxTitle,
          `，${intl.get('ssrc.common.view.message.resultApproved').d('审批结果为')}:`,
          `【${result}】`,
        ];
      }
    default:
      return [
        realNameTitle,
        `${intl.get('ssrc.common.view.message.finallyApproved').d('最终审批了')}`,
        rfxTitle,
        `，${intl.get('ssrc.common.view.message.resultApproved').d('审批结果为')}:`,
        `【${result}】`,
      ];
  }
};

const getComputedRegExpValue = (value, item) => {
  const mappings = value?.match(/{([^{}]*)}/g);
  if (!mappings) return value;
  let newValue = value;
  mappings.forEach((mappingItem) => {
    const key = mappingItem.match(/{([^{}]*)}/)[1];
    newValue = newValue.replace(mappingItem, item[key]);
  });
  return newValue;
};

// 若修改getProcessOperationAction的参数，请关注下接口查询的地方也有这个方法需要处理
const getProcessOperationAction = (record) => {
  const {
    realName,
    sourceNum,
    sourceNode,
    sourceTitle,
    sourceCategory,
    processOperation,
    sourceProjectNum,
    processSystemCode,
    sourceProjectTitle,
    sourceCategoryMeaning,
    projectLineSectionName,
    processOperationMeaning,
  } = record;

  const sourceFlag = sourceNode === 'SOURCING' || (sourceNode === 'FINISHED' && sourceCategory);
  const sourceTitleFlag = sourceFlag ? sourceTitle : sourceProjectTitle;

  const realNameTitle = projectLineSectionName
    ? `{realName} ({loginName}) ${intl
        .get('ssrc.common.view.message.base')
        .d('基于标段')} {projectLineSectionName} `
    : `{realName} ({loginName}) `;
  const rfxTitle = `【 ${
    sourceCategoryMeaning
      ? `${
          sourceCategory.indexOf('BID') > -1
            ? intl.get('ssrc.common.view.message.bid').d('招标书')
            : sourceCategoryMeaning
        }:`
      : ''
  }  ${sourceFlag ? sourceNum : sourceProjectNum}  ${
    sourceTitleFlag ? `- ${sourceFlag ? sourceTitle : sourceProjectTitle}` : ''
  } 】`;

  const processOperationActionMap = {
    CREATE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.createAction').d('新建了'),
      rfxTitle,
    ], // 新建
    CANCEL: [
      realNameTitle,
      intl.get('ssrc.common.view.message.canceledAction').d('作废了'),
      rfxTitle,
    ], // 提交
    SUBMIT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      rfxTitle,
    ], // 提交变更
    SUBMIT_ALTER: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitChangeAction').d('提交变更了'),
      rfxTitle,
    ], // 取消
    // ALTER_APPROVE: [
    //   realNameTitle,
    //   intl.get('ssrc.common.view.message.changedApproval').d('变更审批通过了'),
    //   rfxTitle,
    // ],
    // ALTER_REJECT: [
    //   realNameTitle,
    //   intl.get('ssrc.common.view.message.changedReject').d('变更审批拒绝了'),
    //   rfxTitle,
    // ],
    ALTER_APPROVE: renderApproveNode(
      processSystemCode,
      realNameTitle,
      rfxTitle,
      'approved',
      realName
    ), // 确定供应商审批通过
    ALTER_REJECT: renderApproveNode(
      processSystemCode,
      realNameTitle,
      rfxTitle,
      'rejected',
      realName
    ), // 发布审批拒绝
    ALTER: [realNameTitle, intl.get('ssrc.common.view.message.changed').d('变更了'), rfxTitle],
    ISSUE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      rfxTitle,
    ], // 发布
    RELEASE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      rfxTitle,
    ], // 发布
    RELEASE_REVOKE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.revokeAction').d('撤回了'),
      rfxTitle,
    ], // 发布审批撤回
    RELEASE_APPROVED: renderApproveNode(
      processSystemCode,
      realNameTitle,
      rfxTitle,
      'approved',
      realName
    ), // 发布审批通过
    CHECK_APPROVED: renderApproveNode(
      processSystemCode,
      realNameTitle,
      `【${intl.get('ssrc.common.view.message.qualifiersList').d('入围名单')}】`,
      'approved',
      realName
    ), // 确定供应商审批通过
    RELEASE_REFUSED: renderApproveNode(
      processSystemCode,
      realNameTitle,
      rfxTitle,
      'rejected',
      realName
    ), // 发布审批拒绝
    CHECK_REFUSED: renderApproveNode(
      processSystemCode,
      realNameTitle,
      `【${intl.get('ssrc.common.view.message.qualifiersList').d('入围名单')}】`,
      'rejected',
      realName
    ), // 确定供应商审批拒绝
    CHECK: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      `【${intl.get('ssrc.common.view.message.qualifiersList').d('入围名单')}】`,
    ], // 确定供应商
    CHECK_REVOKE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.revokeAction').d('撤回了'),
      `【${intl.get('ssrc.common.view.message.qualifiersList').d('入围名单')}】`,
    ], // 确定供应商审批撤回
    REJECT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.approveAction').d('最终审批了'),
      rfxTitle,
    ], // 发布审批拒绝
    APPROVE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.approveAction').d('最终审批了'),
      rfxTitle,
    ], // 发布审批通过
    PAUSE: [realNameTitle, intl.get('ssrc.common.view.message.pauseAction').d('暂停了'), rfxTitle], // 暂停
    PAUSE_START: [
      realNameTitle,
      intl.get('ssrc.common.view.message.pauseStartAction').d('启用了'),
      rfxTitle,
    ], // 启用
    CLOSED: [realNameTitle, intl.get('ssrc.common.view.message.closeAction').d('关闭了'), rfxTitle], // 关闭
    ADJUST_TIME: [
      realNameTitle,
      intl.get('ssrc.common.view.message.adjustTimeAction').d('进行了时间调整'),
    ], // 时间调整
    ADJUST_ATTACHMENT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.adjustAttachmentAction').d('进行了附件调整'),
    ], // 附件调整
    ADD_SUPPLIER: [
      realNameTitle,
      intl.get('ssrc.common.view.message.addSupplierAction').d('增加了供应商'),
    ], // 增加供应商
    FINISH: [
      realNameTitle,
      intl.get('ssrc.common.view.message.finishedAction').d('完成了'),
      rfxTitle,
    ], // 新建
    OPEN: [
      realNameTitle,
      intl.get('ssrc.common.view.message.executeAction').d('进行了'),
      `【${intl.get('ssrc.common.view.message.openAction').d('开标')}】`,
    ], // 开标
    PRETRIAL_SUBMIT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.pretrialResult').d('初审结果')}】`,
    ], // 初审提交
    PRETRIAL_DELIVER: [
      realNameTitle,
      intl.get('ssrc.common.view.message.deliverAction').d('转交了'),
      rfxTitle,
    ], // 初审转交
    BACK_PRETRIAL: [
      realNameTitle,
      intl.get('ssrc.common.view.message.backAction').d('退回了'),
      `【${intl.get('ssrc.common.view.message.pretrialResult').d('初审结果')}】`,
    ], // 退回至初审
    BEGIN_PRETRIAL: [realNameTitle, processOperationMeaning], // 开始初审
    BEGIN_CHECK: [realNameTitle, processOperationMeaning], // 开始核价
    EVALUATE_SUMMARY: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}${realNameTitle}】`,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.scoringResultSummary').d('评分结果汇总')}】`,
    ], // 评分结果汇总
    RFX_EVALUATION_PENDING: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}{realName}】`,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.scoringResultSummary').d('评分结果汇总')}】`,
    ], // 评分汇总
    RESCORING: [
      `【${intl.get('ssrc.common.view.message.expertGroupLeader').d('专家组长')}{realName}】`,
      intl.get('ssrc.common.view.message.backRescoring').d('退回重新评分'),
    ], // 重新评分
    START_QUOTATION: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      `【${intl.get('ssrc.common.view.message.roundQuotation').d('多轮报价')}】`,
    ], // 发布多轮报价
    BARGAIN_START: [
      realNameTitle,
      intl.get('ssrc.common.view.message.startAction').d('发起了'),
      `【${intl.get('ssrc.common.view.message.bargainOnline').d('线上议价')}】`,
    ], // 发起线上议价
    BARGAIN_FINISH: [
      realNameTitle,
      intl.get('ssrc.common.view.message.finishedAction').d('完成了'),
      `【${intl.get('ssrc.common.view.message.bargainOffline').d('线下议价')}】`,
    ], // 完成线下议价
    HAND_SCORE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.handleAction').d('下发了'),
      `【${intl.get('ssrc.common.view.message.expertScoring').d('专家评分')}】`,
    ], // 下发专家评分
    QUOTATION_END: [realNameTitle, processOperationMeaning], // 结束报价
    EVALUATE_FINISH: [realNameTitle, processOperationMeaning], // 评分完成
    OPEN_DELIVER: [realNameTitle, processOperationMeaning], // 开标员转交
    EVALUATE_DELIVER: [
      `【${intl.get('ssrc.common.view.message.expert').d('专家')}{realName}】`,
      intl.get('ssrc.common.view.message.deliverAction').d('转交了'),
      rfxTitle,
    ], // 评分员转交
    CANCELED: [
      realNameTitle,
      intl.get('ssrc.common.view.message.cancelAction').d('取消了'),
      rfxTitle,
    ], // 取消
    SEND_RFX_NOTICE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      `【${intl.get('ssrc.common.view.message.rfxNotice').d('中标公告')}】`,
    ], // 发布中标公告
    ADJUST_CONF_RULE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.ruleConfigurationAdjustment').d('进行了规则配置调整'),
    ], // 规则配置调整
    ADJUST_ADD_SUPPLIER: [
      realNameTitle,
      intl.get('ssrc.common.view.message.addSupplierAdjustment').d('进行了新增供应商'),
    ], // 新增供应商
    ADJUST_ADD_MEMBER: [
      realNameTitle,
      intl.get('ssrc.common.view.message.addMemberAdjustment').d('进行了新增寻源小组成员调整'),
    ],
    ADJUST_UPDATE_PUR: [
      realNameTitle,
      intl.get('ssrc.common.view.message.updatePurAdjustment').d('进行了修改采购员调整'),
    ],
    DOC_DELIVER: [
      realNameTitle,
      `${intl.get('ssrc.common.view.message.deliverFromAction').d('将单据由')} `,
      `${intl.get('ssrc.common.view.message.deliverToAction').d('转给了')} `,
    ],
    // DOC_DELIVER: [
    //   realNameTitle,
    //   intl
    //     .get('ssrc.common.view.message.deliverDocAction', {
    //       from: '{deliverFromUserName} ({deliverFromUserLoginName}) ',
    //       to: '{deliverToUserName} ({deliverToUserLoginName}) ',
    //     })
    //     .d('将单据由 {from}转给了 {to}'),
    // ],
    BARGAIN_CLOSE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.endAction').d('结束了'),
      `【${intl.get('ssrc.common.view.message.bargainOnline').d('线上议价')}】`,
    ], // 结束线上议价
    ADJUST_ADD_EXPERT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.addExpert').d('新增了评分专家'),
    ], // 新增评分专家
    ADJUST_ADD_INDICATE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.addIndicate').d('新增了评分要素'),
    ], // 新增评分要素
    rollBackToPreEvaluationPending: [
      realNameTitle,
      intl.get('ssrc.common.view.message.rollBackToPreEvaluationPending').d('退回推荐候选人'),
    ], // 退回推荐候选人
    UPDATE_RFX: [
      realNameTitle,
      intl.get('ssrc.common.view.message.updateRfx').d('修改了'),
      rfxTitle,
    ], // 修改了询价单
    SUBMIT_PREQUEL: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitPrequel').d('提交了预审结果'),
    ], // 提交了预审结果
    PREQUEL_RESULT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.prequelResult').d('预审结果汇总'),
    ], // 预审结果汇总
    SUBMIT_BARGAIN: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitBargain').d('进行了还价'),
    ], // 进行了还价
    SUBMIT_COMPLIANCE_CHECK: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitComplianceCheck').d('提交了符合性检查'),
    ], // 提交了符合性检查
    CONFIRM_COMPLIANCE_CHECK: [
      realNameTitle,
      intl.get('ssrc.common.view.message.confirmComplianceCheck').d('符合性检查确认'),
    ], // 符合性检查确认
    CUX_PENDING: [
      realNameTitle,
      'released the sourcing project to TEC member ',
      record?.attributeVarchar17,
    ] /** ********* 万国数据采购员立项点击提交，转交给技术人员时-勿动!!! *********** */,
    CUX_CANCEL: [
      realNameTitle,
      'invalidated the sourcing project',
      rfxTitle,
    ] /** ********* 万国数据采购员点击【作废】按钮-勿动!!! *********** */,
    CUX_RETURNED: [
      realNameTitle,
      'returned the sourcing project',
      rfxTitle,
    ] /** ********* 万国数据技术人员点击【退回Return to Purchaser】-勿动!!! *********** */,
    CUX_UPGRADE: [
      realNameTitle,
      'generated a new version for',
      rfxTitle,
    ] /** ********* 万国数据升版动作记录-勿动!!! *********** */,
    CUX_CHANGE: [
      realNameTitle,
      'generated a new version for',
      rfxTitle,
    ] /** ********* 万国数据变更记录-勿动!!! *********** */,
    DEFAULT: [realNameTitle],
  };
  return processOperationActionMap[processOperation] || processOperationActionMap.DEFAULT;
};

export {
  getComputedColor,
  renderOperationDesc,
  getComputedRegExpValue,
  getProcessOperationAction,
  renderApproveNode,
};
