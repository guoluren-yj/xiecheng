/**
 * 操作记录item
 */
import React, { useMemo } from 'react';
import { Tag } from 'choerodon-ui';
import { Icon, Attachment, Tooltip } from 'choerodon-ui/pro';
import moment from 'moment';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import styles from './index.less';

const { Group } = Attachment;

const Common = {
  labelLayout: 'float',
  showHistory: true,
  readOnly: true,
  viewMode: 'popup',
  bucketName: PRIVATE_BUCKET,
};

const OperationRecordItem = (props) => {
  const { item } = props;

  const quotationFlag = useMemo(() => {
    return item.node === 'QUOTATION';
  }, [item]);

  const roundQuotationFlag = useMemo(() => {
    return item.realNode === 'ROUND_QUOTATION_PRICE';
  }, [item]);

  const uoloadName = useMemo(() => {
    return quotationFlag || item.node === 'PREQUAL_APPROVE' || item.node === 'QUOTATION_TWO'
      ? `${item.companyName}(${item.realName})`
      : item.realName;
  }, [item]);

  const historyFiles = useMemo(() => {
    return item.historyNewCheckRfxNodeAttachmentDTOs || [];
  }, [item]);

  return (
    <div className={styles['operation-record-item']}>
      <div className={styles['operation-record-item-icon']}>
        <Icon type="file_upload" />
      </div>
      <div className={styles['operation-record-item-conent']}>
        <div className={styles['operation-record-item-conent-desc']}>
          <span style={{ cursor: 'pointer' }}>
            {item.node === 'QUOTATION_TWO' && (
              <span>
                <Tag className={styles.round}>
                  {roundQuotationFlag
                    ? intl
                        .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
                          round: item.roundNumber,
                        })
                        .d('第{round}轮报价')
                    : item.realNodeMeaning}
                </Tag>{' '}
              </span>
            )}
            <Tooltip title={uoloadName}>
              <span className={styles.text1}>{uoloadName}</span>
            </Tooltip>
            <span />
            <span className={styles.text2}>
              {intl.get('ssrc.common.oprate.upload').d('上传了')}
            </span>
            <span className={styles.text1}>{item.typeMeaning} </span>
            <span className={styles.attachment}>
              {/* 这里是为了样式加的Group */}
              <Group
                text={
                  <span style={{ fontWeight: 'bold' }}>
                    {intl.get(`ssrc.common.model.common.viewAttachment`).d('查看附件')}
                  </span>
                }
              >
                <Attachment label={item.typeMeaning} value={item.attachmentUuids[0]} {...Common} />{' '}
              </Group>
            </span>
            <span className={styles.attachment}>
              {historyFiles.length > 1 && (
                <Group
                  count={false}
                  text={
                    <span style={{ fontWeight: 'bold' }}>
                      {' '}
                      {`${intl
                        .get('ssrc.inquiryHall.view.inquiryHall.historyMode')
                        .d('历史版本')} ${historyFiles.length}`}{' '}
                    </span>
                  }
                >
                  {historyFiles.map((historyItem) => {
                    return (
                      <Attachment
                        key={historyItem.attachmentUuids[0]}
                        label={`${historyItem.realNodeMeaning}-${historyItem.versionCount}`}
                        value={historyItem.attachmentUuids[0]}
                        {...Common}
                      />
                    );
                  })}
                </Group>
              )}
            </span>
          </span>
        </div>
        <span className={styles.text3}>
          {item.creationDate && moment(item.creationDate).format(DEFAULT_DATETIME_FORMAT)}
        </span>
      </div>
    </div>
  );
};

export default OperationRecordItem;
