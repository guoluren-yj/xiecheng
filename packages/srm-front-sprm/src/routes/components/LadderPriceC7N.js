import React, { useEffect } from 'react';

import { Table, DataSet, useDataSet } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_SPRM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCurrentOrganizationId } from 'utils/utils';
import { referPiceDs } from './comomDs';

const organizationId = getCurrentOrganizationId();

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
      renderer: ({ record }) => `[${record.get('ladderFrom')},${record.get('ladderTo')})`,
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

const ReferPrice = ({ currentRecord, customizeTable, sourceForm, sourceRecord, uomControl, headerDs, modal, remote }) => {
  const referLineDs = useDataSet(() => ({
    ...referPiceDs({ data: currentRecord, sourceForm }),
    autoQuery: true,
    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/line-create/price-library?customizeUnitCode=SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL`,
          method: 'POST',
          data: currentRecord,
        };
      },
    },
  }), [headerDs, currentRecord]);

  const handleSetValue = () => {
    const { selected = [] } = referLineDs;
    const [selectData] = selected.map(i => i.toData());
    const basePriceFlag = headerDs?.getState('basePriceFlag');
    const { taxPrice, unitPrice, taxCode, taxRate, taxId } = selectData || {};

    if (basePriceFlag) {
      sourceRecord.set({ secondaryTaxInUnitPrice: taxPrice, taxCode, taxRate, taxId, taxLov: { taxCode, taxRate, taxId }, taxIncludedUnitPrice: uomControl ? null : taxPrice });
    } else {
      sourceRecord.set({ unitPrice, taxCode, taxRate, taxId, taxLov: { taxCode, taxRate, taxId } });
    }
    if (remote?.event) {
      remote.event.fireEvent('handleCuxReferSetValue', {
        sourceRecord,
        selectData,
        basePriceFlag,
        uomControl,
      });
    }
  };

  useEffect(() => {
    if (['create', 'update'].includes(sourceForm)) {
      modal.update({
        onOk: () => {
          const { selected = [] } = referLineDs;
          if (selected.length === 0) {
            notification.error({ message: intl.get('hzero.common.validation.atLeastOneRecord').d('请至少选择一条数据') });
          } else {
            handleSetValue();
          }
        },
      });
    }
  }, [modal, sourceForm]);

  const cols = [
    { name: 'supplierCompanyNum', width: 100 },
    { name: 'supplierCompanyName', width: 100 },
    {
      name: 'supplierCode',
      width: 100,
    },
    {
      name: 'supplierName',
      width: 100,
    },
    { name: 'taxPrice', width: 80 },
    { name: 'unitPrice', width: 80 },
    { name: 'uomName', width: 80 },
    { name: 'currencyCode', width: 80 },
    { name: 'taxCode', width: 80 },
    { name: 'taxRate', width: 80 },
    {
      name: 'quantity',
      width: 80,
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
    { name: 'priceSourceMeaning', width: 80 },
    { name: 'orderNum', width: 100 },
    { name: 'validDateFrom', width: 100 },
    { name: 'validDateTo', width: 100 },
    { name: 'creationDate', width: 100 },
  ];

  return customizeTable(
    {
      code: 'SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL',
    },
    <Table
      style={{ maxHeight: 'calc(100vh - 174px)' }}
      dataSet={referLineDs}
      columns={cols}
      onRow={(row) => {
        const handleSelect = ({ dataSet, record: _record }) => {
          if (dataSet && _record) {
            dataSet.select(_record);
          }
        };
        return {
          onClick: () => handleSelect(row),
          onDoubleClick: () => {
            if (row?.record?.selectable) {
              handleSelect(row);
              handleSetValue();
              modal.close();
            }
          },
        };
      }}
    />
  );
};

export default withCustomize({
  unitCode: ['SPRM.PURCHASE_EXECUTION.C7NLADDERPRICEMODAL'],
})(ReferPrice);
