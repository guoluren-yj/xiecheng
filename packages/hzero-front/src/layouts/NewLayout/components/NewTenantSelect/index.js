/**
 * NewTenantSelect
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */

import React, { useCallback, useState } from 'react';
import { connect } from 'dva';
import { Icon, Select, useDataSet } from 'choerodon-ui/pro';
import { routerRedux } from 'dva/router';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { cleanMenuTabs } from 'utils/menuTab';
import { getCurrentOrganizationId, setSession, getCurrentUser } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT } from 'utils/constants';
import remote from 'utils/remote';

const menuHistorySessionKey = 'menuHistoryKey';

const NewTenantSelect = function (props) {
  const {
    getClassName,
    dispatch,
    tenantId,
    tenantName,
    tenantNum,
    className,
    optionClassName,
    loading = false,
    processRemote,
  } = props;
  const options = useDataSet(
    () => ({
      transport: {
        read: {
          url: `${getEnvConfig().HZERO_IAM}/hzero/v1/users/self-tenants`,
          method: 'GET',
        },
      },
      data: [{ tenantId, tenantName, tenantNum }],
      paging: false,
    }),
    [tenantId, tenantName, tenantNum]
  );
  const [{ currentTenantId, loaded }, setState] = useState(() => ({
    currentTenantId: tenantId,
    tenantId: getCurrentOrganizationId(),
  }));

  const handlePopupHiddenChange = useCallback(
    (hidden) => {
      if (!hidden) {
        options.query().then((res) => {
          setState((prevState) => ({
            ...prevState,
            loaded: true,
          }));
        });
      }
    },
    [options]
  );

  const handleTenantChange = useCallback(
    (selectTenantId) => {
      setState((prevState) => {
        if (selectTenantId !== prevState.tenantId) {
          // 缓存当前用户的租户
          dispatch({
            type: 'user/updateCurrentTenant',
            payload: { tenantId: selectTenantId },
          }).then((res) => {
            if (res) {
              // warn 清空 tabs 信息
              cleanMenuTabs();
              setSession(menuHistorySessionKey, []);
              dispatch(routerRedux.push({ pathname: '/workplace' }));
              // 切换租户时记录当前登陆租户、角色和语言
              const { currentRoleId, language, timeZone } = getCurrentUser();
              localStorage.setItem(
                CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
                `${selectTenantId}-${currentRoleId}-${language}-${timeZone}`
              );
              localStorage.removeItem(YQCLOUD_TABMAP);
              localStorage.removeItem(YQCLOUD_COUNT);
              // 成功 刷新页面
              window.location.reload();
            }
          });
          return {
            ...prevState,
            currentTenantId: selectTenantId,
          };
        }
        return prevState;
      });
    },
    [dispatch]
  );
  const handleOption = useCallback(
    () => ({
      className: optionClassName,
    }),
    [optionClassName]
  );
  const searchMatcher = useCallback(
    ({ record, text, textField }) =>
      (record.get(textField) || '').includes(text) ||
      (record.get('tenantNum') || '').includes(text),
    []
  );
  const optionRenderer = useCallback(
    ({ text, record }) => (
      <>
        {text}
        {processRemote.render(
          'LAYOUT_NEW_TENANT_SELECT_TENANT_NUM',
          <div>{record.get('tenantNum')}</div>,
          {}
        )}
      </>
    ),
    []
  );
  if (isNil(currentTenantId)) {
    return null;
  }
  return (
    <Select
      prefix={<Icon type="domain" />}
      size="small"
      popupPlacement="bottomRight"
      className={className}
      value={currentTenantId}
      onChange={handleTenantChange}
      onOption={handleOption}
      optionRenderer={optionRenderer}
      onPopupHiddenChange={loaded ? undefined : handlePopupHiddenChange}
      disabled={loading}
      clearButton={false}
      options={options}
      valueField="tenantId"
      textField="tenantName"
      isFlat
      searchable
      searchFieldInPopup
      searchFieldProps={{
        placeholder: intl
          .get('hzero.common.basicLayout.tenantSearchPlaceholder')
          .d('请输入租户编码或名称查询'),
      }}
      searchMatcher={searchMatcher}
      popupCls={getClassName('right', 'item', 'popup')}
    />
  );
};

export default formatterCollections({ code: ['hpfm.tenantSelect', 'entity.tenant'] })(
  connect(({ user: { currentUser: { tenantId, tenantName, tenantNum } } = {}, loading }) => ({
    tenantId,
    tenantName,
    tenantNum,
    loading: loading.effects['user/updateDefaultTenant'],
  }))(remote({
    code: 'LAYOUT_NEW_TENANT_SELECT',
    name: 'processRemote',
  })(NewTenantSelect))
);
