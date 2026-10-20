/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import classnames from 'classnames';
import { getFileSuffix, downloadFile } from '../../functions/message';
import styles from './FileMessage.less';
import { CalculateFileSize } from '../../functions';

export default class FileMessage extends PureComponent {
  download = () => {
    if (!this.props.record.fileUrl) return;
    downloadFile(this.props.record.fileUrl);
  };

  onRightClick = (e) => {
    const { onRightClick, record } = this.props;
    if (typeof onRightClick === 'function') {
      onRightClick(e, record);
    }
  };

  render() {
    const { id, className, record = {}, date = '' } = this.props;
    const size = Number(record.fileSize || 0);
    const sizeStr = CalculateFileSize(size);
    const fileTypeMap = {
      pdf: 'file-icon-pdf',
      docx: 'file-icon-word',
      doc: 'file-icon-word',
      mp4: 'file-icon-video',
      m4a: 'file-icon-video',
      xlsx: 'file-icon-excel',
      xls: 'file-icon-excel',
      pptx: 'file-icon-ppt',
      ppt: 'file-icon-ppt',
      zip: 'file-icon-zip',
      txt: 'file-icon-txt',
    };
    const _id = id || record.msgId;
    let suffix = getFileSuffix(record.fileName);
    if (suffix) {
      suffix = suffix.toLowerCase();
    }
    const iconName = fileTypeMap[suffix] || 'file-icon-unknow';
    const icon = require(`../../../../../assets/file/${iconName}.svg`);
    const atText = record.receiverHide ? '' : (record.receiverNames || []).join(',');
    return (
      <div
        id={_id}
        date={date}
        className={classnames(styles['smbl-file-message-wrap'], className)}
        contentEditable={false}
        style={{ textAlign: record.float }}
      >
        <div
          className={styles['smbl-file-message']}
          style={{ flexDirection: record.float === 'left' ? 'row-reverse' : 'row' }}
          onClick={this.download}
          onContextMenu={this.onRightClick}
        >
          <div className={styles['smbl-file-message-left']}>
            <div className={styles['smbl-file-message-name']}>{record.fileName}</div>
            <div className={styles['smbl-file-message-size']}>{sizeStr}</div>
          </div>
          <div className={styles['smbl-file-message-space']} />
          <div className={styles['smbl-file-message-right']}>
            <img src={icon} alt="" />
          </div>
        </div>
        {atText && (
          <div style={{ textAlign: record.float }} className={styles['smbl-file-message-at']}>
            {`${intl.get('smbl.chat.view.message.sendTo').d('发送给')}  ${atText}`}
          </div>
        )}
      </div>
    );
  }
}
