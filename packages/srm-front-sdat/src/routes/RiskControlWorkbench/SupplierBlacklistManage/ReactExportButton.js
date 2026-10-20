/**
 * ReactButton: 响应按钮
 * @date: 2022-09-05
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import PermissionExport from '@/components/PermissionExport';
import { observer } from 'mobx-react-lite';

export const ReactExportButton = observer((props) => {
  const getQueryParam = () => {
    const data = { ...(props?.ds?.queryParameter ?? {}) };
    // 去除data里值为null的字段
    const obj = {};
    for (const key in data) {
      if (data[key]) obj[key] = data[key];
    }
    return obj;
  };
  return (
    <PermissionExport
      templateCode={props?.templateCode ?? null}
      buttonText={props?.btnText ?? ''}
      requestUrl={props?.exportRequestUrl ?? ''}
      otherButtonProps={{
        icon: props?.icon ?? 'export',
        type: props?.type ?? 'c7n-pro',
        funcType: props?.funcType ?? 'raised',
        disabled: props?.disabled ?? false,
        permissionList: props?.permissionList ?? [],
      }}
      queryParams={{
        ...(props?.params ?? {}),
        ...getQueryParam(),
      }}
      headerParam={props?.header ?? {}}
      defaultSelectAll
    />
  );
});
