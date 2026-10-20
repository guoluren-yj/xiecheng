/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-04 21:51:44
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment } from 'react';
import { Steps } from 'choerodon-ui';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import querystring from 'querystring';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { renderStatus } from '@/routes/components/utils';
import MoreButton from '@/routes/components/MoreButton';
import { isNil, isEmpty } from 'lodash';
import {
  handleBatchDeleteRecord,
  handleCreateEvaluationReport,
  handleCancelLineRecord,
  handleCancelRecord,
  dealCopy,
  dealChange,
} from '@/services/vendorEvaluationPlanService';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import {
  renderApproveProgress,
  handleRevokeApprova,
  handleApprove,
} from '@/routes/components/WorkFlowApproval';

import { handleCheckIsNewStrategy } from '@/services/purchaserEvaluationWorkbenchServices';
import ReformContentModal from '../ReformContentModal';

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

// ”评估进度“步骤条
export const ProgressStep = ({ record, progressList }) => {
  const {
    evalType,
    finalScore,
    needFeedbackFlag,
    resultsFlagMeaning,
    progressStatus,
    progressStatusMeaning,
  } = record.get([
    'evalType',
    'finalScore',
    'needFeedbackFlag',
    'resultsFlagMeaning',
    'progressStatus',
    'progressStatusMeaning',
  ]);
  const finalList = progressList
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
  const current = finalList.findIndex(n => n.progressStatus === progressStatus);
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

const openRelatedQualityModal = (evalHeaderId, history) => {
  Modal.open({
    title: intl
      .get('sslm.vendorEvaluationPlan.button.tableAction.relatedQualityM')
      .d('关联质量整改单据'),
    drawer: true,
    style: { width: 742 },
    okButton: false,
    cancelText: intl.get('hzero.common.button.close').d('关闭'),
    cancelProps: { color: 'primary' },
    children: <ReformContentModal evalHeaderId={evalHeaderId} history={history} />,
  });
};

/**
 * @description: 标签页配置
 * @return {*}
 */
const getTabsConfig = () => {
  return [
    {
      key: 'tabGroupWholeList',
      tab: intl.get('sslm.vendorEvaluationPlan.view.content.tabGroupWholeList').d('整单'),
      children: [
        {
          key: 'tabPaneSubmitted',
          tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneSubmitted').d('待发布'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.SUBMITTED',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_SUBMITTED',
        },
        {
          key: 'tabPaneUnderApproval',
          tabPane: intl
            .get('sslm.vendorEvaluationPlan.view.content.tabPaneUnderApproval')
            .d('审批中'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.UNDER_APPROVAL',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVAL',
        },
        {
          key: 'tabPaneApproved',
          tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneApproved').d('已发布'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABPANE_APPROVED',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVED',
        },
        {
          key: 'tabPaneAll',
          tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneAll').d('全部'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.HEADER',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_ALL',
        },
      ],
    },
    {
      key: 'tabGroupDetail',
      tab: intl.get('sslm.vendorEvaluationPlan.view.content.tabGroupDetail').d('明细'),
      children: [
        {
          key: 'tabPaneEvaluated',
          tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneEvaluated').d('已发布'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_PUBLISH',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_EVALUATED',
        },
        // {
        //   key: 'tabPaneUnderEvaluation',
        //   tabPane: intl
        //     .get('sslm.vendorEvaluationPlan.view.content.tabPaneUnderEvaluation')
        //     .d('评估中'),
        //   searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.LINE',
        // },
        // {
        //   key: 'tabPaneAssessed',
        //   tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneAssessed').d('评估完成'),
        //   searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.LINE',
        // },
        {
          key: 'tabPaneDetailAll',
          tabPane: intl.get('sslm.vendorEvaluationPlan.view.content.tabPaneAll').d('全部'),
          searchBarCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_DETAIL_ALL',
          tableCode: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_ALL',
        },
      ],
    },
  ];
};

// 跳转评估报告详情只读界面
const handleJumpPurchaserDetail = (history, record, status = 'view') => {
  const { evalHeaderId } = record?.get(['evalHeaderId']);
  history.push({
    pathname: `/sslm/purchaser-evaluation-workbench/details/${status}`,
    search: querystring.stringify({
      evalHeaderId,
    }),
  });
};

// 整单 - 跳转详情页（可以编辑，也是view）
const handleJumpDetail = (history, record, status = 'view') => {
  const { evalPlanHeaderId } = record?.get(['evalPlanHeaderId']);
  history.push({
    pathname: `/sslm/vendor-evaluation-plan-workbench/details/${status}`,
    search: querystring.stringify({
      evalPlanHeaderId,
    }),
  });
};

// 整单-全部-变更操作
const handleChange = (history, record, status = 'edit') => {
  const { evalPlanHeaderId } = record?.get(['evalPlanHeaderId']) || {};
  dealChange({ evalPlanHeaderId }).then(res => {
    const response = getResponse(res);
    if (response) {
      const { evalPlanHeaderId: curEvalPlanHeaderId } = response;
      if (curEvalPlanHeaderId) {
        history.push({
          pathname: `/sslm/vendor-evaluation-plan-workbench/details/${status}`,
          search: querystring.stringify({
            evalPlanHeaderId: curEvalPlanHeaderId,
          }),
        });
      }
    }
  });
};

// 整单-全部-复制操作
const handleCopy = (history, record, status = 'view') => {
  Modal.confirm({
    children: intl
      .get(`sslm.siteInvestigateReport.view.message.copyConfirm`)
      .d('是否复制此单据生成一张新单据？'),
    onOk: () =>
      new Promise(() => {
        const { evalPlanHeaderId } = record.get(['evalPlanHeaderId']);
        dealCopy({ evalPlanHeaderId }).then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            const { evalPlanHeaderId: copyEvalPlanHeaderId } = res;
            history.push({
              pathname: `/sslm/vendor-evaluation-plan-workbench/details/${status}`,
              search: querystring.stringify({
                evalPlanHeaderId: copyEvalPlanHeaderId,
              }),
            });
          }
        });
      }),
  });
};

const handleRecordDelete = (record, dataSet, handleQueryList, handleQueryCount) => {
  const params = record.toData();
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    children: intl
      .get('sslm.vendorEvaluationPlan.modal.confirm.deleteRecord')
      .d('确定要删除所选行吗？'),
    onOk: () => {
      return handleBatchDeleteRecord([params]).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          // 删除成功重新查询数据
          handleQueryList();
          handleQueryCount();
          // eslint-disable-next-line no-unused-expressions
          dataSet?.unSelectAll(); // 详情页返回清空勾选
          // eslint-disable-next-line no-unused-expressions
          dataSet?.clearCachedSelected();
        }
      });
    },
  });
};

const handleBatchCreateEvaluationReport = async (
  record,
  _dataSet,
  handleQueryList,
  handleQueryCount,
  history
) => {
  const params = record.toData().evalPlanLineId;
  const evalPlanLineIds = [params];
  const result = await handleCheckIsNewStrategy({ evalPlanLineIds });
  const res = getResponse(result);
  if (res) {
    const { sameFlag, newStrategyId, oldStrategyId, evalHeaderId } = res;
    if (sameFlag) {
      notification.success();
      // 创建成功刷新数据
      handleQueryList();
      handleQueryCount();
      history.push({
        pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
        search: querystring.stringify({
          evalHeaderId,
        }),
      });
      return true;
    } else {
      Modal.open({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        okText: intl.get(`sslm.vendorEvaluationPlan.strategyModal.confirm.ok`).d('最新版本'),
        cancelText: intl
          .get('sslm.vendorEvaluationPlan.strategyModal.confirm.cancel')
          .d('当前版本'),
        onOk: () => {
          return handleCreateEvaluationReport({ evalPlanLineIds, strategyId: newStrategyId }).then(
            resp => {
              const response = getResponse(resp);
              if (response) {
                notification.success();
                // 创建成功刷新数据
                handleQueryList();
                handleQueryCount();
                history.push({
                  pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                  search: querystring.stringify({
                    evalHeaderId: response.evalHeaderId,
                  }),
                });
                return true;
              } else {
                return false;
              }
            }
          );
        },
        onCancel: () => {
          return handleCreateEvaluationReport({ evalPlanLineIds, strategyId: oldStrategyId }).then(
            resp => {
              const response = getResponse(resp);
              if (response) {
                notification.success();
                // 创建成功刷新数据
                handleQueryList();
                handleQueryCount();
                history.push({
                  pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                  search: querystring.stringify({
                    evalHeaderId: response.evalHeaderId,
                  }),
                });
                return true;
              } else {
                return false;
              }
            }
          );
        },
        children: intl
          .get('sslm.vendorEvaluationPlan.strategyModal.tooltip')
          .d('来源评估计划关联的评估策略版本已更新，请选择继续使用当前版本或选用最新版本。'),
        footer: (okBtn, cancelBtn, modal) => {
          return (
            <Fragment>
              <Button
                onClick={() => {
                  modal.close();
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              {cancelBtn}
              {okBtn}
            </Fragment>
          );
        },
      });
    }
  }
};

const handleCancelLine = (record, dataSet, handleQueryList, handleQueryCount) => {
  const params = [{ ...record.toData() }];
  handleCancelLineRecord(params).then(res => {
    const result = getResponse(res);
    if (result) {
      notification.success();
      // 创建成功刷新数据
      handleQueryList();
      handleQueryCount();
      // eslint-disable-next-line no-unused-expressions
      dataSet?.unSelectAll(); // 详情页返回清空勾选
      // eslint-disable-next-line no-unused-expressions
      dataSet?.clearCachedSelected();
    }
  });
};

const handleCancel = (record, dataSet, handleQueryList, handleQueryCount) => {
  const params = [{ ...record.toData() }];
  handleCancelRecord(params).then(res => {
    const result = getResponse(res);
    if (result) {
      notification.success();
      // 创建成功刷新数据
      handleQueryList();
      handleQueryCount();
      // eslint-disable-next-line no-unused-expressions
      dataSet?.unSelectAll(); // 详情页返回清空勾选
      // eslint-disable-next-line no-unused-expressions
      dataSet?.clearCachedSelected();
    }
  });
};

/**
 * @description: 获取行上操作按钮
 * @param {*} record
 * @param {*} params
 * @return {*}
 */
const getLineBtns = (record, params, approvalInfo = {}, notPermissionBtns = []) => {
  const { currentTab, history, dataSet, handleQueryList, handleQueryCount } = params || {};
  const isShowActions =
    record.get('evalStatus') === 'PUBLISHED' &&
    ['TO_BE_EVALUATED', 'EVAL_CANCEL'].includes(record.get('executeStatus'));
  const { evalPlanHeaderId } = record?.get(['evalPlanHeaderId']) || {};
  switch (currentTab) {
    case 'tabPaneUnderApproval':
    case 'tabPaneApproved':
    case 'tabPaneSubmitted':
      return [
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operation').d('操作记录'),
          onClick: () =>
            operationRecordsModal({
              documentType: 'EVAL_PLAN',
              documentId: evalPlanHeaderId,
              evalPlanHeaderId,
            }),
        },
      ].filter(btn => !btn.hidden);
    case 'tabPaneAll':
      // eslint-disable-next-line no-case-declarations
      const { evalStatus, businessKey } = record?.get(['evalStatus', 'businessKey']) || {};
      // eslint-disable-next-line no-case-declarations
      // const evalPlanHeaderId = record?.get('evalPlanHeaderId');
      // 审批/撤销审批
      // eslint-disable-next-line no-case-declarations
      const { approvalDataMap, revokeDataMap } = approvalInfo || {};
      // eslint-disable-next-line no-case-declarations
      const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
      // 撤销审批按钮
      // eslint-disable-next-line no-case-declarations
      const revokeBtnProps = revokeDataMap ? revokeDataMap[businessKey] : {};
      return [
        {
          name: 'copy',
          child: intl.get('hzero.common.button.copy').d('复制'),
          onClick: () => handleCopy(history, record, 'edit'),
        },
        {
          name: 'edit',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          hidden: !['NEW', 'REJECT'].includes(evalStatus),
          onClick: () => handleJumpDetail(history, record, 'edit'),
        },
        {
          name: 'delete',
          child: intl.get('hzero.common.button.delete').d('删除'),
          hidden: !['NEW', 'REJECT'].includes(evalStatus),
          onClick: () => handleRecordDelete(record, dataSet, handleQueryList, handleQueryCount),
        },
        {
          name: 'change',
          child: intl.get('hzero.common.button.change').d('变更'),
          hidden: !['PUBLISHED'].includes(evalStatus),
          onClick: () => handleChange(history, record, 'edit'),
        },
        {
          name: 'cancel',
          child: intl.get(`sslm.vendorEvaluationPlan.button.cancel`).d('取消'),
          hidden: !['PUBLISHED'].includes(evalStatus),
          onClick: () => handleCancel(record, dataSet, handleQueryList, handleQueryCount),
        },
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operation').d('操作记录'),
          onClick: () =>
            operationRecordsModal({
              documentType: 'EVAL_PLAN',
              documentId: evalPlanHeaderId,
              evalPlanHeaderId,
            }),
        },
        {
          name: 'approval',
          hidden: isEmpty(approvalBtnProps) || notPermissionBtns.includes('approval'),
          child: intl.get('hzero.common.button.approval').d('审批'),
          onClick: () =>
            handleApprove({
              approveProps: {
                ...approvalBtnProps,
                onSuccess: () => dataSet.query(),
              },
            }),
        },
        {
          name: 'revokeApproval',
          hidden: isEmpty(revokeBtnProps) || notPermissionBtns.includes('revokeApproval'),
          child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
          onClick: () =>
            handleRevokeApprova({
              businessKey,
              onSuccess: () => dataSet.query(),
            }),
        },
      ].filter(btn => !btn.hidden);
    case 'tabPaneEvaluated':
    case 'tabPaneDetailAll':
      return [
        {
          name: 'createEvaluationReport',
          child: intl
            .get('sslm.vendorEvaluationPlan.button.createEvaluationReport')
            .d('新建评估报告'),
          hidden: !isShowActions,
          onClick: () =>
            handleBatchCreateEvaluationReport(
              record,
              dataSet,
              handleQueryList,
              handleQueryCount,
              history
            ),
        },
        {
          name: 'cancel',
          child: intl.get(`sslm.vendorEvaluationPlan.button.cancel`).d('取消'),
          hidden: !isShowActions,
          onClick: () => handleCancelLine(record, dataSet, handleQueryList, handleQueryCount),
        },
      ].filter(btn => !btn.hidden);
    default:
      return null;
  }
};

/**
 * @description: 表格列配置
 * @param {*} currentTab
 * @return {*}
 */
const getColumns = (
  currentTab,
  history,
  dataSet,
  handleQueryList,
  handleQueryCount,
  progressList = [],
  approvalInfo = {},
  notPermissionBtns = []
) => {
  // 是否属于整单的Tab
  const isWholeTab = [
    'tabPaneSubmitted',
    'tabPaneUnderApproval',
    'tabPaneApproved',
    'tabPaneAll',
  ].includes(currentTab);
  // 操作列是否展示
  const isShowOperations = [
    // 'tabPaneSubmitted', // 整单 - 待提交
    // 'tabPaneAll', // 整单 - 全部
    'tabPaneEvaluated', // 明细 - 已发布
  ].includes(currentTab);

  const isNotEvaluated = currentTab !== 'tabPaneEvaluated';

  if (isWholeTab) {
    // 整单
    const isShowAssessType = ['tabPaneSubmitted'].includes(currentTab); // 评估类型列是否展示
    return [
      {
        name: 'evalStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'operation',
        width: 130,
        renderer: ({ record }) => {
          const params = { currentTab, history, dataSet, handleQueryList, handleQueryCount };
          const buttons = getLineBtns(record, params, approvalInfo, notPermissionBtns);
          return !isEmpty(buttons) ? <MoreButton buttons={buttons} /> : '-';
        },
      },
      {
        name: 'evalPlanNum',
        width: 150,
        renderer: ({ record, value }) => {
          const evalStatus = record.get('evalStatus');
          // 待发布页签，点击单号，直接进入编辑页面
          const toEditFlag =
            ['NEW', 'REJECT'].includes(evalStatus) && ['tabPaneSubmitted'].includes(currentTab);
          const type = toEditFlag ? 'edit' : 'view';
          return <a onClick={() => handleJumpDetail(history, record, type)}>{value}</a>;
        },
      },
      {
        name: 'problemNum',
        width: 150,
        hidden: !['tabPaneDetailAll'].includes(currentTab),
        renderer: ({ record }) => {
          return record.get('evalHeaderId') ? (
            <a
              onClick={() => {
                openRelatedQualityModal(record.get('evalHeaderId'), history);
              }}
            >
              {intl
                .get('sslm.vendorEvaluationPlan.button.tableAction.relatedQuality')
                .d('关联质量整改单据')}
            </a>
          ) : (
            <span>-</span>
          );
        },
      },
      { name: 'evalPlanDescription', width: 200 },
      { name: 'strategyName', width: 120 },
      { name: 'assessTypeMeaning', width: 120, hidden: !isShowAssessType },
      { name: 'groupFlag', width: 120, renderer: ({ value }) => yesOrNoRender(value) },
      { name: 'companyName', width: 180 },
      { name: 'realName', width: 120 },
      { name: 'creationDate', width: 140 },
      { name: 'publishDate', width: 140 },
      { name: 'creationTypeMeaning', width: 120 },
      {
        hidden: currentTab !== 'tabPaneAll',
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        renderer: ({ record }) => {
          const { approvalHistoryMap } = approvalInfo || {};
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
    ].filter(item => !item.hidden);
  } else {
    // 明细
    return [
      {
        name: 'evalStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'executeStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'evalHeaderStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'operation',
        width: 200,
        hidden: !isShowOperations,
        renderer: ({ record }) => {
          const params = { currentTab, history, dataSet, handleQueryList, handleQueryCount };
          const buttons = getLineBtns(record, params);
          return !isEmpty(buttons) ? <MoreButton buttons={buttons} /> : '-';
        },
      },
      {
        name: 'evalPlanNumAndLineNumber',
        width: 200,
        renderer: ({ record }) => {
          const { evalPlanNum, lineNumber } = record?.get(['evalPlanNum', 'lineNumber']);
          return (
            <a onClick={() => handleJumpDetail(history, record, 'view')}>
              {`${evalPlanNum}-${lineNumber}`}
            </a>
          );
        },
      },
      {
        name: 'rectifyStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'problemNum',
        width: 150,
        renderer: ({ record }) => {
          return record.get('evalHeaderId') ? (
            <a
              onClick={() => {
                openRelatedQualityModal(record.get('evalHeaderId'), history);
              }}
            >
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          ) : (
            <span>-</span>
          );
        },
      },
      {
        name: 'evalNum',
        width: 160,
        hidden: isNotEvaluated,
        renderer: ({ record, value }) => {
          return value ? (
            <a onClick={() => handleJumpPurchaserDetail(history, record, 'view')}>{value}</a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'progressStatusMeaning',
        width: 120,
        hidden: isNotEvaluated,
        renderer: ({ value, record }) => {
          return value && <ProgressStep record={record} progressList={progressList} />;
        },
      },
      {
        name: 'finalScore',
        width: 120,
        hidden: isNotEvaluated,
        align: 'right',
      },
      {
        name: 'resultsFlagMeaning',
        width: 120,
        hidden: isNotEvaluated,
      },
      {
        name: 'grade',
        width: 120,
        hidden: isNotEvaluated,
        align: 'right',
      },
      {
        name: 'approveDate',
        width: 120,
        hidden: isNotEvaluated,
      },
      { name: 'supplierCompanyName', width: 180 },
      { name: 'supplierCompanyNum', width: 180 },
      { name: 'supplierNum', width: 180 },
      {
        name: 'categoryCode',
        width: 120,
        hidden: !isNotEvaluated,
      },
      {
        name: 'categoryName',
        width: 120,
        hidden: !isNotEvaluated,
      },
      {
        name: 'itemCode',
        width: 120,
        hidden: !isNotEvaluated,
      },
      {
        name: 'itemName',
        width: 120,
        hidden: !isNotEvaluated,
      },
      { name: 'strategyName', width: 120 },
      { name: 'assessTypeMeaning', width: 120 },
      { name: 'planMonth', width: 120 },
      { name: 'planDateFrom', width: 120 },
      { name: 'planDateTo', width: 120 },
      { name: 'groupFlag', width: 120, renderer: ({ value }) => yesOrNoRender(value) },
      { name: 'companyName', width: 180 },
      { name: 'ouName', width: 120 },
      { name: 'invOrganizationName', width: 120 },
      { name: 'inventoryName', width: 120 },
      { name: 'evalPrincipalName', width: 120 },
      { name: 'supplierContacts', width: 120 },
      { name: 'telephone', width: 120 },
      { name: 'email', width: 120 },
      { name: 'supplierAddress', width: 120 },
      { name: 'evalRemark', width: 120 },
      { name: 'createdByName', width: 120 },
      { name: 'creationDate', width: 140 },
    ].filter(item => !item.hidden);
  }
};

export { getTabsConfig, getColumns };
