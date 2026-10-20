import React, { useRef, useEffect } from 'react';
import { Modal } from 'hzero-ui';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Icon, Button } from 'choerodon-ui';
// import uuid from 'uuid/v4';

import intl from 'utils/intl';
// import * as HmallConfig from 'utils/api-config';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { PUBLIC_BUCKET } from '_utils/config';
import styles from './index.less';
import { fetchEnabledFile, uploadAvatar } from './api';
import useState from './useState';

function awaitWrap(promise) {
  return promise.then((data) => [null, data]).catch((err) => [err, null]);
}

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return typeof result === 'object' && typeof result !== 'string';
}

const { Dragger } = Upload;
const STORAGE_UNIT = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 2014 * 1024 };
// const attachmentUuid = uuid();
export default function Demo(props) {
  const {
    bucketName = PUBLIC_BUCKET,
    directory = 'smpc/sku/media',
    fn = (e) => e,
    width = 1,
    height = 1,
    title = 'banner',
    canvasStyle = { width: 800, height: 400 },
    callback = (e) => e, // 上传的回调
    maxSize,
  } = props;

  const cropper = useRef();
  const [state, setState] = useState({
    visible: false,
    file: {},
    fileList: [],
    imgFormData: {},
    limitData: {}, // 上传限制查询
    saveLoading: false,
    cropperReady: false, // 标记 cropper 是否已准备好
  });

  const clearImageData = () => {
    setState({
      file: {},
      fileList: [],
      imgFormData: {},
      uploadImgPreviewUrl: undefined,
      uploadImgName: undefined,
    });
  };

  useEffect(() => {
    fn({
      toggle: () => setState((prev) => ({ visible: !prev.visible })),
    });
    fetchLimitData();
  }, []);

  async function fetchLimitData() {
    if (maxSize) {
      setState({ limitData: maxSize });
    } else {
      const [err, data] = await awaitWrap(
        fetchEnabledFile({
          tenantId: getCurrentOrganizationId(),
          bucketName,
          directory: 'hiam02',
        })
      );
      if (!err) setState({ limitData: data });
    }
  }

  function beforeUpload(file) {
    setState({
      fileList: [...state.fileList, file],
      file,
      imgFormData: file,
    });
    return false;
  }

  /**
   * 选择图片后，将图片转换为base64格式预览
   * @param {object} info 文件数据对象，包含file，fileList
   */
  function handleImgChange(info) {
    const reader = new FileReader();
    reader.readAsDataURL(info.file);
    reader.onload = () => {
      setState({
        uploadImgPreviewUrl: reader.result,
        uploadImgName: info.file.name,
      });
    };
  }

  /**
   * 校验上传参数
   * 使用时: 如果Boolean(返回的数据), 则不做限制
   */
  function validateUploadParams() {
    const { file, limitData } = state;
    const { fileFormat, storageSize, storageUnit } = limitData;
    if (!fileFormat && !storageSize) {
      // 如果没有查询到桶配置, 那么就不做限制;
      return;
    }

    let flag = true;
    let message;
    if (fileFormat) {
      const fileType = fileFormat.split(',').map((item) => `image/${item}`);
      if (fileType.indexOf() > -1) {
        fileType.push('image/jpeg');
      }
      flag = fileType.indexOf(file.type) > -1;
      message = flag ? '' : intl.get('smpc.product.view.message.fileTypeError').d('文件类型不支持');
    }

    if (storageSize && flag) {
      // 表示文件大小上限，单位：KB
      const fileSize = STORAGE_UNIT[storageUnit] * storageSize;
      flag = fileSize > file.size;
      message = flag
        ? ''
        : intl
            .get('hzero.common.upload.error.size.custom', {
              fileSize: `${storageSize}${storageUnit}`,
            })
            .d(`上传文件大小不能超过: ${storageSize}${storageUnit}`);
    }
    return message;
  }

  /**
   * 保存
   */
  async function onOk() {
    const message = validateUploadParams();
    if (message) {
      notification.warning({ message });
      return;
    }
    setState({
      saveLoading: true,
    });
    const res = await uploadAvatar({
      organizationId: getCurrentOrganizationId(),
      image: state.imgFormData,
      uploadImgName: state.uploadImgName,
      bucketName,
      directory,
    });
    if (res && isJSON(res) && JSON.parse(res).failed) {
      notification.warning({ message: JSON.parse(res).message });
    } else if (res) {
      callback({ url: res, fileName: state.uploadImgName });
      clearImageData();
      onCancel();
    }
    setState({
      saveLoading: false,
    });
  }

  function handleAvatarCrop() {
    if (!cropper.current || !state.cropperReady) {
      return;
    }
    const imgCanvas = cropper.current.getCroppedCanvas({
      ...canvasStyle,
      imageSmoothingQuality: 'high',
    });
    // IE toBlob兼容方案，手动实现toBlob，兼容IE10及以上
    if (!HTMLCanvasElement.prototype.toBlob) {
      Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value(cb, type, quality) {
          // atob将编码为base64后的图片数据解码为二进制数据
          const binStr = atob(this.toDataURL(type, quality).split(',')[1]);
          const len = binStr.length;
          // 使用二进制数组存放数据
          const arr = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            // 将指定位置的数据设置为Unicode编码，存放在二进制数组中
            arr[i] = binStr.charCodeAt(i);
          }
          // 最后返回Blob类型的数据
          cb(new Blob([arr], { type: type || 'image/png' }));
        },
      });
    }
    imgCanvas.toBlob((blob) => {
      setState({ imgFormData: blob });
    });
  }

  function onCancel() {
    // 在关闭前重置 cropperReady 状态，防止 unbuild 时调用 resetPreview 报错
    setState({
      cropperReady: false,
    });
    setTimeout(() => {
      setState({
        visible: false,
        imgFormData: {},
        fileList: [],
        file: {},
      });
      clearImageData();
    }, 0);
  }

  function renderFooter() {
    const footerBtns = [
      <Button style={{ width: 72, height: 32 }} key="back" onClick={onCancel}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
    ];
    if (state.fileList.length > 0) {
      footerBtns.push(
        <Button
          style={{ width: 72, height: 32 }}
          key="submit"
          type="primary"
          onClick={onOk}
          loading={state.saveLoading}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    }
    return footerBtns;
  }

  return (
    <>
      <Modal
        destroyOnClose
        width={700}
        visible={state.visible}
        wrapClassName="avatar-uploader-Modal"
        title={intl
          .get('smpc.product.view.upload', {
            name: title,
          })
          .d(`上传${title}`)}
        onCancel={onCancel}
        onOk={onOk}
        footer={renderFooter()}
      >
        {state.fileList.length === 0 ? (
          <div
            style={{
              width: 400,
              height: 200,
              marginLeft: '50%',
              transform: 'translateX(-50%)',
              marginTop: 53,
            }}
          >
            <Dragger
              className={styles['avatar-uploader']}
              name="file"
              accept="image/*"
              beforeUpload={(file) => beforeUpload(file)}
              onChange={(info) => handleImgChange(info)}
            >
              <p className="c7n-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="c7n-upload-text">
                {intl.get('smpc.product.view.uploadImgOptTips').d('点击或将图片拖到此区域上传图片')}
              </p>
              {
                <p className="c7n-upload-hint">
                  {state.limitData.fileFormat && (
                    <span>
                      {intl
                        .get('smpc.product.model.imgSupportFormat', {
                          fileFormat: state.limitData.fileFormat,
                        })
                        .d(`图片支持${state.limitData.fileFormat}格式`)}
                    </span>
                  )}
                  {state.limitData.storageSize && (
                    <span>
                      {intl
                        .get('smpc.product.model.imgFileSizeNotMax', {
                          maxSize: `${state.limitData.storageSize}${state.limitData.storageUnit}`,
                        })
                        .d(`不能大于${state.limitData.storageSize}${state.limitData.storageUnit}`)}
                    </span>
                  )}
                </p>
              }
            </Dragger>
          </div>
        ) : (
          <div className={styles['cropper-box']}>
            <div className="top-area">
              <div style={{ display: 'inline-block' }}>
                <Cropper
                  preview=".img-preview"
                  ref={cropper}
                  src={state.uploadImgPreviewUrl}
                  style={{ height: 225, width: 420 }}
                  aspectRatio={width / height}
                  guides={false}
                  crop={handleAvatarCrop}
                  ready={() => setState({ cropperReady: true })}
                />
              </div>
              <div className={styles['yulan-box']}>
                <p>
                  {intl
                    .get('smpc.product.model.viewImg', {
                      name: title,
                    })
                    .d(`${title}预览`)}
                </p>
                <div className="img-preview" style={{ width: 130, height: 65 }} />
                <p>{`${width}:${height}`}</p>
              </div>
            </div>
            <div>
              <span style={{ color: '#333' }}>
                {intl
                  .get('smpc.product.model.imgCroperOptTips', {
                    name: title,
                  })
                  .d(`您可以在此缩放裁剪，然后点击“保存”完成${title}的修改`)}
              </span>
              <Upload
                name="file"
                accept="image/*"
                beforeUpload={(file) => beforeUpload(file)}
                onChange={(info) => handleImgChange(info)}
                showUploadList={false}
                customRequest={() => null} // 阻止图片的默认上传
              >
                <Button funcType="flat" icon="file_upload" style={{ marginLeft: 8 }}>
                  {intl.get('smpc.product.model.imgReUpload').d('重新上传')}
                </Button>
              </Upload>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
