/*
 * @Date: 2024-08-09 09:14:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import UploadCard from '@/routes/components/EnterpriseCertification/components/UploadCard';
import FileCardByUuid from '@/routes/components/EnterpriseCertification/components/FileCardByUuid';

import styles from '../styles.less';
import { registerDS } from '../stores/getRegisterDS';

const Register = observer(({ registerData = {} }) => {
  const dataSet = useDataSet(() => registerDS(), []);

  useEffect(() => {
    dataSet.create(registerData);
  }, [JSON.stringify(registerData)]);

  const { idType, domesticForeignRelation } = registerData;

  const { certificationRegionId, certificationType } =
    dataSet?.current?.get(['certificationRegionId', 'certificationType']) || {};

  const fields = [
    {
      name: 'certificationType',
    },
    {
      name: 'domesticForeignRelation',
      hidden: !!certificationRegionId,
    },
    {
      name: 'certificationRegionId',
      hidden: !certificationRegionId || certificationType === '2',
    },
    {
      name: 'companyName',
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
      name: 'businessRegistrationNumber',
      hidden: domesticForeignRelation !== 0,
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
      name: 'idType',
      hidden: domesticForeignRelation !== 2,
    },
    {
      name: 'idNum',
      hidden: domesticForeignRelation !== 2 || idType !== 'I',
    },
    {
      name: 'passport',
      hidden: domesticForeignRelation !== 2 || idType !== 'I',
    },
    {
      name: 'registeredCountryName',
    },
    {
      name: 'addressDetail',
    },
    {
      name: 'registeredCapital',
      hidden: domesticForeignRelation === 2,
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
      name: 'phone',
      hidden: domesticForeignRelation !== 2,
    },
    {
      name: 'email',
      hidden: domesticForeignRelation !== 2,
    },
    {
      name: 'buildDate',
    },
    {
      name: 'licenceEndDate',
      hidden: domesticForeignRelation === 0,
      renderer: ({ value, record }) => {
        const longTermFlag = record?.get('longTermFlag');
        return longTermFlag === 1
          ? intl.get(`spfm.enterprise.view.message.longTerm`).d('长期')
          : dateRender(value) || '-';
      },
    },
    {
      name: 'businessScope',
      hidden: domesticForeignRelation === 2,
    },
    {
      name: 'licenceUrl',
      newLine: true,
      hidden: domesticForeignRelation === 2,
      renderer: ({ value, record }) => {
        const licenceFilename = record?.get('licenceFilename');
        return value ? (
          <UploadCard
            fileUrl={value}
            enableImageWatermark={1}
            fileName={licenceFilename}
            imgWrapClass={styles['upload-card-img']}
          />
        ) : (
          '-'
        );
      },
    },
    {
      name: 'idFrontUuid',
      hidden: domesticForeignRelation !== 2,
      renderer: ({ record, value }) =>
        value ? (
          <FileCardByUuid
            viewOnly
            uuid={value}
            record={record}
            fieldName="idFrontUuid"
            enableImageWatermark={1}
            label={intl
              .get('spfm.supplierRegister.view.title.nationalEmblem')
              .d('身份证身份证国徽面')}
          />
        ) : (
          '-'
        ),
    },
    {
      name: 'idBackUuid',
      hidden: domesticForeignRelation !== 2,
      renderer: ({ record, value }) =>
        value ? (
          <FileCardByUuid
            viewOnly
            uuid={value}
            record={record}
            fieldName="idFrontUuid"
            enableImageWatermark={1}
            label={intl.get('spfm.supplierRegister.view.title.portraitFace').d('身份证人像面')}
          />
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Form
      columns={3}
      useWidthPercent
      dataSet={dataSet}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => (
        <Output {...field} />
      ))}
    </Form>
  );
});

export default Register;
