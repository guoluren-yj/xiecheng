import type { ReactElement } from 'react';
import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react';
import classNames from 'classnames';
import { Alert, Icon, Tooltip } from 'choerodon-ui';
import type { AlertProps } from 'choerodon-ui/lib/alert';
import { isEmpty, flow, isFunction, isString } from 'lodash';

import intl from 'utils/intl';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { previewPdf } from '../../utils/utils';
import styles from './index.less';


export interface DynamicAlertProps extends AlertProps {
  type?: 'info' | 'error',
  name?: string,
  placement?: 'normal' | 'modal-top',
  requestUrl?: string,
  onLoad?: (name: string) => void,
  onDisplayChange?: (data: Record<string, any>) => any,
};

const DynamicAlert = flow(
  memo,
  formatterCollections({
    code: ['sbsm.common'],
  }),
)((props: DynamicAlertProps) => {

  const {
    type = 'info',
    name,
    message,
    placement = 'normal',
    requestUrl,
    afterClose,
    onLoad,
    onDisplayChange,
    ...otherProps
  } = props;

  const wrapperRef = useRef<any>({});
  const [text, setText] = useState(message);
  const [fileUrl, setFileUrl] = useState('');

  const handleEmitInit = useCallback(() => {
    if (name && isFunction(onLoad)) {
      onLoad(name);
    } else if (isFunction(onDisplayChange)) {
      onDisplayChange({ height: wrapperRef.current?.offsetHeight || 0 });
    }
  }, [name, onLoad, onDisplayChange]);

  const handleInit = useCallback(async () => {
    if (requestUrl) {
      const res = getResponse(await request(requestUrl));
      if (res && !isEmpty(res)) {
        const { announcement, prompt, fileUrl } = res;
        setText(announcement || prompt);
        setFileUrl(fileUrl);
        handleEmitInit();
      }
    } else if (message) handleEmitInit();
  }, [requestUrl, message, handleEmitInit]);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  const handleAfterClose = useCallback(() => {
    if (isFunction(afterClose)) afterClose();
    if (isFunction(onDisplayChange)) onDisplayChange({ height: 0 });
  }, [afterClose, onDisplayChange]);

  const handlePreviewFile = useCallback(() => {
    if (fileUrl) previewPdf(fileUrl, 'public-bucket');
  }, [fileUrl]);

  const dynamicText = useMemo(() => {
    let arr: any[] = [];
    if (isString(text)) {
      arr = text.replace(/(\\n|\\r|\\r\\n)/g, '\n<br/>').split('<br/>');
    }
    if (fileUrl) {
      arr.push(
        <Tooltip
          key="dynamicAlert-downloadAttachment"
          placement="top"
          title={intl.get('sbsm.common.view.button.DownloadAttachments').d('下载附件')}
        >
          <Icon
            type="attach_file"
            className={styles['sbsm-alert-attach-file']}
            onClick={handlePreviewFile}
          />
        </Tooltip>
      );
    }
    return (
      <div style={{ whiteSpace: 'pre-wrap' }}>{arr}</div>
    );
  }, [text, fileUrl, handlePreviewFile]);

  return text ? (
    <div ref={wrapperRef} className={styles[`sbsm-alert-wrapper`]}>
      <Alert
        closable
        showIcon
        message={message || dynamicText}
        className={classNames(styles[`sbsm-alert-${type}`], styles[`sbsm-alert-${placement}`])}
        afterClose={handleAfterClose}
        {...otherProps}
      />
    </div>
  ) : null;
}) as (props: DynamicAlertProps) => ReactElement;

export default DynamicAlert;
