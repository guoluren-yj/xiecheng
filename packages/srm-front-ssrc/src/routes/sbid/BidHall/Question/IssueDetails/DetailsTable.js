import React from 'react';
import intl from 'utils/intl';
import { Popover } from 'hzero-ui';
import Upload from 'srm-front-boot/lib/components/Upload';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { valueMapMeaning } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

export default class DetailsTable extends React.Component {
  @Bind()
  handleCheckAttachment() {}

  render() {
    const {
      Loading,
      clarifyType = [],
      organizationId,
      dataSource,
      issueLinePagination,
      onChange,
    } = this.props;
    const columns = [
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
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.question.view.question.attachment`).d('附件'),
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
      <React.Fragment>
        <EditTable
          bordered
          // rowKey="clarifyId"
          columns={columns}
          dataSource={dataSource}
          pagination={issueLinePagination}
          loading={Loading}
          onChange={(page) => onChange(page)}
        />
      </React.Fragment>
    );
  }
}
