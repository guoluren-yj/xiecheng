import React, { createContext, useRef, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set } from 'lodash';
import querystring from 'querystring';
import { toJS } from 'mobx';

import {
  basicFormDS,
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
} from './storeDS';

// 创建context用于上下文传值
const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match,
    match: {
      params: { rfHeaderId },
    },
    location: { pathname, search },
  } = props;

  const { noBack } = useMemo(() => querystring.parse(search.substr(1)), [search]);
  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);

  const basicFormDs = useMemo(() => new DataSet(basicFormDS({ rfHeaderId, sourceCategory })), []);
  const sourceGroupDs = useMemo(
    () => new DataSet(sourceGroupDS({ rfHeaderId, sourceCategory })),
    []
  );
  const rfItemLineDs = useMemo(
    () => new DataSet(rfItemLineDS({ ds: basicFormDs, rfHeaderId, sourceCategory })),
    [basicFormDs]
  );
  const ladderQuotationTableDs = useMemo(() => new DataSet(ladderQuotationTableDS()), []);
  const supplierTableDs = useMemo(
    () => new DataSet(supplierTableDS({ rfHeaderId, sourceCategory, basicFormDs })),
    [basicFormDs]
  );
  const ruleFormDs = useMemo(() => new DataSet(ruleFormDS({ rfHeaderId, sourceCategory })), []);
  const noticeDs = useMemo(
    () => new DataSet(noticeDS({ rfHeaderId, sourceCategory, basicFormDs })),
    [basicFormDs]
  );
  const rfFormDs = useMemo(() => new DataSet(rfFormDS({ rfHeaderId, sourceCategory })), []);
  const expertTableDs = useMemo(
    () => new DataSet(expertTableDS({ ruleFormDs, rfHeaderId, sourceCategory })),
    []
  );
  const businessIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'BUSINESS',
          ruleFormDs,
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_BUSI_${sourceCategory}`,
        })
      ),
    []
  );
  const techIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'TECHNOLOGY',
          ruleFormDs,
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_TECH_${sourceCategory}`,
        })
      ),
    []
  );
  const noneIndicateDs = useMemo(
    () =>
      new DataSet(
        scoringElementDS({
          expertCategory: 'BUSINESS_TECHNOLOGY',
          ruleFormDs,
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_${sourceCategory}`,
        })
      ),
    []
  );
  const expertModalDs = useMemo(
    () => new DataSet(expertModalDS({ rfHeaderId, sourceCategory })),
    []
  );

  const ref = {
    basicInfoRef: useRef({}), // 基础信息formRef
    organizationRef: useRef({}), // 采购组织formRef
    programmeRef: useRef({}), // 要求内容formRef
    inviteRangeRef: useRef({}), // 邀请范围formRef
    attachmentRef: useRef({}), // 上传附件
  };

  const customizeUnitCode = useRef(
    `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.ORGANIZATION_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.LINE_ITEM_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.INVITE_RANGE_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.LINE_SUPPLIER_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.FORM_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_STAGE_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_EXPERT_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_RULE_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_EXPERTS_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_CONFIG_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_TECH_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_BUSI_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_ASSIGN_${sourceCategory},
    SSRC.INQUIRY_HALL.RF_EDIT.${sourceCategory}_ATTACHMENT,
    SSRC.INQUIRY_HALL.RF_EDIT.${sourceCategory}_ATTACHMENT,
    SSRC.INQUIRY_HALL.RF_EDIT.NOTICES_${sourceCategory}`
  );

  const store = useLocalStore(() => ({
    // 公共ds
    commonDs: {
      basicFormDs,
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
    },
    // 路径参数
    routerParams: {
      rfHeaderId,
      sourceCategory,
      noBack,
    },
    match,
    commonCode: {
      customizeUnitCode,
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
