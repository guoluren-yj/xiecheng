import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';

// 采购组织及人员卡片-需求方
const PurOrganizationAndStaffDemandCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('purOrgDemandForm'),
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="companyName" />
      <Output name="unitName" />
      <Output name="createdByName" />
    </Form>
  );
});

// 采购组织及人员卡片-执行人
const PurOrganizationAndStaffExecutorCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('purOrgExecutorForm'),
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="purOrganizationName" />
      <Output name="purchaserName" />
      <Output name="purAgent" />
      <Output name="contactMobilephone" />
      <Output name="contactMail" />
      <Output name="sourceMemberMeaning" />
    </Form>
  );
});

export { PurOrganizationAndStaffDemandCmp, PurOrganizationAndStaffExecutorCmp };
