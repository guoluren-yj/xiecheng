/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import { connect } from 'dva';
import { noop } from 'lodash';

import mixCustomize from 'srm-front-cuz/lib/mixCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';

import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY_HALL_LOWERCASE } from '@/utils/globalVariable';

const modelName = INQUIRY_HALL_LOWERCASE;

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = CombineComponent({
    modelName,
  })(
    mixCustomize({
      c7nUnit: [
        // 只是区分哪些属于c7n个性化
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT', // 附件列表-tab
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.COST', // 成本备注
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL', // 基础信息
        'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', // 阶梯报价-表格信息
        'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE', // 老核价维护/审批-附件表格 oldUpdateOrApproval
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
      unitCode: [
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT', // 附件列表-tab
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.COST', // 成本备注
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.HEAD_BUTTONS', // 头部按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL', // 基础信息
        'SSRC.INQUIRY_HALL_CHECK_PRICE.QUOTATION_BATCH_MAINTAIN_FROM', // 批量维护
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEM_LINE_ADD', // 补充物料编码],
        'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', // 阶梯报价-表格信息h
        // 'SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE', // IP重合率表格
        'SSRC.INQUIRY_HALL_CHECK_PRICE.DISTRIBUTE_RATE', // 供应商-》分配比率model
        'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE', // 老核价维护/审批-附件表格 oldUpdateOrApproval
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
    })(
      formatterCollections({
        code: [
          'ssrc.inquiryHall',
          'ssrc.common',
          'ssrc.expertScoring',
          'ssrc.bidHall',
          'ssrc.queryRfq',
          'inquryHall',
          'scux.ssrc',
          'sscux.common',
          'ssrc.supplierQuotation',
          'sscux.ssrc',
          'ssrc.offlineResultEntry',
        ],
      })(
        connect(({ inquiryHall, priceComparison, loading }) => ({
          inquiryHall,
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
          // saveCheckPriceLoading: loading.effects['${modelName}/saveCheckPrice'], // 合并loading性能 会优于 单个拆分loading, 前提是二者共同控制
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
          organizationId: getCurrentOrganizationId(),
          userId: getCurrentUserId(),
          turnPageSaveLoading: loading.effects[`${modelName}/turnPageSave`],
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
                // 选择议价方式
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

                queryNewCheckPriceConfigEvent() {},
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
                // 二开tab 刷新
                handleRefreshCuxTab() {},
                remoteJudgeFieldExistAndQueryLaterOperate() {},
              },
            }
          )(Comp)
        )
      )
    )
  );
  return HOCComponent;
}
