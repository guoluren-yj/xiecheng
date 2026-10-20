import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Button, Icon, Menu, Dropdown } from 'choerodon-ui/pro';
import { isEmpty, isArray, throttle, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';

import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

import { fetchSpHistoryVersionList } from '@/services/projectSetupService';

/**
 * 历史版本下拉按钮
 */
const HistoryVersionListBtn = (props = {}) => {
  const {
    aggregation, // 是否聚合
    sourceProjectId, // 立项id，必输
    listFlag = false, // 是否是列表按钮, true-是，false-头按钮
    permissionDisabled, // 如果走权限，权限是否设置了禁用；ps：列表走权限
    handleJumpVersion, // 跳转历史版本页面方法
    currentDataVersion, // 当前版本
    buttonProps, // 按钮属性
    status = null,
  } = props;

  const [versionList, setVersionList] = useState([]); // 历史版本列表

  useEffect(() => {
    if (!listFlag) {
      // 如果是头按钮，只需要查询这一次即可
      querySpHistoryVersions();
    }
  }, [listFlag, currentDataVersion]);

  // 查询立项版本历史
  const querySpHistoryVersions = useCallback(async () => {
    if (!sourceProjectId) return;
    const params = filterNullValueObject({
      sourceProjectId,
      currentDataVersion:
        Number.isFinite(+currentDataVersion) && !isNaN(currentDataVersion)
          ? Number(currentDataVersion)
          : null,
      organizationId: getCurrentOrganizationId(),
    });

    let result = null;
    try {
      result = await fetchSpHistoryVersionList(params);
      result = getResponse(result);
      if (!result || !isArray(result)) {
        return;
      }

      setVersionList(result);
    } catch (e) {
      throw e;
    }
  }, [sourceProjectId, currentDataVersion]);

  // 跳转历史版本页面
  const skipHistoryVersion = (versionRecord) => {
    const { sourceProjectHistoryId } = versionRecord || {};
    if (!sourceProjectHistoryId) return;
    if (isFunction(handleJumpVersion)) {
      handleJumpVersion({
        versionRecord,
        sourceProjectId,
      });
    }
  };

  // menu list
  const menuList = useCallback(() => {
    if (isEmpty(versionList)) {
      return '';
    }

    return (
      <Menu>
        {versionList.map((versionRecord) => {
          return (
            <Menu.Item
              onClick={() => skipHistoryVersion(versionRecord)}
              key={versionRecord.sourceProjectHistoryId}
            >
              <div>
                {`${intl.get('ssrc.projectSetup.view.menuItem.version').d('版本')}v${
                  versionRecord.dataVersion
                }`}
              </div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }, [versionList]);

  // menu visible change
  const handleMenuChange = useCallback(
    throttle((visible) => {
      if (!visible) {
        querySpHistoryVersions();
      } else {
        setVersionList([]);
      }
    }, 1200),
    [querySpHistoryVersions, setVersionList]
  );

  // 按钮禁用标识
  const btnDisabledFlag = useMemo(() => {
    return !sourceProjectId || permissionDisabled;
  }, [sourceProjectId, permissionDisabled]);
  return listFlag ? (
    <Dropdown overlay={menuList} onHiddenChange={handleMenuChange}>
      {!status && (
        <Button funcType="link" disabled={btnDisabledFlag}>
          <span>{intl.get('ssrc.projectSetup.view.button.historyMode').d('查看版本')}</span>
          <Icon type="navigate_next" style={{ fontSize: '16px' }} />
        </Button>
      )}
      {status && (
        <a style={{ marginLeft: !aggregation && '16px' }} disabled={btnDisabledFlag}>
          {intl.get('ssrc.projectSetup.view.button.historyMode').d('查看版本')}
        </a>
      )}
    </Dropdown>
  ) : (
    <Dropdown overlay={menuList}>
      <Button funcType="flat" disabled={btnDisabledFlag} {...(buttonProps || {})}>
        <span>{intl.get('ssrc.projectSetup.view.button.historyMode').d('查看版本')}</span>
        <Icon type="navigate_next" style={{ fontSize: '16px' }} />
      </Button>
    </Dropdown>
  );
};

export default observer(HistoryVersionListBtn);
