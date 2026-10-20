/*
 * @Date: 2024-08-09 09:14:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Form, Output, useDataSet } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

import UploadCard from '@/routes/components/EnterpriseCertification/components/UploadCard';

import styles from '../styles.less';
import { businessDS } from '../stores/getBusinessDS';

const Business = ({ businessData = {} }) => {
  const dataSet = useDataSet(() => businessDS(), []);

  useEffect(() => {
    dataSet.create(businessData);
  }, [JSON.stringify(businessData)]);

  const fields = [
    {
      name: 'businessType',
    },
    {
      name: 'interBusinessShield',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'serviceType',
    },
    {
      name: 'industryReqList',
    },
    {
      name: 'industryCategoryReqList',
    },
    {
      name: 'serviceAreaReqList',
    },
    {
      name: 'website',
    },
    {
      name: 'description',
      newLine: true,
      colSpan: 2,
    },
    {
      name: 'logoUrl',
      newLine: true,
      renderer: ({ record, value }) => {
        const logoFilename = record?.get('logoFilename');
        return (
          <UploadCard
            fileName={logoFilename}
            fileUrl={value}
            imgWrapClass={styles['upload-card-img']}
          />
        );
      },
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
};

export default Business;
