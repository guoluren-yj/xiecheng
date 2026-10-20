/**
 * ExpertScoring/BidHall - 澄清单详情表格信息展示
 * @date: 2019-08-20
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

class TableList extends Component {
  renderColumns() {
    const columns = [
      {
        title: intl.get(`ssrc.question.model.question.lineNum`).d(`行号`),
        dataIndex: 'leaderLineNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.question.model.question.description`).d(`描述`),
        render: (val) => val.leaderDescription || val.description,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (_, recored) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={recored.leaderAttachmentUuid || recored.attachmentUuid || null}
            icon="download"
            viewOnly
            filePreview
          />
        ),
      },
    ];

    return columns;
  }

  render() {
    const { dataSource, pagination, onChange } = this.props;
    const tableProps = {
      bordered: true,
      dataSource,
      pagination,
      onChange,
      columns: this.renderColumns(),
    };
    return (
      <div>
        <Table {...tableProps} />
      </div>
    );
  }
}

export default TableList;
