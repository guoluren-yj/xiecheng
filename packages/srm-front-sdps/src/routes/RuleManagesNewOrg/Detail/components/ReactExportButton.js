/**
 * ReactButton: 响应按钮
 * @date: 2022-05-24
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import ExcelExportPro from 'components/ExcelExportPro';
import { observer } from 'mobx-react-lite';

export const ReactExportButton = observer(props => {
  const getQueryParam = () => {
    const data = { ...(props?.ds?.queryDataSet?.toData()[0] ?? {}) };
    // 去除data里值为null的字段
    const obj = {};
    for (const key in data) {
      if (data[key]) obj[key] = data[key];
    }
    return obj;
  };
  return (
    <ExcelExportPro
      // templateCode={exportTemplateCode}
      buttonText={props?.btnText ?? ''}
      otherButtonProps={{ icon: 'export', funcType: 'flat', ...props?.buttonProps }}
      requestUrl={props?.exportRequestUrl ?? ''}
      queryParams={{
        fullPathCode: props.ruleCode,
        code: props.code,
        ...getQueryParam(),
      }}
    />
  );
});
