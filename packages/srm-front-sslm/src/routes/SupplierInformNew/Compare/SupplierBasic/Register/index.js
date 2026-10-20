/*
 * Register - 登记信息
 * @Date: 2023-04-06 15:57:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Spin } from 'choerodon-ui/pro';

import Personal from './Personal';
import DomesticAndForeign from './DomesticAndForeign';

const Register = props => {
  const { dataSet, domesticForeignRelation } = props;
  const doAndForeParams = {
    customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS',
    ...props,
  };
  const personalParams = {
    customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL',
    ...props,
  };
  return (
    <Spin dataSet={dataSet}>
      {domesticForeignRelation !== 2 ? (
        <DomesticAndForeign {...doAndForeParams} />
      ) : (
        <Personal {...personalParams} />
      )}
    </Spin>
  );
};

export default Register;
