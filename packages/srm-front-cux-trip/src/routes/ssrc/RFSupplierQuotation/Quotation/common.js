import React from 'react';
import { Attachment } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import intl from 'utils/intl';

const beforeUpload = attachment => {
  if (attachment.size === 0) {
    const name = attachment.name;
    notification.error({
      message: intl.get(`scux.ssrc.trip.message.attachmentTipWithZero`, { name }).d(`${name}文件大小为0KB，请确认上传合适的文件`),
    });
    return false;
  }
  return true;
};

const renderAttacnmentList = (list, otherProps = {}) => {
  const props = {
    fileSize: 1024 * 1024 * 1024,
    beforeUpload,
    ...otherProps,
  };
  return list.map(l => <Attachment name={l} {...props} />);
};

export { renderAttacnmentList };
