/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-09-11 09:59:28
 * @LastEditTime: 2024-09-11 15:53:44
 * @Description:回复行
 * @copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import { Popover } from 'hzero-ui';

import intl from 'utils/intl';

import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import styles from './index.less';

const ReplyLine = (props) => {
  const { item } = props || {};
  return (
    <div className={styles['ssrc-reply-detail-line']}>
      <div className="question">
        <span className="description">{item.leaderDescription || item.description}</span>
        <span className="other-info">
          <span className="uuid">
            {(item.leaderAttachmentUuid || item.attachmentUuid) && (
              <>
                <Upload
                  btnText=""
                  viewOnly
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={item.leaderAttachmentUuid || item.attachmentUuid || null}
                />
                <span className="split">|</span>
              </>
            )}
          </span>
          <span className="uuid">
            {item.validAttachmentUuid && (
              <>
                <Upload
                  icon="download"
                  viewOnly
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={item.validAttachmentUuid || null}
                />
                <span className="split">|</span>
              </>
            )}
          </span>
          <span className="asked">
            <span>
              {' '}
              {intl.get(`ssrc.expertScoring.view.expertScoring.askedByName`).d('提问人')}：
            </span>
            <Popover content={item.askedByMeaning}>
              <span
                style={{
                  display: 'inline-block',
                  maxWidth: 80,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  verticalAlign: 'bottom',
                }}
              >
                {item.askedByMeaning || '-'}
              </span>
            </Popover>
          </span>
        </span>
      </div>
      <div className="result">
        {intl.get(`ssrc.expertScoring.view.expertScoring.replayResult`).d('回复结果')}：
        {item.validAnswer}
      </div>
    </div>
  );
};

export default ReplyLine;
