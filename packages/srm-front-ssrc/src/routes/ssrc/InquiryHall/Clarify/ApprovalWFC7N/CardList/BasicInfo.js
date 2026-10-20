import React, { useContext } from 'react';
import CollapseForm from '_components/CollapseForm';
import { observer } from 'mobx-react-lite';
import { Output, Attachment } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import { StoreContext } from '../store/StoreProvider';

const BasicInfo = observer(() => {
  const {
    commonDs: { headerDs },
    customizeCollapseForm,
    getCustomizeUnitCode,
  } = useContext(StoreContext);
  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('basicInfoForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
      showLines={3}
    >
      <Output name="title" />
      <Output name="clarifyNum" />
      <Output name="sourceNum" />
      <Output name="companyName" />
      <Attachment
        readOnly
        name="attachmentUuid"
        data={{
          tenantId: getCurrentOrganizationId(),
        }}
      />
    </CollapseForm>
  );
});

export default BasicInfo;
