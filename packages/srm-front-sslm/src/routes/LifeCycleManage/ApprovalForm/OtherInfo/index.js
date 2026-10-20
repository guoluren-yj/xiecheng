/*
 * @Date: 2023-09-15 17:04:01
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';

import { Context } from '../../Context';

const OtherInfo = () => {
  const context = useContext(Context);
  const { baseInfoDs } = context;
  return (
    <div className="card-wrap">
      <div style={{ paddingBottom: 20 }}>
        <Form
          columns={1}
          dataSet={baseInfoDs}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output
            name="remark"
            label={
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'rgb(29, 33, 41)',
                }}
              >
                {intl.get('sslm.common.model.instructions').d('说明')}
              </div>
            }
          />
        </Form>
      </div>
    </div>
  );
};

export default OtherInfo;
