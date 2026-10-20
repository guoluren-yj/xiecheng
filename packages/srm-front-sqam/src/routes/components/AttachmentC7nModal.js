import React, { Fragment, useMemo, useEffect, useCallback, memo } from 'react';
import { Attachment, Modal } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import notification from 'utils/notification';
import intl from 'utils/intl';

const AttachmentC7nModal = (props) => {
  // onCancel 方法是更新uuid,showSupplier显示供应商字段，supplierReadOnly供应商只读，purchaseReadOnly采购方附件只读，camp打开的阵营
  const {
    onCancel,
    bucketName,
    purchaserDirectory,
    attachmentUuid,
    showSupplier,
    supplierReadOnly,
    purchaseReadOnly,
    camp = 'purchase',
    interPurchaseDirectory,
    attachmentInterUuid,
    storageSize = 10,
    supplierAttachmentUuid,
    supplierBucketDirectory,
  } = props;

  const purchaseProps = useMemo(() => {
    return {
      label:
        camp === 'supplier'
          ? intl.get(`entity.attachment.type.purchaser`).d('采购方附件')
          : intl.get(`entity.attachment.type.purchaser.out`).d('采购方外部附件'),
      bucketName,
      bucketDirectory: purchaserDirectory,
      value: attachmentUuid,
      // showHistory: true,
      labelLayout: 'float',
      onChange: true,
      readOnly: purchaseReadOnly,
    };
  }, [bucketName, purchaserDirectory, attachmentUuid, purchaseReadOnly, camp]);

  const purchaseInterProps = useMemo(() => {
    return {
      label: intl.get(`entity.attachment.type.purchaser.inter`).d('采购方内部附件'),
      bucketName,
      bucketDirectory: interPurchaseDirectory,
      value: attachmentInterUuid,
      // showHistory: true,
      labelLayout: 'float',
      onChange: true,
      readOnly: purchaseReadOnly,
    };
  }, [bucketName, interPurchaseDirectory, attachmentInterUuid, purchaseReadOnly]);

  const supplierProps = useMemo(() => {
    return {
      label: intl.get(`entity.attachment.type.supplier`).d('供应商附件'),
      bucketName,
      bucketDirectory: supplierBucketDirectory,
      value: supplierAttachmentUuid,
      // showHistory: true,
      labelLayout: 'float',
      onChange: true,
      readOnly: supplierReadOnly,
    };
  }, [supplierBucketDirectory, bucketName, supplierAttachmentUuid, supplierReadOnly]);

  useEffect(() => {
    Modal.open({
      key: Modal.key(),
      closable: true,
      style: {
        width: '720px',
      },
      bodyStyle: {
        minHeight: '260px',
      },
      autoCenter: true,
      title: intl.get(`entity.attachment.tag`).d('附件'),
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      onClose: onCancel,
      children: (
        <Fragment>
          <Row>
            <Col span={11}>
              <Attachment  {...purchaseProps} />
            </Col>
            {camp !== 'supplier' && (
              <Col span={11} style={{ marginLeft: 46 }}>
                <Attachment  {...purchaseInterProps} />
              </Col>
            )}
          </Row>
          {showSupplier && (
            <Row>
              <Col span={11} style={{ marginTop: 40 }}>
                <Attachment  {...supplierProps} />
              </Col>
            </Row>
          )}
        </Fragment>
      ),
    }); 
  }, [
    purchaseInterProps,
    purchaseProps,
    onCancel,
    supplierProps,
    showSupplier,
    camp,
  ]);

  return null;
};

export default memo(AttachmentC7nModal);
