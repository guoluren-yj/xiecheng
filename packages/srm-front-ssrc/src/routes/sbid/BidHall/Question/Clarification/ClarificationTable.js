/**
 * ClarificationTable - 引用问题澄清函table
 * @date: 2019-6-16
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { Popover } from 'hzero-ui';
import { PRIVATE_BUCKET } from '_utils/config';

export default class ClarificationTable extends React.Component {
  /**
   *跳转到初审页面
   *
   */
  @Bind()
  onIssueDetail(record) {
    const { onIssueDetail } = this.props;
    onIssueDetail(record);
  }

  render() {
    const {
      Loading,
      onChange,
      clarifyType = [],
      rowSelection,
      fetchClarList = [],
      organizationId,
      fetchClarListPagination = {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.clarificationCompany`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 180,
        render: (val, record) => <a onClick={() => this.onIssueDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.clarificationTitle`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.questionState`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.clarificationPublishDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompany`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 100,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.questionSubmitter`).d('提交人'),
        dataIndex: 'submittedByUserName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.questionFlie`).d('问题附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (val) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            attachmentUUID={val}
            tenantId={organizationId}
            icon="download"
            viewOnly
            filePreview
          />
        ),
      },
    ];
    return (
      <EditTable
        bordered
        columns={columns}
        rowKey="issueLineId"
        dataSource={fetchClarList}
        pagination={fetchClarListPagination}
        rowSelection={rowSelection}
        loading={Loading}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
