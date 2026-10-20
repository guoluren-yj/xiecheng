import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NUpload from 'choerodon-ui/lib/upload';
import type { UploadProps } from 'choerodon-ui/lib/upload';
import Icon from '../icon';
import Dragger from './Dragger';
import { C7NPopconfirmProps } from '../popconfirm';
import type { UploadFile, UploadListType } from './interface';

export type { UploadProps };

function renderIcon(file: UploadFile, listType: UploadListType, prefixCls?: string) {
  if (listType === 'picture' || listType === 'picture-card') {
    const { name } = file;
    if (name) {
      const fA = name.split('.');
      const fileExt = fA && fA[fA.length - 1];
      let iconType = 'file-unknown';
      switch (fileExt) {
        case 'doc':
        case 'docx':
          iconType = 'file-word';
          break;
        case 'xls':
        case 'xlsx':
          iconType = 'file-excel';
          break;
        case 'ppt':
        case 'pptx':
          iconType = 'file-ppt';
          break;
        case 'pdf':
          iconType = 'file-pdf';
          break;
        case 'txt':
          iconType = 'file-text';
          break;
        case 'md':
          iconType = 'file-markdown';
          break;
        default:
      }
      return <Icon type={iconType} className={`${prefixCls}-list-item-icon`} />;
    }
    return <Icon type="file-unknown" className={`${prefixCls}-list-item-icon`} />;
  }
  return <Icon type={file.status === 'uploading' ? 'loading' : 'paper-clip'} />;
}

const Upload: ForwardRefExoticComponent<UploadProps> = forwardRef<C7NUpload, UploadProps>((props, ref) => {
  return (
    <C7NUpload
      prefixCls="ant-upload"
      multiple
      overwriteDefaultEvent
      tooltipPrefixCls="ant-tooltip"
      popconfirmProps={C7NPopconfirmProps}
      renderIcon={renderIcon}
      {...props}
      ref={ref}
    />
  );
});

Upload.displayName = 'Upload<hzeroWithC7n>';

type UploadComponent = typeof Upload & {
  Dragger: typeof Dragger;
}

(Upload as UploadComponent).Dragger = Dragger;

export default Upload as UploadComponent;
