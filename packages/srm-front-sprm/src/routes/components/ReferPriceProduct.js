import React from 'react';

import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { referPiceProductDs } from './comomDs';

const renderLadderDetailTable = (ladderPriceLibList = []) => {
  const ladderDs = new DataSet({
    primaryKey: 'ladderPriceLibId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderLineNum`).d('行号'),
        name: 'ladderLineNum',
      },
      {
        label: intl.get(`ssrc.priceLibrary.model.priceLibrary.numberRange`).d('数量范围'),
        name: 'numberRange',
      },
      {
        label: intl.get(`ssrc.priceLibrary.model.priceLibrary.price`).d('价格'),
        name: 'ladderPrice',
      },
      {
        label: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderPriceRemark`).d('备注'),
        name: 'ladderPriceRemark',
      },
    ],
  });
  const columns = [
    { name: 'ladderLineNum', width: 80 },
    {
      name: 'numberRange',
      width: 120,
      renderer: ({ record }) =>
        `[${record.get('ladderFrom') || '-'},${record.get('ladderTo') || '-'})`,
    },
    { name: 'ladderPrice', width: 100 },
    { name: 'ladderPriceRemark', width: 120 },
  ];
  ladderDs.loadData(ladderPriceLibList);
  return (
    <div style={{ width: 450 }}>
      <Table
        bordered
        columns={columns}
        dataSet={ladderDs}
        rowKey="ladderPriceLibId"
        pagination={false}
      />
    </div>
  );
};

const ReferPrice = ({ currentRecord, cuxLable }) => {
  const openModal = () => {
    const referLineDs = new DataSet(referPiceProductDs({ data: currentRecord?.toData() }));
    const cols = [
      { name: 'supplierCompanyNum', width: 150 },
      { name: 'supplierCompanyName', width: 200 },

      { name: 'taxPrice', width: 100, sortable: true },
      { name: 'taxRate', width: 80 },
      { name: 'unitPrice', width: 100 },
      { name: 'marketPrice', width: 100 },
      { name: 'currencyCode', width: 80 },
      {
        name: 'quantity',
        width: 100,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') === 1 ? (
            <Popover
              placement="bottomLeft"
              content={renderLadderDetailTable(record.get('ladderPriceLibList'))}
              arrowPointAtCenter
            >
              <a>
                {`${intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格')}`}
              </a>
            </Popover>
          ) : null,
      },

      { name: 'uomName', width: 100 },
      { name: 'prPriceSourceMeaning', width: 100 },
      { name: 'priceSourceMeaning', width: 100 },
      { name: 'validDateFrom', width: 150, sortable: true },
      { name: 'validDateTo', width: 150, sortable: true },
      { name: 'orderNum', width: 150 },
      { name: 'skuCodeAndName', width: 150 },
      {
        name: 'supplierCode',
        width: 150,
      },
      {
        name: 'supplierName',
        width: 200,
      },
      { name: 'creationDate', width: 150, sortable: true },
      { name: 'productEcSourceFrom', width: 150 },
    ];
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`sprm.common.model.common.referPrice`).d('参考价格'),
      children: (
        <Table style={{ maxHeight: 'calc(100vh - 204px)' }} dataSet={referLineDs} columns={cols} />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  const flag =
    currentRecord &&
    currentRecord.get('itemCode') &&
    currentRecord.get('prSourcePlatform') !== 'CATALOGUE';

  const cuxLableLink = isFunction(cuxLable)
    ? cuxLable({ record: currentRecord })
    : intl.get(`sprm.common.model.common.referDetail`).d('查看详细');

  return flag ? (
    <a onClick={openModal}>
      {cuxLableLink || intl.get(`sprm.common.model.common.referDetail`).d('查看详细')}
    </a>
  ) : null;
};

export default ReferPrice;

// export default withCustomize({
//   unitCode: ['SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL'],
// })(ReferPrice);
