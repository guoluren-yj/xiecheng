import React, { useEffect } from 'react';
import { Popover } from 'choerodon-ui';
import { DataSet, Attachment, Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { custDS } from './custDs';

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
export function CustModal(props) {
  const custDs = new DataSet(custDS());
  const { dataSource = [] } = props;

  useEffect(() => {
    custDs.appendData(dataSource);
  }, []);

  const columns = [
    {
      name: 'componentName',
      width: 400,
      renderer: ({ record }) => {
        return (
          <Popover placement="top" content={record.get('componentName')}>
            {record.get('componentName')}
          </Popover>
        );
      },
    },
    {
      name: 'cpValue',
      width: 100,
      renderer: ({ value, record }) => {
        return value && String(value).indexOf('http') !== -1 ? (
          <a href={String(value)} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        ) : ['IMAGE', 'UPLOAD'].includes(record?.get('componentType')) ? (
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
    dataSet: custDs,
    pagination: false,
  };

  const showRecordModal = () => {
    return c7nModal({
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      title: intl.get(`${modelPrompt}.model.title.customSpecsJson`).d('定制品属性'),
      children: <Table {...tableProps} />,
    });
  };
  return (
    <a onClick={showRecordModal}>
      {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
    </a>
  );
}
