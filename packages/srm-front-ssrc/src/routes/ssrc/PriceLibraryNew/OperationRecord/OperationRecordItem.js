import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import { Attachment } from 'choerodon-ui/pro';
import moment from 'moment';
import { noop } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getOperationIcon, getOperationDesc } from './utils';

import styles from './index.less';

const OperationRecordItem = (props) => {
  const { item, onViewDetail = noop, initTitle, remote } = props;

  // const itemOperationDesc = useMemo(() => getOperationDesc(item, initTitle), [item]);

  const itemOperationDesc = useMemo(() => {
    return remote
      ? remote.process('SSRC_PRICE_LIBRARY_OPERATE_DESC_LIST', getOperationDesc(item, initTitle), {
          ...props,
        })
      : getOperationDesc(item, initTitle);
  }, []);

  return (
    <div className={styles['operation-record-item']} key={item.actionId}>
      <div className={styles['operation-record-item-icon']}>
        <Icon type={getOperationIcon(item.actionCode)} />
      </div>
      <div className={styles['operation-record-item-content']}>
        <div>
          <span
            className={
              ['APPROVE_SUCCESS', 'EXT_APPROVE_SUCCESS'].includes(item.actionCode)
                ? styles['operation-record-item-content-success']
                : ['APPROVE_REJECT', 'EXT_APPROVE_REJECT'].includes(item.actionCode)
                ? styles['operation-record-item-content-reject']
                : styles['operation-record-item-content-name']
            }
            onClick={() => onViewDetail(item)}
          >
            {itemOperationDesc?.[0]}
          </span>
          <span className={styles['operation-record-item-content-action']}>
            {itemOperationDesc?.[1]}
          </span>
          <span className={styles['operation-record-item-content-name']}>
            {itemOperationDesc?.[2]}
          </span>
          <span className={styles['operation-record-item-content-action']}>
            {itemOperationDesc?.[3]}
          </span>
        </div>
        {['EXT_APPROVE_SUCCESS', 'EXT_APPROVE_REJECT', 'INVALID'].includes(item.actionCode) ? (
          <div className={styles['operation-record-item-other']}>
            {item.actionCode === 'INVALID' ? (
              item?.approveMethod && ['EXT', 'WFL'].includes(item?.approveMethod) ? (
                <div className={styles['operation-record-item-other-invalid']}>
                  <span className={styles['operation-record-item-other-invalid-name']}>
                    {intl.get('ssrc.priceLibraryNew.model.library.invalid.reason').d('失效理由')}
                  </span>
                  <span className={styles['operation-record-item-other-invalid-remark']}>
                    {!item?.actionRemark && !item?.actionAttachmentUuid ? (
                      '-'
                    ) : (
                      <>
                        {item?.actionRemark}
                        {item?.actionAttachmentUuid && (
                          <Attachment
                            readOnly
                            icon={null}
                            value={item?.actionAttachmentUuid}
                            label={intl
                              .get('ssrc.priceLibraryNew.model.library.statementLineAttachment')
                              .d('对账单行附件')}
                            viewMode="popup"
                            bucketName={PRIVATE_BUCKET}
                            bucketDirectory="price-center"
                          >
                            {intl
                              .get('ssrc.priceLibraryNew.model.library.invalidAttachment')
                              .d('失效附件')}
                          </Attachment>
                        )}
                      </>
                    )}
                  </span>
                </div>
              ) : null
            ) : (
              <div className={styles['operation-record-item-other-workflow']}>
                <span className={styles['operation-record-item-other-workflow-name']}>
                  {intl.get(`ssrc.priceLibraryNew.view.message.extApprove`).d('外部审批单号')}
                </span>
                <span className={styles['operation-record-item-other-workflow-num']}>
                  {item?.externalApprovalNum}
                </span>
              </div>
            )}
          </div>
        ) : null}
        <div className={styles['operation-record-item-time']}>
          {item.creationDate && moment(item.creationDate).format(DEFAULT_DATETIME_FORMAT)}
        </div>
      </div>
    </div>
  );
};

export default OperationRecordItem;
