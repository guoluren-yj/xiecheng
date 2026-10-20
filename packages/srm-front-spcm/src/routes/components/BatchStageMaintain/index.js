import React from 'react';
import { Button, Form, Modal, DataSet, NumberField, Lov } from 'choerodon-ui/pro';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';

import { stageBatchAddDS } from './stageBatchAddDS';

const BatchStageMaintainContent = withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGEBATCH'],
})(props => {
  const { customizeForm, ds } = props;
  return customizeForm(
    {
      code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGEBATCH',
      dataSet: ds,
    },
    <Form dataSet={ds} columns={1}>
      <NumberField name="payRatio" />
      <Lov name="supplierCurrencyCode" />
      <Lov name="purchaseCurrencyCode" />
      <NumberField name="exchangeRate" />
      <Lov name="typeId" />
      <NumberField name="costQuantity" />
    </Form>
  );
});

export default function BatchStageMaintain(props) {
  const {
    dataSet,
    type = 'c7n',
    dataSource,
    onChangeListData,
    headerInfo = {},
  } = props;

  const batchMaintain = async (lineDataSet) => {
    const ds = new DataSet(stageBatchAddDS(headerInfo));
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      drawer: true,
      title: intl.get(`spcm.common.button.stageBatchAdd`).d('阶段批量编辑'),
      children: <BatchStageMaintainContent ds={ds} />,
      style: { width: '380px' },
      onOk: () => {
        const { _status, ...batchInfo } = ds?.current?.toJSONData() || {};
        if (type === 'c7n' && lineDataSet.length) {
          lineDataSet.forEach((record) => {
            record.set(batchInfo);
            record.set(
              'exchangeRate',
              record?.get('purchaseCurrencyCode') === record?.get('supplierCurrencyCode')
                ? 1
                : batchInfo?.exchangeRate
            );
          });
        } else if (type === 'h0' && dataSource.length) {
          const pcStageDataSource = dataSource.map((record) => {
            if (record?.$form) {
              record.$form.resetFields();
            }
            const data = {
              ...record,
              ...batchInfo,
            };
            return {
              ...data,
              exchangeRate:
                data?.purchaseCurrencyCode === data?.supplierCurrencyCode
                  ? 1
                  : batchInfo?.exchangeRate,
            };
          });
          onChangeListData({ pcStageDataSource });
        }
      },
    });
  };

  return (
    <Button onClick={() => batchMaintain(dataSet)}>
      {intl.get(`spcm.common.model.common.batchMaintain`).d('批量维护')}
    </Button>
  );
}

