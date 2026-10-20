import React, { PureComponent, Fragment } from 'react';
import { Table, Modal, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { Attachment } from 'choerodon-ui/pro';

const modelPrompt = 'sprm.common.model.common';
export default class CustomSpecModal extends PureComponent {
  render() {
    const { visible, hideModal, dataSource = [], specsJsonType } = this.props;
    const columns =
      specsJsonType !== 'product'
        ? [
            {
              title: intl.get(`${modelPrompt}.componentName`).d('属性名称'),
              dataIndex: 'componentName',
              width: 120,
              render: (value) => {
                return (
                  <Popover placement="top" content={value}>
                    {value}
                  </Popover>
                );
              },
            },
            {
              title: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
              dataIndex: 'cpValue',
              width: 100,
              render: (value, record) => {
                return value && String(value).indexOf('http') !== -1 ? (
                  <a href={String(value)} target="_blank" rel="noopener noreferrer">
                    {value}
                  </a>
                ) : ['IMAGE', 'UPLOAD'].includes(record?.componentType) ? (
                  <Attachment
                    readOnly
                    labelLayout="float"
                    value={value}
                    bucketName="private-bucket"
                  />
                ) : (
                  <Popover placement="top" content={value}>
                    {value}
                  </Popover>
                );
              },
            },
          ]
        : [
            {
              title: intl.get(`${modelPrompt}.pName`).d('属性描述'),
              dataIndex: 'pName',
              width: 120,
            },
            {
              title: intl.get(`${modelPrompt}.cpValue`).d('属性值'),
              dataIndex: 'pValue',
              width: 100,
            },
          ];
    const tableProps = {
      columns,
      dataSource,
      pagination: false,
      bordered: true,
      rowKey: 'cpValueId',
    };

    return (
      <Fragment>
        <Modal
          title={
            specsJsonType !== 'product'
              ? intl.get(`${modelPrompt}.customSpecsJson`).d('定制品属性')
              : intl.get(`${modelPrompt}.productSpecsJson`).d('商品属性')
          }
          zIndex={999}
          visible={visible}
          onCancel={() => hideModal()}
          footer={null}
        >
          <Table {...tableProps} />
        </Modal>
      </Fragment>
    );
  }
}
