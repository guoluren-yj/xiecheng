import React, { PureComponent, Fragment } from 'react';
// import { Button, Table, Popover } from 'hzero-ui';
import { Popover } from 'choerodon-ui';

// import { Modal } from 'choerodon-ui';
import { DataSet, Attachment, Table } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { custDS } from './custDS';

@formatterCollections({ code: ['sinv.receiptExecution', 'sinv.common'] })
export default class CustomModal extends PureComponent {
  custDs = new DataSet(custDS());

  componentDidMount() {
    const { dataSource = [] } = this.props;
    this.custDs.appendData(dataSource);
  }

  render() {
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
        <Table {...tableProps} />
      </Fragment>
    );
  }
}
