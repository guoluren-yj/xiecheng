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
      return '#47B881';
    case 'Rejected':
    case 'REJECT':
    case 'RELEASE_REFUSED':
    case 'CHECK_REFUSED':
      return '#F56349';
    default:
      return '#E5E5E5';
  }
};

const renderOperationDesc = (item) => {
  const { processOperation } = item || {};

  let desc = '';
  switch (processOperationDescMap[item.processOperation]) {
    case 'operation':
      desc = `${intl.get('ssrc.common.view.message.changeDescription').d('变更说明')}`;
      if (['START_QUOTATION', 'BARGAIN_START'].includes(item.processOperation)) {
        desc = `${intl.get('ssrc.common.view.message.startDescription').d('发起原因')}`;
      }
      if (['CLOSE'].includes(item.processOperation)) {
        desc = `${intl.get('ssrc.common.view.message.closeReason').d('关闭理由')}`;
      }
      if (['BIDDING_PAUSE'].includes(item.processOperation)) {
        desc = `${intl.get('ssrc.common.view.message.pauseReason').d('暂停理由')}`;
      }
      if (['BIDDING_RESUME'].includes(item.processOperation)) {
        desc = `${intl.get('ssrc.common.view.message.resumeReason').d('开启理由')}`;
      }
      if (['ROLL_BACK'].includes(item.processOperation)) {
        desc = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.checkRollbackRemark`)
          .d('退回理由')}`;
      }
      if (['BIDDING_PROHIBIT_PRICE'].includes(processOperation)) {
        desc = `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingHallForbiddenRemark`)
          .d('禁止理由')}`;
      }
      if (['EVALUATE_OPENER_CLOSED'].includes(item.processOperation)) {
        desc = `Reason for rejection`; /** ********* 万国数据新增评分结果确认页面否决原因-勿动!!! *********** */
      }
      if (['CUX_UPGRADE'].includes(item.processOperation)) {
        desc = `Reason`; /** ********* 万国数据升版动作记录-勿动!!! *********** */
      }
      break;
    case 'approval':
      desc = `, ${intl.get('ssrc.common.view.message.approvalResult').d('审批结果为')}`;
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

const getProcessOperationAction = (
  operation,
  processSystemCode,
  realName,
  operationMeaning,
  dataType = '',
  rfTitle = '',
  rfx = {},
  actionExpandParam = {},
  actionSurplusPayload = {}
) => {
  const {
    bidFlag = false,
    documentTypeName = intl.get('ssrc.common.view.message.rfx').d('询价单'),
    sourceCategoryName = intl.get('ssrc.common.inquiryPrice').d('询价'),
    quotationName = intl.get('ssrc.common.model.common.quotation').d('报价'),
    checkPriceName = intl.get('ssrc.common.view.message.nuclearPrice').d('核价'),
    biddingTypeName = intl.get('ssrc.common.view.message.biddingSheet').d('竞价单'),
  } = rfx;
  const { secondarySourceCategory, processRemark = '', opener = '', cuxMap = {} } =
    actionSurplusPayload || {};
  const realNameTitle = `{realName} ({loginName}) `;
  let rfxTitle;
  if (dataType === 'rf') {
    rfxTitle = `【${rfTitle}】`;
  } else if (secondarySourceCategory === 'RFA') {
    rfxTitle = `【${biddingTypeName}】`;
  } else {
    rfxTitle = `【${documentTypeName}】`;
  }

  const { expertName = '', supplierCompanyName = '' } = actionExpandParam || {};

  const processOperationActionMap = {
    CREATE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.createAction').d('新建了'),
      rfxTitle,
    ], // 新建
    CANCEL: [
      realNameTitle,
      intl.get('ssrc.common.view.message.cancelAction').d('取消了'),
      rfxTitle,
    ], // 取消
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
    ], // 退回
    ROLLBACK_TO_CHECK: [
      realNameTitle,
      intl.get('ssrc.common.view.message.launchAction').d('发起了'),
      `【${intl.get('ssrc.common.view.message.rollbackToCheckAction').d('退回至确定入围名单')}】`,
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
    ROUND: [
      realNameTitle,
      intl.get('ssrc.common.view.message.against').d('针对'),
      rfxTitle,
      intl
        .get(`ssrc.common.view.message.roundAction`, {
          sourceCategoryName,
        })
        .d(`发起再次{sourceCategoryName}`),
    ], // 再次询价
    CLOSE: [realNameTitle, intl.get('ssrc.common.view.message.closeAction').d('关闭了'), rfxTitle], // 关闭
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
    SUBMIT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl
        .get(`ssrc.common.view.message.commonCheckPriceResult`, { checkPriceName })
        .d('{checkPriceName}结果')}】`,
    ], // 核价提交
    FINISH: [realNameTitle, operationMeaning], // 完成
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
    IMPORT_SCORE: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}${realName}】`,
      intl.get('ssrc.common.view.message.importScoreAction').d('代录入了'),
      intl
        .get('ssrc.common.view.message.importScoreResult', { expert: processRemark })
        .d('【专家{expert}】的【评分结果】'),
    ], // 代录入
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
    SCORING: [
      `【${
        !bidFlag
          ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
          : intl.get('ssrc.common.view.message.BIDCreator').d('招标员')
      }{realName}】`,
      intl.get('ssrc.common.view.message.executeAction').d('进行了'),
      `【${intl.get('ssrc.common.view.message.releaseExpertScoring').d('下发专家评分')}】`,
    ], // 下发专家评分
    BEGIN_PRETRIAL: [realNameTitle, operationMeaning], // 开始初审
    BEGIN_CHECK: [realNameTitle, operationMeaning], // 开始核价
    SUBMIT_SCORE: [
      dataType === 'rf'
        ? `【${intl.get('ssrc.common.view.message.expert').d('专家')}${realNameTitle}】`
        : `【${intl.get('ssrc.common.view.message.expert').d('专家')}{realName}】`,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.scoringResult').d('评分结果')}】`,
    ], // 提交评分
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
    PRE_EVALUATION_PENDING: [
      dataType === 'rf'
        ? realNameTitle
        : `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}{realName}】`,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.recommendCandi').d('推荐候选人')}】`,
    ], // 推荐候选人
    RESCORING: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}{realName}】`,
      intl.get('ssrc.common.view.message.backAction').d('退回了'),
      `【${intl.get('ssrc.common.view.message.scoreResultAll').d('全部评分结果')}】`,
    ], // 全部重新评分
    RESCORING_PART: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}{realName}】`,
      intl.get('ssrc.common.view.message.backAction').d('退回了'),
      intl
        .get('ssrc.common.view.message.scoreResultPart', { expertName, supplierCompanyName })
        .d('【专家{expertName}】对【{supplierCompanyName}供应商】的【评分结果】'),
    ], // 部分重新评分
    RESCORING_EXPERT: [
      `【${intl.get('ssrc.common.view.message.expert').d('专家')}{realName}】`,
      intl.get('ssrc.common.view.message.backAction').d('退回了'),
      intl
        .get('ssrc.common.view.message.scoreResultExpert', { supplierCompanyName })
        .d('对【{supplierCompanyName}供应商】的【评分结果】'),
    ], // 专家重新评分
    END_SCORE: [
      `${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}({realName}) `,
      intl.get('ssrc.common.view.message.operateAction').d('操作了'),
      processRemark,
    ] /** ********* 安琪酵母新增结束评分-勿动!!! *********** */,
    EVALUATE_OPENER_CLOSED: [
      realNameTitle,
      'rejected the bidding during the TEC Confirmation process',
    ] /** ********* 万国数据新增评分结果确认页面否决-勿动!!! *********** */,
    EVALUATE_OPENER_CONFIRM: [
      realNameTitle,
      'confirmed the bidding during the TEC Confirmation process',
    ] /** ********* 万国数据新增评分结果确认页面确认-勿动!!! *********** */,
    EVALUATE_FINISH_LEADER: [
      realNameTitle,
      'has sent a TEC Confirmation message to ',
      opener,
    ] /** ********* 万国数据技术最终确认提交-勿动!!! *********** */,
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
    ROLL_BACK: [
      realNameTitle,
      intl.get('ssrc.common.view.message.startAction').d('发起了'),
      `【${intl
        .get('ssrc.common.view.message.commonRollBackCheckPrice', { checkPriceName })
        .d('退回至{checkPriceName}')}】`,
    ], // 退回至核价
    HAND_SCORE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.handleAction').d('下发了'),
      `【${intl.get('ssrc.common.view.message.expertScoring').d('专家评分')}】`,
    ], // 下发专家评分
    QUOTATION_END: [realNameTitle, operationMeaning], // 结束报价
    EVALUATE_FINISH: [realNameTitle, operationMeaning], // 评分完成
    BID_EVALUATION_PENDING: [
      dataType === 'rf'
        ? `【${intl
            .get('ssrc.common.view.message.scoringLeader')
            .d('评分负责人')}${realNameTitle}】`
        : `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}{realName}】`,
      intl.get('ssrc.common.view.message.submitAction').d('提交了'),
      `【${intl.get('ssrc.common.view.message.scoringResultSummary').d('评分结果汇总')}】`,
    ], // 评分汇总
    OPEN_DELIVER: [realNameTitle, operationMeaning], // 开标员转交
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
    QUOTATION_NED: [
      realNameTitle,
      intl.get('ssrc.common.view.message.endAction').d('结束了'),
      quotationName,
    ],
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
    DEFAULT: [realNameTitle],
    BIDDING_RESUME: [
      realNameTitle,
      intl.get('ssrc.common.view.message.resumeAction').d('开启了'),
      rfxTitle,
    ],
    BIDDING_PAUSE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.pauseAction').d('暂停了'),
      rfxTitle,
    ],
    BIDDING_START_TRIAL_BIDDING: [
      realNameTitle,
      intl.get('ssrc.common.view.message.resumeAction').d('开启了'),
      `【${intl.get('ssrc.common.view.message.trialBidding').d('试竞价')}】`,
    ],
    BIDDING_START_BIDDING: [
      realNameTitle,
      intl.get('ssrc.common.view.message.resumeAction').d('开启了'),
      `【${intl.get('ssrc.common.view.message.formalBidding').d('正式竞价')}】`,
    ],
    BIDDING_START_SUPPLEMENT_PRICE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.resumeAction').d('开启了'),
      `【${intl.get('ssrc.common.view.message.supplementPrice').d('补充单价')}】`,
    ],
    BIDDING_END_SUPPLEMENT_PRICE: [
      // RFX2023071700025
      realNameTitle,
      intl.get('ssrc.common.view.message.endAction').d('结束了'),
      `【${intl.get('ssrc.common.view.message.supplementPrice').d('补充单价')}】`,
    ],
    SUBMIT_BID_ANNOUNCEMENT: [
      realNameTitle,
      intl.get('ssrc.common.view.message.releaseAction').d('发布了'),
      `【${intl.get('ssrc.common.model.common.bidAnnouncement').d('唱标')}】`,
    ], // 唱标
    SECOND_OPEN: [
      realNameTitle,
      intl.get('ssrc.common.view.message.executeAction').d('进行了'),
      ` 【${operationMeaning}】`,
    ], // 二开操作记录补充字典-二阶段开标
    RETURN_SUMMARY: [
      `【${intl.get('ssrc.common.view.message.scoringLeader').d('评分负责人')}${realName}】`,
      intl.get('ssrc.common.view.message.operateAction').d('操作了'),
      `【${operationMeaning}】`,
    ],
    CUX_UPGRADE: [
      realNameTitle,
      'generated a new version for',
      rfxTitle,
    ] /** ********* 万国数据升版动作记录-勿动!!! *********** */,
    /** ********* start 阅文三期跳过动作记录-勿动!!! *********** */
    SKIP_EXPERT: [
      realNameTitle,
      intl
        .get('ssrc.common.view.message.skipExpert', {
          expandParam: actionSurplusPayload?.item?.expandParam,
        })
        .d('在{expandParam}评分环节操作跳过了'),
      processRemark,
    ],
    RETURN_PREQUEL: [
      realNameTitle,
      intl.get('ssrc.common.view.message.returnPrequel').d('退回了预审文件'),
    ], // 退回了预审文件
    // 竞价大厅-删除最新报价 张三删除了【xxx供应商】的最新报价
    BIDDING_DELETE_PRICE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.hasDeleted').d('删除了'),
      intl
        .get('ssrc.common.view.message.hasDeletedBiddingOfSupplierQuoted', {
          supplierName: supplierCompanyName || ' ',
        })
        .d('{supplierName}】的最新报价'),
    ],
    // 竞价大厅-禁止报价 张三禁止了【xxx供应商】报价
    BIDDING_PROHIBIT_PRICE: [
      realNameTitle,
      intl.get('ssrc.common.view.message.hasForbidden').d('禁止了'),
      intl
        .get('ssrc.common.view.message.hasForbiddenBiddingOfSupplierQuoted', {
          supplierName: supplierCompanyName || ' ',
        })
        .d('【{supplierName}】报价'),
    ],
    /** ********* end 阅文三期跳过动作记录-勿动!!! *********** */
    ...(cuxMap || {}),
  };
  return processOperationActionMap[operation] || processOperationActionMap.DEFAULT;
};

export { getComputedColor, renderOperationDesc, getComputedRegExpValue, getProcessOperationAction };
