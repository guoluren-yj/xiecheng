/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-29 15:44:37
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/utils/index.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */

import { isNil, isEmpty } from 'lodash';
import React from 'react';
import { Steps } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { renderStatus } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';
import querystring from 'querystring';
import { getResponse, getCurrentUser } from 'utils/utils';
import MoreButton from '@/routes/components/MoreButton';
import {
  dealCopy,
  batchRelease,
  handleBatchDiscardRecord,
} from '@/services/purchaserEvaluationWorkbenchServices';
import notification from 'utils/notification';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import {
  ApprovalBtn,
  RevokeApprovalBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';

import ReformContentModal from '../ReformContentModal';
import ScoringIndicatorChart from '../Details/ScoringIndicatorChart';
// import styles from '../index.less';

/**
 * 格式化国际化手机号格式
 * internationalTelMeaning 国别码meaning字段
 * phone 手机号码
 */
export function formatInternationalTel(internationalTelMeaning, phone) {
  let value = phone || '-';
  if (internationalTelMeaning && phone) {
    value = `${internationalTelMeaning} | ${phone}`;
  }
  return <span>{value}</span>;
}

// 质量整改弹窗
const openRelatedQualityModal = (evalHeaderId, history, customizeTable) => {
  Modal.open({
    title: intl
      .get('sslm.purchaserEvaluation.title.tableAction.relatedQualityM')
      .d('关联质量整改单据'),
    drawer: true,
    style: { width: 742 },
    okButton: false,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: { color: 'primary' },
    children: (
      <ReformContentModal
        evalHeaderId={evalHeaderId}
        history={history}
        customizeTable={customizeTable}
      />
    ),
  });
};

// ”评估进度“步骤条
export const ProgressStep = props => {
  const { remote, record, progressList, currentValue } = props;
  const {
    evalType,
    finalScore,
    needFeedbackFlag,
    resultsFlagMeaning,
    progressStatusMeaning,
  } = record.get([
    'evalType',
    'finalScore',
    'needFeedbackFlag',
    'resultsFlagMeaning',
    'progressStatusMeaning',
  ]);
  const newFinalList = progressList
    .map(progress => {
      if (progress.progressStatus === 'SUPPLIER_EVAL') {
        if (needFeedbackFlag) {
          return progress;
        } else {
          return false;
        }
      } else if (progress.progressStatus === 'INTERNAL_EVAL') {
        if (evalType === 'ONLINE') {
          return progress;
        } else {
          return false;
        }
      } else {
        return progress;
      }
    })
    .filter(Boolean);
  const finalList = remote
    ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_STEPS_PROGRESS_LIST', newFinalList, {
        ...props,
      })
    : newFinalList;
  const current = finalList.findIndex(n => n.progressStatus === currentValue);
  return (
    <Steps type="popup" headerText={progressStatusMeaning}>
      {finalList.map((progress, index) => {
        return (
          <Steps.Step
            title={progress.progressStatusMeaning}
            status={index < current ? 'finish' : index === current ? 'process' : 'wait'}
            description={
              progress.progressStatus === 'EVAL_RESULT' &&
              !isNil(finalScore) &&
              !isNil(resultsFlagMeaning) ? (
                <span>
                  {`${finalScore}${intl
                    .get('sslm.purchaserEvaluation.model.message.score')
                    .d('分')}-${resultsFlagMeaning}`}
                </span>
              ) : (
                ''
              )
            }
          />
        );
      })}
    </Steps>
  );
};

/**
 * @description: 标签页配置
 * @return {*}
 */
const getTabsConfig = permissionCode => {
  const getTabsConfigData = [
    {
      key: 'tabGroupManagement',
      permissionCode: 'srm.partner.purchaser.evaluation-workbench.button.report.manage',
      tab: intl.get('sslm.purchaserEvaluation.tabs.content.tabGroupEvaluationReport').d('评估报告'),
      children: [
        {
          key: 'tabPaneAssessmentReserve',
          tabPane: intl
            .get('sslm.purchaserEvaluation.tabs.content.tabPaneAssessmentReserve')
            .d('评估准备'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_RESERVE',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_RESERVE_TABLE',
        },
        {
          key: 'tabPaneUnderEvaluation',
          tabPane: intl
            .get('sslm.purchaserEvaluation.tabs.content.tabPaneUnderEvaluation')
            .d('评估中'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.UNDER_EVALUATION',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.TABLE',
        },
        {
          key: 'tabPaneEvaluationCompleted',
          tabPane: intl
            .get('sslm.purchaserEvaluation.tabs.content.tabPaneEvaluationCompleted')
            .d('评估完成'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_COMPLETED',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_COMPLETED_TABLE',
        },
        {
          key: 'tabPaneManageAll',
          tabPane: intl.get('sslm.purchaserEvaluation.tabs.content.tabPaneManageAll').d('全部'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ALL',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ALL_TABLE',
        },
      ],
    },
    {
      key: 'tabGroupScore',
      permissionCode: 'srm.partner.purchaser.evaluation-workbench.button.report.score',
      tab: intl.get('sslm.purchaserEvaluation.tabs.content.tabGroupReportScoring').d('报告打分'),
      children: [
        {
          key: 'tabPaneWaitScore',
          tabPane: intl.get('sslm.purchaserEvaluation.tabs.content.tabPaneWaitScore').d('待评分'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.WAIT_SCORE',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.WAIT_SCORE_TABLE',
        },
        {
          key: 'tabPaneScoreAll',
          tabPane: intl.get('sslm.purchaserEvaluation.tabs.content.tabPaneScoreAll').d('全部'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.ALL',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.ALL_TABLE',
        },
      ],
    },
  ];
  return permissionCode
    ? getTabsConfigData.filter(i => {
        const approvalTab = permissionCode.filter(
          item => item.code === i.permissionCode && item.approve
        );
        return !isEmpty(approvalTab);
      })
    : getTabsConfigData;
};

/**
 * @description: 点击编号进入详情页面 / 通过操作按钮点击编辑进入详情页面
 * @param {*} param1
 * @return {*}
 */
const handleJumpDetail = ({
  history,
  record,
  tabPaneKey,
  status = 'view',
  evalHeaderId: newEvalHeaderId,
}) => {
  const { evalHeaderId, scoreStatus } = record?.get(['evalHeaderId', 'scoreStatus']) || {};
  if (
    [
      'tabPaneAssessmentReserve',
      'tabPaneUnderEvaluation',
      'tabPaneEvaluationCompleted',
      'tabPaneManageAll',
    ].includes(tabPaneKey)
  ) {
    history.push({
      pathname: `/sslm/purchaser-evaluation-workbench/details/${status}`,
      search: querystring.stringify({
        evalHeaderId: evalHeaderId || newEvalHeaderId,
      }),
    });
  } else {
    history.push({
      pathname: `/sslm/purchaser-evaluation-workbench/scoreDetails/${status}`,
      search: querystring.stringify({
        evalHeaderId: evalHeaderId || newEvalHeaderId,
        flag: Number(['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus)),
      }),
    });
  }
};

/**
 * @description: 废弃
 * @param {*} record
 * @param {*} _dataSet
 * @param {*} handleQueryList
 * @param {*} handleQueryCount
 * @return {*}
 */
const handleRecordDiscard = ({ record, queryList, handleQueryCount, remote }) => {
  const params = record.toData().evalHeaderId;
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sslm.purchaserEvaluation.modal.confirm.discardRecord')
      .d('确定要废弃所选行吗？'),
    onOk: () => {
      return handleBatchDiscardRecord({ params: [params] }).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          if (remote && remote.event) {
            remote.event.fireEvent('cuxWorkBenChHandleAfterDiscard', {
              tableRecords: [record],
            });
          }
          // 废弃成功重新查询数据
          queryList();
          handleQueryCount();
        }
      });
    },
  });
};

// 复制
const handleCopy = ({ history, record, tabPaneKey }) => {
  const evalHeaderId = record?.get('evalHeaderId');
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get(`sslm.purchaserEvaluation.view.message.copyConfirm`)
      .d('是否复制此单据生成一张新单据？'),
    onOk: () =>
      dealCopy({ evalHeaderId }).then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          handleJumpDetail({
            history,
            evalHeaderId: res.evalHeaderId,
            tabPaneKey,
            status: 'edit',
          });
          return true;
        } else {
          return false;
        }
      }),
  });
};

// 查看雷达图
export const handleScoringChart = ({ evalHeaderId }) => {
  Modal.open({
    title: intl.get('sslm.purchaserEvaluationDetail.view.title.scoreDistribution').d('得分分布'),
    key: Modal.key(),
    movable: false,
    drawer: true,
    okCancel: false,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <ScoringIndicatorChart evalHeaderId={evalHeaderId} />,
  });
};

// 发布
const handleRelease = ({ record, dataSet, handleQueryCount }) => {
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sslm.purchaserEvaluationDetail.view.message.publishMsg')
      .d('该操作将向供应商发布评估报告，确定发布吗？'),
    onOk: () => {
      const evalHeaderIds = record?.get('evalHeaderId');
      if (evalHeaderIds) {
        return new Promise(resolve => {
          batchRelease([evalHeaderIds])
            .then(response => {
              const res = getResponse(response);
              if (res) {
                resolve();
                notification.success();
                handleQueryCount();
                dataSet.query(dataSet.currentPage);
              }
            })
            .finally(() => {
              resolve(false);
            });
        });
      }
    },
  });
};

/**
 * @description: 获取行上操作按钮
 * @param {*} record
 * @param {*} params
 * @return {*}
 */
const getLineBtns = (record, params, remote) => {
  const { tabPaneKey, history, dataSet, queryList, handleQueryCount, state } = params || {};
  const { evalHeaderId, scoreStatus, reportStatus, progressStatus, businessKey } = record.get([
    'evalHeaderId',
    'scoreStatus',
    'reportStatus',
    'progressStatus',
    'businessKey',
  ]);
  const documentType = ['tabPaneWaitScore', 'tabPaneScoreAll'].includes(tabPaneKey)
    ? 'REPORT_EVAL_SUBMIT'
    : 'REPORT_EVAL';
  const otherParams = ['tabPaneWaitScore', 'tabPaneScoreAll'].includes(tabPaneKey)
    ? { sourceCode: 'FILLING', submitUserId: '' }
    : {};

  const isNeedSecondaryDev = remote
    ? remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH.HIDDENEDIT',
        ['PUBLISHED', 'DISCARDED'].includes(reportStatus),
        { record, currentUser: getCurrentUser() }
      )
    : ['PUBLISHED', 'DISCARDED'].includes(reportStatus);

  // 审批、撤销审批
  const { manageAllInfo = {}, scoreAllInfo = {}, notPermissionBtns = [] } = state || {};

  switch (tabPaneKey) {
    // 管理-全部页签
    case 'tabPaneManageAll': {
      const { approvalDataMap = {}, revokeDataMap = {} } = manageAllInfo || {};
      const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
      // 撤销审批按钮
      const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
      return [
        {
          name: 'edit',
          child: ['NEW'].includes(reportStatus)
            ? intl.get('sslm.purchaserEvaluation.button.tableAction.edit').d('编辑')
            : intl
                .get('sslm.purchaserEvaluation.button.tableAction.evaluationReportManagement')
                .d('评估报告管理'),
          hidden: isNeedSecondaryDev,
          onClick: () =>
            handleJumpDetail({
              history,
              record,
              tabPaneKey,
              status: 'edit',
            }),
        },
        {
          name: 'release',
          child: intl.get(`hzero.common.button.release`).d('发布'),
          hidden: !(
            ['APPROVED'].includes(reportStatus) && ['EVAL_COMPLETE'].includes(progressStatus)
          ),
          onClick: () => handleRelease({ record, dataSet, handleQueryCount }),
        },
        {
          name: 'copy',
          child: intl.get('sslm.purchaserEvaluation.button.tableAction.copy').d('复制'),
          hidden: ['DISCARDED'].includes(reportStatus),
          onClick: () => handleCopy({ history, record, dataSet, tabPaneKey }),
        },
        {
          name: 'discard',
          child: intl.get('sslm.common.button.discard').d('废弃'),
          hidden: ![
            'NEW',
            'NEW_APPROVALED',
            'SYSTEM_PROCESSING',
            'SYSTEM_COMPLETE',
            'SYSTEM_FAIL',
            'MANUAL_EVALUATING',
            'MANUAL_COMPLETE',
            'FINAL_COLLECTED',
            'REJECTED',
            'APPROVED',
            'WAITINGREJECTED',
            'FEEDBACK',
            'FEEDBACK_APPROVALED',
          ].includes(reportStatus),
          onClick: () =>
            handleRecordDiscard({ record, dataSet, queryList, handleQueryCount, remote }),
        },
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operation').d('操作记录'),
          onClick: () =>
            operationRecordsModal({ documentType, documentId: evalHeaderId, ...otherParams }),
        },
        {
          name: 'manageApproval',
          hidden: isEmpty(approvalBtnProps) || notPermissionBtns.includes('manageApproval'),
          btnComp: <ApprovalBtn />,
          showIcon: false,
          approveProps: {
            ...approvalBtnProps,
            onSuccess: () => dataSet.query(),
          },
        },
        {
          name: 'manageRevokeApproval',
          hidden: isEmpty(revokeBtnProps) || notPermissionBtns.includes('manageRevokeApproval'),
          btnComp: <RevokeApprovalBtn />,
          showIcon: false,
          approveProps: {
            businessKey,
            onSuccess: () => dataSet.query(),
          },
        },
      ].filter(btn => !btn.hidden);
    }
    case 'tabPaneScoreAll': {
      // 评分 全部页签
      const { approvalDataMap = {}, revokeDataMap = {} } = scoreAllInfo || {};
      const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
      // 撤销审批按钮
      const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
      return [
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operation').d('操作记录'),
          onClick: () =>
            operationRecordsModal({ documentType, documentId: evalHeaderId, ...otherParams }),
        },
        {
          name: 'evaluationReport',
          child: intl.get('sslm.purchaserEvaluation.button.tableAction.evaluationReport').d('评分'),
          hidden: !['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus),
          onClick: () => handleJumpDetail({ history, record, tabPaneKey, status: 'edit' }),
        },
        {
          name: 'scoreApproval',
          hidden: isEmpty(approvalBtnProps) || notPermissionBtns.includes('scoreApproval'),
          btnComp: <ApprovalBtn />,
          approveProps: {
            ...approvalBtnProps,
            onSuccess: () => dataSet.query(),
          },
          showIcon: false,
        },
        {
          name: 'scoreRevokeApproval',
          hidden: isEmpty(revokeBtnProps) || notPermissionBtns.includes('scoreRevokeApproval'),
          btnComp: <RevokeApprovalBtn />,
          showIcon: false,
          approveProps: {
            businessKey,
            onSuccess: () => dataSet.query(),
          },
        },
      ].filter(btn => !btn.hidden);
    }
    default:
      return [
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operation').d('操作记录'),
          onClick: () =>
            operationRecordsModal({ documentType, documentId: evalHeaderId, ...otherParams }),
        },
      ];
  }
};

/**
 * @description: 表格columns配置
 * @return {*}
 */
const getColumns = ({
  tabPaneKey = 'tabPaneManageAll',
  history,
  dataSet,
  queryList,
  handleQueryCount,
  progressList = [],
  customizeTable,
  remote,
  state,
}) => {
  /**
   * 页签信息
   * 评估准备 - 管理 : tabPaneAssessmentReserve
   * 评估中 - 管理 : tabPaneUnderEvaluation
   * 评估完成 - 管理 : tabPaneEvaluationCompleted
   * 全部- 管理 : tabPaneManageAll
   * 待评分 - 评分 : tabPaneWaitScore
   * 全部 - 评分 : tabPaneScoreAll
   */
  const isShowOperations = ['tabPaneScoreAll', 'tabPaneManageAll'].includes(tabPaneKey);
  const isEdit = ['tabPaneEvaluationCompleted'].includes(tabPaneKey);
  // 评分分组标识
  const scoreTabFlag = ['tabPaneWaitScore', 'tabPaneScoreAll'].includes(tabPaneKey);
  // 评估结果(resultsFlagMeaning)\评估得分(finalScore)\评估等级(grade)字段显示标识
  const completedAndAllShowflag = ['tabPaneEvaluationCompleted', 'tabPaneManageAll'].includes(
    tabPaneKey
  );
  // 关联质量整改单据显示标识
  const problemNumShowFlag = ['tabPaneEvaluationCompleted'].includes(tabPaneKey);
  // 评估模板名称显示标识
  const evalTplNameShowFlag = !['tabPaneUnderEvaluation'].includes(tabPaneKey);

  return [
    !scoreTabFlag && {
      // 管理分组展示该状态
      name: 'reportStatus',
      width: 120,
      renderer: renderStatus,
    },
    scoreTabFlag && {
      // 评分分组展示该虚拟状态
      name: 'scoreStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      // 操作列
      name: 'operation',
      width: isShowOperations ? 220 : 100,
      renderer: ({ record }) => {
        const params = { tabPaneKey, history, dataSet, queryList, handleQueryCount, state };
        const btns = getLineBtns(record, params, remote);
        const buttons = remote
          ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_LIST_BTNS', btns, {
              record,
              params,
            })
          : btns;
        return <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'evalNum',
      width: 150,
      renderer: ({ record, value }) => (
        <a
          onClick={() =>
            handleJumpDetail({
              history,
              record,
              tabPaneKey,
              status: isShowOperations || isEdit ? 'view' : 'edit',
            })
          }
        >
          {value}
        </a>
      ),
    },
    !scoreTabFlag && {
      name: 'progressStatus',
      width: 120,
      renderer: ({ value, record }) => {
        return (
          <ProgressStep
            remote={remote}
            record={record}
            currentValue={value}
            progressList={progressList}
          />
        );
      },
    },
    problemNumShowFlag && {
      name: 'rectifyStatus',
      width: 120,
      renderer: renderStatus,
    },
    problemNumShowFlag && {
      name: 'problemNum',
      width: 120,
      renderer: ({ record }) => {
        return record.get('evalHeaderId') ? (
          <Button
            funcType="link"
            onClick={() => {
              openRelatedQualityModal(record.get('evalHeaderId'), history, customizeTable);
            }}
          >
            {intl
              .get('sslm.purchaserEvaluation.table.column.label.relatedQuality')
              .d('关联质量整改单据')}
          </Button>
        ) : (
          <span>-</span>
        );
      },
    },
    {
      name: 'evalDescription',
      width: 200,
    },
    {
      name: 'groupFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
      renderer: ({ value, record }) => {
        const supplierName = record?.get('supplierName');
        return value || supplierName || '-';
      },
    },
    completedAndAllShowflag && {
      name: 'resultsFlagMeaning',
      width: 120,
    },
    completedAndAllShowflag && {
      name: 'finalScore',
      width: 80,
      align: 'right',
    },
    completedAndAllShowflag && {
      name: 'grade',
      width: 120,
    },
    !scoreTabFlag && {
      name: 'strategyName',
      width: 200,
    },
    evalTplNameShowFlag && {
      name: 'evalTplName',
      width: 200,
    },
    !scoreTabFlag && {
      name: 'evalTypeMeaning',
      width: 120,
    },
    {
      name: 'assessTypeMeaning',
      width: 120,
    },
    {
      name: 'realName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 140,
    },
    !['tabPaneAssessmentReserve', 'tabPaneWaitScore', 'tabPaneScoreAll'].includes(tabPaneKey) && {
      name: 'feedbackDate',
      width: 140,
    },
    ![
      'tabPaneAssessmentReserve',
      'tabPaneUnderEvaluation',
      'tabPaneWaitScore',
      'tabPaneScoreAll',
    ].includes(tabPaneKey) && {
      name: 'publishDate',
      width: 140,
    },
    ['tabPaneManageAll', 'tabPaneScoreAll'].includes(tabPaneKey) && {
      name: 'approvalProgress',
      width: 160,
      title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
      renderer: ({ record }) => {
        const { manageAllInfo = {}, scoreAllInfo = {} } = state || {};
        const { approvalHistoryMap } =
          (['tabPaneManageAll'].includes(tabPaneKey) ? manageAllInfo : scoreAllInfo) || {};
        return renderApproveProgress({ approvalHistoryMap, record });
      },
    },
  ].filter(Boolean);
};

export { getTabsConfig, getColumns };
