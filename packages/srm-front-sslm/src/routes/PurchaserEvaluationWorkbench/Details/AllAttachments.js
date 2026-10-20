/**
 * 采购方评估 - 详情 - 内部、外部附件
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-02 11:41:10
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Attachment, Form } from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';

import styles from '../index.less';

const AllAttachments = ({
  isEdit,
  pubEdit,
  dataSet,
  dataSource = 'manage',
  customizeForm,
  custLoading,
  exAttCustomizeCode,
  inAttCustomizeCode,
  customizeReadOnly = false,
  remote,
}) => {
  const { reportStatus, progressStatus } =
    dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};

  const newIsEdit =
    dataSource !== 'manage'
      ? isEdit
      : pubEdit ||
        (isEdit &&
          ['NEW', 'REJECTED', 'APPROVED', 'FEEDBACK', 'FINAL_COLLECTED'].includes(reportStatus) &&
          progressStatus !== 'EVAL_COMPLETE');

  // 获取内部附件字段
  const getInternalFields = () => {
    const fields = [
      <Attachment
        name="internalAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        readOnly={!newIsEdit}
        bucketDirectory="sslm-evaluation"
      />,
    ];
    const finalFields = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.INNER_ATTA_FORM', fields, {
          readOnly: customizeReadOnly,
          dataSet,
        })
      : fields;
    return finalFields;
  };
  // 获取外部附件字段
  const getExternalFields = () => {
    const fields = [
      <Attachment
        name="externalAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        readOnly={!newIsEdit}
        bucketDirectory="sslm-evaluation"
      />,
      <Attachment
        readOnly
        name="selfEvalAttachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="sslm-evaluation"
      />,
    ];
    const finalFields = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.EXTERNAL_ATTA_FORM', fields, {
          readOnly: customizeReadOnly,
          dataSet,
        })
      : fields;
    return finalFields;
  };
  return (
    <div className={styles['all-attachment-wrap']}>
      {/* 采购方评估工作台 ｜ 销售方评估工作台 */}
      {dataSource !== 'feedback' ? (
        <div className={styles['all-attachment-mutil']}>
          {/* 内部附件 */}
          <div className={styles['left-attachment']}>
            <div className={styles['att-title']}>
              <p className={styles.title}>
                {intl
                  .get('sslm.purchaserEvaluationDetail.view.content.internalAttachment')
                  .d('内部附件')}
              </p>
              <p className={styles.tooltip}>
                {intl
                  .get('sslm.purchaserEvaluationDetail.view.content.hiddenSupplier')
                  .d('供应商不可见')}
              </p>
            </div>
            <div>
              {customizeForm(
                {
                  code: inAttCustomizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
                  readOnly: customizeReadOnly,
                },
                <Form dataSet={dataSet} columns={3} labelLayout="float" custLoading={custLoading}>
                  {getInternalFields()}
                </Form>
              )}
            </div>
          </div>
          {/* 外部附件 */}
          <div className={styles['right-attachment']}>
            <div className={styles.attTitle}>
              <p className={styles.title}>
                {intl
                  .get('sslm.purchaserEvaluationDetail.view.content.externalAttachment')
                  .d('外部附件')}
              </p>
              <p className={styles.tooltip}>
                {intl
                  .get('sslm.purchaserEvaluationDetail.view.content.showSupplier')
                  .d('供应商可见')}
              </p>
            </div>
            <div>
              {customizeForm(
                {
                  code: exAttCustomizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
                  readOnly: customizeReadOnly,
                },
                <Form dataSet={dataSet} columns={1} labelLayout="float">
                  {getExternalFields()}
                </Form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles['all-attachment-single']}>
          <div className={styles.attachment}>
            <div className={styles['att-title']}>
              <p className={styles.title}>
                {intl
                  .get('sslm.purchaserEvaluationDetail.view.feedback.content.externalAttachment')
                  .d('附件信息')}
              </p>
            </div>
            <div>
              <Form dataSet={dataSet} columns={1} labelLayout="float">
                <Attachment
                  readOnly
                  name="externalAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sslm-evaluation"
                />
                <Attachment
                  name="selfEvalAttachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  readOnly={!newIsEdit}
                  bucketDirectory="sslm-evaluation"
                />
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAttachments;
