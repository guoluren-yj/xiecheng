/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form } from 'choerodon-ui/pro';

const OtherInfo = ({ dataSet, custLoading, customizeForm, customizeUnitCode }) => {
  return customizeForm(
    {
      code: customizeUnitCode,
    },
    <Form columns={3} dataSet={dataSet} labelLayout="float" custLoading={custLoading} />
  );
};

export default OtherInfo;
