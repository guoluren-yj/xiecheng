import React, { useRef, useState, useEffect } from 'react';
import { Upload, Icon } from 'choerodon-ui';
import { Button, Modal, Spin } from 'choerodon-ui/pro';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import styles from './index.less';
import { batchUploadImage } from './api';
import useSetState from './useState';

const STORAGE_UNIT = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 2014 * 1024 };

const RewriteFile = (() => {
  let ResFile = window.File; // 浏览器file类
  class File extends Blob {
    constructor(chunks, fileName, opts = {}) {
      super(chunks, opts);
      this.lastModifiedDate = new Date();
      this.lastModified += this.lastModifiedDate;
      this.name = fileName;
    }
  }
  try {
    // eslint-disable-next-line no-new
    new ResFile([], '');
  } catch (e) {
    ResFile = File;
  }
  return ResFile;
})();

// 错误图片抛出
async function getImageError(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  const readerPromise = new Promise((resolve) => {
    reader.onload = () => {
      resolve(reader.result);
    };
  });
  const imgSrc = await readerPromise;
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      resolve();
    };
    image.onerror = () => {
      resolve(intl.get('smpc.product.view.message.skuImageTypeError').d('商品图片格式不对'));
    };
  });
}

// 图片大小校验
function validateFileSize(file, maxSize) {
  if (maxSize) {
    const { storageSize, storageUnit } = maxSize;
    // 表示文件大小上限，单位：KB
    const limitSize = STORAGE_UNIT[storageUnit] * storageSize;
    return file.size > limitSize
      ? intl
          .get('hzero.common.upload.error.size.custom', {
            fileSize: `${storageSize}${storageUnit}`,
          })
          .d(`上传文件大小不能超过: ${storageSize}${storageUnit}`)
      : undefined;
  }
}

// 裁切组件
function CropperComp(props) {
  const { title, modal, fileInfo, maxSize, onSuccess = (e) => e } = props;

  // 绑定cropper
  const cropper = useRef();
  const canvasStyle = useRef({ width: 600, height: 600 }); // 画布数据
  const [state, setState] = useSetState({
    file: {}, // 当前文件 File
    fileBlob: {}, // 表单数据 Blob
    fileName: '', // 文件名称
    fileBase64Data: undefined, // 文件base64数据,本地预览

    limitData: {}, // 上传限制查询
  });

  // 注册弹窗保存方法
  modal.handleOk(() => {
    return handleSave();
  });

  useEffect(() => {
    // 初始化限制
    initLimitData();
  }, [maxSize]);

  // 初始图片变化
  useEffect(() => {
    handleImgChange(fileInfo);
  }, [fileInfo]);

  // 初始化限制数据，可查远程配置
  async function initLimitData() {
    if (maxSize) {
      setState({ limitData: maxSize });
    }
  }

  /**
   * 选择图片后，将图片转换为base64格式预览
   * @param {object} info 文件数据对象，包含file，fileList
   */
  function handleImgChange(info) {
    const { file } = info;
    setState({
      file,
      fileBlob: file,
    });
    // 读取文件
    const reader = new FileReader();
    reader.readAsDataURL(info.file);
    reader.onload = () => {
      const fileBase64Data = reader.result;
      // 构造临时图片，根据图片大小限制控制更改画布数据，最大限制1140
      const temporaryImage = new Image();
      temporaryImage.src = fileBase64Data;
      temporaryImage.onload = () => {
        const maxLength = Math.max(temporaryImage.width, temporaryImage.height);
        const styleWidth = maxLength > 1140 ? 1140 : maxLength;
        canvasStyle.current = { width: styleWidth, height: styleWidth };
      };
      setState({
        fileName: file.name,
        fileBase64Data,
      });
    };
  }

  // 上传前校验，判断图片
  async function handleBeforeUpload(file, fileList) {
    const res = await getImageError(file);
    if (res) {
      notification.warning({ message: res });
      return false;
    }
    // 校验通过后文件变化
    handleImgChange({ file, fileList });
    return false;
  }

  /**
   * 保存
   */
  async function handleSave() {
    const { file, fileBlob, fileName, limitData } = state;
    const message = validateFileSize(file, limitData);
    if (message) {
      notification.warning({ message });
      return false;
    }
    // 将裁减后的blob转成File
    const newFile = new RewriteFile([fileBlob], fileName);
    const res = getResponse(await batchUploadImage([newFile]));
    if (res) {
      onSuccess(res);
      return true;
    }
  }

  // 裁剪行为事件
  function handleAvatarCrop() {
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
      setState({ fileBlob: blob });
    });
  }

  return (
    <div className={styles['cropper-box']}>
      <div className="top-area">
        <div style={{ display: 'inline-block' }}>
          <Cropper
            ref={cropper}
            aspectRatio={1}
            guides={false}
            autoCropArea={280}
            preview=".img-preview"
            crop={handleAvatarCrop}
            src={state.fileBase64Data}
            style={{ height: 280, width: 280 }}
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
          <p>1:1</p>
        </div>
      </div>
      <div>
        <p style={{ color: '#333', margin: '18px 0 6px' }}>
          {intl
            .get('smpc.product.model.imgCroperOptTips', {
              name: title,
            })
            .d(`您可以在此缩放裁剪，然后点击“保存”完成${title}的修改`)}
        </p>
        <Upload
          name="file"
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleBeforeUpload}
        >
          <Button funcType="flat">
            <Icon style={{ color: '#29BECE' }} type="file_upload" />{' '}
            <span style={{ color: '#29BECE', fontSize: 13 }}>
              {intl.get('smpc.product.model.imgReUpload').d('重新上传')}
            </span>
          </Button>
        </Upload>
      </div>
    </div>
  );
}

// 打开裁剪框
export function openCropper(fileInfo, cropperProps = {}) {
  const { title, ...other } = cropperProps;
  return Modal.open({
    movable: true,
    closable: true,
    border: false,
    title: intl
      .get('smpc.product.view.upload', {
        name: title,
      })
      .d(`上传${title}`),
    style: { width: 580 },
    okText: intl.get('hzero.common.button.save').d('保存'),
    children: <CropperComp {...other} fileInfo={fileInfo} />,
  });
}

// 上传基础组件
export default function CropperUpload(props) {
  const [uploadLoading, setUploadLoading] = useState(false); // 控制上传按钮实践
  const { text, multiple, maxSize = {}, onSuccess = (e) => e } = props;

  // 多张上传请求 [File, File] => [url, url]
  async function handleBatchUpload(fileList) {
    setUploadLoading(true);
    const res = getResponse(await batchUploadImage(fileList));
    setUploadLoading(false);
    if (res) {
      onSuccess(res);
    }
  }

  // 上传前校验
  async function handleBeforeUpload(file, fileList) {
    // 单张上传打开裁剪
    if (fileList.length === 1) {
      setUploadLoading(true);
      const res = await getImageError(file);
      setUploadLoading(false);
      if (res) {
        notification.warning({ message: res });
        return false;
      }
      openCropper({ file, fileList }, { ...props });
    } else {
      // 多张上传，会触发n次，最后一次时直接多张上传
      const isLastFile = file.uid === fileList[fileList.length - 1].uid;
      if (isLastFile) {
        setUploadLoading(true);
        const imgErrors = await Promise.all(fileList.map((m) => getImageError(m)));
        setUploadLoading(false);
        const imgError = imgErrors.find((f) => f);
        if (imgError) {
          notification.warning({ message: imgError });
          return false;
        }
        const errFile = fileList.find((f) => validateFileSize(f, maxSize));
        if (errFile) {
          const errMessage = validateFileSize(errFile, maxSize);
          notification.warning({ message: errMessage });
          return false;
        }
        handleBatchUpload(fileList);
      }
    }
    return false;
  }

  return (
    <Spin spinning={uploadLoading}>
      <Upload
        name="file"
        accept="image/*"
        multiple={multiple}
        beforeUpload={handleBeforeUpload}
        listType="picture-card"
        showUploadList={false}
      >
        <div>
          <Icon type="add" />
          <div className="c7n-upload-text">
            {text || intl.get('smpc.product.view.uploadImage').d('上传图片')}
          </div>
        </div>
      </Upload>
    </Spin>
  );
}
