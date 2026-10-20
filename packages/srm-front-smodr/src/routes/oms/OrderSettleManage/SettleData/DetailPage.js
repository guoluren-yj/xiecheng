import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import qs from 'qs';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import RenderForm from '@/routes/components/RenderForm';
import { getResponse } from 'utils/utils';

import { affairDs } from './DetailDs';
import { fetchSettleDetail } from '@/services/oms/orderSettleService';
import { renderColorInvoice, renderColorStatement } from '../renderTag';

const unitCode = [];

function DetailPage(props) {
  const { customizeForm } = props;
  const { settlementId = '' } = qs.parse(props.history.location.search.substr(1));
  const affairDS = useMemo(() => new DataSet(affairDs(settlementId)), []);
  const baseDS = useMemo(() => new DataSet(), []);
  useEffect(() => {
    initData(settlementId);
  }, [settlementId]);

  async function initData(id) {
    const res = getResponse(await fetchSettleDetail({ settlementId: id }));
    if (res) {
      baseDS.loadData([res]);
    }
  }
  const renderFields = useMemo(
    () => [
      {
        name: 'settlementCode',
        label: intl.get('smodr.settle.model.settlementCode').d('事务编码'),
      },
      {
        name: 'sourceDocumentCode',
        label: intl.get('smodr.settle.model.sourceDocumentCode').d('来源单据编码'),
      },
      {
        name: 'orderCode',
        label: intl.get('smodr.settle.model.orderCode').d('商城订单编码'),
      },
      {
        name: 'sourceDocumentTypeMeaning',
        label: intl.get('smodr.settle.model.sourceDocumentTypeMeaning').d('来源单据类型'),
      },
      {
        name: 'sourceFromMeaning',
        label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
      },
      {
        name: 'currencyName',
        label: intl.get('smodr.settle.model.currencyName').d('币种'),
      },
      {
        name: 'settlementNetAmountMeaning',
        label: intl.get('smodr.settle.model.settlementNetAmountMeaning').d('事务金额(不含税)'),
      },
      {
        name: 'settlementTaxAmountMeaning',
        label: intl.get('smodr.settle.model.settlementTaxAmountMeaning').d('事务税额'),
      },
      {
        name: 'settlementAmountMeaning',
        label: intl.get('smodr.settle.model.settlementAmountMeaning').d('事务金额(含税)'),
      },
      {
        name: 'purchaseCompanyName',
        label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
      },
      {
        name: 'settlementTime',
        label: intl.get('smodr.settle.model.settlementDate').d('事务日期'),
      },
    ],
    []
  );

  const tabeColumns = useMemo(
    () => [
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'entryCode' },
      {
        name: 'statementsStatusMeaning',
        renderer: ({ record, text }) => (
          <Tag style={renderColorStatement(record.get('statementsStatus'))}>{text}</Tag>
        ),
      },
      {
        name: 'invoiceStatusMeaning',
        renderer: ({ record, text }) => (
          <Tag style={renderColorInvoice(record.get('invoiceStatus'))}>{text}</Tag>
        ),
      },
      { name: 'quantityMeaning' },
      { name: 'unitPriceMeaning' },
      { name: 'entryAmountMeaning' },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl.get('smodr.settle.model.affairDetail').d('事务详情')}
        backPath="/s2-mall/oms/order-settle-manage/list"
      />
      <Content>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          {intl.get('smodr.settle.model.baseInfo').d('基本信息')}
        </div>
        <RenderForm
          columns={3}
          dataSet={baseDS}
          fields={renderFields}
          customizeForm={customizeForm}
          style={{
            width: '75%',
          }}
        />
      </Content>
      <Content>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          {intl.get('smodr.settle.model.affairInfo').d('事务信息')}
        </div>
        <Table columns={tabeColumns} dataSet={affairDS} />
      </Content>
    </>
  );
}

export default withCustomize({ unitCode })(DetailPage);
