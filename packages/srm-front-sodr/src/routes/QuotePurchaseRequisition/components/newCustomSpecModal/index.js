import React from 'react';
import { Attachment, DataSet, Modal, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const modelPrompt = 'sprm.common.model.common';
export default function openCustomSpecModal(props) {
  const { specsJsonType, dataSource } = props;
  const dataSet = new DataSet({
    data: dataSource,
    paging: false,
  });
  const columns =
    specsJsonType !== 'product'
      ? [
          {
            title: intl.get(`${modelPrompt}.componentName`).d('属性名称'),
            name: 'componentName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
            name: 'cpValue',
            width: 100,
            renderer: ({ value, record }) => {
              return value && String(value).indexOf('http') !== -1 ? (
                <a href={String(value)} target="_blank" rel="noopener noreferrer">
                  {value}
                </a>
              ) : ['IMAGE', 'UPLOAD'].includes(record.get('componentType')) ? (
                <Attachment
                  readOnly
                  labelLayout="float"
                  value={value}
                  bucketName="private-bucket"
                />
              ) : (
                value
              );
            },
          },
        ]
      : [
          {
            title: intl.get(`${modelPrompt}.pName`).d('属性描述'),
            name: 'pName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
            name: 'pValue',
            width: 100,
          },
        ];
  return Modal.open({
    title:
      specsJsonType !== 'product'
        ? intl.get(`${modelPrompt}.customSpecsJson`).d('定制品属性')
        : intl.get(`${modelPrompt}.productSpecsJson`).d('商品属性'),
    children: <Table dataSet={dataSet} columns={columns} selectionMode="none" />,
    footer: null,
    closable: true,
  });
}
