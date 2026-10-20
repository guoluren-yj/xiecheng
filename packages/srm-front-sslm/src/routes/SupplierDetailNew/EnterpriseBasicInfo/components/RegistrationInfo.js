/*
 * RegistrationInfo - 登记信息
 * @Date: 2023-08-16 15:14:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect, useMemo } from 'react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { computeEnglistAmount } from '@/routes/components/utils/utils';
import UrlUpload from '@/routes/components/C7nUrlUpload';
import { getRegistrationInfoDS } from '../stores/getRegistrationInfoDS';

const RegistrationInfo = () => {
  const context = useContext(Context);
  const { basic = {}, customizeForm, basic: { domesticForeignRelation } = {} } = context;
  const dataSet = useDataSet(() => getRegistrationInfoDS({ domesticForeignRelation }), [
    domesticForeignRelation,
  ]);
  const customizeCode = useMemo(() => {
    return domesticForeignRelation === 1
      ? 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_DOMESTIC'
      : domesticForeignRelation === 0
      ? 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_OVERSEAS'
      : 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.REGISTER_PERSONAL';
  }, [domesticForeignRelation]);

  useEffect(() => {
    dataSet.loadData([basic]);
  });

  const fields = [
    {
      name: 'certificationType',
    },
    {
      name: 'domesticForeignRelation',
      hidden: Boolean(dataSet?.current?.get('certificationRegionId')),
    },
    {
      name: 'certificationRegionId',
      hidden:
        dataSet?.current?.get('certificationType') === '2' ||
        !dataSet?.current?.get('certificationRegionId'),
    },
    {
      name: 'companyName',
      colSpan: 2,
    },
    {
      name: 'businessRegistrationNumber',
      hidden: domesticForeignRelation !== 0,
    },
    {
      name: 'unifiedSocialCode',
      hidden: domesticForeignRelation !== 1,
    },
    {
      name: 'organizingInstitutionCode',
      hidden: domesticForeignRelation !== 1,
    },
    {
      name: 'dunsCode',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'institutionalType',
      hidden: domesticForeignRelation !== 1,
    },
    {
      name: 'companyType',
      hidden: domesticForeignRelation !== 1,
    },
    {
      name: 'legalRepName',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'registeredCountryName',
    },
    {
      name: 'registeredRegionName',
    },
    {
      name: 'addressDetail',
    },
    {
      name: 'registeredCapital',
      hidden: domesticForeignRelation === 2,
      renderer: ({ value }) => computeEnglistAmount(value, 8),
    },
    {
      name: 'currencyName',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'taxpayerType',
      hidden: domesticForeignRelation !== 1,
    },
    {
      name: 'buildDate',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'licenceEndDate',
      hidden: domesticForeignRelation !== 1,
      renderer: ({ value, record }) => {
        const longTermFlag = record && record.get('longTermFlag');
        return +longTermFlag
          ? intl.get('sslm.supplierDetail.model.suDe.companyInfo.longTermFlag').d('长期')
          : dateRender(value) || '-';
      },
    },
    {
      name: 'businessScope',
      newLine: true,
      hidden: domesticForeignRelation === 2,
      rows: 3,
      cols: 2,
      colSpan: 2,
    },
    {
      name: 'licenceUrl',
      newLine: true,
      hidden: domesticForeignRelation === 2,
      renderer: ({ record }) => {
        return (
          <UrlUpload
            newLine
            isEdit={false}
            enableImageWatermark={1}
            fileUrl={record?.get('licenceUrl')}
          />
        );
      },
    },
    {
      name: 'phone',
      hidden: domesticForeignRelation !== 2,
    },
    {
      name: 'email',
      hidden: domesticForeignRelation !== 2,
    },
    {
      name: 'localName',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'localAddress',
      hidden: domesticForeignRelation === 2,
    },
  ];

  return customizeForm(
    {
      code: customizeCode,
      readOnly: true,
    },
    <Form
      columns={3}
      dataSet={dataSet}
      key={customizeCode}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
};

export default RegistrationInfo;
