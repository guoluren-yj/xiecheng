import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import { Lov, Table, DataSet, useModal, CheckBox } from 'choerodon-ui/pro';
import { Badge, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { noop, isNaN, isEmpty, debounce, isNil, throttle } from 'lodash';

import { SRM_SSRC } from '_utils/config';

import CommonImportNew from 'hzero-front/lib/components/Import';
// import { yesOrNoRender } from 'utils/renderer';
// import { DEFAULT_DATETIME_FORMAT, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentTenant } from 'utils/utils';
import { calculateBasicQty } from '@/utils/utils';
import { PageSourceSymbol } from '@/utils/constants.js';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';

import { numberSeparatorRender, getQuotationTooltipTitle } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import LadderPriceEditor from '@/routes/ssrc/components/LadderPrice/WholeLadderPrice/LadderPriceEditor';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

// import QuotationDetailModal from '@/routes/components/QuotationDetailCurrent/Supplier';
import { CheckBoxWithLinkRender } from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';

import {
  fetchConfigSheet,
  fetchSourceSupplierRelativeConfig,
} from '@/services/inquiryHallNewService';

import { itemLineDataSet } from '../Stores/itemLineDS';
import { supplierLineDS } from '../Stores/supplierLineDS';
import Items from './Items';
import Suppliers from './Suppliers';
import BatchMaintain from '../Modals/BatchMaintain';
import SortByMaterialAndPrice from '../../components/SortByMaterialAndPrice';

import Styles from '../index.less';

const QuotationLineTable = (props) => {
  const {
    history,
    lineDS,
    customizeTable = noop,
    custLoading,
    organizationId,
    basicFormDS,
    getCustomizeUnitCode = () => {},
    doubleUnitFlag = false,
    // path,
    rfxHeaderId,
    initPage = noop,
    confirmBatchMaintain = noop,
    customizeForm = noop,
    applyToInquiryNewFlag = 1,
    viewApplicationOrgModal = noop,
    save = noop,
    settings = null,
    defaultConfig = {},
    suggestedDimension,
    resetBatchMainRecord,
    allowInputSupplierNameFlag = 0,
    offlineEntryRemote,
    currencyPrecision,
    financialPrecision,
    caclRule,
    onRef,
  } = props;

  useImperativeHandle(
    onRef,
    () => ({
      dynamicChangePrice,
    }),
    [dynamicChangePrice, currencyPrecision, financialPrecision, caclRule]
  );

  const uModal = useModal();

  const [configSheet, setConfigSheet] = useState({});

  const itemRef = useRef(); // 物料与供应商弹窗中 supplier

  const supplierRef = useRef(); // 物料与供应商弹窗中 supplier

  const { companyId, sourceMethod, templateId, taxChangeFlag, priceTypeCode } = basicFormDS?.current
    ? basicFormDS.current?.get([
        'companyId',
        'sourceMethod',
        'templateId',
        'taxChangeFlag',
        'priceTypeCode',
      ])
    : {};
  const companySavedFlag = basicFormDS?.getState?.('companySavedFlag');
  const headerCurrencyCode = basicFormDS?.getState?.('headerCurrencyCode'); // 后端返回的头币种
  const tableUnitCode = useMemo(() => getCustomizeUnitCode('table'), [getCustomizeUnitCode]);
  let doubleFetchDataCurrentFlag = 0; // 双单位获取数量值,防止接口过慢
  const isUnTaxPriceFlag = priceTypeCode && priceTypeCode === 'NET_PRICE';
  const hasTaxFlag = basicFormDS?.current?.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE'; // 后端以该字段为准基准价类型
  const purchaseTurnFlag = lineDS ? lineDS.getState('purchaseTurnFlag') : 0; // 申请转标识

  const currentModal = {}; // 防止多行多个组件实例打开多次

  // 阶梯报价-取消弹窗-刷新头行
  const handleCancelLadderPrice = useCallback(() => {
    initPage();
  }, [initPage]);

  // 报价明细 props
  // const quotationDetailProps = useMemo(
  //   () => ({
  //     sourceFrom: 'RFX',
  //     rfxHeaderId,
  //     detailFrom: 'SUP_QUOTATION', // 针对一些子模块的情况
  //     quotationStatus,
  //     continuousQuotationFlag: headerContinuousQuotationFlag,
  //     onBeforeOpen: handleSaveQuotation, // 打开之前保存页面数据
  //     onOk: handleCancelLadderPrice,
  //     onCancel: handleCancelLadderPrice,
  //   }),
  //   [quotationStatus, headerContinuousQuotationFlag, handleCancelLadderPrice, rfxHeaderId]
  // );

  useEffect(() => {
    fetchConfig();
  }, []);

  // 查询配置表
  const fetchConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId,
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      setConfigSheet({
        configSheet: { sprmOldUiConfig: !isEmpty(data) },
      });
    } catch (e) {
      throw e;
    }
  };

  const linktoPrNumDetail = useCallback(
    (record = {}, prHeaderId) => {
      if (!prHeaderId) {
        return;
      }

      const { sprmOldUiConfig = false } = configSheet || {};
      const { prSourcePlatform } = record.get(['prSourcePlatform']);
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
      let pathUrl = null;

      if (!sprmOldUiConfig) {
        // 记录一个标识, 实现跳转的采购申请工作台明细后,点击返回按钮，返回采购申请工作台主页面的【整单-全部】页签
        // 需要去采购申请工作台去适配此方案
        // NOTE window.ssrc.directionToPurchasePlatform = 'inquiryHallNewUpdate,inquiryHallNewDetail';
        window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';

        // 采购申请工作台
        pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      } else {
        pathUrl = isErp
          ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
          : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
      }

      history.push({
        pathname: pathUrl,
      });
    },
    [history, configSheet]
  );

  // fortmat [] to string
  const formatListToString = useCallback((list = null) => {
    if (isEmpty(list)) {
      return null;
    }

    return list.join(',');
  }, []);

  // before open supplier lov model to query config
  const fetchSourceSupplierRelativeConfigData = useCallback(
    async (options = {}) => {
      if (!rfxHeaderId) {
        return;
      }

      const {
        excludeSupplierDetailFlag = 0, // 是否需要过滤掉已经选择过的供应商 0 = 不过滤， 1 = 过滤
      } = options || {};

      const params = {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
      };
      let result = {};
      try {
        result = await fetchSourceSupplierRelativeConfig(params);
        result = getResponse(result);
        if (!result) {
          return;
        }

        const {
          reviewStatusList = null,
          existSuppliers = null,
          itemCategoryIds = null,
          sourceCode = null,
          erpFlag = null,
          stageIdList = null,
          queryItemIds = null,
          expandObject = null, // 扩展对象
        } = result;

        let nonLocalSupplierList = [];
        if (!isEmpty(existSuppliers)) {
          nonLocalSupplierList = existSuppliers.filter(
            (supplier = {}) => supplier.supplierCompanyId || supplier.supplierId
          );
        }

        result = {
          defaultQueryItemCategoryIds: formatListToString(itemCategoryIds),
          supplyReviewStatus: formatListToString(reviewStatusList),
          sourceCode,
          erpFlag,
          chooseDetailDTOS: sourceMethod === 'INVITE' ? nonLocalSupplierList : null, // 维护，过程控制-反选供应商，线下正选供应商
          stageIdList,
          excludeSupplierDetailDTOS: excludeSupplierDetailFlag ? existSuppliers : null, // 维护，过程控制-反选供应商，线下正选供应商
          queryItemIds,
          ...(expandObject || {}),
          pageSource: PageSourceSymbol.rfxWholeUpdate,
        };
      } catch (e) {
        throw e;
      }

      return result || {};
    },
    [organizationId, rfxHeaderId, sourceMethod]
  );

  // supplier lov select data on ok
  const supplierLovOk = useCallback(
    (options = {}) => {
      const CurrentRecord = lineDS?.current;
      if (!CurrentRecord) {
        return;
      }

      const { currentField = 'supplierCompanyId' } = options || {};
      const supplierLovSelectedData = CurrentRecord?.get(currentField);
      if (isEmpty(supplierLovSelectedData)) {
        notification.warning({
          message: intl
            .get('hzero.common.message.confirm.selected.atLeast')
            .d('请至少选择一行数据'),
        });
        return false;
      }

      updateCurrentLineFields(supplierLovSelectedData, CurrentRecord);
    },
    [lineDS]
  );

  // select lov update current line fields
  const updateCurrentLineFields = (lovData = {}, CurrentRecord = {}) => {
    if (!CurrentRecord) {
      return;
    }

    const {
      supplierId = null,
      supplierNum = null,
      supplierName = null,
      supplierCompanyId = null,
      supplierCompanyName = null,
      supplierCompanyNum = null,
      supplierContactId = null,
      supplierTenantId = null,
      name = null,
      mobilephone = null,
      mail = null,
      internationalTelCode = null,
      stageName = null,
    } = lovData || {};

    const ErrorFlag = !supplierCompanyId && !supplierId && !supplierCompanyName && !supplierName;
    if (ErrorFlag) {
      notification.warning({
        message: intl.get('hzero.common.notification.warn').d('操作异常'),
      });
      return false;
    }

    const supplierTypeText = supplierId && !supplierCompanyId ? 'external' : 'internal';

    CurrentRecord.set('supplierCompanyId', {
      supplierCompanyNum: supplierCompanyNum || supplierNum,
      supplierCompanyId,
      cuxSupplierLovData: lovData,
    });
    CurrentRecord.set('supplierId', supplierId);
    CurrentRecord.set('supplierName', supplierName);
    CurrentRecord.set('supplierNum', supplierNum);
    CurrentRecord.set('supplierCompanyName', {
      supplierCompanyName: supplierCompanyName || supplierName,
    });
    CurrentRecord.set('contactName', name);
    CurrentRecord.set('supplierContactId', supplierContactId);
    CurrentRecord.set('contactMobilephone', mobilephone);
    CurrentRecord.set('supplierType', supplierTypeText);
    CurrentRecord.set('contactMail', mail);
    CurrentRecord.set('internationalTelCode', internationalTelCode);
    CurrentRecord.set('supplierTenantId', supplierTenantId);
    CurrentRecord.set('stageDescription', stageName);
  };

  // supplier lov change value
  const supplierLovChange = useCallback(
    (value) => {
      const CurrentRecord = lineDS?.current;
      if (!CurrentRecord) {
        return;
      }
      if (!value) {
        CurrentRecord.set({
          supplierId: null,
          supplierCompanyId: null,
          supplierName: null,
          supplierNum: null,
          supplierCompanyName: null,
          contactName: null,
          supplierContactId: null,
          contactMobilephone: null,
          supplierType: null,
          contactMail: null,
          internationalTelCode: null,
          supplierTenantId: null,
          stageDescription: null,
        });
      } else {
        const { supplierCompanyId, supplierCompanyName } = value || {};
        const newValue = value || {};
        if (supplierCompanyName && supplierCompanyName === supplierCompanyId) {
          newValue.supplierCompanyId = null;
        }
        updateCurrentLineFields(newValue, CurrentRecord);
      }
    },
    [lineDS]
  );

  // supplier_company_name lov modal ok
  const getSupplierNameLovProps = useCallback(
    (options = {}) => {
      const commonSupplierLovProps = getSupplierLovProps(options) || {};
      commonSupplierLovProps.modalProps = {
        ...(commonSupplierLovProps.modalProps || {}),
        onOk: () =>
          supplierLovOk({
            currentField: 'supplierCompanyName',
          }),
      };

      return commonSupplierLovProps;
    },
    [getSupplierLovProps, companyId, fetchSourceSupplierRelativeConfigData, supplierLovOk]
  );

  // supplier lov props constructor
  const getSupplierLovProps = useCallback(
    (options = {}) => {
      const companyIdValue = companyId?.companyId;
      const queryData = {
        companyId: companyIdValue,
      };

      const supplierLovProps = {
        clearButton: true,
        noCache: true,
        modalProps: {
          style: { maxWidth: '1200px', width: '800px' },
          onOk: supplierLovOk,
        },
        onChange: supplierLovChange,
        disabled: !companyIdValue,
        beforeQuery: fetchSourceSupplierRelativeConfigData,
      };

      return {
        queryData, // 初始化查询参数 body payload
        ...supplierLovProps,
        ...options,
      };
    },
    [companyId, supplierLovOk, fetchSourceSupplierRelativeConfigData, supplierLovChange]
  );

  // ou_id
  const changeOuId = useCallback((value, record) => {
    record.set({
      ouId: {
        ...(value || {}),
        ouId: value?.ouId,
        ouName: value?.ouName,
      },
      invOrganizationId: null,
    });
  }, []);

  // itemCategoryId
  const changeItemCategory = useCallback((value, record) => {
    record.set('itemCategoryId', {
      ...(value || {}),
      categoryId: value?.categoryId,
      categoryName: value?.categoryName,
      itemCategoryId: value?.categoryId,
      itemCategoryName: value?.categoryName,
    });
  }, []);

  // change item lov
  const changeItemId = useCallback(
    (value = null, oldValue, record) => {
      if (!record) {
        return;
      }

      const { event } = offlineEntryRemote || {};
      const currentItemIdValue = value?.partnerItemId || value?.itemId;
      const pristineItemIdValue = oldValue?.itemId;

      if (!pristineItemIdValue && !currentItemIdValue) {
        return;
      }

      record.set('itemId', {
        ...(value || {}),
        itemId: currentItemIdValue,
        itemCode: value?.itemCode,
      });
      record.set('itemCategoryId', {
        categoryId: value?.categoryId,
        categoryName: value?.categoryName,
        itemCategoryId: value?.categoryId,
        itemCategoryName: value?.categoryName,
      });
      record.set('itemName', value?.itemName);
      record.set('referencePrice', value?.referencePrice);
      record.set('specs', value?.specifications);
      record.set('model', value?.model);

      if (event) {
        event.fireEvent('quotationLineTableChangeItemId', {
          record,
          value,
          pageProps: props,
        });
      }

      const uom = {
        uomId: value?.orderUomId || value?.primaryUomId || value?.uomId,
        uomName: value?.uomName || value?.orderUomName,
      };
      const secondaryUom = {
        secondaryUomId: value?.secondaryUomId || value?.uomId,
        secondaryUomName: value?.secondaryUomName || value?.uomName,
      };

      record.set('uomId', uom);
      record.set('secondaryUomId', secondaryUom);
      calculateAllBasicQuantity(record);

      if (pristineItemIdValue && !currentItemIdValue) {
        clearQuotationLineFieldsValue(record);
      }

      if (event) {
        event.fireEvent('remoteHandleSetRecordValueChangeItemId', {
          record,
          value,
          pageProps: props,
        });
      }
    },
    [doubleUnitFlag, lineDS?.current, calculateAllBasicQuantity, clearQuotationLineFieldsValue]
  );

  // 更换物料时，报价行除供应商、币种以外的报价信息清空
  const clearQuotationLineFieldsValue = useCallback(
    (record) => {
      record.set({
        suggestedFlag: null,
        currentQuotationPrice: null,
        currentQuotationSecPrice: null,
        netSecondaryPrice: null,
        localLnQuotationPrice: null,
        localLnQuotationSecPrice: null,
        netPrice: null,
        localLnNetPrice: null,
        localLnNetSecPrice: null,
        currentQuotationQuantity: null,
        currentQuotationSecQuantity: null,
        totalAmount: null,
        netAmount: null,
        taxIncludedFlag: null,
        taxId: null,
        currentDeliveryCycle: null,
        currentExpiryDateFrom: null,
        currentExpiryDateTo: null,
        currentAttachmentUuid: null,
        weightPrice: null,
        currentPerNetPrice: null,
        currentPerNetSecPrice: null,
        currentPerTaxIncludedPrice: null,
        currentPerTaxInclSecPrice: null,
        differentPrice: null,
        paymentTermId: null,
        paymentTypeId: null,
        // quotationCurrencyCode: null,
        exchangeRate: null,
        estimatedPrice: null,
        netEstimatedPrice: null,
        estimatedAmount: null,
        netEstimatedAmount: null,
        currentQuotationRemark: null,
        minPurchaseQuantity: null,
        minPackageQuantity: null,
        freightIncludedFlag: null,
        freightAmount: null,
        allottedQuantity: null,
        allottedSecondaryQuantity: null,
        allottedRatio: null,
        suggestedRemark: null,
        quotedDate: null,
        origin: null,
      });
    },
    [
      // doubleUnitFlag,
    ]
  );

  const changeUomId = (value, record) => {
    if (!record) {
      return;
    }

    dynamicChangePrice(record);
  };

  // 双单位
  const changeSecondaryUomId = useCallback(
    (value, record) => {
      if (!record) {
        return;
      }

      const id = value?.uomId;
      const nameUom = value?.uomCodeAndName || value?.uomName;

      record.set('secondaryUomId', {
        secondaryUomId: id,
        secondaryUomName: nameUom,
      });

      const itemId = record.get('itemId');
      const currentItemIdValue = itemId?.itemId;
      if (!currentItemIdValue) {
        const uom = {
          uomId: id,
          uomName: nameUom,
        };
        record.set('uomId', uom);
      }
      calculateAllBasicQuantity(record);
      dynamicChangePrice(record);
    },
    [calculateAllBasicQuantity, doubleUnitFlag]
  );

  // 行字段变更触发所有数量数量计算 - 物料lov和单位lov任意一个变动都重新计算基本数量
  const calculateAllBasicQuantity = useCallback(
    debounce((record) => {
      const { itemId, secondaryUomId, uomId } = record?.get(['itemId', 'secondaryUomId', 'uomId']);
      const currentItemIdValue = itemId?.itemId;
      const currentSecondaryUomId = secondaryUomId?.secondaryUomId;

      if (!doubleUnitFlag) {
        return;
      }

      if (!currentItemIdValue) {
        const secondaryQuantity = record.get('secondaryQuantity');
        record.set('rfxQuantity', secondaryQuantity);
      }

      const currentUomId = uomId?.uomId;

      if (currentSecondaryUomId !== currentUomId) {
        record.set('priceBatchQuantity', 1);
      }

      if (!currentItemIdValue) {
        // item_id 为空不能查询
        return;
      }

      // 双单位数量
      const QuantityMap = {
        secondaryQuantity: 'rfxQuantity',
        currentQuotationSecQuantity: 'currentQuotationQuantity',
        // allottedSecondaryQuantity: 'allottedQuantity',
      };
      const commonParams = {
        doublePrimaryUomId: currentUomId,
        secondaryUomId: currentSecondaryUomId,
        itemId: currentItemIdValue,
        tenantId: organizationId,
      }; // 掉用批量操作通用参数

      const newData = [];
      Object.keys(QuantityMap).forEach((secondaryField) => {
        const secondaryFieldValue = record.get(secondaryField); // secondary quanity value
        const field = QuantityMap[secondaryField];

        if (isNil(secondaryFieldValue) || !currentSecondaryUomId) {
          record.set(field, secondaryFieldValue ?? null);
          return;
        }

        newData.push({
          ...commonParams,
          secondaryQuantity: secondaryFieldValue,
          businessKey: secondaryField || record?.id,
        });
      });

      if (isEmpty(newData)) {
        return;
      }

      calculateBasicQty(newData).then((result) => {
        if (!result || !result?.length) {
          return;
        }

        result.forEach((obj) => {
          const { businessKey, primaryQuantity } = obj || {};
          if (!QuantityMap[businessKey]) {
            return;
          }
          record.set(QuantityMap[businessKey], primaryQuantity);
        });
      });
    }, 500),
    [doubleUnitFlag, organizationId]
  );

  // 双单位 数量换算
  const changeQuantity = useCallback(
    async (value = null, record = null, currentField = '', changeField = '') => {
      if (!record || !currentField || !changeField) {
        return;
      }

      record.set(currentField, value);
      const { itemId, secondaryUomId, uomId } = record.get(['itemId', 'secondaryUomId', 'uomId']);
      const itemIdValue = itemId?.itemId;
      const uomIdValue = uomId?.uomId;
      const secondaryUomIdValue = secondaryUomId?.secondaryUomId;

      if (!itemIdValue || !secondaryUomIdValue || !doubleUnitFlag) {
        record.set(changeField, value); // 两个数量做相同赋值
        dynamicChangePrice(record);
        return;
      }

      if (doubleFetchDataCurrentFlag) {
        notification.warning({
          message: intl.get('hzero.common.status.pending').d('请求中'),
        });
        return;
      }
      if (secondaryUomIdValue) {
        doubleFetchDataCurrentFlag = 1;
        const res = await calculateBasicQty({
          secondaryQuantity: value,
          itemId: itemIdValue,
          businessKey: currentField || record?.id,
          doublePrimaryUomId: uomIdValue,
          secondaryUomId: secondaryUomIdValue,
        });
        doubleFetchDataCurrentFlag = 0;
        if (isNil(res)) {
          return;
        }
        record.set(changeField, res ?? null);
      }

      dynamicChangePrice(record);
    },
    [doubleUnitFlag, lineDS?.current]
  );

  // 价格批量变更
  const batchPriceChange = useCallback(
    (value = null, record) => {
      const currentValue = value;
      const currentBatchPrice =
        currentValue === 0 || Number(currentValue) === 0 ? null : currentValue;
      record.set('priceBatchQuantity', currentBatchPrice);

      dynamicChangePrice(record);
    },
    [basicFormDS, rfxHeaderId, lineDS, caclRule]
  );

  /**
   * render price or amount by double unit flag
   * */
  const renderPriceOrAmount = useCallback(
    (record, baseField, secondaryField, precissionType = null) => {
      if (!record || !baseField || !secondaryField) {
        return '';
      }
      let currentValue = null;
      const field = !doubleUnitFlag ? baseField : secondaryField;
      currentValue = record.get(field);
      const precision = precissionType ? record.getState(precissionType) : null;
      return numberSeparatorRender(currentValue, precision);
    },
    [doubleUnitFlag]
  );

  // 适用范围
  const viewItemLineApplicationOrgModal = (record = {}) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // 适用范围勾选
  const changeApplicationScopeFlag = useCallback((checked = 0, record) => {
    record.set('applicationScopeFlag', checked ? 1 : 0);
  });

  // 改变价格后统一数据处理
  const changePriceGetCommonProps = (record) => {
    if (!record) {
      return;
    }

    const currentCurrencyPrecision = record.get('defaultPrecision') ?? currencyPrecision;
    const currentFinancialPrecision = record.get('financialPrecision') ?? financialPrecision;

    const {
      priceBatchQuantity,
      taxRate,
      taxIncludedFlag,
      currentQuotationQuantity,
      currentQuotationSecQuantity,
      taxRateType,
    } =
      record?.get([
        'taxIncludedFlag',
        'taxRate',
        'currentQuotationQuantity',
        'currentQuotationSecQuantity',
        'priceBatchQuantity',
        'taxRateType',
      ]) || {};

    // const pristineTaxRate = record.getPristineValue('taxRate');
    const COMMONS = {
      hasTax: !isUnTaxPriceFlag,
      hasMount: true,
      financialPrecision: currentFinancialPrecision,
      defaultPrecision: currentCurrencyPrecision,
      caclRule,
      each: priceBatchQuantity,
      taxRateType,
    };

    const taxRateNew = taxIncludedFlag ? taxRate : null;

    const currentQuantity = !doubleUnitFlag
      ? currentQuotationQuantity
      : currentQuotationSecQuantity;
    COMMONS.quantity = currentQuantity;
    COMMONS.taxRate = taxRateNew ?? 0;
    // 数量不存在，修改计算场景
    if (!currentQuantity) {
      COMMONS.stageRule = 'noQuantity';
    }

    return COMMONS;
  };

  // 按照基准价动态计算价格
  const dynamicChangePrice = (record = {}) => {
    if (!isUnTaxPriceFlag) {
      handleChangeQuotationPrice(record);
    } else {
      handleChangeNetPrice(record);
    }
  };

  // 改变含税后，计算价格
  const handleChangeQuotationPrice = (record) => {
    if (!record) {
      return;
    }

    let currentQuotationPrice = record.get('currentQuotationPrice');
    if (doubleUnitFlag) {
      currentQuotationPrice = record.get('currentQuotationSecPrice');
    }

    const CurrentPriceCOMMONS = {};
    CurrentPriceCOMMONS.taxUnitPrice = currentQuotationPrice;
    const CommonProps = changePriceGetCommonProps(record) || {};
    const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
    const { calcNetUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      netPrice: calcNetUnitPrice,
      totalAmount: calcTaxAmount,
      netAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.netSecondaryPrice = calcNetUnitPrice;
    }

    record.set(priceValueObject);
  };

  // 改变未税含税后，计算价格
  const handleChangeNetPrice = (record) => {
    if (!record) {
      return;
    }

    let netPrice = record.get('netPrice');
    if (doubleUnitFlag) {
      netPrice = record.get('netSecondaryPrice');
    }

    const CurrentPriceCOMMONS = {};
    const CommonProps = changePriceGetCommonProps(record) || {};
    const COMMONS = { ...CommonProps, ...CurrentPriceCOMMONS };
    COMMONS.netUnitPrice = netPrice;
    const { calcTaxUnitPrice, calcTaxAmount, calcNetAmount } = amountCalculation(COMMONS) || {};

    const priceValueObject = {
      currentQuotationPrice: calcTaxUnitPrice,
      totalAmount: calcTaxAmount,
      netAmount: calcNetAmount,
    };

    if (doubleUnitFlag) {
      priceValueObject.currentQuotationSecPrice = calcTaxUnitPrice;
    }

    record.set(priceValueObject);
  };

  // change currency
  const changeCurrency = (data = {}, record) => {
    const {
      currencyCode,
      currencyName,
      defaultPrecision,
      financialPrecision: currentFinancialPrecision,
    } = data || {};

    record.set({
      quotationCurrencyCode: { quotationCurrencyCode: currencyCode, currencyCode, currencyName },
      defaultPrecision,
      financialPrecision: currentFinancialPrecision,
    });

    dynamicChangePrice(record);
  };

  // 改变税率
  const changeTax = (data, record) => {
    const { taxRate = null, taxId = null, taxRateType } = data || {};
    record.set('taxId', { ...(data || {}), taxId, taxRate });
    record.set('taxRateType', taxRateType);
    dynamicChangePrice(record);
  };

  // 改变含税标识
  const onChangeTaxIncludedFlag = (result, record) => {
    if (!result) {
      record.set('taxId', null);
      record.set('taxRate', null);
      record.set('taxRateType', null);
    }
    dynamicChangePrice(record);
  };

  // 修改可供数量
  const changeCurrentQuotationQuantity = (record) => {
    dynamicChangePrice(record);
  };

  // 价格标红
  const priceRedRender = ({ name, record, dom }) => {
    const colorRemote = offlineEntryRemote
      ? offlineEntryRemote?.process('SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_PROCESS_PRICE_COLOR', 'red')
      : 'red';
    const _dom = (
      <span style={record.get('priceRedFlag') === 1 ? { color: colorRemote } : null}>{dom}</span>
    );
    const a = doubleUnitFlag && hasTaxFlag && name === 'currentQuotationSecPrice';
    const b = !doubleUnitFlag && hasTaxFlag && name === 'currentQuotationPrice';
    const c = doubleUnitFlag && !hasTaxFlag && name === 'netSecondaryPrice';
    const d = !doubleUnitFlag && !hasTaxFlag && name === 'netPrice';
    if (a || b || c || d) return _dom;
    return dom;
  };

  // table column
  const columns = useMemo(() => {
    const allColumns = [
      {
        name: 'suggestedFlag',
        width: 80,
        editor: true,
        lock: 'left',
        align: 'center',
      },
      doubleUnitFlag
        ? {
            name: 'currentQuotationSecPrice',
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationSecPrice"
                  record={record}
                  currency="quotationCurrencyCode"
                  onChange={() => handleChangeQuotationPrice(record)}
                />
              );
            },
            // renderer: ({ value }) => numberSeparatorRender(value),
            renderer: ({ value, dataSet, record, name }) => (
              <Tooltip
                placement="topLeft"
                title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
              >
                <div>
                  {priceRedRender({
                    record,
                    name,
                    dom: numberSeparatorRender(
                      value,
                      record.get('defaultPrecision') ?? dataSet.getState('precision')
                    ),
                  })}
                </div>
              </Tooltip>
            ),
          }
        : null,
      {
        name: 'currentQuotationPrice',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="currentQuotationPrice"
              record={record}
              currency="quotationCurrencyCode"
              onChange={() => handleChangeQuotationPrice(record)}
            />
          );
        },
        renderer: ({ value, dataSet, record, name }) => (
          <Tooltip
            placement="topLeft"
            title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
          >
            <div>
              {priceRedRender({
                record,
                name,
                dom: numberSeparatorRender(
                  value,
                  record.get('defaultPrecision') ?? dataSet.getState('precision')
                ),
              })}
            </div>
          </Tooltip>
        ),
      },
      {
        name: 'localLnQuotationPrice',
        width: 150,
        renderer: ({ record, name }) =>
          renderPriceOrAmount(record, name, 'localLnQuotationSecPrice'),
      },
      doubleUnitFlag
        ? {
            name: 'netSecondaryPrice',
            width: 150,
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="netSecondaryPrice"
                  record={record}
                  currency="quotationCurrencyCode"
                  onChange={() => handleChangeNetPrice(record)}
                />
              );
            },
            renderer: ({ value, dataSet, record, name }) => (
              <Tooltip
                placement="topLeft"
                title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
              >
                <div>
                  {priceRedRender({
                    record,
                    name,
                    dom: numberSeparatorRender(
                      value,
                      record.get('defaultPrecision') ?? dataSet.getState('precision')
                    ),
                  })}
                </div>
              </Tooltip>
            ),
          }
        : null,
      {
        name: 'netPrice',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="netPrice"
              record={record}
              currency="quotationCurrencyCode"
              onChange={() => handleChangeNetPrice(record)}
            />
          );
        },
        // renderer: ({ value }) => numberSeparatorRender(value),
        renderer: ({ value, dataSet, record, name }) => (
          <Tooltip
            placement="topLeft"
            title={getQuotationTooltipTitle(record.get('priceReadonlyFlag') === 1)}
          >
            <div>
              {priceRedRender({
                record,
                name,
                dom: numberSeparatorRender(
                  value,
                  record.get('defaultPrecision') ?? dataSet.getState('precision')
                ),
              })}
            </div>
          </Tooltip>
        ),
      },
      {
        name: 'localLnNetPrice',
        width: 150,
        renderer: ({ record, name }) => renderPriceOrAmount(record, name, 'localLnNetSecPrice'),
      },
      {
        name: 'currentQuotationQuantity',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="currentQuotationQuantity"
              type="c7n-pro"
              record={record}
              uom="uomId"
              onChange={() => changeCurrentQuotationQuantity(record)}
            />
          );
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      doubleUnitFlag
        ? {
            name: 'currentQuotationSecQuantity',
            width: 150,
            editor: (record, name) => {
              return (
                <C7nPrecisionInputNumber
                  name="currentQuotationSecQuantity"
                  type="c7n-pro"
                  record={record}
                  uom="secondaryUomId"
                  onChange={(val) => changeQuantity(val, record, name, 'currentQuotationQuantity')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'totalAmount',
        width: 140,
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('financial_precision')),
      },
      {
        name: 'netAmount',
        width: 140,
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('financial_precision')),
      },
      {
        name: 'taxIncludedFlag',
        width: 140,
        editor: (record) => {
          return (
            <CheckBox
              name="taxIncludedFlag"
              record={record}
              onChange={(e) => onChangeTaxIncludedFlag(e, record)}
            />
          );
        },
      },
      {
        name: 'taxId',
        width: 140,
        align: 'right',
        editor: (record) => {
          return (
            <Lov
              record={record}
              name="taxId"
              paramMatcher={({ text }) => {
                return !isNaN(text) ? { taxRate: text } : { taxCode: text };
              }}
              onChange={(val) => changeTax(val, record)}
            />
          );
        },
      },
      {
        editor: true,
        width: 150,
        name: 'demandDate',
      },
      {
        name: 'priceBatchQuantity',
        width: 150,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="priceBatchQuantity"
              type="c7n-pro"
              record={record}
              currency="quotationCurrencyCode"
              onChange={(e) => batchPriceChange(e, record)}
            />
          );
        },
        renderer: ({ record, value }) => {
          if (isNil(value) || value === 0 || value === '0') {
            return intl.get('ssrc.common.pleaseEnterGreatThanZeroNumber').d('请输入大于0的数值');
          }
          return numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true, // 不补零标识
          });
        },
      },
      {
        name: 'currentDeliveryCycle',
        width: 150,
        editor: true,
      },
      {
        name: 'currentExpiryDateFrom',
        width: 180,
        editor: true,
      },
      {
        name: 'currentExpiryDateTo',
        width: 180,
        editor: true,
      },
      {
        name: 'stageDescription',
        width: 180,
        editor: false,
      },
      {
        name: 'currentAttachmentUuid',
        width: 140,
        editor: true,
      },
      {
        name: 'supplierCompanyId',
        width: 160,
        editor: () => {
          const { ...resetProps } = getSupplierLovProps() || {};
          return (
            <SupplierLov
              {...resetProps}
              dataSet={lineDS}
              // valueChangeAction="input"
              restrict="\S"
            />
          );
        },
      },
      {
        name: 'priceCoefficient',
        width: 100,
        editor: true,
      },
      {
        name: 'weightPrice',
        width: 140,
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'supplierCompanyName',
        width: 180,
        editor: (record) => {
          const { ...supplierCompanyNameResetProps } = getSupplierNameLovProps() || {};
          const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
          return supplierCompanyNum || !allowInputSupplierNameFlag ? (
            false
          ) : (
            <SupplierLov
              {...supplierCompanyNameResetProps}
              name="supplierCompanyName"
              dataSet={lineDS}
              combo
              valueChangeAction="input"
              restrict="\S"
            />
          );
        },
      },
      {
        name: 'currentPerNetPrice',
        width: 140,
        editor: false,
        renderer: ({ record, name }) => renderPriceOrAmount(record, name, 'currentPerNetSecPrice'),
      },
      {
        name: 'currentPerTaxIncludedPrice',
        width: 140,
        editor: false,
        renderer: ({ record, name }) =>
          renderPriceOrAmount(record, name, 'currentPerTaxInclSecPrice'),
      },
      {
        name: 'referencePrice',
        width: 140,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="weightPrice"
              type="c7n-pro"
              record={record}
              currency="quotationCurrencyCode"
            />
          );
        },
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'differentPrice',
        width: 140,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'paymentTermId',
        width: 140,
        editor: true,
      },
      {
        name: 'paymentTypeId',
        width: 140,
        editor: true,
      },
      {
        name: 'quotationCurrencyCode',
        width: 140,
        editor: (record) => {
          return (
            <Lov
              name="quotationCurrencyCode"
              record={record}
              onChange={(val) => changeCurrency(val, record)}
            />
          );
        },
      },
      {
        name: 'exchangeRate',
        width: 140,
        editor: true,
      },
      {
        name: 'estimatedPrice',
        width: 140,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netEstimatedPrice',
        width: 140,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'estimatedAmount',
        width: 140,
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'netEstimatedAmount',
        width: 140,
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentQuotationRemark',
        editor: true,
        width: 180,
      },
      {
        name: 'rfxLineItemNum',
        width: 80,
        lock: 'left',
      },
      {
        name: 'ouId',
        width: 150,
        editor: (record) => {
          return <Lov name="ouId" record={record} onChange={(val) => changeOuId(val, record)} />;
        },
      },
      {
        editor: true,
        name: 'invOrganizationId',
        width: 150,
      },
      {
        name: 'itemId',
        width: 150,
        editor: (record) => {
          return (
            <Lov
              name="itemId"
              record={record}
              onChange={(val, oldVal) => changeItemId(val, oldVal, record)}
            />
          );
        },
      },
      {
        name: 'itemName',
        editor: true,
        width: 150,
      },
      {
        name: 'itemCategoryId',
        editor: (record) => {
          return (
            <Lov
              editor
              dataSet={lineDS}
              name="itemCategoryId"
              tableProps={{
                selectionMode: 'rowbox',
                // virtual: true,
                // style: {
                //   maxHeight: '500px',
                // },
              }}
              onChange={(value) => changeItemCategory(value, record)}
            />
          );
        },
        width: 150,
      },
      {
        name: 'uomId',
        width: 150,
        editor: (record) => {
          return <Lov name="uomId" record={record} onChange={(val) => changeUomId(val, record)} />;
        },
      },
      doubleUnitFlag
        ? {
            editor: (record) => {
              return (
                <Lov
                  name="secondaryUomId"
                  record={record}
                  onChange={(val) => changeSecondaryUomId(val, record)}
                />
              );
            },
            name: 'secondaryUomId',
            width: 150,
            ignore: 'always',
          }
        : null,
      {
        name: 'origin',
        editor: true,
        width: 150,
      },
      {
        editor: true,
        name: 'currentPromisedDate',
        width: 150,
      },
      {
        name: 'rfxQuantity',
        width: 140,
        editor: (record) => {
          return <C7nPrecisionInputNumber name="rfxQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ record, value }) =>
          doubleUnitFlag && record.get('itemId')
            ? numberSeparatorRender(value)
            : numberSeparatorRender(value, record.getState('uom_precision')),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 140,
            editor: (record, name) => {
              return (
                <C7nPrecisionInputNumber
                  name="secondaryQuantity"
                  record={record}
                  uom="secondaryUomId"
                  onChange={(val) => changeQuantity(val, record, name, 'rfxQuantity')}
                />
              );
            },
            renderer: ({ record, value }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : null,
      {
        name: 'minPurchaseQuantity',
        width: 140,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="minPurchaseQuantity"
              record={record}
              uom={doubleUnitFlag ? 'secondaryUomId' : 'uomId'}
            />
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        name: 'minPackageQuantity',
        width: 140,
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="minPurchaseQuantity"
              record={record}
              uom={doubleUnitFlag ? 'secondaryUomId' : 'uomId'}
            />
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      {
        editor: true,
        name: 'freightIncludedFlag',
        width: 150,
      },
      {
        name: 'freightAmount',
        width: 140,
        editor: (record) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = offlineEntryRemote
            ? offlineEntryRemote.process(
                'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_PROCESS_ALL_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return (
            <C7nPrecisionInputNumber
              name="freightAmount"
              type="c7n-pro"
              record={record}
              financial="quotationCurrencyCode"
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        editor: false,
        name: 'quotedDate',
        width: 150,
      },
      {
        editor: true,
        name: 'specs',
        width: 150,
      },
      {
        editor: (record) => (
          <C7nPrecisionInputNumber name="allottedQuantity" record={record} uom="uomId" />
        ),
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
        name: 'allottedQuantity',
        width: 140,
      },
      doubleUnitFlag
        ? {
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber
                  name="allottedSecondaryQuantity"
                  record={record}
                  uom="secondaryUomId"
                  // onChange={(val) => changeQuantity(val, record, name, 'allottedQuantity')}
                />
              );
            },
            renderer: ({ value, record }) =>
              numberSeparatorRender(value, record.getState('uom_precision')),
            name: 'allottedSecondaryQuantity',
            width: 140,
          }
        : null,
      {
        editor: true,
        name: 'allottedRatio',
        width: 140,
      },
      {
        editor: true,
        name: 'suggestedRemark',
        width: 150,
      },
      purchaseTurnFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => {
              const { prData, prHeaderId } = record.get(['prData', 'prHeaderId']);

              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a onClick={() => linktoPrNumDetail(record, prItem?.prHeaderId)}>
                        {`${prItem?.displayPrNum}|${prItem?.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return <a onClick={() => linktoPrNumDetail(record, prHeaderId)}>{value}</a>;
                }
              } else {
                return value;
              }
            },
          }
        : null,
      {
        name: 'applicationScopeFlag',
        width: 140,
        renderer: ({ value, record }) => {
          const { rfxLineItemId = null } = record?.get(['rfxLineItemId', 'applicationScopeFlag']);

          const currentProps = {
            name: 'applicationScopeFlag',
            checkboxProps: {
              disabled: !rfxLineItemId,
              onChange: (checked) => changeApplicationScopeFlag(checked, record),
              defaultChecked: value,
              checked: value,
            },
          };

          return (
            <CheckBoxWithLinkRender {...currentProps}>
              <a
                disabled={!value || !rfxLineItemId}
                style={{ marginLeft: '8px' }}
                onClick={() => viewItemLineApplicationOrgModal(record)}
              >
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
                  .d('适用其他组织')}
              </a>
            </CheckBoxWithLinkRender>
          );
        },
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        editor: true,
      },
      {
        name: 'ladderLevel',
        width: 100,
        renderer: ({ record }) => {
          const { ladderInquiryFlag, ladderInquiryRequire, offlineQuoLineId } = record.get([
            'ladderInquiryFlag',
            'ladderInquiryRequire',
            'offlineQuoLineId',
          ]);

          if (!ladderInquiryFlag) {
            return;
          }

          const currentProps = {
            customizeTable,
            doubleUnitFlag,
            currentModal,
            customizeFlag: 0, // 取消个性化
            customizedCode: 'SSRC.INQUIRY_HALL_WHOLE_EDIT.LADDER_PRICE_EDITOR', // todo：ui非让加表格设置，如果后续加了个性化请把此处用户个性化删掉
            lineIdName: 'offlineQuoLineId',
            lineId: offlineQuoLineId,
            lineDataSet: lineDS,
            offlineEntryRemote,
            // customizeUnitCode: getCustomizeUnitCode('ladderTable'), // 先不做个性化，产能不足
          };

          return (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {ladderInquiryFlag === 1 ? (
                <LadderPriceEditor
                  pageSymbol="wholeOfflineUpdate"
                  readOnly={false}
                  disabled={!offlineQuoLineId}
                  onBeforeOpen={save} // 打开页面之前保存数据
                  onCancel={handleCancelLadderPrice}
                  record={record}
                  headerDS={basicFormDS}
                  organizationId={organizationId}
                  {...currentProps}
                />
              ) : (
                '-'
              )}
              {ladderInquiryRequire === 1 ? (
                <Badge style={{ marginLeft: '4px' }} status="error" />
              ) : (
                ''
              )}
            </span>
          );
        },
      },
    ].filter(Boolean);
    return offlineEntryRemote
      ? offlineEntryRemote.process(
          'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_TABLE_PROCESS_COLUMNS',
          allColumns,
          {
            lineDS,
            basicFormDS,
          }
        )
      : allColumns;
  }, [
    basicFormDS,
    doubleUnitFlag,
    customizeTable,
    getSupplierLovProps,
    getSupplierNameLovProps,
    purchaseTurnFlag,
    companyId,
    changeItemId,
    changeQuantity,
    changeSecondaryUomId,
    changeItemCategory,
    changeOuId,
    batchPriceChange,
    renderPriceOrAmount,
    viewItemLineApplicationOrgModal,
    handleCancelLadderPrice,
    save,
    currentModal,
    allowInputSupplierNameFlag,
    isUnTaxPriceFlag,
    currencyPrecision,
    financialPrecision,
    suggestedDimension,
    caclRule,
  ]);

  // 从个人中心获取默认值
  const getDefaultValueFormUserConfig = () => {
    const { userCheck = null } = defaultConfig || {};
    let defaultValue = {};
    if (userCheck?.enabledFlag) {
      const {
        ouId = null,
        ouName = null,
        organizationName = null,
        organizationId: invOrganizationId = null,
      } = userCheck || {};
      defaultValue = Object.assign(
        {},
        {
          ouId: ouId || null, // 业务实体id
          ouName: ouName || null, // 业务实体
          invOrganizationId: invOrganizationId || null, // 库存组织id
          invOrganizationName: organizationName || null, // 库存组织
        }
      );
    }

    return defaultValue;
  };

  // create line
  const createLine = useCallback(() => {
    const { currencyCode, paymentTypeId, paymentTermId } = basicFormDS.current
      ? basicFormDS.current.get(['currencyCode', 'paymentTermId', 'paymentTypeId'])
      : {};

    const defaultValue = getDefaultValueFormUserConfig() || {};

    const newLine = {
      ...(paymentTypeId || {}),
      ...(paymentTermId || {}),
      ...defaultValue,
      quotationCurrencyCode: currencyCode?.currencyCode,
      financialPrecision,
      currencyPrecision,
    };
    lineDS.create(newLine, 0);
  }, [lineDS, basicFormDS?.current, defaultConfig, financialPrecision, currencyPrecision]);

  // 物料与供应商 modal close
  const handleViewItemSupplierCancel = useCallback(
    throttle(() => {
      if (resetBatchMainRecord) {
        resetBatchMainRecord();
      }

      if (lineDS) {
        lineDS.loadData();
        lineDS.clearCachedRecords();
        lineDS.clearCachedModified();
        lineDS.clearCachedSelected();
      }
      initPage();
    }, 500),
    [lineDS, handleViewItemSupplierCancel]
  );

  // // 物料与供应商 modal ok
  // const handleViewItemSupplierOk = useCallback(
  //   throttle(() => {
  //     console.log(itemRef);

  //     return false;
  //     // initPage();
  //   }, 500),
  //   []
  // );

  // 物料与供应商查看
  const viewItemSupplier = useCallback(
    throttle(async () => {
      const commonProps = {
        organizationId,
        doubleUnitFlag,
        rfxHeaderId,
        custLoading,
        customizeTable,
        history,
        basicFormDS,
        lineDS,
        templateId,
        companyId: companyId?.companyId,
        customizeForm,
        taxChangeFlag,
        settings,
        applyToInquiryNewFlag,
        allowInputSupplierNameFlag,
      };

      const itemProps = {
        ...commonProps,
        customizeUnitCode: getCustomizeUnitCode('itemTable'),
        btnCustomizeUnitCode: getCustomizeUnitCode('itemTableBtns'),
        batchCreateCustomizaUnitCode: getCustomizeUnitCode('itemTableCreate'),
        maintainCustomizaUnitCode: getCustomizeUnitCode('itemTableCreate'),
        linktoPrNumDetail,
        purchaseTurnFlag,
        viewApplicationOrgModal,
        getDefaultValueFormUserConfig,
      };
      const supplierProps = {
        ...commonProps,
        btnCustomizeUnitCode: getCustomizeUnitCode('supplierTableBtns'),
        customizeUnitCode: getCustomizeUnitCode('supplierTable'),
        fetchSourceSupplierRelativeConfigData,
      };

      const itemLineDS = new DataSet(
        offlineEntryRemote
          ? offlineEntryRemote.process(
              'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_QUOTATION_LINE_ITEM_CHANGE',
              itemLineDataSet(itemProps)
            )
          : itemLineDataSet(itemProps)
      );
      const supplierDS = new DataSet(supplierLineDS(supplierProps));

      itemLineDS.setState('settings', settings);
      itemLineDS.setState('doubleUnitFlag', doubleUnitFlag);
      itemLineDS.setState('disabledChangeItemFlag', false); // TODO 埋点，后续统一控制行数据逻辑

      return uModal.open({
        destroyOnClose: true,
        closable: true,
        drawer: true,
        title: intl
          .get(`ssrc.inquiryHall.view.message.tab.itemDetailsAndSuppliers`)
          .d('物料与供应商'),
        children: (
          <div>
            <Items
              {...itemProps}
              itemLineDS={itemLineDS}
              contentRef={itemRef}
              lineDS={lineDS}
              basicFormDS={basicFormDS}
              offlineEntryRemote={offlineEntryRemote}
            />
            <Suppliers {...supplierProps} supplierDS={supplierDS} contentRef={supplierRef} />
          </div>
        ),
        okButton: false,
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        cancelProps: { color: 'primary' },
        // okText: intl.get('hzero.common.button.save').d('保存'),
        onCancel: handleViewItemSupplierCancel,
        // onOk: handleViewItemSupplierOk,
        onClose: handleViewItemSupplierCancel,
        style: { width: '1090px' },
      });
    }, 1000),
    [
      applyToInquiryNewFlag,
      taxChangeFlag,
      getCustomizeUnitCode,
      organizationId,
      doubleUnitFlag,
      rfxHeaderId,
      custLoading,
      customizeTable,
      basicFormDS,
      history,
      lineDS,
      companyId,
      templateId,
      linktoPrNumDetail,
      purchaseTurnFlag,
      viewApplicationOrgModal,
      settings,
      fetchSourceSupplierRelativeConfigData,
      handleViewItemSupplierCancel,
      // handleViewItemSupplierOk,
      defaultConfig,
      resetBatchMainRecord,
      allowInputSupplierNameFlag,
    ]
  );

  // 复制
  const copyLine = useCallback(() => {
    const { selected } = lineDS || {};
    if (isEmpty(selected)) {
      notification.warning({
        message: intl.get('ssrc.common.pleaseSelectItemLinesToCopy').d('请勾选要复制的行!'),
      });
      return;
    }

    const lines = selected.map((select) => select.toData());
    lines.forEach((line = {}) => {
      const newItemLine = {
        ...line,
        rfxLineItemId: null,
        currentAttachmentUuid: null,
        offlineQuoLineId: null,
        offlineQuoHeaderId: null,
        rfxLineSupplierId: null,
        supplierCompanyId: null,
        supplierId: null,
        supplierNum: null,
        supplierName: null,
        supplierCompanyNum: null,
        supplierCompanyName: null,
        supplierContactId: null,
        contactName: null,
        contactMobilephone: null,
        contactMail: null,
        internationalTelCode: null,
        supplierTenantId: null,
        stageDescription: null,
        ladderInquiryRequire: 0,
        ladderQuotationFlag: 0, // 当前价格是否在阶梯报价区间内
      };
      lineDS.create(newItemLine, 0);
    });

    lineDS.unSelectAll();
    lineDS.clearCachedSelected();
  }, [lineDS?.selected]);

  // delete
  const deleteLines = useCallback(
    debounce(() => {
      const selectedData = lineDS.selected;
      if (!selectedData?.length) {
        return;
      }

      const addData = [];
      const oldData = [];
      const prData = [];

      selectedData.forEach((newItem) => {
        const { offlineQuoLineId, prHeaderId } = newItem.get(['offlineQuoLineId', 'prHeaderId']);
        if (!offlineQuoLineId) {
          addData.push(newItem);
          return;
        }
        if (prHeaderId) {
          prData.push(newItem);
        }

        oldData.push(newItem);
      });

      if (addData.length) {
        lineDS.remove(addData, 1);
      }
      if (oldData.length) {
        lineDS
          .delete(oldData, {
            title: intl.get('ssrc.common.message.tip').d('提示'),
            children: !prData.length
              ? intl.get('ssrc.common.view.delete_selected_row_confirm').d('确认删除选中行？')
              : intl
                  .get('ssrc.common.view.warning.deleteLineHasPr')
                  .d('当前要删除的行包含申请转行数据,确认删除'),
          })
          .then(async (res) => {
            if (getResponse(res)) {
              initPage(true);
            }
          });
      }
    }, 800),
    [lineDS, initPage]
  );

  // 导入
  const ImportProps = useMemo(
    () => ({
      businessObjectTemplateCode: 'SSRC_OFFLINE_WHOLE_IMPORT',
      prefixPatch: SRM_SSRC,
      refreshButton: true,
      name: 'lineImport',
      args: {
        tenantId: organizationId,
        organizationId,
        rfxHeaderId,
        templateCode: 'SSRC_OFFLINE_WHOLE_IMPORT',
        customizeUnitCode: tableUnitCode,
        fromExport: true,
      },
      customeImportTemplate: {
        templateCode: 'SSRC_OFFLINE_WHOLE_EXPORT',
        requestUrl: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/line-export?rfxHeaderId=${rfxHeaderId}`,
        queryArea: { fillerType: 'multi-sheet', async: false },
      },
      buttonProps: {
        funcType: 'flat',
        icon: 'archive',
        color: 'primary',
        disabled: !companySavedFlag || !headerCurrencyCode,
        // permissionList: [
        //   {
        //     code: `${path}.button.line-import`.toLowerCase(),
        //     type: 'button',
        //     meaning:
        //       intl
        //         .get(`ssrc.supplierQuotation.view.message.title.offlineWholeInput`)
        //         .d('线下整单录入') - intl.get(`ssrc.inquiryHall.view.button.import`).d('导入'),
        //   },
        // ],
      },
      buttonText: intl.get(`ssrc.inquiryHall.view.button.import`).d('导入'),
      buttonTooltip: intl
        .get('ssrc.inquiryHall.view.message.tipsBeforeImport')
        .d('请先点击头上的保存后再导入'),
      autoRefreshInterval: 5000,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      auto: true,
      successCallBack: () => {
        lineDS.reset();
        lineDS.clearCachedRecords();
        initPage();
      },
    }),
    [
      organizationId,
      rfxHeaderId,
      lineDS,
      initPage,
      tableUnitCode,
      initPage,
      companySavedFlag,
      headerCurrencyCode,
    ]
  );

  // table buttons
  const getButtons = useCallback(() => {
    const buttons = [
      <TooltipButtonPro
        icon="playlist_add"
        onClick={createLine}
        name="create"
        disabled={!companySavedFlag}
        help={intl.get('ssrc.common.view.message.save.tip').d('请先保存')}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="itemSupplier"
        onClick={viewItemSupplier}
        icon="view_list-o"
        disabled={!companySavedFlag}
        wait={500}
        waitType="debounce"
        help={intl.get('ssrc.common.view.message.save.tip').d('请先保存')}
      >
        {intl.get('ssrc.inquiryHall.model.inquiryHall.button.itemsAndSuppliers').d('物料与供应商')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        onClick={copyLine}
        disabled={!lineDS?.selected?.length || !companySavedFlag}
        icon="content_copy"
        name="copy"
        help={intl
          .get('ssrc.common.view.message.result-entry-line.select.tip')
          .d('请先勾选结果录入行')}
      >
        {intl.get('hzero.common.button.copy').d('复制')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="delete"
        icon="delete_sweep"
        disabled={isEmpty(lineDS.selected)}
        onClick={deleteLines}
        help={intl
          .get('ssrc.common.view.message.result-entry-line.select.tip')
          .d('请先勾选结果录入行')}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </TooltipButtonPro>,
      <BatchMaintain
        name="batch"
        disabled={(!lineDS?.length && !lineDS?.cachedRecords?.length) || !companySavedFlag}
        organizationId={organizationId}
        text={
          isEmpty(lineDS.selected)
            ? intl.get(`ssrc.offlineResultEntry.view.button.batchMaintenance`).d('批量维护')
            : intl.get(`ssrc.offlineResultEntry.view.button.batchEditorSelected`).d('勾选批量编辑')
        }
        title={
          isEmpty(lineDS?.all)
            ? intl
                .get('ssrc.common.view.message.result-entry-line.batch-edit.add.tip')
                .d('针对全部数据进行批量编辑。请先新增结果录入行')
            : isEmpty(lineDS?.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: lineDS.selected?.length,
                })
                .d(`已勾选${lineDS.selected?.length}条数据进行批量编辑`)
        }
        lineDS={lineDS}
        basicFormDS={basicFormDS}
        confirmBatchMaintain={confirmBatchMaintain}
        customizeForm={customizeForm}
        offlineEntryRemote={offlineEntryRemote}
        customizeUnitCode={getCustomizeUnitCode('batchMaintain')}
        fetchSourceSupplierRelativeConfigData={fetchSourceSupplierRelativeConfigData}
        allowInputSupplierNameFlag={allowInputSupplierNameFlag}
      />,
      <CommonImportNew {...ImportProps} />,
      <SortByMaterialAndPrice name="sortByPrice" lineDS={lineDS} />,
    ];
    // otherProps 二开需要的参数-['daqo']
    const otherProps = {
      basicFormDS,
      lineDS,
    };
    return offlineEntryRemote
      ? offlineEntryRemote.process(
          'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_QUOTATION_LINE_BUTTONS',
          buttons,
          otherProps
        )
      : buttons;
  }, [
    companySavedFlag,
    lineDS,
    lineDS?.selected,
    ImportProps,
    copyLine,
    deleteLines,
    createLine,
    confirmBatchMaintain,
    organizationId,
    basicFormDS,
    fetchSourceSupplierRelativeConfigData,
    getCustomizeUnitCode,
    allowInputSupplierNameFlag,
    viewItemSupplier,
    isUnTaxPriceFlag,
    headerCurrencyCode,
  ]);

  // line table
  const tableContent = useCallback(() => {
    return (
      <Table
        clearButton
        bordered
        custLoading={custLoading}
        dataSet={lineDS}
        rowKey="offlineQuoLineId"
        virtual={false}
        virtualCell={false}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        columns={columns}
        buttons={getButtons()}
      />
    );
  }, [
    basicFormDS,
    custLoading,
    lineDS,
    lineDS.status,
    lineDS?.length,
    columns,
    getButtons,
    allowInputSupplierNameFlag,
    caclRule,
  ]);

  return (
    <div className={Styles['quotation-table']}>
      {customizeTable(
        { code: tableUnitCode, buttonCode: getCustomizeUnitCode('tableButtons') },
        tableContent()
      )}
    </div>
  );
};

const hocComponent = (Com) => {
  return observer(Com);
};

export default hocComponent(QuotationLineTable);
