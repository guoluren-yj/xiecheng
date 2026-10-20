/*
 * @Author: your name
 * @Date: 2020-12-07 14:38:40
 * @LastEditTime: 2020-12-13 04:30:46
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-ssta\src\routes\SupplySettle\Show.js
 */
import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/components/c7n/withCustomize';
import { decimalPointAccuracy } from '@/routes/utils';
import { showDS as showDs } from '../../stores/PurchaseSettleDS';

const Show = (props) => {
  const { settleHeaderId, customizeTable } = props;

  const showDS = useMemo(() => {
    return new DataSet(showDs());
  }, []);

  useEffect(() => {
    showDS.setQueryParameter('settleHeaderId', settleHeaderId);
    showDS.query();
  }, []);

  const columns = [
    // {
    //   name: 'settleHeaderId',
    //   width: 120,
    // },
    {
      name: 'erpPaymentNum',
      width: 150,
    },
    {
      name: 'paymentAmount',
      width: 150,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      name: 'paymentDate',
    },
    {
      name: 'paymentTypeMeaning',
    },
  ];

  return (
    <>
      {customizeTable(
        { code: 'SSTA.SUPPLY_SETTLE_LIST.VIEWPAYMENTRECORDS' },
        <Table columns={columns} dataSet={showDS} />
      )}
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.SUPPLY_SETTLE_LIST.VIEWPAYMENTRECORDS'],
  })
)(Show);
