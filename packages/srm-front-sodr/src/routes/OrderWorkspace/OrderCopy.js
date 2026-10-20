/*
 * OrderCopy - 订单复制
 * @date: 2021/06/15 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
// import SearchBarTable from '_components/SearchBarTable';

const OrderCopy = (props) => {
  const { ds } = props;

  useEffect(() => {
    ds.query();
  }, []);

  const columns = useMemo(() => [
    {
      name: 'statusCode',
      width: 110,
      renderer: ({ record }) => record.get('statusCodeMeaning'),
    },
    {
      name: 'displayPoNum',
      width: 150,
    },
    {
      name: 'supplierCode',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'poTypeCode',
      width: 150,
      renderer: ({ record }) => record.get('poTypeCodeMeaning'),
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'orgName',
      width: 170,
    },
    {
      name: 'purOrganizationName',
      width: 150,
    },
  ]);
  return (
    <Table
      // searchCode="SODR.WORKSPACE_LIST.SEARCHBAR_WHOLEORDER"
      dataSet={ds}
      columns={columns}
    />
  );
};

export default OrderCopy;
