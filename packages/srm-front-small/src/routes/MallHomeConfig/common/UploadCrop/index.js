import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Upload, Icon, Modal, Tooltip } from 'choerodon-ui';
import classnames from 'classnames';

import CroperModal from '@/routes/Components/CroperModal';
import intl from 'utils/intl';
import './index.less';

export default function (props) {
  const croperModal = useRef();
  const { title, isApp, width, height, required = true, handleOk = (e) => e, imgUrl, help, showHelp='newLine', className, max=1 } = props;
  const imgSize = `${width}x${height}px`;
  const helpTip = help || intl.get('small.common.modal.create.image.imgSize', { value: imgSize }).d(`支持上传PNG、JPG、JPEG格式，上传大小为${imgSize}`);
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (imgUrl) setFileList([{ url: imgUrl, uid: -1 }]);
  }, [imgUrl]);

  const logoUrl = useMemo(() => {
    return fileList?.[0]?.url;
  }, [fileList]);

  const uploadSuccess = (data) => {
    setFileList([{ ...data, uid: -1 }]);
    handleOk(data);
  };
  const uploadButton = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => {
        if (croperModal?.current?.toggle()) croperModal.toggle();
      }}
    >
      <div>
        <Icon type="add" />
        <div className="c7n-upload-text">{intl.get('small.common.upload.desc').d('上传图片')}</div>
        <div className="c7n-upload-max">{fileList?.length || 0}/{max}</div>
      </div>
    </div>
  );
  return (
    <div className={classnames([className])}>
      <p className='des' style={{ marginBottom: 4 }}>
        {title ||
          (isApp
            ? intl.get('small.common.modal.create.mobile.image').d('移动端图片')
            : intl.get('small.common.modal.create.image').d('图片'))}
        {required && <span style={{ color: 'red' }}>*</span>}
        {showHelp === 'tooltip' && (
          <Tooltip title={helpTip}>
            <Icon type='help' className='attachment-help' style={{ fontSize: 14, marginLeft: '4px', color: '#868D9C'}} />
          </Tooltip>
        )}
      </p>
      {showHelp === 'newLine' && <p className='des' style={{ marginBottom: 4 }}> {helpTip} </p>}
      <div>
        <Upload
          name="file"
          accept={['.jpg', '.jpeg', '.png']}
          listType="picture-card"
          className="mall-home-config-upload"
          fileList={fileList}
          onRemove={() => {
            setFileList([]);
            handleOk({});
          }}
          disabled
          onPreview={() => setVisible(true)}
        >
          {fileList?.length >= max ? null : uploadButton}
        </Upload>
        <Modal
          visible={visible}
          width={width + 48}
          footer={null}
          onCancel={() => setVisible(false)}
        >
          <img alt="example" style={{ maxWidth: '100%' }} src={logoUrl} />
        </Modal>
      </div>
      <CroperModal
        fn={(ele) => {
          croperModal.current = ele;
        }}
        maxSize={5}
        width={width}
        height={height}
        canvasStyle={{ width, height }}
        callback={(e) => uploadSuccess(e)}
      />
    </div>
  );
}
