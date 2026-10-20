import React, { useMemo, useState, useEffect } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

const AiOrderView = function(props) {
  const { digitalEmployeeInfo: { chatId, idList = [] } = {} } = props;
  const [headData, setHeadData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    request(`/sprm/v1/${getCurrentOrganizationId()}/smart-pr-transfer/order-results`, {
      method: 'GET',
      query: { chatId },
    })
      .then(res => {
        setHeadData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [chatId, idList]);

  const ds = useMemo(
    () =>
      new DataSet({
        autoQuery: true,
        paging: true,
        pageSize: 20,
        selection: false,
        primaryKey: 'poLineId',
        fields: [
          { name: 'poNum', type: 'string' },
          { name: 'poLineNum', type: 'string' },
          {
            name: 'itemCode',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemCode').d('物料编码'),
          },
          {
            name: 'itemName',
            type: 'string',
            label: intl.get('sprm.common.model.common.itemName').d('物料名称'),
          },
          {
            name: 'uomName',
            type: 'string',
            label: intl.get('sprm.common.model.common.uom').d('单位'),
          },
          {
            name: 'quantity',
            type: 'number',
            label: intl.get('sprm.common.model.common.quantity').d('数量'),
          },
          {
            name: 'unitPrice',
            type: 'number',
            label: intl.get('sprm.aiSource.model.unitPrice').d('单价'),
          },
          {
            name: 'taxRate',
            type: 'number',
            label: intl.get('sprm.aiSource.model.taxRate').d('税率'),
          },
          {
            name: 'supplierCompanyName',
            type: 'string',
            label: intl.get('sprm.common.model.payment.supplierCompanyName').d('供应商'),
          },
          {
            name: 'amount',
            type: 'number',
            label: intl.get('sprm.aiSource.model.amount').d('金额'),
          },
          {
            name: 'deliveryDate',
            type: 'string',
            label: intl.get('sprm.aiSource.model.deliveryDate').d('交货日期'),
          },
          {
            name: 'sourcePrLineSummary',
            type: 'string',
            label: intl.get('sprm.aiSource.model.sourcePrLineSummary').d('采购申请行'),
          },
        ],
        transport: {
          read({ data }) {
            return {
              url: `/sprm/v1/${getCurrentOrganizationId()}/smart-pr-transfer/order-results/page`,
              method: 'GET',
              data: { ...data, chatId },
            };
          },
        },
      }),
    [chatId]
  );

  const columns = useMemo(
    () => [
      {
        name: 'poNum',
        renderer: ({ record }) => `${record.get('poNum') || ''}-${record.get('poLineNum') || ''}`,
        header: intl.get('sprm.aiSource.model.poLine').d('订单号-行号'),
      },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'uomName' },
      { name: 'quantity' },
      { name: 'unitPrice' },
      { name: 'taxRate' },
      { name: 'supplierCompanyName' },
      { name: 'amount' },
      { name: 'deliveryDate' },
      { name: 'sourcePrLineSummary' },
    ],
    []
  );

  return (
    <Spin spinning={loading}>
      <div className={styles['ai-order-view']}>
        <div className="po-card">
          <div className="po-title">
            {intl.get('sprm.aiSource.view.title.orderResult').d('已为您生成订单')}
          </div>
          <div className="po-sub">
            <span className="node-chip">
              {intl.get('sprm.aiSource.view.label.order').d('采购订单单据')}
            </span>
            <br />
            <span>
              {intl.get('sprm.aiSource.view.label.sourceEmp').d('来源员工')}：
              {headData?.sourceEmp || '-'}
            </span>
            <span style={{ marginLeft: 32 }}>
              {intl.get('sprm.aiSource.model.createdBy').d('创建人')}：{headData?.createdBy || '-'}
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
})(AiOrderView);
