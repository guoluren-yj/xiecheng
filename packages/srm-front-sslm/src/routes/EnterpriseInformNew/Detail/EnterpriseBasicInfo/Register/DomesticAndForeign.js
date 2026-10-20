/*
 * DomesticAndForeign - 登记信息- 境内外
 * @Date: 2023-08-28 15:57:42
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import FormField from '@/routes/components/FormField';
import UrlUpload from '@/routes/components/C7nUrlUpload';

const DomesticAndForeign = observer(
  ({
    isEdit = false,
    dataSet,
    custLoading,
    customizeForm,
    domesticForeignRelation,
    isAllPlatform,
    getFieldProps = () => {},
    code = '',
    custConfig = {},
    headerInfo = {},
  }) => {
    dataSet.setState('isEdit', isEdit);
    const { writePlatformFlag = false } = headerInfo || {};
    const regionPathNameEdit = isEdit && (isAllPlatform || !!writePlatformFlag);

    const urlUploadCuzProps = (
      (custConfig['SSLM.ENTERPRISE_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS'] || {}).fields ||
      []
    ).find(({ fieldCode }) => fieldCode === 'licenceUrl');
    const { editable } = urlUploadCuzProps || {};
    const urlUploadCuzEdit = editable === 1 && isEdit;

    const certificationRegionId = dataSet?.current?.get('certificationRegionId');

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
          name="certificationType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'certificationType',
            type: 'SELECT',
          })}
        />
        <FormField
          name="domesticForeignRelation"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'domesticForeignRelation',
            type: 'SELECT',
            hidden: isEdit || !!certificationRegionId,
          })}
        />
        <FormField
          name="certificationRegionId"
          isEdit={isEdit}
          componentType="LOV"
          {...handleFieldRender({
            type: 'LOV',
            fieldName: 'certificationRegionId',
            displayField: 'certificationRegionIdMeaning',
            hidden: isEdit ? false : !certificationRegionId,
          })}
        />
        <FormField
          name="companyName"
          isEdit={isEdit}
          componentType="TLEDITOR"
          {...handleFieldRender({ fieldName: 'companyName' })}
        />
        <FormField
          name="shortName"
          isEdit={isEdit}
          componentType="TLEDITOR"
          {...handleFieldRender({
            fieldName: 'shortName',
            hidden: !isAllPlatform,
          })}
        />

        <FormField
          name="unifiedSocialCode"
          isEdit={isEdit}
          newLine
          {...handleFieldRender({
            fieldName: 'unifiedSocialCode',
            hidden: domesticForeignRelation !== 1,
          })}
        />
        <FormField
          name="businessRegistrationNumber"
          isEdit={isEdit}
          newLine
          {...handleFieldRender({
            fieldName: 'businessRegistrationNumber',
            hidden: domesticForeignRelation !== 0,
          })}
        />
        <FormField
          name="dunsCode"
          isEdit={isEdit}
          {...handleFieldRender({ fieldName: 'dunsCode' })}
        />

        <FormField
          name="legalRepName"
          isEdit={isEdit}
          componentType="TLEDITOR"
          {...handleFieldRender({ fieldName: 'legalRepName' })}
        />
        <FormField
          name="organizingInstitutionCode"
          isEdit={isEdit}
          {...handleFieldRender({
            fieldName: 'organizingInstitutionCode',
            hidden: domesticForeignRelation !== 1,
          })}
        />
        <FormField
          name="institutionalType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'institutionalType',
            type: 'SELECT',
            hidden: domesticForeignRelation !== 1,
          })}
        />

        <FormField
          name="companyType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'companyType',
            type: 'SELECT',
            hidden: domesticForeignRelation !== 1,
          })}
        />
        <FormField
          name="registeredCountryId"
          isEdit={isEdit}
          componentType="LOV"
          {...handleFieldRender({
            type: 'LOV',
            fieldName: 'registeredCountryId',
            displayField: 'registeredCountryName',
          })}
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
            fieldName: 'registeredRegionId',
            displayField: 'regionPathName',
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
          name="registeredCapital"
          isEdit={isEdit}
          componentType="NUMBERFIELD"
          newLine
          {...handleFieldRender({ fieldName: 'registeredCapital' })}
        />
        <FormField
          name="currencyCode"
          isEdit={isEdit}
          componentType="LOV"
          {...handleFieldRender({
            fieldName: 'currencyCode',
            displayField: 'currencyName',
          })}
        />

        <FormField
          name="taxpayerType"
          isEdit={isEdit}
          componentType="SELECT"
          {...handleFieldRender({
            fieldName: 'taxpayerType',
            type: 'SELECT',
            hidden: domesticForeignRelation !== 1,
          })}
        />
        <FormField
          name="buildDate"
          isEdit={isEdit}
          componentType="DATEPICKER"
          newLine
          {...handleFieldRender({
            fieldName: 'buildDate',
            type: 'date',
          })}
        />
        <FormField
          name="licenceEndDate"
          isEdit={isEdit}
          componentType="DATEPICKER"
          {...handleFieldRender({
            type: 'date',
            fieldName: 'licenceEndDate',
            hidden: domesticForeignRelation !== 1,
          })}
        />
        <FormField
          name="longTermFlag"
          isEdit={isEdit}
          componentType="CHECKBOX"
          {...handleFieldRender({
            fieldName: 'longTermFlag',
            type: 'CHECKBOX',
            hidden: domesticForeignRelation !== 1,
          })}
        />

        <FormField
          name="businessScope"
          isEdit={isEdit}
          componentType="TEXTAREA"
          newLine
          rows={3}
          col={2}
          colSpan={2}
          {...handleFieldRender({ fieldName: 'businessScope' })}
        />
        <UrlUpload
          hidden={(handleFieldRender({ fieldName: 'licenceUrl' }) || {}).hidden}
          required={domesticForeignRelation === 1}
          newLine
          isEdit={isEdit}
          viewOnly={urlUploadCuzEdit ? false : !isEdit || !isAllPlatform}
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
        <FormField
          name="localName"
          isEdit={isEdit}
          {...handleFieldRender({
            fieldName: 'localName',
            hidden: !isAllPlatform,
          })}
        />
        <FormField
          name="localAddress"
          isEdit={isEdit}
          {...handleFieldRender({
            fieldName: 'localAddress',
            hidden: !isAllPlatform,
          })}
        />
      </Form>
    );
  }
);

export default DomesticAndForeign;
