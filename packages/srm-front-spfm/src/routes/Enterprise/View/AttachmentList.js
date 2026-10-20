/**
 * AttachmentList - 企业信息-明细展示页面-附件信息列表组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: ['spfm.attachment', 'entity.attachment'] })
export default class AttachmentList extends PureComponent {
  render() {
    const { dataSource, ...others } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('entity.attachment.type').d('附件类型'),
          dataIndex: 'attachmentType',
        },
        {
          title: intl.get('entity.attachment.description').d('附件描述'),
          dataIndex: 'subAttachment',
        },
        {
          title: intl.get('spfm.attachment.model.attachment.explain').d('说明'),
          dataIndex: 'description',
        },
        {
          title: intl.get('spfm.attachment.model.attachment.endDate').d('文件到期日'),
          dataIndex: 'endDate',
        },
        {
          title: intl.get('spfm.attachment.model.attachment.nestUploadData').d('最后上传时间'),
          dataIndex: 'uploadDate',
        },
        {
          title: intl.get('entity.attachment.upload').d('附件上传'),
          dataIndex: 'attachmentUrl',
        },
      ],
      pagination: false,
      dataSource,
      rowKey: 'companyAttachmentId',
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
