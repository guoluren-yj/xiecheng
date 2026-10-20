/**
 * BaseTable - 澄清函引用问题
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Table, Popover } from 'hzero-ui';

import intl from 'utils/intl';
import { Attachment } from 'choerodon-ui/pro';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { noop } from 'lodash';

import { INQUIRY } from '@/utils/globalVariable';

import { getClarifyUpdateCode } from '../utils/util';

export default class BaseTable extends React.Component {
  render() {
    const {
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarifyType,
      // organizationId,
      clarificationQuestionPagination,
      onChange,
      rowSelection,
      sourceCategory,
      customizeTable = noop,
      sourceKey = INQUIRY,
      clarifyRemote,
      headerInfo,
    } = this.props;

    const _columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionNum`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 180,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.clarification.clarificationDate`).d('提交时间'),
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
        width: 120,
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
          //   filePreview
          //   bucketName={PRIVATE_BUCKET}
          //   bucketDirectory="ssrc-rfx-quotationheader"
          //   attachmentUUID={val}
          //   tenantId={organizationId}
          //   icon="download"
          //   viewOnly
          // />
        ),
      },
    ];

    let columns = _columns;

    if (clarifyRemote) {
      columns = clarifyRemote.process(
        'SSRC_INQUIRY_HALL_NEW_CLARIFY_PROCESS_CLARIFICATION_TABLE',
        columns,
        {
          sourceCategory,
          headerInfo,
        }
      );
    }

    return customizeTable(
      // 需求暂时只添加询价工作台的新建澄清答疑预览-关联问题表格个性化，招标后期只需要加个个性化单元即可
      {
        code: getClarifyUpdateCode(sourceKey)?.tableCode,
      },
      <Table
        bordered
        columns={
          sourceCategory === 'RFX' || sourceCategory === 'RFQ'
            ? columns
            : columns.filter((ele) => ele.dataIndex !== 'clarifyType')
        }
        rowKey="issueLineId"
        dataSource={clarificationQuestionList}
        pagination={clarificationQuestionPagination}
        loading={clarificationQuestionLoading}
        onChange={(page) => onChange(page)}
        rowSelection={rowSelection}
      />
    );
  }
}
