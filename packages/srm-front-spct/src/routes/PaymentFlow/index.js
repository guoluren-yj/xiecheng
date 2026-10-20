import React, { useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import SearchBarTable from '_components/SearchBarTable';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPCT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react-lite';

import { tableDs } from './ds.js';

function PaymentFlow(props) {
  const { customizeTable } = props;
  const organizationId = getCurrentOrganizationId();
  const mapColor = {
    UNPAID: 'yellow', // 待支付
    PAID: 'green', // 已支付
    CANCELLED: 'gray', // 已取消
    UNREF: 'yellow', // 待退款
    REFUNDING: 'yellow', // 退款中
    REFUNDED: 'green', // 已退款
    FAILED: 'red', // 退款失败
    REFUSED: 'red', // 退款拒接
  };

  const tagRender = ({ record, value }) => {
    if (!record || !value) return '-';
    const { status, statusMeaning } = record.get(['status', 'statusMeaning']);
    const color = mapColor[status] || 'gray';
    return (
      <Tag color={color} style={{ border: 'none', fontWeight: 500 }}>
        {statusMeaning}
      </Tag>
    );
  };
  const ds = useMemo(() => new DataSet(tableDs()), []);
  const columns = useMemo(
    () => [
      {
        name: 'statusMeaning',
        renderer: tagRender,
      },
      {
        name: 'transactionSerialNum',
        width: 200,
      },
      {
        name: 'merchantOrderNum',
        width: 160,
      },
      {
        name: 'channelTradeNo',
        width: 220,
      },
      {
        name: 'transactionTypeMeaning',
      },
      {
        name: 'amount',
        align: 'right',
        width: 110,
      },
      {
        name: 'currencyName',
      },
      {
        name: 'channelMeaning',
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'payTagMeaning',
      },
      {
        name: 'createdByName',
      },
      {
        name: 'lastUpdateDate',
        width: 140,
      },
    ],
    []
  );
  const Export = observer(({ dataSet }) => {
    const isSelected = dataSet?.selected?.length;
    return (
      <ExcelExportPro
        requestUrl={`${SRM_SPCT}/v1/${organizationId}/payment-orders/flow-export`}
        queryParams={() => {
          const query = dataSet?.queryDataSet?.current?.toData() || {};
          delete query.__dirty;
          delete query.__id;
          delete query._status;
          if (isSelected) {
            query.transactionSerialNums = dataSet?.selected.map((i) =>
              i.get('transactionSerialNum')
            );
          }
          query.customizeUnitCode = 'SMODR.ORDER.ENTRY.HEADER.QUERY,SMODR.ORDER.ENTRY.DETAIL';
          return query;
        }}
        templateCode="SRM_C_SRM_SPCT_PAYMENT_ORDER_EXPORT"
        buttonText={
          isSelected
            ? intl.get('spct.paymentFlow.view.exportSelected').d('勾选导出')
            : intl.get('spct.paymentFlow.view.export').d('导出')
        }
        otherButtonProps={{
          icon: 'unarchive',
          type: 'c7n-pro',
          funcType: 'flat',
          style: { border: 'none' },
        }}
      />
    );
  });
  return (
    <>
      <Header title={intl.get('spct.paymentFlow.view.paymentFlowQuery').d('支付流水查询')}>
        <Export dataSet={ds} />
      </Header>
      <Content>
        {customizeTable(
          { code: 'SPCT.PAYMENT.FLOW.QUERY.TABLE.INFO' },
          <SearchBarTable
            dataSet={ds}
            columns={columns}
            style={{ maxHeight: `calc(100vh - 200px)` }}
            searchCode="SPCT.PAYMENT.FLOW.QUERY.SEARCH_BAR"
            customizedCode="SPCT.PAYMENT.FLOW.QUERY.SEARCH_BAR"
          />
        )}
      </Content>
    </>
  );
}

export default compose(
  formatterCollections({
    code: ['spct.paymentFlow'],
  }),
  withCustomize({ unitCode: ['SPCT.PAYMENT.FLOW.QUERY.TABLE.INFO'] })
)(PaymentFlow);
