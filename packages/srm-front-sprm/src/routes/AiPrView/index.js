import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Spin, Tooltip } from 'choerodon-ui/pro';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const AiPrView = function AiPrView(props) {
  const { digitalEmployeeInfo: { chatId, idList = [], path } = {} } = props;
  const { transferStatus } = querystring.parse(path?.split('?')[1] || '') || {};
  const [headData, setHeadData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fields = useMemo(
    () => [
      {
        name: 'displayPrNum',
        type: 'string',
        label: intl.get('sprm.common.model.common.displayPrNum').d('申请号'),
      },
      {
        name: 'displayLineNum',
        type: 'string',
        label: intl.get('sprm.aiSource.model.prLine').d('申请行'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('sprm.common.model.common.itemName').d('物料名称'),
      },
      {
        name: 'quantity',
        type: 'string',
        label: intl.get('sprm.common.model.common.quantity').d('数量'),
      },
      {
        name: 'sourceEmp',
        type: 'string',
        label: intl.get('sprm.aiSource.model.sourceEmp').d('采购员'),
      },
      {
        name: 'sourceResultTypeMeaning',
        type: 'string',
        label: intl.get('sprm.aiSource.model.sourceResultTypeMeaning').d('货源匹配'),
      },
      {
        name: 'transferStatusMeaning',
        type: 'string',
        label: intl.get('sprm.aiSource.model.transferStatusMeaning').d('转单状态'),
      },
      {
        name: 'transferStatus',
        type: 'string',
      },
      {
        name: 'transferFailReason',
        type: 'string',
        label: intl.get('sprm.aiSource.model.transferFailReason').d('转单失败原因'),
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
      { name: 'sourceEmp' },
      { name: 'sourceResultTypeMeaning' },
      transferStatus === 'FAILED'
        ? { name: 'transferFailReason' }
        : {
            name: 'transferStatusMeaning',
            renderer: ({ record, value }) =>
              record.get('transferStatus') === 'FAILED' ? (
                <Tooltip title={record.get('transferFailReason')}>
                  <span>{value}</span>
                </Tooltip>
              ) : (
                value
              ),
          },
    ],
    [transferStatus]
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
      body: { chatId, prLineIds: idList, transferStatus },
    })
      .then(res => {
        setHeadData(res);
        ds.loadData(res.prLineList || []);
      })
      .finally(() => setLoading(false));
  }, [chatId, idList, transferStatus]);

  return (
    <Spin spinning={loading}>
      <div className={styles['ai-pr-view']}>
        <div className="po-card">
          <div className="po-title">
            {intl.get('sprm.aiSource.view.title.sourcePrDetail').d('采购申请详情')}
          </div>
          <div className="po-sub">
            <span className="node-chip">
              {intl.get('sprm.aiSource.view.metric.taskResult').d('结果')}: {headData?.lineCount}行
            </span>
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
})(AiPrView);
