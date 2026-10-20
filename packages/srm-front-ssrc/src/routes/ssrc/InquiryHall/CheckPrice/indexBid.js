import { connect } from 'dva';
import { noop } from 'lodash';

import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID, NEW_BID_HALL_LOWERCASE } from '@/utils/globalVariable';

import { CheckPrice } from './index';

const modelName = NEW_BID_HALL_LOWERCASE;

const withStandardCompEnhancer = (Comp) => {
  return CombineComponent({
    sourceKey: BID,
    modelName,
  })(
    mixCustomize({
      c7nUnit: [
        // 只是区分哪些属于c7n个性化
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT', // 附件列表-tab
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ITEM_DTL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_INFO',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.COST', // 成本备注
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEMSINFO_TABS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_COLLAPSE',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL', // 基础信息
        'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', // 阶梯报价-表格信息
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE', // 老核价维护/审批-附件表格 oldUpdateOrApproval
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
      unitCode: [
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT', // 附件列表-tab
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ITEM_DTL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_INFO',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.COST', // 成本备注
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEMSINFO_TABS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_COLLAPSE',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL', // 基础信息
        'SSRC.NEW_BID_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM', // 批量维护
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEM_LINE_ADD', // 补充物料编码],
        'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', // 阶梯报价-表格信息
        // 'SSRC.NEW_BID_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE', // IP重合率表格
        'SSRC.NEW_BID_HALL_CHECK_PRICE.DISTRIBUTE_RATE', // 供应商-》分配比率model
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE', // 老核价维护/审批-附件表格 oldUpdateOrApproval
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.common',
          'ssrc.expertScoring',
          'ssrc.bidHall',
          'ssrc.queryRfq',
          'scux.ssrc',
          'sscux.common',
          'sscux.ssrc',
          'ssrc.offlineResultEntry',
        ],
      })(
        connect(({ newBidHall, priceComparison, loading }) => ({
          newBidHall,
          priceComparison,
          allLoading:
            loading.effects[`${modelName}/saveCheckPrice`] ||
            loading.effects[`${modelName}/submitCheckPrice`] ||
            loading.effects[`${modelName}/checkPriceSectionSubmitValidate`] ||
            loading.effects[`${modelName}/validateBeforeSubmit`] ||
            loading.effects[`${modelName}/saveSuggestedRemark`] ||
            loading.effects[`${modelName}/checkPriceSectionSubmit`],
          fetchHeaderLoading: loading.effects[`${modelName}/fetchInquiryHeaderDetail`],
          fetchItemLineLoading: loading.effects[`${modelName}/fetchItemLine`],
          fetchSupplierLineLoading: loading.effects[`${modelName}/fetchSupplierLineCheckPrice`],
          fetchQuoteLineLoading: loading.effects[`${modelName}/fetchQuoteLine`],
          // saveCheckPriceLoading: loading.effects[`${modelName}/saveCheckPrice`], // 合并loading性能 会优于 单个拆分loading, 前提是二者共同控制
          // submitCheckPriceLoading: loading.effects[`${modelName}/submitCheckPrice`],
          fetchLadderLevelTableLoading: loading.effects[`${modelName}/fetchLadderLevelTable`],
          fetchPriceChartLoading: loading.effects[`${modelName}/fetchPriceChartsData`],
          fetchIPCoincidenceRateLoading: loading.effects[`${modelName}/fetchIPCoincidenceRate`],
          beginRoundQuotationLoading: loading.effects[`${modelName}/beginRoundQuotation`],
          querySupplierExchangeEditLoading:
            loading.effects[`${modelName}/querySupplierExchangeEdit`],
          saveExchangeEditLoading: loading.effects[`${modelName}/saveExchangeEdit`],
          changeCheckWayLoading: loading.effects[`${modelName}/changeRfxDetailLayout`],
          batchMaintainQuotateLineLoading:
            loading.effects[`${modelName}/batchMaintainItemQuotationLine`],
          fetchQueryPriceInfoLoading: loading.effects[`${modelName}/fetchQueryPriceInfo`],
          turnPageSaveLoading: loading.effects[`${modelName}/turnPageSave`],
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
        }))(
          remote(
            {
              code: 'SSRC_CHECK_PRICE',
              name: 'remote',
            },
            {
              events: {
                changeItemLinePagination(eventProps) {
                  const { handleChangeItemLinePagination } = eventProps;
                  handleChangeItemLinePagination();
                },
                changeSupplierLinePagination(eventProps) {
                  const { handleChangeSupplierLinePagination } = eventProps;
                  handleChangeSupplierLinePagination();
                },
                handlePricingSheet(eventProps) {
                  const { submitData = noop } = eventProps;
                  submitData();
                },
                setItemActivePanel() {},
                setSupplierActivePanel() {},
                handleValidateItemLine(props = {}) {
                  const { validateItemLine = noop, ...otherParams } = props || {};
                  validateItemLine(otherParams, 'standFlag');
                },
                handleGetCheckPriceDTOLineList(props = {}) {
                  const { getCheckPriceDTOLineList = noop, ...otherParams } = props || {};
                  getCheckPriceDTOLineList(otherParams);
                },
                selectBargainWay(eventProps) {
                  const { selectBargainWay } = eventProps;
                  selectBargainWay();
                },
                // 打开议价弹框回调
                directBargain(eventProps) {
                  const { directBargain } = eventProps;
                  directBargain();
                },
                afterQueryHeaderInfoFunc() {},
                setTabChange() {},
                handleHidePricingModal() {},
                afterStartBatchMaintainItemLine() {},
                inquiryAgain(eventProps) {
                  const { againInquoryFunc } = eventProps;
                  againInquoryFunc();
                },
                validateFunc(eventProps) {
                  const { validateFunc } = eventProps;
                  validateFunc();
                },
                cancelFunc() {},
                releaseFunc() {},
                beforeJump() {},
                afterSubmitCheckPrice(eventProps) {
                  const { callback, res, operation, handleAfterSubmit } = eventProps || {};
                  if (callback) {
                    callback();
                  }
                  if (handleAfterSubmit) {
                    handleAfterSubmit(res, operation);
                  }
                },
                afterSubmitCheckPriceCodelessItem(eventProps) {
                  const { codeLessSubmit } = eventProps || {};
                  if (codeLessSubmit) {
                    codeLessSubmit();
                  }
                },
                afterSubmitCheckPriceCodelessSupplier(eventProps) {
                  const { codeLessSubmit } = eventProps || {};
                  if (codeLessSubmit) {
                    codeLessSubmit();
                  }
                },
                afterSubmitCheckPriceCodelessAllQuotationDetail(eventProps) {
                  const { codeLessSubmit } = eventProps || {};
                  if (codeLessSubmit) {
                    codeLessSubmit();
                  }
                },
                // 快速选用成功回调
                changeStrategySuccessCallBack(eventProps) {
                  const { successCallBack } = eventProps || {};
                  if (successCallBack) {
                    successCallBack();
                  }
                },
                // 切换tab
                changeTab(eventProps) {
                  const { that = {}, search, key } = eventProps || {};
                  if (search) {
                    search();
                  }
                  that.setState({ activeKey: key });
                },
                // 保存
                remoteSave(eventProps) {
                  const { handleBeSave } = eventProps || {};
                  if (handleBeSave) {
                    handleBeSave(true);
                  }
                },
                // 提交
                remoteSubmit(eventProps) {
                  const { handleBeSave } = eventProps || {};
                  if (handleBeSave) {
                    handleBeSave(false);
                  }
                },
                // 快速选用
                strategySubmitCallBack(eventProps) {
                  const { strategySubmit } = eventProps || {};
                  if (strategySubmit) {
                    strategySubmit();
                  }
                },
                // 快速选用 失败后
                changeStrategyFailedCallBack() {},
                // 全部报价明细查看适用范围埋点方法
                remoteViewApplicationModalEvent(props = {}) {
                  const { handleViewApplicationModal = noop } = props || {};
                  handleViewApplicationModal(props);
                },
                // 提交方法
                beforeSubmit(props) {
                  const { beforeSubmit = noop } = props || {};
                  beforeSubmit();
                },
                // 页面加载后二开逻辑处理
                afterLoadedPageCuxHandle() {},
                remoteJudgeFieldExistAndQueryLaterOperate() {},
              },
            }
          )(Comp)
        )
      )
    )
  );
};

export default withStandardCompEnhancer(CheckPrice);
export { withStandardCompEnhancer as hocCheckPrice };
