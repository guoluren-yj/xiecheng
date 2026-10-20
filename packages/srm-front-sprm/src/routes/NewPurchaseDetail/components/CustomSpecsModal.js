/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2023-09-22 16:24:31
 */

import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Table, Modal, useDataSet } from 'choerodon-ui/pro';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const CustomListDs = () => {
  return {
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        label: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
        name: 'componentName',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'cpValue',
        width: 100,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        dynamicProps: {
          type: ({ record }) =>
            ['IMAGE', 'UPLOAD'].includes(record.get('componentType')) ? 'attachment' : 'string',
        },
      },
    ],
  };
};

const CustomList = function CustomList({ value }) {
  const customListDs = useDataSet(() => CustomListDs(), []);

  const columns = useMemo(() => {
    return [
      {
        name: 'componentName',
      },
      {
        name: 'cpValue',
      },
    ];
  });

  const openModal = () => {
    customListDs.loadData(value ? JSON.parse(value) : []);

    Modal.open({
      title: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
      closable: true,
      drawer: true,
      children: <Table dataSet={customListDs} columns={columns} />,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  return (
    <>
      <a onClick={() => openModal()}>
        {intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性')}
      </a>
    </>
  );
};

export default CustomList;
