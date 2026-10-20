/**
 * MarmotDownloadButton
 * MarmotDownloadButton API发布下载按钮
 * @date: 2022-03-28
 * @author: jinxinzhang <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import { Button } from 'choerodon-ui/pro';
import { debounce } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFileByAxios } from '../../services/MarmotDownloadButtonServices';

function MarmotDownloadButton(props = {}) {
  /**
   * api: String - 请求地址
   * isButton: Boolean - 按钮还是a标签 默认为 按钮
   * displayName: String - 按钮名称 默认为 导出
   * defaultFileName: String - 下载文件名，前端传值 "测试.xlsx", 也可以后端header中传入值，encodeURIComponent("filename=测试.xlsx")
   * style: Object - 外部传入的样式参数
   * queryParams: Array<object> 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]] 默认为 []
   * disabled: 按钮禁用
   * method: String - get GET post POST 默认GET
   * queryData: Object
   */
  const {
    api = '',
    isButton = true,
    style = {},
    displayName = '',
    defaultFileName = '',
    queryParams = [],
    disabled = false,
    method = 'GET',
    queryData,
    ...buttonProps
  } = props;
  // 存储覆盖数据
  const [loading, handleLoading] = useState(false);

  const onExport = debounce(() => {
    handleLoading(true);
    downloadFileByAxios(
      { requestUrl: api, queryParams, method, queryData },
      defaultFileName
    ).finally(() => handleLoading(false));
  });

  return (
    <>
      {isButton ? (
        <Button
          onClick={onExport}
          style={style}
          loading={loading}
          disabled={loading || disabled}
          {...buttonProps}
        >
          {displayName || intl.get('hzero.common.view.title.marmotDownloadButton').d('导出')}
        </Button>
      ) : (
        <a
          onClick={onExport}
          style={style}
          loading={loading}
          disabled={loading || disabled}
          {...buttonProps}
        >
          {displayName || intl.get('hzero.common.view.title.marmotDownloadButton').d('导出')}
        </a>
      )}
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(MarmotDownloadButton);
