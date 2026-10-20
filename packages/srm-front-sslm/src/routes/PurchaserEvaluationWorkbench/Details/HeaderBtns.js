import { observer } from 'mobx-react-lite';
import React, { Fragment } from 'react';
import { isNil, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { handleOpenHistoryVersion } from '@/routes/EvaluationStrategy/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import { handleRevokeApprova, handleApprove } from '@/routes/components/WorkFlowApproval';

import { handleScoringChart } from '../utils';
// import styles from '../index.less';

const tenantId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL.BASICINFO',
  'SSLM.PURCHASER_ASSESS_DETAIL.SUPPLIER_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL.COMPANY_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_RESULT',
];

const btnsPermissions = [
  {
    name: 'approval',
    code: 'srm.partner.purchaser.evaluation-workbench.button.report.detail.approval',
    meaning: '审批',
  },
  {
    name: 'revokeApproval',
    code: 'srm.partner.purchaser.evaluation-workbench.button.report.detail.repeal-approval',
    meaning: '撤销审批',
  },
  {
    name: 'exportReportAtt',
    code: 'srm.partner.purchaser.evaluation-workbench.button.report.single-download',
    meaning: '导出评估报告附件',
  },
];

/**
 * 线下的【结果确认】和【上一步】是虚拟按钮（功能设计问题导致）
 * 工作流的状态（审批中、审批拒绝、审批通过）code是共用的，（后端不区分code导致）
 * 前端要根据当前步骤条的code（progressStatus）+单据状态code（reportStatus）进行区分是哪个工作流
 */
const HeaderBtns = observer((props) => {
  const {
    isCreate,
    readOnly,
    handleSaveAll,
    loading,
    dataSet,
    isAmktClient,
    workflowFlag = false, // 工作流标识
    handleExecutiveScoring,
    handleSubmit,
    currentStep,
    setCurrentStep,
    stepsConfig = [],
    handleScoreSum,
    handleRelease,
    handleFeedBack,
    backModal,
    handleDelete,
    handleInvalid,
    backScoreModal,
    customizeBtnGroup,
    customizeCode,
    onSupplement,
    exeScoringDisableFlag,
    remote,
    assessmentDataSet,
    approvalBtnInfo,
    handleQuery = () => {},
    isPub,
    exportReportAttachment,
  } = props;
  // 单据状态
  const {
    needFeedbackFlag,
    evalType,
    progressStatus,
    approvalMethod,
    strategyId,
    evalHeaderId,
    reportStatus,
    businessKey,
  } =
    dataSet?.current?.get([
      'needFeedbackFlag',
      'evalType',
      'progressStatus',
      'approvalMethod',
      'callSuppliersFlag',
      'strategyId',
      'evalHeaderId',
      'reportStatus',
      'businessKey',
    ]) || {};
  const isOnLine = evalType === 'ONLINE';
  // 评估准备下标
  const prepareIndex = stepsConfig.findIndex((config) => config.progressStatus === 'EVAL_PREPARE');
  // 评估结果确认下标
  const resultIndex = stepsConfig.findIndex((config) => config.progressStatus === 'EVAL_RESULT');
  // 供应商自评下标
  const supplierEvalIndex = stepsConfig.findIndex(
    (config) => config.progressStatus === 'SUPPLIER_EVAL'
  );
  // 【结果确认】按钮显隐
  const resultBtnFlag = needFeedbackFlag
    ? reportStatus === 'FEEDBACK' && currentStep === supplierEvalIndex
    : reportStatus === 'NEW' && currentStep === prepareIndex;
  // 【上一步】按钮显隐
  const preStepBtnFlag =
    currentStep === resultIndex &&
    (needFeedbackFlag ? reportStatus === 'FEEDBACK' : reportStatus === 'NEW');
  // 线下【提交审批】按钮显隐
  const submitBtnFlag =
    (needFeedbackFlag ? reportStatus === 'FEEDBACK' : reportStatus === 'NEW') &&
    currentStep === resultIndex;
  // 评估准备
  const evaluationPrepare = progressStatus === 'EVAL_PREPARE';
  // 评估准备-审批中
  const newApprovaling = evaluationPrepare && reportStatus === 'APPROVALING';
  // 评估准备-审批通过
  const newApprovaled = evaluationPrepare && reportStatus === 'APPROVED';
  // 供应商自评(采购方发起)
  const supplierEvaluation = progressStatus === 'SUPPLIER_EVAL';
  // 供应商自评-审批中
  const supplierApprovaling = supplierEvaluation && reportStatus === 'APPROVALING';
  // 供应商自评-审批通过
  const supplierApprovaled = supplierEvaluation && reportStatus === 'APPROVED';
  // 供应商自评-审批拒绝
  const supplierRejected = supplierEvaluation && reportStatus === 'REJECTED';
  // 评估结果确认
  const resultConfirm = progressStatus === 'EVAL_RESULT';
  // 评估结果确认-审批中
  const resultApprovaling = resultConfirm && reportStatus === 'APPROVALING';
  // 评估结果确认-审批拒绝
  const resultRejected = resultConfirm && reportStatus === 'REJECTED';
  // 评估完成-审批通过
  const completeApprovaled = progressStatus === 'EVAL_COMPLETE' && reportStatus === 'APPROVED';

  // 雷达图显示标识
  const showChartBtn =
    isOnLine &&
    (['FINAL_COLLECTED', 'PUBLISHED'].includes(reportStatus) ||
      (reportStatus === 'APPROVALING' && progressStatus === 'EVAL_RESULT'));

  // 二开增加退回自评按钮显示
  const showReturnSelfEvalation = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.SHOWRETURNSELFEVALATION', true, {
        dataSet,
        currentUser: getCurrentUser(),
      })
    : true;
  // 二开增加执行评分按钮显示
  const hiddenExcutionScore = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.EXECUTIONSCORE', false, {
        dataSet,
        currentUser: getCurrentUser(),
        assessmentDataSet,
      })
    : false;
  // 保存按钮隐藏
  const saveBtnHidden =
    readOnly ||
    [
      'SYSTEM_PROCESSING',
      'SYSTEM_FAIL',
      'MANUAL_EVALUATING',
      'MANUAL_COMPLETE',
      'PUBLISHED',
      'DISCARDED',
      'WAITINGREJECTED',
      'BACK',
    ].includes(reportStatus) ||
    newApprovaling ||
    resultApprovaling ||
    supplierApprovaling ||
    completeApprovaled;
  // 埋点修改其他所有按钮隐藏都在写这里
  // 标准按钮属性
  const standardBtnHiddenList = {
    saveBtn: saveBtnHidden,
  };
  const remoteBtnHiddenList = remote
    ? remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH.HEADER_BTN_HIDDEN',
        standardBtnHiddenList,
        { headerDs: dataSet }
      )
    : standardBtnHiddenList;
  const { saveBtn: newSaveBtnHidden } = remoteBtnHiddenList || {};

  // 审批/撤销审批
  const { approvalDataMap, revokeDataMap } = approvalBtnInfo || {};
  const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
  const btns = [
    {
      name: 'infoSupplement',
      hidden: !workflowFlag,
      child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      btnProps: {
        loading,
        color: 'primary',
        icon: 'mode_edit',
        onClick: onSupplement,
      },
    },
    {
      name: 'executiveSelfEvaluation',
      hidden:
        readOnly ||
        (isOnLine
          ? !(
              needFeedbackFlag &&
              ((reportStatus === 'NEW' && approvalMethod === 'SELF') || newApprovaled)
            )
          : !(reportStatus === 'NEW' && needFeedbackFlag)),
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.executiveSelfEvaluation`)
        .d('执行自评'),
      btnProps: {
        icon: 'add_task-o',
        color: 'primary',
        loading,
        onClick: handleFeedBack,
      },
    },
    {
      name: 'resultConfirmation',
      hidden: readOnly || isOnLine || !resultBtnFlag,
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.resultConfirmation`)
        .d('结果确认'),
      btnProps: {
        icon: 'add_task-o',
        color: 'primary',
        loading,
        onClick: () => {
          dataSet.setState(
            'currentStepConfig',
            stepsConfig.find((n) => n.progressStatus === 'EVAL_RESULT')
          );
          setCurrentStep(resultIndex);
        },
      },
    },
    {
      name: 'preStep',
      hidden: readOnly || isOnLine || !preStepBtnFlag,
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.preStep`).d('上一步'),
      btnProps: {
        icon: 'arrow_back',
        funcType: 'flat',
        loading,
        onClick: () => {
          dataSet.setState(
            'currentStepConfig',
            stepsConfig.find((n) => n.progressStatus === 'SUPPLIER_EVAL')
          );
          setCurrentStep(needFeedbackFlag ? supplierEvalIndex : prepareIndex);
        },
      },
    },
    {
      name: 'submitApproval',
      hidden:
        readOnly ||
        !(
          ['FINAL_COLLECTED', 'REJECTED'].includes(reportStatus) ||
          (isOnLine
            ? ['FEEDBACK', 'NEW'].includes(reportStatus) && approvalMethod !== 'SELF'
            : submitBtnFlag)
        ),
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.submitApproval`).d('提交审批'),
      btnProps: {
        icon: 'add_task-o',
        color: 'primary',
        loading,
        onClick: handleSubmit,
      },
    },
    {
      name: 'publish',
      hidden: readOnly || !completeApprovaled,
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.publish`).d('发布'),
      btnProps: {
        icon: 'publish2',
        color: 'primary',
        loading,
        onClick: handleRelease,
      },
    },
    {
      name: 'executiveScoring',
      hidden:
        readOnly ||
        !(
          isOnLine &&
          (needFeedbackFlag
            ? (reportStatus === 'FEEDBACK' && approvalMethod === 'SELF') || supplierApprovaled
            : (reportStatus === 'NEW' && approvalMethod === 'SELF') || newApprovaled)
        ),
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.executiveScoring`)
        .d('执行评分'),
      btnProps: {
        icon: 'add_task-o',
        color: 'primary',
        disabled: exeScoringDisableFlag,
        hidden:
          readOnly ||
          !(
            isOnLine &&
            (needFeedbackFlag
              ? (reportStatus === 'FEEDBACK' && approvalMethod === 'SELF') || supplierApprovaled
              : (reportStatus === 'NEW' && approvalMethod === 'SELF') || newApprovaled)
          ) ||
          hiddenExcutionScore,
        loading,
        onClick: () => handleExecutiveScoring(),
      },
    },
    {
      name: 'summaryStatistics',
      hidden:
        readOnly || !(isOnLine && ['MANUAL_COMPLETE', 'SYSTEM_COMPLETE'].includes(reportStatus)),
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.summaryStatistics`)
        .d('汇总统计'),
      btnProps: {
        icon: 'add_task-o',
        color: 'primary',
        loading,
        onClick: handleScoreSum,
      },
    },
    {
      name: 'save',
      hidden: newSaveBtnHidden,
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        color: isNil(reportStatus) ? 'primary' : '',
        icon: 'save',
        funcType: isNil(reportStatus) ? 'raised' : 'flat',
        loading,
        onClick: handleSaveAll,
      },
    },
    {
      name: 'backScore',
      hidden:
        readOnly ||
        !(
          (['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'FINAL_COLLECTED'].includes(reportStatus) ||
            resultRejected) &&
          evalType === 'ONLINE'
        ),
      child: intl.get(`sslm.common.view.button.backScore`).d('退回评分'),
      btnProps: {
        icon: 'reply',
        funcType: 'flat',
        loading,
        onClick: backScoreModal,
      },
    },
    {
      name: 'returnSelfAssessment',
      hidden:
        readOnly || isOnLine
          ? !((supplierRejected || ['FEEDBACK'].includes(reportStatus)) && needFeedbackFlag === 1)
          : !(needFeedbackFlag === 1 && (resultRejected || ['FEEDBACK'].includes(reportStatus))),
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.executiveScoring.returnSelfAssessment`)
        .d('退回自评'),
      btnProps: {
        icon: 'reply',
        funcType: 'flat',
        hidden: isOnLine
          ? !(
              (supplierRejected || ['FEEDBACK'].includes(reportStatus)) &&
              needFeedbackFlag === 1 &&
              showReturnSelfEvalation
            )
          : !(
              needFeedbackFlag === 1 &&
              (resultRejected || ['FEEDBACK'].includes(reportStatus)) &&
              showReturnSelfEvalation
            ),
        loading,
        onClick: backModal,
      },
    },
    {
      name: 'discard',
      hidden:
        readOnly ||
        isAmktClient ||
        !(
          [
            'NEW',
            'SYSTEM_PROCESSING',
            'SYSTEM_COMPLETE',
            'SYSTEM_FAIL',
            'MANUAL_EVALUATING',
            'MANUAL_COMPLETE',
            'FINAL_COLLECTED',
            'REJECTED',
            'WAITINGREJECTED',
            'FEEDBACK',
            'BACK',
          ].includes(reportStatus) ||
          newApprovaled ||
          supplierApprovaled
        ),
      child: intl.get(`sslm.common.button.discard`).d('废弃'),
      btnProps: {
        icon: 'cancel',
        funcType: 'flat',
        loading,
        onClick: handleInvalid,
      },
    },
    {
      name: 'delete',
      hidden: readOnly || !['NEW'].includes(reportStatus) || isAmktClient,
      child: intl.get(`hzero.common.button.delete`).d('删除'),
      btnProps: {
        icon: 'delete',
        funcType: 'flat',
        loading,
        onClick: handleDelete,
      },
    },
    {
      name: 'print',
      hidden: isCreate,
      btnComp: PrintProButton,
      child: intl.get('sslm.common.button.newPrint').d('(新)打印'),
      btnProps: {
        icon: 'print',
        requestUrl: `${SRM_SSLM}/v1/${tenantId}/site-eval-headers/eval-report/print-new/${evalHeaderId}`,
        buttonProps: {
          funcType: 'flat',
        },
        params: {
          customizeUnitCode: customizeUnitCode.join(','),
        },
      },
    },
    {
      name: 'viewEvaluationPolicy',
      hidden: isCreate,
      child: intl
        .get(`sslm.purchaserEvaluationDetail.button.header.viewEvaluationPolicy`)
        .d('查看评估策略'),
      btnProps: {
        icon: 'find_in_page',
        funcType: 'flat',
        loading,
        onClick: () =>
          handleOpenHistoryVersion({
            title: intl.get('sslm.purchaserEvaluationDetail.button.header.view').d('查看评估策略'),
            strategyId,
          }),
      },
    },
    {
      name: 'scoringChart',
      hidden: !showChartBtn,
      child: intl
        .get('sslm.purchaserEvaluationDetail.button.header.radarChartOfScoringIndicators')
        .d('评分指标雷达图'),
      btnProps: {
        icon: 'area_chart',
        funcType: 'flat',
        loading,
        onClick: () => handleScoringChart({ evalHeaderId }),
      },
    },
    {
      name: 'operationRecord',
      hidden: isCreate,
      child: intl.get(`sslm.purchaserEvaluationDetail.button.header.operationRecord`).d('操作记录'),
      btnProps: {
        icon: 'operation_service_request',
        funcType: 'flat',
        loading,
        onClick: () =>
          operationRecordsModal({
            documentType: 'REPORT_EVAL',
            documentId: evalHeaderId,
          }),
      },
    },
    {
      name: 'approval',
      hidden: isEmpty(approvalDataMap) || isPub,
      child: intl.get('hzero.common.button.approval').d('审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'authorize',
        onClick: () =>
          handleApprove({
            approveProps: {
              ...approvalBtnProps,
              onSuccess: handleQuery,
            },
          }),
      },
    },
    {
      name: 'revokeApproval',
      hidden: isEmpty(revokeDataMap) || isPub,
      child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
      btnProps: {
        funcType: 'flat',
        icon: 'reply',
        onClick: () =>
          handleRevokeApprova({
            businessKey,
            onSuccess: handleQuery,
          }),
      },
    },
    {
      name: 'exportReportAtt',
      child: intl
        .get('sslm.purchaserEvaluation.button.exportReportAttachment')
        .d('导出评估报告附件'),
      btnType: 'c7n-pro',
      btnProps: {
        loading,
        funcType: 'flat',
        icon: 'unarchive',
        onClick: () => exportReportAttachment(),
      },
    },
  ];

  const buttons = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_HEADER_BTNS', btns, {
        ...props,
      })
    : btns;

  return (
    <Fragment>
      {customizeBtnGroup(
        {
          code: customizeCode,
          pro: true,
        },
        <DynamicButtons
          maxNum={5}
          trigger="hover"
          buttons={buttons}
          defaultBtnType="c7n-pro"
          permissions={btnsPermissions}
        />
      )}
    </Fragment>
  );
});

export default HeaderBtns;
