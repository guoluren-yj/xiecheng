import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

@observer
class SupplierBatchAddExpiredModal extends PureComponent {
  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map(item => {
      const { expirAttachmentsDtos = [], ...otherItem } = item;
      if (expirAttachmentsDtos && expirAttachmentsDtos.length) {
        const attachmentsElement = expirAttachmentsDtos.map((element, index) => {
          return {
            index,
            ...otherItem,
            ...element,
          };
        });
        return attachmentsElement;
      } else {
        return otherItem;
      }
    });
    attachmentsItem.forEach(item => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });

    return arrayItem;
  }

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
    const {
      supplierBulkExpiredModalDS,
      organizationId,
      tip,
      selectionMode,
      remoteBox,
    } = this.props;
    const _columns = [
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
        editor: true,
        renderer: ({ value, record }) =>
          record.get('expirAttachmentsDtosLen') >= 1 ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={value}
              tenantId={organizationId}
            />
          ) : (
            ''
          ),
      },
    ];

    const columns = remoteBox
      ? remoteBox.process(
          'SSRC_OFFLINE_RESULT_ENTRY_DETAIL_PROCESS_SUPPLIER_BULK_EXPIRED_MODAL_COLUMNS',
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
        <Table
          bordered
          columns={columns}
          dataSet={supplierBulkExpiredModalDS}
          selectionMode={selectionMode || 'rowbox'}
        />
      </div>
    );
  }
}

export default SupplierBatchAddExpiredModal;
