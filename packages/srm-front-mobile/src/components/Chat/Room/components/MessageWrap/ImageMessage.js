import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Picture } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { getAttachmentUrl, getUserOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';
import { BUCKET_DIRECTORY } from '../../common/global';
import styles from './ImageMessage.less';

export default class ImageMessage extends PureComponent {
  getImageUrl = record => {
    const url = record.imageUrl;
    if (!url) return '';
    if (record.imageStatus === 'editing') return url;
    const tenantId = getUserOrganizationId();
    const bucketName = url?.includes(PUBLIC_BUCKET) ? PUBLIC_BUCKET : PRIVATE_BUCKET;
    const attachmentUrl = getAttachmentUrl(url, bucketName, tenantId, BUCKET_DIRECTORY);
    return attachmentUrl;
  };

  onRightClick = e => {
    const { onRightClick, record } = this.props;
    if (typeof onRightClick === 'function') {
      onRightClick(e, record);
    }
  };

  render() {
    const { id, className, record = {}, date = '' } = this.props;
    const imageUrl = this.getImageUrl(record);
    const _id = id || record.msgId;
    let imageScale = 1;
    let width = 200;
    if (Number(record.imageHeight) > 0 && Number(record.imageWidth) > 0) {
      imageScale = Number(record.imageHeight) / Number(record.imageWidth);
      width = Number(record.imageWidth) > 200 ? 200 : Number(record.imageWidth);
    }
    const height = width * imageScale;
    const atText = record.receiverHide ? '' : (record.receiverNames || []).join(',');
    return (
      <div
        id={_id}
        date={date}
        className={classnames(styles['smbl-image-message'], className)}
        contentEditable={false}
        onContextMenu={this.onRightClick}
      >
        <div
          className={styles['smbl-image-message-content']}
          style={{ width, height: `${height}px` }}
        >
          <span>{_id}</span>
          <Picture
            width="100%"
            height="100%"
            src={imageUrl}
            downloadUrl={imageUrl}
            onDragStart={event => event.preventDefault()}
          />
        </div>
        {atText && (
          <div style={{ textAlign: record.float }} className={styles['smbl-image-message-at']}>
            {`${intl.get('smbl.chat.view.message.sendTo').d('发送给')}  ${atText}`}
          </div>
        )}
      </div>
    );
  }
}
