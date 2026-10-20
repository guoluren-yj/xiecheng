/*
 * @Author: your name
 * @Date: 2020-12-07 14:38:40
 * @LastEditTime: 2022-03-07 20:33:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-ssta\src\routes\PurchaseSettle\Show.js
 */
import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import { amountLocalRender } from '@/utils/utils';
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
        { code: 'SSTA.PURCHASE_SETTLE_LIST.VIEWPAYMENTRECORDS' },
        <Table columns={columns} dataSet={showDS} />
      )}
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.PURCHASE_SETTLE_LIST.VIEWPAYMENTRECORDS'],
  })
)(Show);
