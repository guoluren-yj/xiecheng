/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-10 15:33:33
 * @FilePath: /srm-front-sslm/src/routes/SupplierEvaluationWorkbench/utils/index.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */

import React, { Fragment } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { renderStatus } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';
import querystring from 'querystring';
import { isEmpty } from 'lodash';
// import { operationRecordsModal } from '@/routes/components/OperationRecords';
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

/**
 * @description: 标签页配置
 * @return {*}
 */
const getTabsConfig = permissionCode => {
  const TabsConfigData = [
    {
      key: 'tabGroupEvaluationPlan',
      permissionCode: 'srm.partner.supplier.evaluation-workbench.api.button.eval.plan',
      tab: intl.get('sslm.supplierEvaluation.tabs.content.evaluationReport').d('评估计划'),
      children: [
        {
          key: 'evaluationPlanAll',
          tabPane: intl.get('sslm.supplierEvaluation.tabs.content.evaluationPlanAll').d('全部'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_SEARCH',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_TABLE',
        },
      ],
    },
    {
      key: 'tabGroupEvaluationReport',
      permissionCode: 'srm.partner.supplier.evaluation-workbench.api.button.report.score',
      tab: intl.get('sslm.supplierEvaluation.tabs.content.assessmentReport').d('评估报告'),
      children: [
        {
          key: 'published',
          tabPane: intl.get('sslm.supplierEvaluation.tabs.content.published').d('已发布'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED_TABLE',
        },
        {
          key: 'toBeSelfEvaluated',
          tabPane: intl.get('sslm.supplierEvaluation.tabs.content.toBeSelfEvaluated').d('待自评'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS_TABLE',
        },
        {
          key: 'selfRatedEvaluated',
          tabPane: intl.get('sslm.supplierEvaluation.tabs.content.selfRatedEvaluated').d('已自评'),
          searchBarCode: 'SSLM.PURCHASER_ASSESS_LIST.ALREADY_ASSESS',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.ALREADY_ASSESS_TABLE',
        },
      ],
    },
  ];
  // 根据权限集控制tab显示
  return permissionCode
    ? TabsConfigData.filter(i => {
        const approvalTab = permissionCode.filter(
          item => item.code === i.permissionCode && item.approve
        );
        return !isEmpty(approvalTab);
      })
    : TabsConfigData;
};

/**
 * @description: 点击编号进入详情页面 / 通过操作按钮点击编辑进入详情页面
 * @param {*} param1 status = 'view' 表示已发布
 * @return {*}
 */
const handleJumpDetail = ({
  history,
  record,
  status = 'view',
  evalHeaderId: newEvalHeaderId,
  tabPaneKey,
}) => {
  const { evalHeaderId } = record?.get(['evalHeaderId', 'scoreStatus']) || {};
  history.push({
    pathname: `/sslm/supplier-evaluation-workbench/details/${status}`,
    search: querystring.stringify({
      evalHeaderId: evalHeaderId || newEvalHeaderId,
      tabPaneKey,
    }),
  });
};

// 跳转评估计划详情页
const handleJumpPlanDetail = (history, record, status = 'view') => {
  const { evalPlanHeaderId } = record?.get(['evalPlanHeaderId']);
  history.push({
    pathname: `/sslm/supplier-evaluation-workbench/plan-details/${status}`,
    search: querystring.stringify({
      evalPlanHeaderId,
      jumpSour: 'supplierEvaluation',
    }),
  });
};

// 质量整改弹窗
const openRelatedQualityModal = (evalHeaderId, history, customizeTable) => {
  Modal.open({
    title: intl
      .get('sslm.supplierEvaluation.button.tableAction.relatedQualityM')
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

/**
 * @description: 操作列渲染
 * @param {*} props
 * @return {*}
 */
// eslint-disable-next-line no-unused-vars
const renderActions = ({ record }, { tabPaneKey, history }) => {
  const evalStatus = record?.get('evalStatus');
  // eslint-disable-next-line no-case-declarations
  switch (tabPaneKey) {
    case 'published':
      // 评分 全部页签
      return (
        <Fragment>
          {(['WAITINGREJECTED', 'BACK'].includes(evalStatus) && (
            <a
              onClick={() =>
                handleJumpDetail({
                  history,
                  record,
                  tabPaneKey,
                  status: 'edit',
                })
              }
            >
              {intl.get('sslm.supplierEvaluation.button.tableAction.selfEvaluated').d('自评')}
            </a>
          )) ||
            '-'}
        </Fragment>
      );
    default:
      return null;
  }
};

/**
 * @description: 表格columns配置
 * @return {*}
 */
const getColumns = ({ tabPaneKey, history, customizeTable }) => {
  const isShowOperations = ['published'].includes(tabPaneKey);
  // 评估计划标识
  const isPlanFlag = ['evaluationPlanAll'].includes(tabPaneKey);
  if (isPlanFlag) {
    // 评估计划Columns
    return [
      {
        name: 'evalStatus',
        width: 200,
        renderer: renderStatus,
      },
      {
        name: 'evalPlanNum',
        width: 200,
        renderer: ({ record, value }) => (
          <a onClick={() => handleJumpPlanDetail(history, record, 'view')}>{value}</a>
        ),
      },
      { name: 'evalPlanDescription', width: 200 },
      { name: 'strategyName', width: 120 },
      { name: 'groupFlag', width: 120, renderer: ({ value }) => yesOrNoRender(value) },
      { name: 'companyName', width: 180 },
      { name: 'realName', width: 120 },
      { name: 'creationDate', width: 120 },
      { name: 'creationTypeMeaning', width: 120 },
    ].filter(Boolean);
  } else {
    // 评估报告Columns
    return [
      {
        name: 'reportStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'problemNum',
        title: intl
          .get('sslm.supplierEvaluation.table.column.label.relatedQuality')
          .d('关联质量整改单据'),
        width: 200,
        hidden: !isShowOperations,
        renderer: ({ record }) => {
          return (
            <Button
              funcType="link"
              onClick={() => {
                openRelatedQualityModal(record.get('evalHeaderId'), history, customizeTable);
              }}
            >
              {intl.get('sslm.supplierEvaluation.table.column.label.view').d('查看')}
            </Button>
          );
        },
      },
      {
        name: 'evalNum',
        width: 200,
        renderer: ({ record, value }) => {
          const reportStatus = record?.get('reportStatus');
          const isViewFlag = isShowOperations || ['FEEDBACK_BAK'].includes(reportStatus);
          return (
            <a
              onClick={() =>
                handleJumpDetail({
                  history,
                  record,
                  tabPaneKey,
                  status: isViewFlag ? 'view' : 'edit',
                })
              }
            >
              {value}
            </a>
          );
        },
      },
      {
        name: 'evalDescription',
        width: 120,
      },
      {
        name: 'groupFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
        renderer: ({ value, record }) => {
          const supplierName = record?.get('supplierName');
          return value || supplierName || '-';
        },
      },
      {
        name: 'assessTypeMeaning',
        width: 120,
      },
      {
        name: 'evalTplName',
        width: 120,
      },
      {
        name: 'needFeedbackFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'evalTypeMeaning',
        width: 120,
      },
      {
        name: 'realName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'sourceTypeMeaning',
        width: 120,
      },
    ];
  }
};

export { getTabsConfig, getColumns };
