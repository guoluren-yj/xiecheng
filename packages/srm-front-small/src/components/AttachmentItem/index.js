import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Icon, Tooltip, Modal } from 'choerodon-ui';

import { PUBLIC_BUCKET } from '_utils/config';
import { getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';
// import useSetState from '@/hooks/useState';
// import { fetchFileList } from '@/hooks/useGetFileList';

// 通用state
function useSetState(initialState = {}) {
  const [state, set] = useState(initialState);
  const isUpdate = useRef();
  const setState = useCallback(
    (nextState, callback) => {
      if (typeof callback === 'function') {
        isUpdate.current = callback;
      }
      if (typeof nextState === 'function') {
        set((prevState) => ({ ...prevState, ...nextState(prevState) }));
      } else {
        set((prevState) => ({ ...prevState, ...nextState }));
      }
    },
    [set]
  );

  useEffect(() => {
    if (isUpdate.current) {
      isUpdate.current(state);
    }
  }, [state]);

  return [state, setState];
}

export default function AttachmentItem(props) {
  const {
    handleRemove, // 删除事件
    itemStyle, // item的样式
    attachmentUuid, // uuid
    bucketName = PUBLIC_BUCKET, // 桶名 必传
    fileUrl,
    // attachmentList, // 手动传入list
  } = props;
  const [state, setState] = useSetState({
    attachmentList: [{ fileUrl, fileName: 'LOGO' }],
    previewVisible: false,
    previewImage: '',
  });
  // useEffect(() => {
  //   // if (attachmentList) {
  //   //   setState({ attachmentList });
  //   // }
  //   // else if (attachmentUuid) {
  //   //   fetchFileList({
  //   //     attachmentUuid,
  //   //     bucketName,
  //   //   }).then((list) => {
  //   //     setState({
  //   //       attachmentList: list.map((item, index) => {
  //   //         return {
  //   //           name: item.fileName,
  //   //           response: item.fileUrl,
  //   //           size: item.fileSize,
  //   //           type: item.fileType,
  //   //           uid: `${(index + 1) * -1}`,
  //   //           url: item.fileUrl,
  //   //           downloadUrl: getAttachmentUrl(item.fileUrl, bucketName),
  //   //         };
  //   //       }),
  //   //     });
  //   //   });
  //   // }
  // }, [attachmentUuid]);

  return (
    <>
      {state.attachmentList.map((file) => {
        const isImg = true;
        // const isImg = /^image\/*/.test(file.type);
        const previewUrl =
          file.downloadUrl || getAttachmentUrl(file.fileUrl || file.url, bucketName);
        const hasUrl = Boolean(file.downloadUrl || file.fileUrl || file.url);
        return (
          <div className={styles['attachment-item']} style={itemStyle}>
            {isImg && (
              <>
                {hasUrl && (
                  <Tooltip placement="top" title={intl.get('hzero.common.button.see').d('预览')}>
                    <a
                      onClick={() => {
                        setState({
                          previewVisible: true,
                          previewImage: previewUrl,
                        });
                      }}
                    >
                      <Icon type="zoom_in" />
                    </a>
                  </Tooltip>
                )}
              </>
            )}
            <>
              {hasUrl && (
                <Tooltip placement="top" title={intl.get('hzero.common.button.download').d('下载')}>
                  <a href={previewUrl}>
                    <Icon type="get_app" />
                  </a>
                </Tooltip>
              )}
            </>
            {hasUrl && (
              <span>
                <a href={previewUrl}>{file.name || file.fileName}</a>
              </span>
            )}
            {handleRemove && (
              <Icon
                type="close"
                className="delete-icon"
                onClick={() => handleRemove(file, attachmentUuid)}
              />
            )}
          </div>
        );
      })}
      <Modal
        visible={state.previewVisible}
        footer={null}
        wrapClassName={styles.content}
        onCancel={() => {
          setState({
            previewVisible: false,
            previewImage: '',
          });
        }}
      >
        <img alt="" style={{ width: '100%' }} src={state.previewImage} />
      </Modal>
    </>
  );
}
