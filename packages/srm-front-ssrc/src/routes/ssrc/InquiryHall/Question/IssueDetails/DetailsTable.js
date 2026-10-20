import React from 'react';
import { Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { noop } from 'lodash';

import intl from 'utils/intl';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { Attachment } from 'choerodon-ui/pro';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

import { INQUIRY, BID } from '@/utils/globalVariable';

export default class DetailsTable extends React.Component {
  @Bind()
  handleCheckAttachment() {}

  render() {
    const {
      Loading,
      clarifyType = [],
      // organizationId,
      dataSource,
      issueDetailsRemote,
      issueLinePagination,
      onChange,
      sourceCategory,
      customizeTable = noop,
      bidFlag,
    } = this.props;
    const preColumns = [
      {
        title: intl.get(`ssrc.question.view.question.lineNum`).d('行号'),
        dataIndex: 'lineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.question.view.question.clarificationType`).d('澄清类型'),
        dataIndex: 'clarifyType',
        width: 150,
        render: (val) => valueMapMeaning(clarifyType, val),
      },
      {
        title: intl.get(`ssrc.question.view.question.descriptions`).d('描述'),
        dataIndex: 'description',
        width: 200,
        render: (val) => (
          <Popover overlayStyle={{ maxWidth: 600 }} placement="topLeft" content={val}>
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`ssrc.question.view.question.attachment`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: (val) => {
          return (
            <Attachment
              readOnly
              key={val}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              value={val}
              viewMode="popup"
            />
          );
        },
        // <Upload
        //   bucketName={PRIVATE_BUCKET}
        //   bucketDirectory="ssrc-rfx-quotationheader"
        //   attachmentUUID={val}
        //   tenantId={organizationId}
        //   icon="download"
        //   viewOnly
        //   filePreview
        // />
      },
    ];
    const columns = issueDetailsRemote?.process
      ? issueDetailsRemote.process(
          'SSRC.INQUIRY_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE_COLUMNS',
          preColumns,
          { dataSource, sourceCategory, bidFlag, that: this }
        )
      : preColumns;
    return (
      <React.Fragment>
        {customizeTable(
          // 需求暂时只添加询价工作台的查看问题详情表格个性化，招标后期只需要加个个性化单元即可
          {
            code: `SSRC.${bidFlag ? BID : INQUIRY}_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE`,
          },
          <EditTable
            bordered
            // rowKey="clarifyId"
            columns={
              sourceCategory === 'RFX' || sourceCategory === 'RFQ'
                ? columns
                : columns.filter((ele) => ele.dataIndex !== 'clarifyType')
            }
            dataSource={dataSource}
            pagination={issueLinePagination}
            loading={Loading}
            onChange={(page) => onChange(page)}
          />
        )}
      </React.Fragment>
    );
  }
}
