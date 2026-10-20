import React, { createContext } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { useLocalStore } from 'mobx-react-lite';
import { set, isArray, isEmpty } from 'lodash';
import { toJS } from 'mobx';
import { getCurrentOrganizationId } from 'utils/utils';

import {
  baseInfoDS,
  approveRuleDS,
  attachRequirementDS,
  releaseRuleDS,
  quotationRuleDS,
  auctionBidDS,
  openBidDS,
  scoreRuleDS,
  bargainRuleDS,
  roundQuotationRuleDS,
  checkPriceRuleDS,
  winBidRuleDS,
  bidAnnouncementRuleDS,
  rfApproveRuleDS,
  rfReleaseDS,
  rfQuotationDS,
  rfExpertScoreDS,
} from './storeDs';

const Store = createContext({});
export default Store;

// 定义路由访问的根组件 用于context传值
export function StoreProvider(props) {
  const {
    children,
    match: {
      params: { templateId, type },
    },
  } = props;

  /**
   * 获取对应的个性化编码
   * @param codeName null string | string[]
   * @return null | string
   *  */
  const getCustomizeUnitCode = (codeName = null) => {
    if (!codeName || isEmpty(codeName)) {
      return null;
    }

    const RfxCodeMap = new Map([
      ['quotationRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.QUOTATION_RULE'], // 报价规则
      ['checkPriceRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.CHECK_PRICE_RULE'], // 核价规则
      [
        'delayedPriceBiddingRule',
        'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.DELAYED_PRICE_BIDDING_RULE',
      ], // 延时竞价规则
      ['baseInfo', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.BASE_INFO'], // 基础信息
      ['scoreRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.EXPERT_SCORE_RULE'], // 询价专家评分规则
      ['rfScoreRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.RF_EXPERT_SCORE_RULE'], // RFI、RFP专家评分规则
      ['releaseRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.RELEASE_RULE'], // 询价招标竞价发布规则
      ['rfApproveRule', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.RF_APPROVE_RULE'], // RFI、RFP 全局规则
      ['attachmentRequirements', 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.ATTACHMENT_REQUIREMENTS'], // 询价-全局规则-附件要求
    ]);

    const CodeDataMap = RfxCodeMap;
    let currentUnitCode = null;

    if (typeof codeName === 'string') {
      currentUnitCode = CodeDataMap.get(codeName);
    }

    if (isArray(codeName)) {
      const codeSet = new Set();
      codeName.forEach((unitCode) => {
        codeSet.add(CodeDataMap.get(unitCode));
      });

      currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
    }

    return currentUnitCode;
  };

  // 共用DS
  const baseInfoDs = useDataSet(() => baseInfoDS(), []);
  // 询价DS
  const approveRuleDs = useDataSet(() => approveRuleDS(), []);
  const attachRequirementDs = useDataSet(
    () =>
      attachRequirementDS({
        baseInfoDs,
        customizeUnitCode: getCustomizeUnitCode('attachmentRequirements'),
      }),
    [templateId]
  );
  const releaseRuleDs = useDataSet(() => releaseRuleDS({ baseInfoDs }), [baseInfoDs]);
  const quotationRuleDs = useDataSet(() => quotationRuleDS({ baseInfoDs }), [baseInfoDs]);
  const auctionBidDs = useDataSet(() => auctionBidDS({ quotationRuleDs, baseInfoDs }), [
    quotationRuleDs,
    baseInfoDs,
  ]);
  const openBidDs = useDataSet(() => openBidDS(), []);
  const scoreRuleDs = useDataSet(() => scoreRuleDS(), []);
  const bargainRuleDs = useDataSet(() => bargainRuleDS(), []);
  const roundQuotationRuleDs = useDataSet(() => roundQuotationRuleDS(), []);
  const checkPriceRuleDs = useDataSet(() => checkPriceRuleDS({ baseInfoDs, quotationRuleDs }), [
    baseInfoDs,
    quotationRuleDs,
  ]);

  // 中标公告DS
  const winBidRuleDs = useDataSet(() => winBidRuleDS(), []);

  // 唱标规则DS
  const bidAnnouncementRuleDs = useDataSet(() => bidAnnouncementRuleDS(), []);

  // RF的DS
  const rfApproveRuleDs = useDataSet(() => rfApproveRuleDS(), []);
  const rfReleaseDs = useDataSet(() => rfReleaseDS(), []);
  const rfQuotationDs = useDataSet(() => rfQuotationDS({ rfReleaseDs }), [rfReleaseDs]);
  const rfExpertScoreDs = useDataSet(() => rfExpertScoreDS(), []);

  const ref = {};

  const store = useLocalStore(() => ({
    organizationId: getCurrentOrganizationId(),
    // 公共ds
    commonDs: {
      baseInfoDs,
      approveRuleDs,
      attachRequirementDs,
      releaseRuleDs,
      quotationRuleDs,
      auctionBidDs,
      openBidDs,
      scoreRuleDs,
      bargainRuleDs,
      roundQuotationRuleDs,
      checkPriceRuleDs,
      winBidRuleDs, // 中标公告DS
      bidAnnouncementRuleDs, // 唱标规则DS
      // RF
      rfApproveRuleDs,
      rfReleaseDs,
      rfQuotationDs,
      rfExpertScoreDs,
    },
    // 路径参数
    routerParams: {
      templateId,
      type,
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
    getCustomizeUnitCode,
  };

  return <Store.Provider value={value}>{children}</Store.Provider>;
}
