import React from "react";
import { Button, DataSet, Modal, Form, TextField, Switch } from 'choerodon-ui/pro';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";

const Index = (props) => {
  const { tableDs, onFormLoaded, rcvTrxHeaderId } = props;

  // 批量编辑
  const handleOpenBatchEdit = () => {
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'attributeTinyint1',
          label: intl.get('scux.receiptWorkbenchLineBatchEdit.model.trip.isGenerateNumbs').d('是否批量生成资产编号'),
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (value) => Number(value),
        },
        {
          name: 'attributeLongtext11',
          type: 'string',
          label: intl.get('scux.receiptWorkbenchLineBatchEdit.model.trip.batchPropertyName').d('批量资产名称'),
        },
      ],
      transport: {
        submit: ({ data }) => {
          const rcvTrxLineIdList = (tableDs?.selected || []).map(r => r.get('rcvTrxLineId'));
          return {
            url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/P8veSRibLEcE8rr0TRFtaDaibur10p7k1rQriaJLNEhGOk`,
            method: 'POST',
            data: {
              rcvTrxLineIdList,
              rcvTrxHeaderId,
              ...(data[0]),
            },
          };
        },
      },
    });
    return Modal.open({
      title: intl.get('scux.receiptWorkbenchLineBatchEdit.view.button.scux.trip.batchEdit').d('批量编辑'),
      destroyOnClose: true,
      drawer: true,
      closable: true,
      style: {
        width: 800,
      },
      children: (
        <Form labelLayout='float' columns={1} dataSet={formDs}>
          <Switch name="attributeTinyint1" />
          <TextField name="attributeLongtext11" />
        </Form>
      ),
      onOk: () => {
        if (onFormLoaded) {
          onFormLoaded(false);
        };
        return formDs.submit().then(res => {
          if (res && !res.failed && tableDs) {
            tableDs.query();
          };
        }).finally(() => {
          if (onFormLoaded) {
            onFormLoaded(true);
          };
        });
      },
    });
  };

  return (
    <Button
      funcType='flat'
      wait={1000}
      onClick={handleOpenBatchEdit}
    >
      {intl.get('scux.receiptWorkbenchLineBatchEdit.view.button.scux.trip.batchEdit').d('批量编辑')}
    </Button>
  )
};

export default formatterCollections({
  code: ['scux.receiptWorkbenchLineBatchEdit']
})(Index);