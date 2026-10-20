/**
 * AttachmentInfo - 企业认证预览-附件信息
 * @date: 2018-12-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import UploadModal from 'srm-front-boot/lib/components/Upload/index';

import ItemWrapper from './ItemWrapper';
import attachmentDS from '../store/attachmentDS';

export default class AttachmentInfo extends React.PureComponent {
  attachmentDS = new DataSet({
    ...attachmentDS(),
    selection: false,
    autoQuery: false,
  });

  componentDidMount() {
    const { attachmentList = [] } = this.props;
    this.attachmentDS.loadData(attachmentList);
  }

  render() {
    const columns = [
      {
        name: 'attachmentType',
        width: 250,
        renderer: ({ record }) => {
          return `${record.toData().attachmentTypeMeaning}/${record.toData().subAttachmentMeaning}`;
        },
      },
      {
        name: 'description',
        width: 200,
      },
      {
        name: 'endDate',
        width: 200,
      },
      {
        name: 'longEffectiveFlag',
        width: 200,
      },
      {
        name: 'uploadDate',
        width: 200,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ record }) => {
          return (
            <div>
              <UploadModal
                viewOnly
                filePreview
                attachmentUUID={record.toData().attachmentUuid}
                filesNumber={record.toData().attachmentCount}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="spfm-comp"
              />
            </div>
          );
        },
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
    return (
      <ItemWrapper
        title={intl.get('spfm.attachment.view.title.tab.attachmentTable').d('附件信息')}
        message={intl
          .get('spfm.attachment.view.message.description')
          .d(
            '您可在此处上传各类经营/质量及各类许可证信息，便于贵司的资质认可；同类型许可证可在同一行内上传多个附件。'
          )}
      >
        <Table
          bordered
          rowKey="companyAttachmentId"
          dataSet={this.attachmentDS}
          columns={columns}
          pagination={false}
        />
      </ItemWrapper>
    );
  }
}
