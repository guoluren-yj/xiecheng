import React from 'react';
import { Table, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { Modal, Attachment } from 'choerodon-ui/pro';

const modelPrompt = 'sinv.receiptExecution';

// 封装通用c7nModal
export function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

// c7n通用弹窗
export function showRecordModal(dataSource = []) {
  const columns = [
    {
      dataIndex: 'componentName',
      title: intl.get(`${modelPrompt}.model.title.componentName`).d('属性名称'),
      key: 'componentName',
      render: (value) => {
        return (
          <Popover placement="top" content={value}>
            {value}
          </Popover>
        );
      },
    },
    {
      dataIndex: 'cpValue',
      title: intl.get(`${modelPrompt}.model.title.cpValue`).d('属性值'),
      key: 'cpValue',
      render: (value, record) => {
        return value && String(value).indexOf('http') !== -1 ? (
          <a href={String(value)} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : ['IMAGE', 'UPLOAD'].includes(record?.componentType) ? (
          <Attachment readOnly labelLayout="float" value={value} bucketName="private-bucket" />
        ) : (
          <Popover placement="top" content={value}>
            {value}
          </Popover>
        );
      },
    },
  ];
  const tableProps = {
    columns,
    dataSource,
    pagination: false,
    bordered: true,
    rowKey: 'cpValueId',
  };

  return c7nModal({
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    style: { width: 742 },
    title: intl.get(`${modelPrompt}.model.title.customSpecsJson`).d('定制品属性'),
    children: <Table {...tableProps} columns={columns} />,
  });
}
