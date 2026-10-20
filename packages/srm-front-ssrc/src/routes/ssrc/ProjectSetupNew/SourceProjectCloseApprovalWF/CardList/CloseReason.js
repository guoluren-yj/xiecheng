import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';

import { StoreContext } from '../store/StoreProvider';

// 关闭原因卡片
const CloseReasonCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('closeReasonForm'),
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="closedComments" />
      <Output
        name="closedAttachmentUuid"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
      />
      <Output name="closedByName" />
    </Form>
  );
});

export default CloseReasonCmp;
