import React, { useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Upload, Icon, Button } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { PUBLIC_BUCKET } from '_utils/config';
import useState from '@/hooks/useState';
import { uploadAvatar } from './api';
import styles from './index.less';

const { Dragger } = Upload;
const STORAGE_UNIT = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 2014 * 1024 };
// 1:1裁剪框
function ImgCropChildren(props) {
  const {
    modal,
    title = 'Image',
    maxSize,
    maxWidth = 56,
    bucketName = PUBLIC_BUCKET,
    directory = 'smpc/sku/media',
    successCallback = (e) => e,
  } = props;

  const cropper = useRef();
  const canvasStyle = useRef({ width: maxWidth, height: maxWidth }); // 画布数据
  const [state, setState] = useState({
    file: {},
    fileList: [],
    imgFormData: {},
    limitData: maxSize, // 上传限制查询
    cropperReady: false, // 标记 cropper 是否已准备好
  });

  useEffect(() => {
    if (state.fileList.length < 1) {
      modal.update({
        footer: (ok, cancel) => cancel,
      });
    } else {
      modal.update({
        footer: (ok, cancel) => [cancel, ok],
      });
    }
  }, [state.fileList.length]);

  modal.handleOk(() => handleSave());

  function beforeUpload(file) {
    setState({
      file,
      imgFormData: file,
      fileList: [...state.fileList, file],
    });
    return false;
  }

  // 裁剪行为事件
  function handleAvatarCrop() {
    if (!cropper.current || !state.cropperReady) {
      return;
    }
    const imgCanvas = cropper.current.getCroppedCanvas({
      ...canvasStyle.current,
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

  /**
   * 选择图片后，将图片转换为base64格式预览
   * @param {object} info 文件数据对象，包含file，fileList
   */
  function handleImgChange(info) {
    const { file } = info;
    // 读取文件
    const reader = new FileReader();
    reader.readAsDataURL(info.file);
    reader.onload = () => {
      const fileBase64Data = reader.result;
      // 构造临时图片，根据图片大小限制控制更改画布数据，最大限制56
      const temporaryImage = new Image();
      temporaryImage.src = fileBase64Data;
      temporaryImage.onload = () => {
        const maxLength = Math.max(temporaryImage.width, temporaryImage.height);
        const styleWidth = maxLength > maxWidth ? maxWidth : maxLength;
        canvasStyle.current = { width: styleWidth, height: styleWidth };
      };
      setState({
        uploadImgName: file.name,
        uploadImgPreviewUrl: fileBase64Data,
      });
    };
  }

  /**
   * 校验上传参数
   * 使用时: 如果Boolean(返回的数据), 则不做限制
   */
  function validateUploadParams() {
    const { file, limitData } = state;
    const { storageSize, storageUnit } = limitData;

    if (storageSize) {
      // 表示文件大小上限，单位：KB
      const fileSize = STORAGE_UNIT[storageUnit] * storageSize;
      const message =
        fileSize > file.size
          ? undefined
          : intl
              .get('hzero.common.upload.error.size.custom', {
                fileSize: `${storageSize}${storageUnit}`,
              })
              .d(`上传文件大小不能超过: ${storageSize}${storageUnit}`);
      return message;
    }
  }

  /**
   * 保存
   */
  async function handleSave() {
    const message = validateUploadParams();
    if (message) {
      notification.warning({ message });
      return false;
    }
    const res = await uploadAvatar({
      directory,
      bucketName,
      image: state.imgFormData,
      uploadImgName: state.uploadImgName,
      organizationId: getCurrentOrganizationId(),
    });
    if (res) {
      try {
        const faileRes = JSON.parse(res) || {};
        if (faileRes.failed) {
          notification.warning({ message: faileRes.message });
        }
      } catch (err) {
        successCallback({ url: res, fileName: state.uploadImgName });
        return true;
      }
    }
    return false;
  }

  return (
    <div className={styles['img-crop-wrapper']}>
      {state.fileList.length < 1 ? (
        <div className="img-dragger-container">
          <Dragger
            className="img-dragger"
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
        <div className="img-cropper-container">
          <div className="top-area">
            <div style={{ display: 'inline-block' }}>
              <Cropper
                preview=".preview-box"
                ref={cropper}
                src={state.uploadImgPreviewUrl}
                style={{ height: 225, width: 420 }}
                aspectRatio={1}
                guides={false}
                crop={handleAvatarCrop}
                ready={() => setState({ cropperReady: true })}
              />
            </div>
            <div className="preview-wrapper">
              <p>
                {intl
                  .get('smpc.product.model.viewImg', {
                    name: title,
                  })
                  .d(`${title}预览`)}
              </p>
              <div className="preview-box" style={{ width: 130, height: 65 }} />
              <p>1:1</p>
            </div>
          </div>
          <div className="footer-area">
            <span className="footer-area-tips" style={{ color: '#333' }}>
              {intl
                .get('smpc.product.model.imgCroperOptTips', {
                  name: title,
                })
                .d(`您可以在此缩放裁剪，然后点击“保存”完成${title}的修改`)}
            </span>
            <Upload
              name="file"
              accept="image/*"
              showUploadList={false}
              onChange={(info) => handleImgChange(info)}
              beforeUpload={(file) => beforeUpload(file)}
              customRequest={() => null} // 阻止图片的默认上传
            >
              <Button funcType="flat" icon="file_upload" style={{ marginLeft: 8 }}>
                {intl.get('smpc.product.model.imgReUpload').d('重新上传')}
              </Button>
            </Upload>
          </div>
        </div>
      )}
    </div>
  );
}

export default function openImgCropModal(cropProps = {}, modalProps = {}) {
  const { title } = cropProps;
  return Modal.open({
    title: intl
      .get('smpc.product.view.upload', {
        name: title,
      })
      .d(`上传${title}`),
    style: { width: 700 },
    okText: intl.get('hzero.common.button.save').d('保存'),
    border: false,
    ...modalProps,
    children: <ImgCropChildren {...cropProps} />,
  });
}
