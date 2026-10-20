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
import UploadModal from 'components/Upload/index';

import { BUCKET_NAME } from '@/routes/components/utils/constant';

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
        render: (val) => val.description || val.leaderDescription,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (_, recored) => (
          <UploadModal
            bucketName={BUCKET_NAME}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={recored.leaderAttachmentUuid || recored.attachmentUuid || null}
            icon="download"
            viewOnly
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
