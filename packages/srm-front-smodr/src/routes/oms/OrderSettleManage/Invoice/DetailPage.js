import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import qs from 'qs';
import { Tag } from 'choerodon-ui';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import RenderForm from '@/routes/components/RenderForm';
import { getResponse } from 'utils/utils';
import { fetchInvoiceDetail } from '@/services/oms/orderSettleService';

import { affairDs } from './DetailDs';
import { renderColorRequest } from '../renderTag';

const unitCode = [];

function DetailPage(props) {
  const { customizeForm } = props;
  const { invoiceId = '' } = qs.parse(props.history.location.search.substr(1));
  const affairDS = useMemo(() => new DataSet(affairDs(invoiceId)), []);
  const baseDS = useMemo(() => new DataSet(), []);
  useEffect(() => {
    initData(invoiceId);
  }, [invoiceId]);

  async function initData(id) {
    const res = getResponse(await fetchInvoiceDetail({ invoiceId: id }));
    if (res) {
      baseDS.loadData([res]);
    }
  }
  const renderFields = useMemo(
    () => [
      {
        name: 'invoiceCode',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceCode').d('发票号码'),
      },
      {
        name: 'invoiceBatch',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceBatch').d('发票代码'),
      },
      {
        name: 'applicationNo',
        type: 'string',
        label: intl.get('smodr.settle.model.applicationNo').d('开票申请编码'),
      },
      {
        name: 'invoiceTypeMeaning',
        label: intl.get('smodr.settle.model.invoiceType').d('发票种类'),
      },
      {
        name: 'invoiceTime',
        // type: 'string',
        label: intl.get('smodr.settle.model.invoiceTime').d('开票日期'),
      },
      {
        name: 'requestStatusMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.requestStatusMeaning').d('发票状态'),
        renderer: ({ record, text }) => (
          <Tag style={renderColorRequest(record?.get('requestStatus'))}>{text}</Tag>
        ),
      },
      {
        type: 'string',
        name: 'invoiceContentCode',
        label: intl.get('smodr.settle.model.invoiceContentCode').d('开票内容'),
      },
      {
        type: 'string',
        name: 'invoiceFormatMeaning',
        label: intl.get('smodr.settle.model.invoiceFormatMeaning').d('发票材质'),
      },
      {
        type: 'string',
        name: 'invoiceStateMeaning',
        label: intl.get('smodr.settle.model.invoiceStateMeaning').d('开票方式'),
      },
      {
        name: 'invoiceAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceAmountMeaning').d('发票总金额(含税)'),
      },
      {
        name: 'invoiceOrderNetAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceOrderNetAmountMeaning').d('发票总金额(不含税)'),
      },
      {
        name: 'invoiceTaxAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceTaxAmountMeaning').d('税额'),
      },
      {
        name: 'invoiceTitle',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceTitle').d('发票抬头'),
      },
      {
        name: 'taxRegistrationNumber',
        type: 'string',
        label: intl.get('smodr.settle.model.taxRegistrationNumber').d('纳税人识别号'),
      },
      {
        name: 'depositBank',
        type: 'string',
        label: intl.get('smodr.settle.model.depositBank').d('开户银行'),
      },
      {
        name: 'bankAccountNum',
        type: 'string',
        label: intl.get('smodr.settle.model.bankAccountNumber').d('银行账户'),
      },
      {
        name: 'billToAddress',
        type: 'string',
        label: intl.get('smodr.settle.model.billToAddress').d('联系地址'),
      },
      {
        name: 'billToContact',
        type: 'string',
        label: intl.get('smodr.settle.model.billToContact').d('联系电话'),
      },
      {
        name: 'purchaseCompanyName',
        type: 'string',
        label: intl.get('smodr.settle.model.purchaseCompanyName').d('采购方公司'),
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        label: intl.get('smodr.settle.model.supplierCompanyName').d('供应商公司'),
      },
    ],
    []
  );

  const tabeColumns = useMemo(
    () => [
      { name: 'settlementCodeLine', width: 120 },
      { name: 'sourceDocumentCode' },
      { name: 'sourceDocumentTypeMeaning' },
      { name: 'orderCode', hidden: true },
      { name: 'ecConsignmentCode', hidden: true },
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'quantityMeaning' },
      { name: 'unitNakedPriceMeaning' },
      { name: 'unitPriceMeaning' },
      { name: 'invoiceOrderNetAmountMeaning' },
      { name: 'invoiceOrderAmountMeaning' },
      { name: 'taxRate' },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl.get('smodr.settle.model.invoiceDetail').d('发票详情')}
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
          {intl.get('smodr.settle.model.invoiceDetailInfo').d('发票明细信息')}
        </div>
        <Table
          columns={tabeColumns}
          dataSet={affairDS}
          customizedCode="SMODR.SETTLE.MANAGE.INVOICE.DETAIL.SELECT"
        />
      </Content>
    </>
  );
}

export default withCustomize({ unitCode })(DetailPage);
