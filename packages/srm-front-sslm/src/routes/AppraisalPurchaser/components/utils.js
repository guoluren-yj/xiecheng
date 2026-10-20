/*
 * @Date: 2023-12-19 10:23:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from '../styles.less';
import ExecutionDocument from './ExecutionDocument';
import { getParamQueryDs, getParamQueryColumns } from '../stores/getParamQueryDS';
import {
  getScoreStatusDs,
  getScoreStatusColumns,
  getSystemStatusDs,
  getSystemStatusColumns,
} from '../stores/getScoreStatusDS';

// 评分人，筛选器code
export const scorerSearchCode = {
  INDICATOR: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_INDICATOR_SEARCH',
  SUPPLIER: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_SUPPLIER_SEARCH',
  CATEGORY: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_CATEGORY_SEARCH',
  ITEM: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_ITEM_SEARCH',
  RATER: 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_DESIGNATED_SEARCH',
  'SUPPLIER+INDICATOR': 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_SUPPLIER_INDICATOR_SEARCH',
  'SU+CA+IN': 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_SU_CA_IN_SEARCH',
  'SU+IT+IN': 'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORER_SU_IT_IN_SEARCH',
};

// 系统计算-参数值查询
export const handleParamQuery = record => {
  const evalDtlId = record.get('evalDtlId');
  const paramQueryDs = new DataSet(getParamQueryDs({ evalDtlId }));
  Modal.open({
    drawer: true,
    okCancel: false,
    key: Modal.key(),
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sslm.common.view.title.paramQuery').d('参数值查询'),
    children: (
      <Table
        dataSet={paramQueryDs}
        columns={getParamQueryColumns()}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        customizedCode="sslm.appraisal_purchaser.param_query"
      />
    ),
  });
};

// 查看评分完成情况
export const hanldeScoreStatus = record => {
  const { evalDtlId, scoreType } = record?.get(['evalDtlId', 'scoreType']) || {};
  const isSystem = scoreType === 'SYSTEM';
  const getFieldsMethod = isSystem ? getSystemStatusDs : getScoreStatusDs;
  const statusDs = new DataSet(getFieldsMethod({ evalDtlId }));
  const statusColumns = isSystem ? getSystemStatusColumns() : getScoreStatusColumns();
  Modal.open({
    drawer: true,
    key: Modal.key(),
    cancelButton: false,
    style: { width: isSystem ? 742 : 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl
      .get(`sslm.supplierDocManage.model.docManage.evaluationStatusTitle`)
      .d('评分完成情况'),
    children: (
      <Table
        dataSet={statusDs}
        columns={statusColumns}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        customizedCode="SSLM.APPRAISAL_PURCHASER.EVALUATION_STATUS"
      />
    ),
  });
};

// 查看执行单据
export const handleExecutionDocument = record => {
  const { supplierId, evalLineId, evalHeaderId, executeRectifyCount, executeLevelCount } =
    record?.get([
      'supplierId',
      'evalLineId',
      'evalHeaderId',
      'executeRectifyCount',
      'executeLevelCount',
    ]) || {};
  Modal.open({
    drawer: true,
    key: Modal.key(),
    cancelButton: false,
    style: { width: 1090 },
    className: styles['execution-document-modal'],
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('sslm.common.view.title.viewExecutionDocuments').d('查看执行单据'),
    children: (
      <ExecutionDocument
        supplierId={supplierId}
        evalLineId={evalLineId}
        evalHeaderId={evalHeaderId}
        executeLevelCount={executeLevelCount}
        executeRectifyCount={executeRectifyCount}
      />
    ),
  });
};
