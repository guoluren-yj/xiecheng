import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

export default class SupplierBatchAddExpiredModal extends PureComponent {
  /**
   * 计算Table单元格缩进
   *
   * @param {*} val
   * @param {*} record
   */
  @Bind()
  handleColCalculate(val, record = {}) {
    let rowSpan = {};
    const { expirAttachmentsDtosLen } = record;
    const mean = <span>{val}</span>;
    if (isNull(expirAttachmentsDtosLen) || expirAttachmentsDtosLen <= 1) {
      return mean;
    } else {
      if (record.index) {
        rowSpan = {
          children: mean,
          props: {
            rowSpan: 0,
          },
        };
      } else {
        rowSpan = {
          children: mean,
          props: {
            rowSpan: expirAttachmentsDtosLen,
          },
        };
      }
      return rowSpan;
    }
  }

  render() {
    const { supplierBulkExpiredModalDs, organizationId } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        width: 150,
        render: ({ value, record }) => this.handleColCalculate(value, record),
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
        renderer: ({ value, record }) =>
          record.get('expirAttachmentsDtosLen') >= 1 ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rf-adjust"
              attachmentUUID={value}
              tenantId={organizationId}
            />
          ) : (
            ''
          ),
      },
    ];

    return (
      <div>
        <span>
          {intl
            .get(`ssrc.inquiryHall.view.message.supplierQualificationInfo`)
            .d('以下供应商在供应商360资质认证已到期，确认是否添加：')}
        </span>
        <Table bordered rowKey="companyId" columns={columns} dataSet={supplierBulkExpiredModalDs} />
      </div>
    );
  }
}
