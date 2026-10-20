/*
 * DomesticAndForeign - 登记信息- 境内外
 * @Date: 2023-04-06 14:36:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isFunction } from 'lodash';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import UrlUpload from '@/routes/components/C7nUrlUpload';
import { handleExtTextRenderIntercept } from '@/routes/components/utils';

const DomesticAndForeign = observer(
  ({
    dataSet,
    custLoading,
    customizeForm,
    isSubdomainsRegister,
    domesticForeignRelation,
    handleCompareRender,
    customizeUnitCode,
    handleFieldProp,
  }) => {
    const fields = [
      {
        name: 'certificationType',
        type: 'select',
      },
      {
        name: 'domesticForeignRelation',
        type: 'select',
        hidden: Boolean(dataSet?.current?.get('certificationRegionId')),
      },
      {
        name: 'certificationRegionId',
        hidden:
          dataSet?.current?.get('certificationType') === '2' ||
          !dataSet?.current?.get('certificationRegionId'),
        type: 'Lov',
      },
      {
        name: 'companyName',
      },
      {
        name: 'shortName',
        hidden: !isSubdomainsRegister,
      },
      {
        name: 'unifiedSocialCode',
        hidden: domesticForeignRelation !== 1,
      },
      {
        name: 'businessRegistrationNumber',
        hidden: domesticForeignRelation !== 0,
      },
      {
        name: 'dunsCode',
      },
      {
        name: 'legalRepName',
      },
      {
        name: 'organizingInstitutionCode',
        hidden: domesticForeignRelation !== 1,
      },
      {
        name: 'institutionalType',
        type: 'select',
        hidden: domesticForeignRelation !== 1,
      },
      {
        name: 'companyType',
        type: 'select',
        hidden: domesticForeignRelation !== 1,
      },
      {
        name: 'registeredCountryId',
        displayField: 'countryName',
      },
      {
        name: 'regionPathName',
      },
      {
        name: 'addressDetail',
      },
      {
        name: 'registeredCapital',
      },
      {
        name: 'currencyCode',
        displayField: 'currencyName',
      },
      {
        name: 'taxpayerType',
        type: 'select',
        hidden: domesticForeignRelation !== 1,
      },
      {
        name: 'licenceEndDate',
        type: 'date',
      },
      {
        name: 'buildDate',
        type: 'date',
      },
      {
        name: 'longTermFlag',
        type: 'boolean',
      },
      {
        name: 'businessScope',
        newLine: true,
        colSpan: 2,
      },
      {
        name: 'licenceUrl',
        newLine: true,
        renderer: () => {
          return (
            <UrlUpload
              newLine
              isEdit={false}
              name="licenceUrl"
              enableImageWatermark={1}
              fileUrl={dataSet.current?.get('licenceUrl')}
              label={
                domesticForeignRelation === 1
                  ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
                  : intl
                      .get('spfm.enterprise.view.message.registrationCertificate')
                      .d('企业登记证件')
              }
            />
          );
        },
      },
    ]
      .filter(Boolean)
      .map(field => {
        const { type, displayField, hidden, ...others } = field;
        const { name: fileName } = others;
        return {
          renderer: ({ value, record, name }) =>
            handleCompareRender({ value, record, name, type, displayField }),
          ...(isFunction(handleFieldProp)
            ? handleFieldProp({ currentRecord: dataSet && dataSet.current, fileName, hidden })
            : { hidden }),
          ...others,
        };
      });

    return customizeForm(
      {
        code: customizeUnitCode,
        readOnly: true,
        extTextRenderIntercept: handleExtTextRenderIntercept,
      },
      <Form
        columns={3}
        dataSet={dataSet}
        labelLayout="vertical"
        custLoading={custLoading}
        className="c7n-pro-vertical-form-display"
      >
        {fields.map(field => (
          <Output {...field} />
        ))}
      </Form>
    );
  }
);

export default DomesticAndForeign;
