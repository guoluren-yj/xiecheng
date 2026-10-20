/*
 * Register - 登记信息
 * @Date: 2023-08-28 15:57:42
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Spin } from 'choerodon-ui/pro';

import Personal from './Personal';
import DomesticAndForeign from './DomesticAndForeign';

const Register = props => {
  const { dataSet, domesticForeignRelation } = props;

  return (
    <Spin dataSet={dataSet}>
      {domesticForeignRelation !== 2 ? <DomesticAndForeign {...props} /> : <Personal {...props} />}
    </Spin>
  );
};

export default Register;
