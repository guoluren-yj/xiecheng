/**
 * ClarificationTable - 引用问题澄清函table
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { Attachment } from 'choerodon-ui/pro';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { Popover, Badge } from 'hzero-ui';
import { PRIVATE_BUCKET } from '_utils/config';

import Styles from '../index.less';

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
      // organizationId,
      fetchClarListPagination = {},
      sourceCategory,
      isReadOnly,
      questionRemote,
      headerInfo = {},
      customizeTable,
      bidFlag,
    } = this.props;
    const _columns = [
      // 该列被【商飞】二开 勿动
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionNum`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 180,
        render: (val, record) => (
          <Badge count={record.unreadIssueSize} className={Styles['badge-item']}>
            <a onClick={() => this.onIssueDetail(record)}>{val}</a>
          </Badge>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationTitle`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => (
          <Popover content={val} overlayStyle={{ maxWidth: 600 }} placement="topRight">
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.clarificationPublishDate`)
          .d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.common.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 100,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionSubmitter`).d('提交人'),
        dataIndex: 'submittedByUserName',
        width: 100,
      },
      // 该列被【商飞】二开 勿动
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionFlie`).d('问题附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
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
    ];

    let columns = _columns;

    if (questionRemote) {
      columns = questionRemote.process(
        'SSRC_INQUIRY_HALL_QUESTION_PROCESS_CLARIFICATION_TABLE',
        columns,
        {
          sourceCategory,
          onIssueDetail: this.onIssueDetail,
          headerInfo,
          that: this,
        }
      );
    }

    const table = (
      <EditTable
        bordered
        columns={
          sourceCategory === 'RFQ' || sourceCategory === 'RFX'
            ? columns
            : columns.filter((ele) => ele.dataIndex !== 'clarifyType')
        }
        rowKey="issueLineId"
        dataSource={fetchClarList}
        pagination={fetchClarListPagination}
        rowSelection={!isReadOnly ? rowSelection : null}
        loading={Loading}
        onChange={(page) => onChange(page)}
      />
    );

    return customizeTable
      ? customizeTable(
          {
            code: bidFlag
              ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_RELATIVE_QUESTION'
              : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_RELATIVE_QUESTION',
          },
          table
        )
      : table;
  }
}
