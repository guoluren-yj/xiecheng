import React, { useRef, useState, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { Button, Output } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type { Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import styles from './index.less';

interface Iprops {
  name: string;
  label?: string | ReactNode;
  dataSet: DataSet;
  hidden?: boolean;
  required?: boolean;
}

function PictureUpload({ name, label, dataSet, hidden, required }: Iprops) {
  const fileInputRef = useRef<any>();
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUpload = debounce(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, 200);

  const handleDelete = () => {
    if (dataSet.current) {
      dataSet.current.set(name, null);
    }
  };

  const handleChangeFile = (event) => {
    const files = event.target.files;
    if (files && files[0]) {
      const fileExtMatch = files[0].name ? files[0].name.match(/(.[^.]+)$/) : undefined;
      const fileExt: string = fileExtMatch && fileExtMatch[1] ? fileExtMatch[1].toLowerCase() : '';
      if (!fileExt || !['.jpg', '.png'].includes(fileExt.toLowerCase())) {
        notification.error({
          message: intl.get('hrpt.reportDesign.model.waterMask.image.inValidType').d('仅支持.jpg、.png 格式的图片'),
        });
        return;
      }
      setUploadLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {  
        if (e.target) {
          const base64Result = e.target.result;  
          // 显示Base64编码结果  
          if (dataSet.current) {
            dataSet.current.set(name, base64Result);
          }
        }
        setUploadLoading(false);
      };
      reader.onabort = () => {
        setUploadLoading(false);
      };
      reader.onerror = () => {
        setUploadLoading(false);
      };
      // 以DataURL的形式读取文件  
      reader.readAsDataURL(files[0]);  
    }
  };

  const handleLoad = (event) => {
    const ratio = event.target.width / event.target.height;
    if (event.target.height > 50) {
      event.target.height = 50;
      event.target.width = Math.floor(50 * ratio);
      event.target.style.display = 'inline';
    }
  };

  const renderContent = ({ value }) => {
    if (!value) {
      return (
        <>
          <input type='file' ref={fileInputRef} onChange={handleChangeFile} style={{ display: 'none' }} accept='image/png,image/jpg' />
          <Button funcType={FuncType.link} onClick={handleUpload} loading={uploadLoading} icon='file_upload' style={{ fontWeight: 600 }}>
            {intl.get('hrpt.reportDesign.model.waterMask.uploadPicture').d('点击上传图片')}
            <span style={{ marginLeft: '4px' }}>0/1</span>
          </Button>
        </>  
      );
    } else {
      return (
        <div style={{ marginTop: '4px' }}>
          <img src={value} alt='' onLoad={handleLoad} style={{ display: 'none' }} />
          <Icon type='close' onClick={handleDelete} style={{ cursor: 'pointer', verticalAlign: 'top' }} />
        </div>
      );
    }
  };

  return (
    <Output
      label={label}
      name={name} 
      dataSet={dataSet}
      hidden={hidden}
      renderer={renderContent as Renderer}
      showValidation={ShowValidation.tooltip}
      className={required ? styles['picture-upload'] : undefined}
    />
  )
}

export default observer(PictureUpload);