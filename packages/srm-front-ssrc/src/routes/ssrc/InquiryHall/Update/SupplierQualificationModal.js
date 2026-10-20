/**
 * SupplierQualificationModal - 供应商资质到期提醒模态框
 * @date: 2020-02-25
 * @author: YYM <yongming.yang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNull } from 'lodash';

import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

export default class SupplierQualificationModal extends PureComponent {
  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { rowSelection, onCancel, onOk } = this.props;
    if (isEmpty(rowSelection)) {
      onCancel();
    } else {
      onOk();
    }
  }

  /**
   * 取消操作
   */
  @Bind()
  cancel() {
    const { onCancel } = this.props;
    onCancel();
  }

  /**
   * 计算Table单元格缩进
   *
   * @param {*} val
   * @param {*} record
   */
  @Bind()
  handleColCalculate(val, record) {
    let rowSpan = {};
    const { expirAttachmentsDtosLen } = record;
    const mean = <Popover content={val}>{val}</Popover>;
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
    const { visible, dataSource, pagination, rowSelection, loading, organizationId } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val, record) => this.handleColCalculate(val, record),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        dataIndex: 'attachmentDesc',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        dataIndex: 'expirationDate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        dataIndex: 'supplierAttachmentUuid',
        width: 100,
        render: (val, record) =>
          record.expirAttachmentsDtosLen >= 1 ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val || record.purchaserAttachmentUuid}
              tenantId={organizationId}
            />
          ) : (
            ''
          ),
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={788}
        visible={visible}
        title={intl
          .get(`ssrc.inquiryHall.view.message.title.supplierQualification`)
          .d('供应商资质到期提醒')}
        onOk={this.saveBtn}
        onCancel={this.cancel}
      >
        <p>
          {intl
            .get(`ssrc.inquiryHall.view.message.supplierQualificationInfo`)
            .d('以下供应商在供应商360资质认证已到期，确认是否添加：')}
        </p>
        <Table
          bordered
          rowKey="companyId"
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
        />
      </Modal>
    );
  }
}
