import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SkuTransfer from './SkuTransfer';

// mode: readOnly | update | add | default
export default function openTransfer({
  mode = 'default', // 模式
  isSup, // 供采
  record, // 协议行信息记录
  backPath, // 当前路由
  versionNum, // 是否历史版本
  isCreateGo, // 创建商品是否立即跳转
  skuApprove, // 权限
  afterRequest = (e) => e,
}) {
  const agmLine = record.toData();
  return Modal.open({
    drawer: true,
    title: intl.get('small.common.model.productInfo').d('商品信息'),
    style: { width: mode === 'default' ? 1090 : 742 },
    okCancel: ['update', 'add'].includes(mode),
    okText: ['update', 'add'].includes(mode)
      ? undefined
      : intl.get('hzero.common.button.close').d('关闭'),
    children: (
      <SkuTransfer
        mode={mode}
        isSup={isSup}
        agmLine={agmLine}
        backPath={backPath}
        versionNum={versionNum}
        isCreateGo={isCreateGo}
        skuApprove={skuApprove}
        afterRequest={afterRequest}
      />
    ),
  });
}
