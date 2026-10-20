import React, { createContext, useMemo } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { useLocalStore } from 'mobx-react-lite';
import { isNil } from 'lodash';
import { set, get, toJS } from 'mobx';

import { getCustomizeUnitCode } from '../../utils/utils';

import { headerDS, templateTableDS, editTempRecordFormDS } from './storeDS';

const StoreContext = createContext({});

function StoreProvider(props = {}) {
  const {
    match: { params } = {},
    children,
    pageSourceCategory, // 页面来源类型[新建、编辑]
    history,
  } = props;

  const { fileManageId } = params || {};

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  // init ds
  // basic information ds
  const headerDs = useDataSet(
    () =>
      headerDS({
        pageSourceCategory,
        fileManageId,
        customizeUnitCode: getCustomizeUnitCode('updateBaseInfo'),
      }),
    [pageSourceCategory, fileManageId]
  );
  // template table ds
  const templateTableDs = useDataSet(() => templateTableDS({ fileManageId }), [fileManageId]);

  // create or edit template table record ds
  const editTempRecordFormDs = useDataSet(() => editTempRecordFormDS({ fileManageId }), [
    fileManageId,
  ]);

  // 动态设置的数据
  const reactionStoreData = useLocalStore(() => ({
    storeData: {},
    setStoreData(key, value) {
      set(this.storeData, key, value); // 针对动态添加属性 by mobx 4.*
    },
    getStoreData(key) {
      return isNil(key) ? toJS(this.storeData) : get(this.storeData, key); // 避免直接引用toJS 递归遍历所有属性, 触发不必要更新
    },
  }));

  // 公共数据存储
  const storeData = useMemo(
    () => ({
      commonDs: {
        headerDs,
        templateTableDs,
        editTempRecordFormDs,
      },
      organizationId,
      fileManageId,
      pageSourceCategory,
      getCustomizeUnitCode,
      history,
      ...reactionStoreData,
    }),
    [
      headerDs,
      templateTableDs,
      editTempRecordFormDs,
      organizationId,
      pageSourceCategory,
      reactionStoreData,
      history,
    ]
  );

  const value = {
    ...(props || {}),
    ...storeData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export default StoreProvider;

export { StoreContext };
