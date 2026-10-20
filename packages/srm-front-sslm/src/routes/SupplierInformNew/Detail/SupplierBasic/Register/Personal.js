/*
 * Personal - 登记信息- 个人
 * @Date: 2023-04-06 14:36:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isNil } from 'lodash';

import { observer } from 'mobx-react';
import { Form, Select } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const Personal = observer(
  ({ isEdit, dataSet, custLoading, customizeForm, isSubdomainsRegister }) => {
    return customizeForm(
      {
        code: isNil(isSubdomainsRegister)
          ? ''
          : 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL',
      },
      <Form
        columns={3}
        dataSet={dataSet}
        custLoading={custLoading}
        useWidthPercent
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField name="domesticForeignRelation" isEdit={isEdit} componentType="SELECT" />
        <FormField name="certificationType" isEdit={isEdit} componentType="SELECT" />
        <FormField name="companyName" isEdit={isEdit} />
        <FormField name="registeredCountryId" isEdit={isEdit} componentType="LOV" newLine />
        <FormField
          isEdit={isEdit}
          name="regionPathName"
          record={dataSet?.current}
          componentType="REGIONCASCADE"
          regionAlias="registeredRegionId"
          countryAlias="registeredCountryId"
          disabled={!(isEdit && isSubdomainsRegister)}
          hidden={dataSet.current?.get('registeredCountryCode') !== 'CN'}
        />
        <FormField name="addressDetail" isEdit={isEdit} componentType="TLEDITOR" />
        <FormField
          name="phone"
          isEdit={isEdit}
          addonBefore={<Select clearButton={false} name="internationalTelCode" />}
          addonBeforeStyle={{ width: 120, padding: 0, border: 'none' }}
        />
        <FormField name="email" isEdit={isEdit} />
      </Form>
    );
  }
);

export default Personal;
