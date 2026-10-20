/**
 * ClarifyQuestion - 澄清函引用问题table
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Popover } from 'hzero-ui';

import intl from 'utils/intl';
import { Attachment } from 'choerodon-ui/pro';
// import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { noop } from 'lodash';

import { getClarifyDetailCode } from '../utils/util';

export default class ClarifyQuestion extends React.Component {
  render() {
    const {
      Loading,
      onChange,
      clarifyType,
      fetchClarList,
      // organizationId,
      sourceCategory,
      fetchClarListPagination,
      customizeTable = noop,
      sourceKey,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationCompany`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      ['RFP', 'RFI'].includes(sourceCategory)
        ? null
        : {
            title: intl.get(`ssrc.bidHall.view.clarification.clarificationNo`).d('澄清类型'),
            dataIndex: 'clarifyType',
            width: 120,
            render: (val) => valueMapMeaning(clarifyType, val),
          },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationTitle`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => (
          <Popover overlayStyle={{ maxWidth: 600 }} placement="topRight" content={val}>
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationPublishDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationPublisher`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.submittedByUserName`).d('提交人'),
        dataIndex: 'submittedByUserName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.problemAnnex`).d('问题附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val) => (
          <Attachment
            readOnly
            key={val}
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-quotationheader"
            value={val}
            viewMode="popup"
          />
          // <Upload
          //   bucketName={PRIVATE_BUCKET}
          //   bucketDirectory="ssrc-rfx-quotationheader"
          //   attachmentUUID={val}
          //   tenantId={organizationId}
          //   icon="download"
          //   viewOnly
          //   filePreview
          // />
        ),
      },
    ].filter(Boolean);
    return customizeTable(
      // 需求暂时只添加询价工作台的查看澄清函详情-关联问题表格个性化，招标后期只需要加个个性化单元即可
      {
        code: getClarifyDetailCode(sourceKey)?.tableCode,
      },
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
