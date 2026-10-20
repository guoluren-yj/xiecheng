/*
 * Personal - 登记信息- 个人
 * @Date: 2023-04-06 14:36:15
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { observer } from 'mobx-react';
import { Form, Select } from 'choerodon-ui/pro';

import FormField from '@/routes/components/FormField';

const Personal = observer(
  ({
    isEdit,
    dataSet,
    custLoading,
    customizeForm,
    getFieldProps = () => {},
    code = '',
    isAllPlatform,
    pageSource,
    headerInfo = {},
  }) => {
    const { writePlatformFlag = false } = headerInfo || {};
    const regionPathNameEdit = isEdit && (isAllPlatform || !!writePlatformFlag);

    // 处理字段渲染
    const handleFieldRender = useCallback(
      ({ fieldName, type, hidden = false, displayField } = {}) => {
        const renderProps = getFieldProps({
          currentRecord: dataSet.current,
          fieldName,
          type,
          displayField,
          hidden,
        });
        return renderProps;
      },
      [dataSet]
    );

    return customizeForm(
      {
        code,
        readOnly: !isEdit,
      },
      <Form
        useWidthPercent
        columns={3}
        dataSet={dataSet}
        custLoading={custLoading}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField
          name="domesticForeignRelation"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'domesticForeignRelation',
            type: 'SELECT',
          })}
        />
        <FormField
          name="certificationType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'certificationType',
            type: 'SELECT',
          })}
        />
        <FormField
          name="companyName"
          isEdit={isEdit}
          {...handleFieldRender({ fieldName: 'companyName' })}
        />

        <FormField
          name="idType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'idType',
            type: 'SELECT',
            hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
          })}
          newLine
        />
        <FormField
          name="idNum"
          isEdit={isEdit}
          {...handleFieldRender({
            fieldName: 'idNum',
            hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
          })}
        />

        <FormField
          name="registeredCountryId"
          isEdit={isEdit}
          componentType="LOV"
          {...handleFieldRender({
            fieldName: 'registeredCountryId',
            displayField: 'countryName',
          })}
          newLine
        />
        <FormField
          isEdit={isEdit}
          name="regionPathName"
          record={dataSet?.current}
          componentType="REGIONCASCADE"
          regionAlias="registeredRegionId"
          countryAlias="registeredCountryId"
          disabled={!regionPathNameEdit}
          {...handleFieldRender({
            fieldName: 'regionPathName',
            hidden: dataSet.current?.get('registeredCountryCode') !== 'CN',
          })}
        />
        <FormField
          name="addressDetail"
          isEdit={isEdit}
          componentType="TLEDITOR"
          {...handleFieldRender({ fieldName: 'addressDetail' })}
        />

        <FormField
          name="phone"
          isEdit={isEdit}
          addonBefore={<Select clearButton={false} name="internationalTelCode" />}
          addonBeforeStyle={{ width: 120, padding: 0, border: 'none' }}
          {...handleFieldRender({ fieldName: 'phone', type: 'phone' })}
        />
        <FormField name="email" isEdit={isEdit} {...handleFieldRender({ fieldName: 'email' })} />

        <FormField
          name="buildDate"
          isEdit={isEdit}
          componentType="DATEPICKER"
          newLine
          {...handleFieldRender({
            fieldName: 'buildDate',
            hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
            type: 'date',
          })}
        />
        <FormField
          name="licenceEndDate"
          isEdit={isEdit}
          componentType="DATEPICKER"
          {...handleFieldRender({
            fieldName: 'licenceEndDate',
            hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
            type: 'date',
          })}
        />
        <FormField
          name="longTermFlag"
          isEdit={isEdit}
          componentType="CHECKBOX"
          {...handleFieldRender({
            fieldName: 'longTermFlag',
            type: 'CHECKBOX',
            hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
          })}
        />

        <FormField
          newLine
          isEdit
          readOnly={!isEdit}
          name="idFrontUuid"
          componentType="ATTACHMENT"
          multiple={false}
          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']}
          hidden={
            (
              handleFieldRender({
                fieldName: 'idFrontUuid',
                hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
              }) || {}
            ).hidden
          }
        />
        <FormField
          isEdit
          readOnly={!isEdit}
          name="idBackUuid"
          componentType="ATTACHMENT"
          multiple={false}
          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']}
          hidden={
            (
              handleFieldRender({
                fieldName: 'idBackUuid',
                hidden: !(pageSource === 'enterpriseInform' && isAllPlatform),
              }) || {}
            ).hidden
          }
        />
      </Form>
    );
  }
);

export default Personal;
