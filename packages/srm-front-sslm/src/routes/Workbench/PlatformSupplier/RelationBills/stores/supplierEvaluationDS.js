import React from 'react';
import querystring from 'querystring';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SSLM } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { ProgressStep } from '@/routes/PurchaserEvaluationWorkbench/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

const organizationId = getCurrentOrganizationId();

const supplierEvaluationDS = params => ({
  pageSize: 20,
  selection: false,
  primaryKey: 'evalHeaderId',
  fields: [
    {
      name: 'reportStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'evalNum',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalNum').d('评估报告编号'),
    },
    {
      name: 'evalNumRe',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalNum').d('评估报告编号'),
    },
    {
      name: 'progressStatus',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateProgress').d('评估进度'),
    },
    {
      name: 'evalDescription',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.evalDescription')
        .d('评估报告描述'),
    },
    {
      name: 'groupFlag',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.groupFlag').d('是否集团级'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.companyName').d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl
        .get('sslm.purchaserEvaluation.table.column.label.supplierCompanyName')
        .d('供应商'),
    },
    {
      name: 'resultsFlag',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluationResult').d('评估结果'),
    },
    {
      name: 'finalScore',
      type: 'number',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateScore').d('评估得分'),
    },
    {
      name: 'grade',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evaluateLevel').d('评估等级'),
    },
    {
      name: 'strategyName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.strategyName').d('评估策略'),
    },
    {
      name: 'evalTplName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalTplName').d('评估模板名称'),
    },
    {
      name: 'evalType',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.evalType').d('评分方式'),
    },
    {
      name: 'assessType',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.assessType').d('评估类型'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.purchaserEvaluation.table.column.label.creationDate').d('创建时间'),
    },
    {
      name: 'operationRecord',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { companyId, supplierCompanyId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/site-eval-headers/eval-report-header`,
        method: 'GET',
        data: filterNullValueObject({
          companyId,
          supplierCompanyId,
          isLifeCyclesSummaryFlag: 1,
          customizeUnitCode:
            'SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.EVALUATION_REPORT,SSLM.SUPPLIER_WORKBENCH_RELATED_DOC.SUPPLIER_EVALUATION_SEARCH_BAR',
          ...data,
        }),
      };
    },
  },
});

/**
 * @description: 点击编号进入详情页面 / 通过操作按钮点击编辑进入详情页面
 * @param {*} param1
 * @return {*}
 */
const handleJumpDetail = ({ history, record, openTabFlag }) => {
  const evalHeaderId = record?.get('evalHeaderId');
  if (openTabFlag) {
    openTab({
      key: '/sslm/include/purchaser-evaluation-workbench/details/view',
      title: intl.get('sslm.purchaserEvaluationDetail.view.header.viewTitle').d('查看评估报告'),
      search: querystring.stringify({
        evalHeaderId,
      }),
    });
  } else {
    history.push({
      pathname: `/sslm/purchaser-evaluation-workbench/details/view`,
      search: querystring.stringify({
        evalHeaderId,
      }),
    });
  }
};

/**
 * @description: 表格columns配置
 * @return {*}
 */
const getColumns = ({ history, progressList = [] }) => {
  return [
    {
      name: 'reportStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'operationRecord',
      width: 120,
      renderer: ({ record }) => {
        const evalHeaderId = record?.get('evalHeaderId');
        return (
          <Button
            funcType="link"
            onClick={() =>
              operationRecordsModal({
                documentType: 'REPORT_EVAL',
                documentId: evalHeaderId,
              })
            }
          >
            {intl.get('hzero.common.button.operation').d('操作记录')}
          </Button>
        );
      },
    },
    {
      name: 'evalNum',
      width: 120,
      renderer: ({ record, value }) => (
        <a onClick={() => handleJumpDetail({ history, record })}>{value}</a>
      ),
    },
    {
      name: 'evalNumRe',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => handleJumpDetail({ history, record, openTabFlag: true })}>
          {record.get('evalNum')}
        </a>
      ),
    },
    {
      name: 'progressStatus',
      width: 120,
      renderer: ({ value, record }) => {
        return <ProgressStep record={record} currentValue={value} progressList={progressList} />;
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
      width: 120,
      renderer: ({ value, record }) => {
        const supplierName = record?.get('supplierName');
        return value || supplierName || '-';
      },
    },
    {
      name: 'resultsFlag',
      width: 120,
    },
    {
      name: 'finalScore',
      width: 120,
    },
    {
      name: 'grade',
      width: 120,
    },
    {
      name: 'strategyName',
      width: 120,
    },
    {
      name: 'evalTplName',
      width: 120,
    },
    {
      name: 'evalType',
      width: 120,
    },
    {
      name: 'assessType',
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
  ];
};

export { getColumns, supplierEvaluationDS };
