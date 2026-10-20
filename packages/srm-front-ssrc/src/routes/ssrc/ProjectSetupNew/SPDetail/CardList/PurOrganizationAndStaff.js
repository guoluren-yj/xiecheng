import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { getCurrentUser } from 'utils/utils';
import CollapseForm from '_components/CollapseForm';

import { StoreContext } from '../store/StoreProvider';

// 采购组织及人员卡片-需求方
const PurOrganizationAndStaffDemandCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const user = getCurrentUser() || {};

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('purOrgDemandForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      showLines={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="companyName" />
      <Output name="unitName" />
      <Output name="createdByName" renderer={({ value }) => value || user?.realName} />
    </CollapseForm>
  );
});

// 采购组织及人员卡片-执行人
const PurOrganizationAndStaffExecutorCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const user = getCurrentUser() || {};

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('purOrgExecutorForm'),
      dataSet: headerDs,
    },
    <CollapseForm
      dataSet={headerDs}
      columns={3}
      showLines={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="purOrganizationName" />
      <Output name="purchaserName" />
      <Output name="purAgent" />
      <Output
        name="contactMobilephone"
        renderer={({ record }) =>
          record?.get('internationalTelCode')
            ? `${record?.get('internationalTelCode')} | ${record?.get('contactMobilephone') ?? ''}`
            : record?.get('contactMobilephone')
        }
      />
      <Output name="contactMail" renderer={({ value }) => value || user?.email} />
      <Output name="sourceMemberMeaning" />
    </CollapseForm>
  );
});

export { PurOrganizationAndStaffDemandCmp, PurOrganizationAndStaffExecutorCmp };
