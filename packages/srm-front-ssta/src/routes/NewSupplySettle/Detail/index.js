/*
 * @Description: file content
 * @Date: 2022-02-08 20:28:50
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';
import { Result } from 'choerodon-ui';

import Detail from './Detail';
import { DetailStore } from './StoreProvider';

const Index = (props) => {
  const { match } = props;
  const {
    params: {
      docType = '',
      documentType: urlDocumentType = '', // 适配工作流接口传递的documentType
    },
  } = match || {};
  const documentType = (urlDocumentType || docType).toUpperCase();
  // 工作流经常有租户预付款工作流配成了开票付款的表单，添加白屏拦截
  if (!['INVOICE', 'PAYMENT'].includes(documentType)) {
    return <Result status="404" />;
  }
  return (
    <DetailStore {...props}>
      <Detail />
    </DetailStore>
  );
};

export default Index;
