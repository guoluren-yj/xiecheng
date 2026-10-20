import React from 'react';
import { Table } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
// import Upload from 'components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { enableRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
export default class AttachmentTempDefine extends React.PureComponent {
  render() {
    const { dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`spfm.investigationDefinition.view.attachment.type`).d('附件类型'),
        width: 200,
        dataIndex: 'attachmentTypeMeaning',
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.attachmentDesc`).d('附件描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.purchaseTemplUuid`).d('采购方上传模板'),
        width: 200,
        dataIndex: 'purchaseTemplUuid',
        render: (value) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-lifecycle"
            attachmentUUID={value}
            tenantId={tenantId}
            viewOnly
            filePreview
          />
        ),
      },
      {
        title: intl.get(`spfm.investigationDefinition.view.asupplierAttFlag`).d('供方附件是否必传'),
        dataIndex: 'supplierAttFlag',
        width: 130,
        render: enableRender,
      },
    ];

    const tableProps = {
      columns,
      dataSource,
      rowKey: 'investgCfLineId',
      pagination: false,
    };

    return <Table bordered {...tableProps} />;
  }
}
