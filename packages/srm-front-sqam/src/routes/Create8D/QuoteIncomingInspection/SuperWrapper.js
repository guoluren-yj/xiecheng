/**
 * 引用创建质量整改-无需参数容器
 * @date: 2022-08-03
 * @author: JSS <shangshang.jing@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import { parse } from 'querystring';
import React, { useEffect, useCallback, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import Index from './index';

/**
 * 默认为引用质检单，affairFlag为1时则引用事务，需要查询业务规则定义
 */
export default connect(({ create8D }) => ({
  create8D,
  tenantId: getCurrentOrganizationId(),
}))((props) => {
  const { location, dispatch, tenantId } = props;
  const { search } = location;
  const { affairFlag } = parse(search.substr(1));
  const [withParams, setWithParams] = useState({});
  const { nodeConfigId = -1, backFlag = 0 } = withParams;

  // 业务规则定义
  const handleInitAffairFlag = useCallback(async () => {
    if (affairFlag) {
      const res = await dispatch({
        type: 'create8D/selectCreate8DConfig',
        payload: { tenantId },
      });
      if (res) {
        setWithParams(res);
      }
    }
  }, [dispatch, tenantId, affairFlag, setWithParams]);

  useEffect(() => {
    handleInitAffairFlag();
  }, [handleInitAffairFlag]);

  return affairFlag && isEmpty(withParams) ? (
    <Spin />
  ) : (
    <Index nodeConfigId={nodeConfigId} backFlag={backFlag} affairFlag={affairFlag} {...props} />
  );
});
