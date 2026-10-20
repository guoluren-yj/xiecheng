/*
 * OtherInfo - 其他信息
 * @Date: 2023-08-29 09:15:25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';

const OtherInfo = ({ dataSet, isEdit, custLoading, customizeForm, code = '' }) => {
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code,
          readOnly: !isEdit,
        },
        <Form
          useWidthPercent
          columns={3}
          dataSet={dataSet}
          custLoading={custLoading}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        />
      )}
    </Spin>
  );
};

export default OtherInfo;
