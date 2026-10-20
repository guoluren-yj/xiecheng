/*
 * ExtraCard - 附加信息卡片
 * @Date: 2023-09-22 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const HeaderInfo = observer(props => {
  const { remote, dataSet } = props;
  return (
    <div className="card-content">
      <div className="card-content-title">
        {intl.get('sslm.enterpriseInform.model.application.changeRemark').d('变更备注')}
      </div>
      <Form
        columns={1}
        dataSet={dataSet}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        <Output
          renderer={({ record }) => {
            if (record) {
              return record.get('remark');
            }
            return null;
          }}
        />
        {remote &&
          remote.process('SSLM_ENTERPRISE_INFORM_TENANT_APPROVAL_WORKFLOW_EXTRA_CARD_NODE', null, {
            ...props,
          })}
      </Form>
    </div>
  );
});

export default HeaderInfo;
