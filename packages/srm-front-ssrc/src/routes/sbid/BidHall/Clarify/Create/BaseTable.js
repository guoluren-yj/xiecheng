/**
 * 澄清函引用问题
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Table, Popover } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

export default class BaseTable extends React.Component {
  render() {
    const {
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarifyType,
      organizationId,
      clarificationQuestionPagination,
      onChange,
      rowSelection,
    } = this.props;

    const columns = [
      //   {
      //     title: intl.get(`ssrc.bidHall.view.clarification.clarificationNo`).d('是否关联'),
      //     dataIndex: 'referFlag',
      //     width: 100,
      //     render: (val, record) =>
      //       ['update', 'create'].includes(record._status) ? (
      //         <Form.Item>
      //           {record.$form.getFieldDecorator('referFlag', {
      //             initialValue: val,
      //           })(<Checkbox />)}
      //         </Form.Item>
      //       ) : (
      //         enableRender(val)
      //       ),
      //  },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationNo`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 100,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationTitle`).d('问题描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationCompany`).d('问题编号'),
        dataIndex: 'issueFinalNum',
        width: 180,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationPublishDate`).d('提交时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.view.clarification.clarificationPublisher`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 100,
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
      <Table
        bordered
        columns={columns}
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
