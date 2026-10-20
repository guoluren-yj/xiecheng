/**
 * Address - 地址
 * @date: 2021-11-25
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

const AddressInfo = ({
  dataSet,
  // allInfo = {},
  addressInfo = {},
  // showAllTab = true,
  // defaultCountryInfo = {},
}) => {
  const { enableFieldList = [] } = addressInfo;
  const columns = [
    {
      name: 'countryObj',
      width: 150,
    },
    {
      name: 'regionPathName',
      width: 240,
    },
    {
      name: 'addressDetail',
    },
    {
      name: 'postCode',
      width: 150,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });

  return (
    <Fragment>
      <Table dataSet={dataSet} columns={columns} />
    </Fragment>
  );
};

export default AddressInfo;
