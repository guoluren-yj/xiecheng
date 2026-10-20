import React, { PureComponent } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';

import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';

export default class SupplierBatchAddExpiredModal extends PureComponent {
  /**
   * 铺平供应商资质到期提醒数据
   */
  @Bind()
  renderDataSource(dataSource) {
    const arrayItem = [];
    const attachmentsItem = dataSource.map((item) => {
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
    attachmentsItem.forEach((item) => {
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
      remote,
      selectionMode,
      tip,
      isSection,
    } = this.props;
    const _columns = [
      isSection
        ? {
            // isSection 是否是多标段
            title: intl
              .get('ssrc.inquiryHall.model.quotationController.supplierExpired.sectionNum')
              .d('所属标段'),
            name: 'sectionNums',
            width: 120,
          }
        : null,
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
            // 整改样式 兼容之前的这样写，不写在ds配置
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              value={value}
              tenantId={organizationId}
              funcType="link"
              viewMode="popup"
            />
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SUPPLIER_BULK_EXPIRED_MODAL_COLUMNS',
          _columns
        )
      : _columns;

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          {tip ||
            intl
              .get(`ssrc.inquiryHall.view.message.supplierQualificationInfo`)
              .d('以下供应商在供应商360资质认证已到期，确认是否添加：')}
        </div>
        <Table
          bordered
          rowKey="companyId"
          columns={columns}
          dataSet={supplierBulkExpiredModalDS}
          selectionMode={selectionMode || 'rowbox'}
        />
      </div>
    );
  }
}
