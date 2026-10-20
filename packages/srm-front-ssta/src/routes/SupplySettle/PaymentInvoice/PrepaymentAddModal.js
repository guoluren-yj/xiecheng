import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { prepaymentAddDS as prepaymentAddDs } from '@/stores/SupplySettleDS';
import { decimalPointAccuracy } from '@/routes/utils';
// import { addPrepayment } from '@/services/settlePoolServices';

const PrepaymentAddModal = (props) => {
  const { topRecord, queryPrepayment, prepaymentLineIdList, modal } = props;

  const prepaymentAddDS = useMemo(() => {
    return new DataSet(prepaymentAddDs());
  }, []);

  useEffect(() => {
    prepaymentAddDS.setQueryParameter('settleHeaderId', topRecord.get('settleHeaderId'));
    prepaymentAddDS.setQueryParameter('currencyCode', topRecord.get('currencyCode'));
    prepaymentAddDS.setQueryParameter('companyId', topRecord.get('companyId'));
    prepaymentAddDS.setQueryParameter('supplierId', topRecord.get('supplierId'));
    prepaymentAddDS.setQueryParameter('supplierCompanyId', topRecord.get('supplierCompanyId'));
    prepaymentAddDS.setQueryParameter('ouId', topRecord.get('ouId'));
    prepaymentAddDS.setQueryParameter('prepaymentLineIdList', prepaymentLineIdList);
    prepaymentAddDS.isLine = false;
    prepaymentAddDS.query();
  }, []);

  const columns = [
    {
      width: 150,
      name: 'prepaymentRemainingAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 250,
      name: 'prepaymentTitle',
    },
    {
      width: 150,
      name: 'prepaymentTypeMeaning',
    },
    {
      width: 150,
      name: 'associateNum',
    },
    {
      width: 150,
      name: 'prepaymentCreatedBy',
    },
    {
      width: 150,
      name: 'prepaymentCreationDate',
    },
  ];

  const handleSave = () => {
    const selectData = prepaymentAddDS.selected;
    if (selectData.length) {
      notification.success();
      queryPrepayment(selectData);
    } else {
      notification.warning({
        message: intl
          .get('ssta.supplySettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  return (
    <>
      <Table columns={columns} dataSet={prepaymentAddDS} queryFields={3} />
      <div className="ssta-body-footer">
        <Button
          onClick={handleSave}
          color="primary"
          disabled={prepaymentAddDS.selected.length === 0}
        >
          {intl.get('hzero.common.button.confirm').d('确认')}
        </Button>
        <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default observer(PrepaymentAddModal);
