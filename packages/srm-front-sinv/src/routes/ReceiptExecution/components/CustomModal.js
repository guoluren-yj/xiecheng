import React, { PureComponent, Fragment } from 'react';
// import { Button, Table, Popover } from 'hzero-ui';
import { Popover, Modal } from 'choerodon-ui';

// import { Modal } from 'choerodon-ui';
import { DataSet, Attachment, Table, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { custDS } from './custDS';

const { Sidebar } = Modal;

const modelPrompt = 'sinv.receiptExecution.model.title';
@formatterCollections({ code: ['sinv.receiptExecution', 'sinv.common'] })
export default class CustomModal extends PureComponent {
  custDs = new DataSet(custDS());

  componentDidMount() {
    const { dataSource = [] } = this.props;
    this.custDs.appendData(dataSource);
  }

  render() {
    const { visible, hideModal } = this.props;
    const columns = [
      {
        name: 'componentName',
        width: 400,
        renderer: ({ value }) => {
          return (
            <Popover placement="top" content={value}>
              {value}
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
      dataSet: this.custDs,
      pagination: false,
      // bordered: true,
      noFilters: true,
      // filterBar: false,
      rowKey: 'cpValueId',
    };

    return (
      <Fragment>
        <Sidebar
          title={intl.get(`${modelPrompt}.customSpecsJson`).d('定制品属性')}
          visible={visible}
          mask
          footer={[
            <Button onClick={hideModal} color="primary">
              {intl.get(`sinv.common.model.common.close`).d('关闭')}
            </Button>,
          ]}
          bodyStyle={{ minHeight: `calc(100vh - 121px)`, padding: '20px' }}
          width={742}
        >
          <Table {...tableProps} />
        </Sidebar>
      </Fragment>
    );
  }
}
