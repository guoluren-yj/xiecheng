import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class SupplierBatchAddExpiredModal extends PureComponent {
  render() {
    const { supplierBulkExpiredModalDS, selectionMode, tip, ssrcRemote } = this.props;
    const _columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        name: 'attachmentDesc',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        name: 'expirationDate',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        name: 'supplierAttachmentUuid',
        width: 100,
      },
    ];
    const columns = ssrcRemote
      ? ssrcRemote.process(
          'SSRC_PROJECT_SETUP_UPDATE_PROCESS_SUPPLIER_BULK_EXPIRED_MODAL_COLUMNS',
          _columns
        )
      : _columns;

    return (
      <div>
        <span>
          {tip ||
            intl
              .get(`ssrc.inquiryHall.view.message.supplierQualificationInfo`)
              .d('以下供应商在供应商360资质认证已到期，确认是否添加：')}
        </span>
        <div style={{ height: '16px' }} />
        <Table
          bordered
          rowKey="companyId"
          columns={columns}
          dataSet={supplierBulkExpiredModalDS}
          selectionMode={selectionMode || 'rowbox'}
          customizable
          customizedCode="SSRC.PROJECT.UPDATE.SUPPLIER_BATCH_ADD_EXPIRED_TABLE"
        />
      </div>
    );
  }
}
