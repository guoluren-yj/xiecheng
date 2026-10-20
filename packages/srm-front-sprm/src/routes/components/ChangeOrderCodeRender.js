/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-03-30 17:04:30
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-31 00:02:13
 */
import React from 'react';
import { Tag } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import classnames from 'classnames';

const ChangeOrderCodeRender = function ChangeOrderCodeRender({
  type = 'c7n',
  record,
  value,
  showTag = true,
}) {
  const list = [
    {
      code: 'success',
      meaning: intl.get(`sprm.common.model.successStatus`).d('成功'),
      tag: 'c7n-tag-green',
    },
    {
      code: 'fail',
      meaning: intl.get(`sprm.common.model.changeOrderCode.errorStatus`).d('失败'),
      tag: 'c7n-tag-red',
    },
    {
      code: 'transfer_order',
      meaning: intl.get(`sprm.common.model.transferOrder`).d('转单中'),
      tag: 'c7n-tag-yellow',
    },
  ];

  const data = list.find((item) => item.code === value);

  const tooltip = type === 'c7n' ? record.get('changeOrderMessage') : record.changeOrderMessage;

  return data ? (
    <>
      {tooltip ? (
        <Tooltip title={tooltip}>
          {showTag ? (
            <Tag className={classnames('c7n-tag-has-color', data.tag)} style={{ border: 'none' }}>
              {data.meaning}
            </Tag>
          ) : (
            data.meaning
          )}
        </Tooltip>
      ) : (
        <>
          {showTag ? (
            <Tag className={classnames('c7n-tag-has-color', data.tag)} style={{ border: 'none' }}>
              {data.meaning}
            </Tag>
          ) : (
            data.meaning
          )}
        </>
      )}
    </>
  ) : null;
};

export default ChangeOrderCodeRender;
