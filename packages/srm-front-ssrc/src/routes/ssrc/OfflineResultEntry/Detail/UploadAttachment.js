/**
 * UploadAttachment - 上传附件
 * @date: 2020-12-24
 * @author: <xiaomin.wang01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import { isFunction } from 'lodash';
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

// import { getCurrentOrganizationId } from 'utils/utils';
// import Upload from 'srm-front-boot/lib/components/Upload';
// import { FIlESIZE } from '@/utils/SsrcRegx';
// import { PRIVATE_BUCKET } from '_utils/config';

// const organizationId = getCurrentOrganizationId();

export default class UploadAttachment extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  render() {
    const { tableDs, custTable, code } = this.props;
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        // width: 120,
      },
      {
        name: 'currentBusinessAttachmentUuid',
        width: 180,
        // renderer: ({ record }) => (
        //   <Upload
        //     filePreview
        //     fileSize={FIlESIZE}
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="offline-businessAttachments"
        //     attachmentUUID={record.get('currentBusinessAttachmentUuid')}
        //     tenantId={organizationId}
        //     afterOpenUploadModal={(uuid) => {
        //       record.set('currentBusinessAttachmentUuid', uuid);
        //     }}
        //   />
        // ),
        editor: true,
      },
      {
        name: 'currentTechAttachmentUuid',
        width: 180,
        editor: true,
        // renderer: ({ record }) => (
        //   <Upload
        //     filePreview
        //     fileSize={FIlESIZE}
        //     bucketName={PRIVATE_BUCKET}
        //     bucketDirectory="offline-techAttachments"
        //     attachmentUUID={record.get('currentTechAttachmentUuid')}
        //     tenantId={organizationId}
        //     afterOpenUploadModal={(uuid) => {
        //       record.set('currentTechAttachmentUuid', uuid);
        //     }}
        //   />
        // ),
      },
    ];

    const table = (
      <Table dataSet={tableDs} columns={columns} />
    );

    return (
      <React.Fragment>
        {custTable && code ? custTable(
          { code },
          table
        ) : table}
      </React.Fragment>
    );
  }
}
