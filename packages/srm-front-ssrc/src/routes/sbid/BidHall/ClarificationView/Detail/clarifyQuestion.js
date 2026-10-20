/**
 * 澄清函引用问题table
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { Popover } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

export default class ClarifyQuestion extends React.Component {
  render() {
    const {
      Loading,
      onChange,
      clarifyType,
      fetchClarList,
      organizationId,
      fetchClarListPagination,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.clarify.view.clarification.clarificationCompany`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.clarificationNo`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 120,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.clarificationTitle`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.clarificationPublishDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.clarificationPublisher`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.submittedByUserName`).d('提交人'),
        dataIndex: 'submittedByUserName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.clarify.view.clarification.problemAnnex`).d('问题附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
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
        onChange={(page) => onChange(page)}
        loading={Loading}
      />
    );
  }
}
