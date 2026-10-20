import React from 'react';
import { Tooltip } from 'choerodon-ui';
import Record from 'choerodon-ui/pro/lib/data-set/Record';

import ImgIcon from '@/utils/ImgIcon';
import keyIcon from '@/assets/icon/key@3x.png';
import relationIcon from '@/assets/icon/relation-2@3x.png';
import needSaveIcon from '@/assets/icon/needSave.svg';

interface IIconRender {
  record: Record;
  text?: string;
}
export default function IconRender({ record, text }: IIconRender) {
  const iconRenderer = () => {
    const data = record.toData();
    return [
      record.get('primaryFlag') === 1 && (
        <img
          key="key"
          src={keyIcon}
          style={{
            width: '14px',
            visibility: 'visible',
            verticalAlign: 'sub',
            marginRight: '8px',
          }}
          alt="icon"
        />
      ),
      record.get('relationKey') === 1 && (
        <img
          key="relationIcon"
          src={relationIcon}
          style={{
            width: '14px',
            visibility: 'visible',
            verticalAlign: 'sub',
            marginRight: '8px',
          }}
          alt="icon"
        />
      ),
      record.get('noSavedFlag') && (
        <Tooltip title="未保存字段">
          <img
            key="needSaveIcon"
            src={needSaveIcon}
            style={{
              width: '14px',
              visibility: 'visible',
              verticalAlign: 'sub',
              marginRight: '8px',
            }}
            alt="icon"
          />
        </Tooltip>
      ),
      <span key="text">
        {((Array.isArray(data.fields) && !data.relationCode) ||
          data.isVirtualFields ||
          (Array.isArray(data.modelFields) && !data.relationCode)) && (
          <Tooltip placement="top" title="主模型">
            <ImgIcon name="main-icon.svg" size={16} style={{ margin: '0px 4px' }} />
          </Tooltip>
        )}
        {((Array.isArray(data.fields) && data.relationCode) ||
          (Array.isArray(data.modelFields) && data.relationCode)) && (
          <Tooltip placement="top" title={`关系名：${data?.relationName || data?.relation?.name}`}>
            <ImgIcon name="guanlian@v4.0.svg" size={14} style={{ marginRight: '4px' }} />
          </Tooltip>
        )}
        {record.get('requiredFlag') === 1 && (
          <Tooltip title="必输">
            <i
              style={{
                color: 'red',
                fontStyle: 'normal',
                marginRight: '4px',
                fontSize: '16px',
                verticalAlign: 'bottom',
              }}
            >
              *
            </i>
          </Tooltip>
        )}
        {text}
      </span>,
    ];
  };
  return <React.Fragment>{iconRenderer()}</React.Fragment>;
}
