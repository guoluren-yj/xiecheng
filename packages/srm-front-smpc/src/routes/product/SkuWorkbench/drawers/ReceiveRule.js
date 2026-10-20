import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { throttle } from 'lodash';
import { Lov, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ReceiveRuleButton = observer((props) => {
  const { tableDs, onOk = (e) => e, text, ...btnProps } = props;
  const ds = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'agreementHeaderIdList',
            label: intl.get('smpc.product.model.receiveRule').d('领用规则'),
            type: 'object',
            lovCode: 'SAGM.RECEIVE_AGREEMENT ',
            multiple: true,
            lovPara: { tenantId: organizationId },
          },
        ],
      }),
    []
  );

  const handleOk = (records) => {
    const ids = records.map((m) => m.get('agreementHeaderId'));
    if (ids.length > 0) {
      return onOk(ids);
    }
    return true;
  };

  return (
    <Lov
      dataSet={ds}
      name="agreementHeaderIdList"
      viewMode="drawer"
      clearButton={false}
      mode="button"
      noCache
      disabled={tableDs.selected.length === 0}
      {...btnProps}
      // 目前没找到控制按钮loading加载的方法
      onBeforeSelect={throttle(handleOk, 50000)}
      onChange={() => {
        ds.reset();
      }}
    >
      {text}
    </Lov>
  );
});

export default ReceiveRuleButton;
