/*
 * @Descripttion: 寻源过程控制--Store
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:23:23
 * @LastEditors: yiping.liu
 */
import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';

import {
  basicFormDS,
  inquiryScopeDS,
  consultationDS,
  buyerDS,
  sourcingTeamDS,
  expertDS,
  scoreDS,
  evaluationDS,
  batchAddSupplierLovDS,
  supplierBulkExpiredModalDS,
  expertModalDS,
  attachmentDS,
} from './storeDS';
// 创建context
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { rfHeaderId, sourceCategory, adjustRecordId },
    },
  } = props;

  // 基本信息
  const basicFormDs = useMemo(() => new DataSet(basicFormDS()), []);

  // 供应商
  const inquiryScopeDs = useMemo(() => new DataSet(inquiryScopeDS({ adjustRecordId })), [
    adjustRecordId,
  ]);

  // 征询时间
  const consultationDs = useMemo(
    () => new DataSet(consultationDS({ rfHeaderId, adjustRecordId })),
    [rfHeaderId, adjustRecordId]
  );

  // 采购员
  const buyerDs = useMemo(() => new DataSet(buyerDS()), []);

  // 寻源小组
  const sourcingTeamDs = useMemo(() => new DataSet(sourcingTeamDS({ adjustRecordId })), [
    adjustRecordId,
  ]);

  // 专家
  const expertDs = useMemo(() => new DataSet(expertDS({ consultationDs, adjustRecordId })), [
    consultationDs,
    adjustRecordId,
  ]);

  const techIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'TECHNOLOGY',
          consultationDs,
          adjustRecordId,
        })
      ),
    [consultationDs, adjustRecordId]
  );

  const businessIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'BUSINESS',
          consultationDs,
          adjustRecordId,
        })
      ),
    [consultationDs, adjustRecordId]
  );

  const noneIndicateDs = useMemo(
    () =>
      new DataSet(
        scoreDS({
          expertCategory: 'BUSINESS_TECHNOLOGY',
          consultationDs,
          adjustRecordId,
        })
      ),
    [consultationDs, adjustRecordId]
  );

  const expertModalDs = useMemo(() => new DataSet(expertModalDS()), []);

  const evaluationDs = useMemo(() => new DataSet(evaluationDS()), []);

  const attachmentDs = useMemo(() => new DataSet(attachmentDS()), []);
  // 批量添加供应商
  const batchAddSupplierLovDs = useMemo(
    () => new DataSet(batchAddSupplierLovDS({ rfHeaderId, sourceCategory, adjustRecordId })),
    [rfHeaderId, sourceCategory, adjustRecordId]
  );

  // 供应商资质
  const supplierBulkExpiredModalDs = useMemo(() => new DataSet(supplierBulkExpiredModalDS()), []);

  const ref = {};

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
      inquiryScopeDs,
      consultationDs,
      buyerDs,
      expertModalDs,
      sourcingTeamDs,
      expertDs,
      techIndicateDs,
      businessIndicateDs,
      noneIndicateDs,
      evaluationDs,
      attachmentDs,
      batchAddSupplierLovDs,
      supplierBulkExpiredModalDs,
    },
    // 路径参数
    routerParams: {
      rfHeaderId,
      sourceCategory,
      adjustRecordId,
    },
    storeData: {},
    // 设置状态值
    setStoreData(key, data, hasStoreData = true) {
      if (hasStoreData) {
        set(this.storeData, key, data);
      } else {
        this[key] = data;
      }
    },

    // 获取状态值
    getStoreData(key) {
      return toJS(this.storeData[key]);
    },
    ref,
  }));

  const value = {
    ...props,
    ...store,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}
