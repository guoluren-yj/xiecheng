import React, { useContext } from 'react';
import { Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import CollapseForm from '_components/CollapseForm';

import { StoreContext } from '../store/StoreProvider';
import { renderChangeFieldsColor } from '../utils';

// 采购组织及人员卡片-需求方
const PurOrganizationAndStaffDemandCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

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
      <Output
        name="companyName"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'companyId' })
        }
      />
      <Output
        name="unitName"
        renderer={({ value, record }) => renderChangeFieldsColor({ value, record, name: 'unitId' })}
      />
      <Output
        name="createdByName"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'createdByName' })
        }
      />
    </CollapseForm>
  );
});

// 采购组织及人员卡片-执行人
const PurOrganizationAndStaffExecutorCmp = observer(() => {
  const { commonDs: { headerDs } = {}, customizeCollapseForm, getCustomizeUnitCode } = useContext(
    StoreContext
  );

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
      <Output
        name="purOrganizationName"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'purOrganizationId' })
        }
      />
      <Output
        name="purchaserName"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'purchaserId' })
        }
      />
      <Output
        name="purAgent"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'contactUserId' })
        }
      />
      <Output
        name="contactMobilephone"
        renderer={({ record }) => {
          return renderChangeFieldsColor({
            value: record?.get('internationalTelCode')
              ? `${record?.get('internationalTelCode')} | ${
                  record?.get('contactMobilephone') ?? ''
                }`
              : record?.get('contactMobilephone'),
            record,
            name: ['internationalTelCode', 'contactMobilephone'],
          });
        }}
      />
      <Output
        name="contactMail"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'contactMail' })
        }
      />
      <Output
        name="sourceMemberMeaning"
        renderer={({ value, record }) =>
          renderChangeFieldsColor({ value, record, name: 'sourceMember' })
        }
      />
    </CollapseForm>
  );
});

export { PurOrganizationAndStaffDemandCmp, PurOrganizationAndStaffExecutorCmp };
