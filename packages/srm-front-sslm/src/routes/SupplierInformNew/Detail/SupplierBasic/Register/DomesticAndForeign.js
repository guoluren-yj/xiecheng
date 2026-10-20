/*
 * DomesticAndForeign - 登记信息- 境内外
 * @Date: 2023-04-06 14:36:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { isNil } from 'lodash';

import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';
import UrlUpload from '@/routes/components/C7nUrlUpload';

const DomesticAndForeign = observer(
  ({
    isEdit,
    isRead,
    dataSet,
    custLoading,
    customizeForm,
    isSubdomainsRegister,
    domesticForeignRelation,
  }) => {
    // 附件上传成功回调
    const onUploadSuccess = useCallback(
      response => {
        if (dataSet.current) {
          dataSet.current.set({
            licenceUrl: response,
          });
        }
      },
      [dataSet]
    );

    // 附件删除成功回调
    const onUploadRemove = useCallback(() => {
      if (dataSet.current) {
        dataSet.current.set({
          licenceUrl: null,
        });
      }
    }, [dataSet]);

    return customizeForm(
      {
        code: isNil(domesticForeignRelation)
          ? ''
          : 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS',
        readOnly: isRead,
      },
      <Form
        columns={3}
        dataSet={dataSet}
        custLoading={custLoading}
        useWidthPercent
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField name="certificationType" isEdit={isEdit} componentType="SELECT" />
        <FormField
          name="domesticForeignRelation"
          isEdit={isEdit}
          componentType="SELECT"
          hidden={Boolean(dataSet?.current?.get('certificationRegionId'))}
        />
        <FormField
          name="certificationRegionId"
          isEdit={isEdit}
          componentType="LOV"
          hidden={!dataSet?.current?.get('certificationRegionId')}
        />
        <FormField name="companyName" isEdit={isEdit} componentType="TLEDITOR" />
        <FormField
          name="shortName"
          isEdit={isEdit}
          componentType="TLEDITOR"
          hidden={!isSubdomainsRegister}
        />
        <FormField
          name="unifiedSocialCode"
          isEdit={isEdit}
          hidden={domesticForeignRelation !== 1}
          newLine
        />
        <FormField
          name="businessRegistrationNumber"
          isEdit={isEdit}
          hidden={domesticForeignRelation !== 0}
        />
        <FormField name="dunsCode" isEdit={isEdit} />
        <FormField name="legalRepName" isEdit={isEdit} componentType="TLEDITOR" />
        <FormField
          name="organizingInstitutionCode"
          isEdit={isEdit}
          hidden={domesticForeignRelation !== 1}
        />
        <FormField
          name="institutionalType"
          isEdit={isEdit}
          componentType="SELECT"
          hidden={domesticForeignRelation !== 1}
        />
        <FormField
          name="companyType"
          isEdit={isEdit}
          componentType="SELECT"
          hidden={domesticForeignRelation !== 1}
        />
        <FormField name="registeredCountryId" isEdit={isEdit} componentType="LOV" />
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
        <FormField name="registeredCapital" isEdit={isEdit} componentType="NUMBERFIELD" />
        <FormField name="currencyCode" isEdit={isEdit} componentType="LOV" />
        <FormField
          name="taxpayerType"
          isEdit={isEdit}
          componentType="SELECT"
          hidden={domesticForeignRelation !== 1}
        />
        <FormField name="buildDate" isEdit={isEdit} componentType="DATEPICKER" />
        <FormField
          name="licenceEndDate"
          isEdit={isEdit}
          componentType="DATEPICKER"
          hidden={domesticForeignRelation === 0 && isSubdomainsRegister}
        />
        <FormField
          name="longTermFlag"
          isEdit={isEdit}
          componentType="CHECKBOX"
          renderer={({ value }) => yesOrNoRender(value)}
          hidden={domesticForeignRelation === 0 && isSubdomainsRegister}
        />
        <FormField
          name="businessScope"
          newLine
          isEdit={isEdit}
          componentType="TEXTAREA"
          rows={3}
          col={2}
          colSpan={2}
        />
        <UrlUpload
          newLine
          isEdit={isEdit}
          name="licenceUrl"
          enableImageWatermark={1}
          onUploadRemove={onUploadRemove}
          onUploadSuccess={onUploadSuccess}
          fileUrl={dataSet.current?.get('licenceUrl')}
          help={
            isEdit && (
              <div className="attachment-help">
                {intl
                  .get('hzero.common.upload.support', { type: '*.jpg;*.png;*.jpeg;*.pdf' })
                  .d('上传格式：*.jpg;*.png;*.jpeg;*.pdf')}
              </div>
            )
          }
          label={
            domesticForeignRelation === 1
              ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
              : intl.get('spfm.enterprise.view.message.registrationCertificate').d('企业登记证件')
          }
        />
      </Form>
    );
  }
);

export default DomesticAndForeign;
