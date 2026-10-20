import React, { useMemo, useState, createContext, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { isTenantRoleLevel, getResponse } from 'utils/utils';
import { setPermissionSetEnable } from '@/services/menuConfigService';
import { getFunctionDs, getFunctionContentDs } from './FunctionDs';
import { platform, tenant } from '../../MenuGroup/SrmMenuGroup';

export const Store = createContext({});

const StoreProvider = (props) => {
  const [functionContentDs, setFunctionContentDs] = useState(null);
  const [activeMenus, setActiveMenus] = useState({});
  const [activeTabKey, setActiveTabKey] = useState(isTenantRoleLevel() ? tenant : platform);
  const functionDs = useMemo(() => new DataSet(getFunctionDs(platform)), []);
  const [labelMap, setLabelMap] = useState({});
  // 首先初始化tabs信息，结束后根据tabs的首字段生成内容区
  useEffect(() => {
    // 默认查询当前tab的第一条数据
    functionDs.addEventListener('load', initContent);

    return () => {
      functionDs.removeEventListener('load', initContent);
    };
  }, [functionDs, activeTabKey]);

  useEffect(() => {
    queryIdpValue('AUTH_LABEL').then((res) => {
      const labelList = getResponse(res);
      if (labelList) {
        const map = {};
        labelList.forEach((item) => {
          map[item.value] = item.meaning || '';
        });
        setLabelMap(map);
      }
    });
  }, []);

  /**
   * DS加载结束后保存DS
   * 不存在当前层级的activeMenus，选中第一条Menu信息，防止右侧内容区出现空白
   */
  const initContent = ({ dataSet }) => {
    handleActiveMenu(dataSet.records[0]?.toData(), activeTabKey);
  };

  // 选中菜单，并生成内容区DS
  const handleActiveMenu = (record, type = activeTabKey) => {
    if (functionDs) {
      const data = record || functionDs.records[0]?.toData();
      if (data) {
        setActiveMenus((preState) => {
          const currentState = { ...preState };
          currentState[type] = data;
          return currentState;
        });
        setFunctionContentDs(new DataSet(getFunctionContentDs(data.code, type)));
      }
    }
  };

  // 功能-启用/禁用
  const updateEnabledFlag = (record, dataSet, tenantId) => {
    setPermissionSetEnable({
      id: record.get('id'),
      _token: record.get('_token'),
      paramType: record.get('enabledFlag') ? 'disable' : 'enable',
      tenantId,
    }).then((res) => {
      if (getResponse(res)) {
        dataSet.query();
      }
    });
  };

  const getLevel = (type = activeTabKey) => {
    return type === platform ? 'site' : 'organization';
  };

  const value = {
    ...props,
    functionDs,
    functionContentDs,
    setFunctionContentDs,
    activeMenus,
    setActiveMenus,
    activeTabKey,
    setActiveTabKey,
    handleActiveMenu,
    updateEnabledFlag,
    getLevel,
    labelMap,
  };

  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};

export default StoreProvider;
