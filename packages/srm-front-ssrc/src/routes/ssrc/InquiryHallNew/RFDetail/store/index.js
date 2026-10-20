import React, { createContext, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import { toJS } from 'mobx';
import querystring from 'querystring';

import {
  createBasicFormDS,
  sourceGroupDS,
  rfItemLineDS,
  ladderQuotationTableDS,
  supplierTableDS,
  noticeDS,
  ruleFormDS,
  rfFormDS,
  expertTableDS,
  scoringElementDS,
  expertModalDS,
  checkPendingBasicFormDS,
  supplierDS,
  consultBasicFormDS,
  supplierResponseDS,
  ItemLineDetailDS,
  scoreBasicFormDS,
  scoreResultDS,
  scoreDetailDS,
  scoringInfoDS,
} from './storeDS';

// 创建context用于上下文传值
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      path,
      params: { rfHeaderId },
    },
    location: { pathname, search },
    remote,
  } = props;

  // 如果是include形式审批流，路由形式需要转换
  const setPath = useMemo(() => {
    let pathName = '';
    // eslint-disable-next-line no-template-curly-in-string
    pathName = path.replace('${rfHeaderId}', ':rfHeaderId');
    return pathName || path;
  }, [path]);

  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);

  // 发布准备
  const createBasicFormDs = useMemo(
    () => new DataSet(createBasicFormDS({ rfHeaderId, sourceCategory })),
    []
  );
  const sourceGroupDs = useMemo(
    () => new DataSet(sourceGroupDS({ rfHeaderId, sourceCategory })),
    []
  );
  const rfItemLineDs = useMemo(() => new DataSet(rfItemLineDS({ rfHeaderId, sourceCategory })), []);
  const ladderQuotationTableDs = useMemo(() => new DataSet(ladderQuotationTableDS()), []);
  const supplierTableDs = useMemo(
    () => new DataSet(supplierTableDS({ rfHeaderId, sourceCategory })),
    []
  );
  const noticeDs = useMemo(() => new DataSet(noticeDS({ rfHeaderId, sourceCategory })), []);
  const ruleFormDs = useMemo(() => new DataSet(ruleFormDS({ rfHeaderId, sourceCategory })), []);
  const rfFormDs = useMemo(() => new DataSet(rfFormDS({ rfHeaderId, sourceCategory })), []);
  const expertTableDs = useMemo(
    () => new DataSet(expertTableDS({ rfHeaderId, sourceCategory })),
    []
  );
  const businessIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'BUSINESS',
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_TECH_${sourceCategory}`,
        })
      ),
    []
  );
  const techIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'TECHNOLOGY',
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_BUSI_${sourceCategory}`,
        })
      ),
    []
  );
  const noneIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'BUSINESS_TECHNOLOGY',
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_${sourceCategory}`,
        })
      ),
    []
  );
  const expertModalDs = useMemo(
    () => new DataSet(expertModalDS({ rfHeaderId, sourceCategory })),
    []
  );

  // 核价
  const checkPendingBasicFormDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_INQUIRY_DETAIL_RF_PROCESS_CHECK_PENDING_DS',
              checkPendingBasicFormDS({ rfHeaderId, sourceCategory })
            )
          : checkPendingBasicFormDS({ rfHeaderId, sourceCategory })
      ),
    []
  );

  const supplierDs = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process(
              'SSRC_INQUIRY_DETAIL_RF_PROCESS_SUPPLIER_DS',
              supplierDS({ rfHeaderId, sourceCategory }),
              { rfHeaderId, sourceCategory }
            )
          : supplierDS({ rfHeaderId, sourceCategory })
      ),
    []
  );

  const consultBasicFormDs = useMemo(
    () => new DataSet(consultBasicFormDS({ rfHeaderId, sourceCategory })),
    []
  );
  const supplierResponseDs = useMemo(
    () => new DataSet(supplierResponseDS({ rfHeaderId, sourceCategory })),
    []
  );
  const ItemLineDetailDs = useMemo(
    () =>
      new DataSet(
        ItemLineDetailDS({
          rfHeaderId,
          sourceCategory,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_QUOTATION_LINE`,
        })
      ),
    []
  );
  // 征询中 - 报价明细行
  const ItemLineInQuotationDetailDs = useMemo(
    () =>
      new DataSet(
        ItemLineDetailDS({
          rfHeaderId,
          sourceCategory,
          customizeUnitCode: `SSRC.INQUIRY_HALL_RF_DETAIL.${sourceCategory}_STEP_IN_QUOTATION_LINE`,
        })
      ),
    []
  );
  const checkLadderQuotationTableDs = useMemo(() => new DataSet(ladderQuotationTableDS(true)), []);

  // 评分
  const scoreBasicFormDs = useMemo(
    () => new DataSet(scoreBasicFormDS({ rfHeaderId, sourceCategory })),
    []
  );
  const scoreResultDs = useMemo(
    () => new DataSet(scoreResultDS({ rfHeaderId, sourceCategory })),
    []
  );
  const scoreDetailDs = useMemo(() => new DataSet(scoreDetailDS()), []);

  const scoringInfoDs = useMemo(() => new DataSet(scoringInfoDS({ sourceCategory })), [
    sourceCategory,
  ]);

  const ref = {};

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      createBasicFormDs,
      sourceGroupDs,
      rfItemLineDs,
      ladderQuotationTableDs,
      supplierTableDs,
      noticeDs,
      ruleFormDs,
      rfFormDs,
      expertTableDs,
      businessIndicateDs,
      techIndicateDs,
      noneIndicateDs,
      expertModalDs,
      checkPendingBasicFormDs,
      supplierDs,
      consultBasicFormDs,
      supplierResponseDs,
      ItemLineDetailDs,
      ItemLineInQuotationDetailDs,
      checkLadderQuotationTableDs,
      scoreBasicFormDs,
      scoreResultDs,
      scoreDetailDs,
      scoringInfoDs,
    },
    // 路径参数
    routerParams: {
      setPath,
      rfHeaderId,
      sourceCategory,
      searchParams: querystring.parse(search?.substr(1)),
    },
    storeData: {
      scoreViewFlag: false, // 设置评分结果可见标志
    },
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
