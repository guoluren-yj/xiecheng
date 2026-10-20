import React, { useContext } from 'react';
import { Lov, TextField, TelField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';
import { getResponse } from 'utils/utils';
import { isFunction } from 'lodash';

import { changeCompany } from '@/services/projectSetupService';

import { StoreContext } from '../store/StoreProvider';

// 采购组织及人员卡片-需求方
const PurOrganizationAndStaffDemandCmp = observer((props) => {
  const { fetchPageData } = props;

  const {
    commonDs: { headerDs } = {},
    customizeCollapseForm,
    getCustomizeUnitCode,
    sourceProjectId,
    organizationId,
  } = useContext(StoreContext);

  // 切换公司
  const handleChangeCompany = async (value, oldValue) => {
    if (headerDs.current) {
      headerDs.current.set({
        currencyCode: value
          ? {
              currencyCode: value.currencyCode || null,
            }
          : null,
      });
    }
    if (
      sourceProjectId &&
      sourceProjectId !== 'null' &&
      value &&
      oldValue?.companyId !== value.companyId
    ) {
      try {
        const res = await changeCompany({
          sourceProjectId,
          organizationId,
          companyId: value.companyId,
          companyName: value.companyName,
        });
        if (getResponse(res) && isFunction(fetchPageData)) {
          await fetchPageData({ refreshSectionFields: ['objectVersionNumber'] });
        }
      } catch (e) {
        throw e;
      }
    }
  };

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('purOrgDemandForm'),
      dataSet: headerDs,
    },
    <CollapseForm dataSet={headerDs} columns={3} labelLayout="float" useWidthPercent>
      <Lov name="companyId" onChange={handleChangeCompany} />
      <Lov name="unitId" />
      <TextField name="createdByName" />
    </CollapseForm>
  );
});

// 采购组织及人员卡片-执行人
const PurOrganizationAndStaffExecutorCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  // 切换采购联系人
  const handleContactUserId = (value) => {
    if (!headerDs?.current) return;
    const { phone = null, email = null, internationalTelCode = null } = value || {};
    headerDs.current.set({
      internationalTelCode: internationalTelCode || '+86',
      contactMobilephone: phone,
      contactMail: email,
    });
  };

  return customizeCollapseForm(
    {
      code: getCustomizeUnitCode('purOrgExecutorForm'),
      dataSet: headerDs,
    },
    <CollapseForm dataSet={headerDs} columns={3} labelLayout="float" useWidthPercent>
      <Lov name="purOrganizationId" />
      <Lov name="purchaserId" />
      <Lov name="contactUserId" onChange={handleContactUserId} />
      <TelField name="contactMobilephone" />
      <TextField name="contactMail" />
      <Lov name="sourceMember" />
    </CollapseForm>
  );
});

export { PurOrganizationAndStaffDemandCmp, PurOrganizationAndStaffExecutorCmp };
