import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Spin, Tooltip } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const AiSourceMatchDetail = function(props) {
  const { digitalEmployeeInfo: { chatId, idList = [] } = {} } = props;
  const [headData, setHeadData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fields = useMemo(
    () => [
      {
        name: 'displayPrNum',
        type: 'string',
        label: intl.get('sprm.aiSource.model.prNum').d('申请号'),
      },
      {
        name: 'displayLineNum',
        type: 'string',
        label: intl.get('sprm.aiSource.model.prLine').d('申请行'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('sprm.common.model.common.itemName').d('物料'),
      },
      {
        name: 'quantity',
        type: 'string',
        label: intl.get('sprm.common.model.common.quantity').d('数量'),
      },
      {
        name: 'filterResults',
        type: 'string',
        label: intl.get('sprm.aiSource.model.filterResults').d('过滤结果'),
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      { name: 'displayPrNum' },
      { name: 'displayLineNum' },
      { name: 'itemName' },
      { name: 'quantity' },
      { name: 'filterResults' },
    ],
    []
  );

  const ds = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        selection: false,
        paging: false,
        fields,
      }),
    []
  );

  useEffect(() => {
    setLoading(true);
    request(`/sprm/v1/${getCurrentOrganizationId()}/smart-pr-transfer/price-sources/result`, {
      method: 'POST',
      body: { chatId, prLineIds: idList },
    })
      .then(res => {
        setHeadData(res);
        ds.loadData(res.prLineList || []);
      })
      .finally(() => setLoading(false));
  }, [chatId, idList]);

  return (
    <Spin spinning={loading}>
      <div className={styles['ai-source-match-detail']}>
        <div className="po-card">
          <div className="po-title">
            {intl.get('sprm.aiSource.view.title.prDetail').d('采购申请详情')}
          </div>
          <div className="po-sub">
            <span className="node-chip">
              {intl.get('sprm.aiSource.view.label.prDoc').d('采购申请单据')}
            </span>
            <br />
            <strong>{headData?.chatNum || '-'}</strong>
            <br />
            <span>
              {intl.get('sprm.aiSource.view.label.sourceEmp').d('来源员工')}：
              {headData?.sourceEmp || '-'}
            </span>
            <span style={{ marginLeft: 32 }}>
              {intl.get('sprm.aiSource.model.createdBy').d('创建人')}：{headData?.createdBy || '-'}
            </span>
          </div>
          <div className="po-metrics">
            <div className="metric-cell">
              <Tooltip title={headData?.lineCount}>
                <strong>{headData?.lineCount ?? '-'} 行</strong>
              </Tooltip>
              <span>{intl.get('sprm.aiSource.view.metric.totalAmount').d('总金额/结果')}</span>
            </div>
            <div className="metric-cell">
              <Tooltip title={headData?.creationDate}>
                <strong>{headData?.createdBy || '-'}</strong>
              </Tooltip>
              <span>{intl.get('sprm.aiSource.view.metric.demandDate').d('需求日期')}</span>
            </div>
            <div className="metric-cell">
              <Tooltip title={headData?.supplierName}>
                <strong>{headData?.supplierName || '-'}</strong>
              </Tooltip>
              <span>{intl.get('sprm.common.model.payment.supplierCompanyName').d('供应商')}</span>
            </div>
          </div>
        </div>

        <div className="doc-table-wrap">
          <Table dataSet={ds} columns={columns} />
        </div>
      </div>
    </Spin>
  );
};

export default formatterCollections({
  code: ['sprm.common', 'sprm.aiSource'],
})(AiSourceMatchDetail);
