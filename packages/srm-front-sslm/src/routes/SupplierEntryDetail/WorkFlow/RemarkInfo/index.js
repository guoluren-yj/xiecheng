/*
 * @Date: 2023-09-15 11:16:50
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';

const OtherInfo = ({ commonProps }) => {
  const { entryBaseInfoDs } = commonProps;

  return (
    <div className="card-wrap">
      <div className="card-detail-title">
        {intl.get('sslm.common.model.instructions').d('说明')}
      </div>
      <div style={{ paddingTop: 16, paddingBottom: 20 }}>
        <Form
          columns={1}
          dataSet={entryBaseInfoDs}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="remarkForm"
            renderer={({ record = {} }) => {
              const { data: { remark } = {} } = record;
              return remark;
            }}
          />
        </Form>
      </div>
    </div>
  );
};

export default OtherInfo;
