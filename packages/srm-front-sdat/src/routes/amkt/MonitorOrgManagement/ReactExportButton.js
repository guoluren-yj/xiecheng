/**
 * ReactButton: 响应按钮
 * @date: 2022-09-05
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import ExcelExportPro from '@/components/ExcelExportPro';
import { observer } from 'mobx-react-lite';

export const ReactExportButton = observer((props) => {
  return (
    <ExcelExportPro
      buttonText={props?.btnText ?? ''}
      requestUrl={props?.exportRequestUrl ?? ''}
      otherButtonProps={{
        icon: props?.icon ?? 'export',
        type: props?.type ?? 'c7n-pro',
        funcType: 'flat',
      }}
      queryParams={{
        ...(props?.params ?? {}),
      }}
      headerParam={props?.header ?? {}}
      defaultSelectAll
    />
  );
});
