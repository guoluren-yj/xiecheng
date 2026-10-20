import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import qs from 'qs';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import RenderForm from '@/routes/components/RenderForm';
import { fetchStateDetail } from '@/services/oms/orderSettleService';
import { getResponse } from 'utils/utils';

import { statementDs } from './DetailDs';
import { renderColorStatement } from '../renderTag';

const unitCode = [];

function DetailPage(props) {
  const { customizeForm } = props;
  const { statementsId = '' } = qs.parse(props.history.location.search.substr(1));
  const statementDS = useMemo(() => new DataSet(statementDs(statementsId)), [statementsId]);
  const baseDS = useMemo(() => new DataSet(), [statementsId]);
  useEffect(() => {
    initData(statementsId);
  }, [statementsId]);

  async function initData(id) {
    const res = getResponse(await fetchStateDetail({ statementsId: id }));
    if (res) {
      baseDS.loadData([res]);
    }
  }
  const renderFields = useMemo(
    () => [
      {
        name: 'statementsCode',
        label: intl.get('smodr.settle.model.statementsCode').d('商城对账单编码'),
      },
      {
        name: 'statementsStatusMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.statementsStatusMeaning').d('对账状态'),
        renderer: ({ record, text }) => (
          <Tag style={renderColorStatement(record?.get('statementsStatus'))}>{text}</Tag>
        ),
      },
      {
        name: 'sourceFromMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.sourceFromMeaning').d('来源类型'),
      },
      {
        name: 'statementsTypeMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.statementsTypeMeaning').d('账单出具方'),
      },
      {
        name: 'currencyName',
        label: intl.get('smodr.settle.model.currencyName').d('币种'),
      },
      {
        name: 'statementsNetAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.statementsNetAmountMeaning').d('账单金额(不含税)'),
      },
      {
        name: 'statementsTaxAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.statementsTaxAmountMeaning').d('账单税额'),
      },
      {
        name: 'statementsAmountMeaning',
        type: 'string',
        label: intl.get('smodr.settle.model.statementsAmountMeaning').d('账单金额(含税)'),
      },
      // {
      //   name: 'affairDetail',
      //   label: intl.get('smodr.settle.model.affairCode').d('创建人'),
      // },
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
        name: 'statementsTime',
        // type: 'string',
        label: intl.get('smodr.settle.model.statementsTime').d('账单时间'),
      },
      // {
      //   name: 'affairDetail',
      //   label: intl.get('smodr.settle.model.affairCode').d('最后还款日期'),
      // },
      {
        name: 'creationDate',
        label: intl.get('smodr.settle.model.creationDate').d('创建日期'),
      },
      {
        name: 'remark',
        label: intl.get('smodr.settle.model.statementRemark').d('对账说明'),
      },
    ],
    []
  );

  const tabeColumns = useMemo(
    () => [
      { name: 'matchStatusMeaning' },
      { name: 'differentRemark' },
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
      { name: 'entryAmountMeaning' },
      { name: 'netAmountMeaning', hidden: true },
      { name: 'settlementTime' },
    ],
    []
  );

  return (
    <>
      <Header
        title={intl.get('smodr.settle.model.statementDetail').d('对账单详情')}
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
        <Table
          columns={tabeColumns}
          dataSet={statementDS}
          customizedCode="SMODR.SETTLE.MANAGE.SUPPLIER.STATEMENT.DETAIL.SELECT"
        />
      </Content>
    </>
  );
}

export default withCustomize({ unitCode })(DetailPage);
