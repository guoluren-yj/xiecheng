import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import qs from 'qs';
import { Tag } from 'choerodon-ui';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import RenderForm from '@/routes/components/RenderForm';
import { getResponse } from 'utils/utils';

import { affairDs } from './DetailDs';
import { fetchInvoiceAppDetail } from '@/services/oms/orderSettleService';
import HeadLine from '@/routes/components/HeadLine';

import { renderColorRequest } from '../renderTag';

const unitCode = [];

function DetailPage(props) {
  const { customizeForm } = props;
  const { requestId = '' } = qs.parse(props.history.location.search.substr(1));
  const affairDS = useMemo(() => new DataSet(affairDs(requestId)), []);
  const baseDS = useMemo(() => new DataSet(), []);
  const invoiceDS = useMemo(() => new DataSet(), []);
  useEffect(() => {
    initData(requestId);
  }, [requestId]);

  async function initData(id) {
    const res = getResponse(await fetchInvoiceAppDetail({ requestId: id }));
    if (res) {
      baseDS.loadData([res]);
      invoiceDS.loadData([res]);
    }
  }
  const renderFields = useMemo(
    () => [
      {
        name: 'applicationNo',
        type: 'string',
        label: intl.get('smodr.settle.model.applyInvoieNum').d('开票申请编码'),
      },
      {
        name: 'requestStatusMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceStatus').d('开票状态'),
        renderer: ({ record, text }) => (
          <Tag style={renderColorRequest(record?.get('requestStatus'))}>{text}</Tag>
        ),
      },
      {
        name: 'sourceFromMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
      },
      {
        name: 'currencyName',
        type: 'string',
        label: intl.get('smodr.settle.model.currencyName').d('币种'),
      },
      {
        name: 'requestNetAmountMeaning',
        label: intl.get('smodr.settle.model.requestNetAmountMeaning').d('发票金额(不含税)'),
      },
      {
        name: 'requestTaxAmountMeaning',
        label: intl.get('smodr.settle.model.requestTaxAmountMeaning').d('发票税额'),
      },
      {
        name: 'requestAmountMeaning',
        label: intl.get('smodr.settle.model.requestAmountMeaning').d('发票金额(含税)'),
      },
      {
        name: 'creationByName',
        type: 'string',
        label: intl.get('smodr.settle.model.creationByName').d('申请人'),
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
      {
        name: 'creationDate',
        label: intl.get('smodr.settle.model.applyTime').d('申请时间'),
      },
    ],
    []
  );

  const invoiceFields = useMemo(
    () => [
      {
        name: 'invoiceTypeMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceTypeMeaning').d('发票类型'),
      },
      {
        name: 'invoiceStateMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceStatusType').d('开票方式'),
      },
      {
        name: 'invoiceHeader',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceHeader').d('发票抬头'),
      },
      {
        name: 'invoiceContentDetail',
        type: 'string',
        label: intl.get('smodr.settle.model.invoiceContentDetail').d('发票内容'),
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
      { name: 'uomName', hidden: true },
      { name: 'taxRate', hidden: true },
      { name: 'currencyName', hidden: true },
      { name: 'unitPriceMeaning' },
      { name: 'unitNakedPriceMeaning', hidden: true },
      { name: 'invoiceOrderAmountMeaning' },
      { name: 'invoiceOrderNetAmountMeaning', hidden: true },
      { name: 'settlementTime' },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl.get('smodr.settle.model.applyInvoiceDetail').d('开票申请详情')}
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
        <HeadLine
          title={intl.get('smodr.settle.model.invoiceInfo').d('发票信息')}
          style={{ marginTop: '32px' }}
        />
        <RenderForm
          columns={3}
          dataSet={invoiceDS}
          fields={invoiceFields}
          customizeForm={customizeForm}
        />
      </Content>
      <Content>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          {intl.get('smodr.settle.model.affairInfo').d('事务信息')}
        </div>
        <Table
          columns={tabeColumns}
          dataSet={affairDS}
          customizedCode="SMODR.SETTLE.MANAGE.INVOICE.APPLY.DETAIL.SELECT"
        />
      </Content>
    </>
  );
}

export default withCustomize({ unitCode })(DetailPage);
