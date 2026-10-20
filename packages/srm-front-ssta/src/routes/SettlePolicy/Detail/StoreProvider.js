/*
 * @Description: 结算策略详情——Context
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, {
  createContext,
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import { useDataSet, ModalProvider } from 'choerodon-ui/pro';
import { isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

import {
  payRuleDS,
  headerDS,
  dimensionDS,
  approveMethodDS,
  payOprPermissionDS,
  payDefaultAmountDS,
  collaborativeModeDS,
  conditionSelectDS,
} from '@/stores/SettleStrategyDS';
import { getEnablePayConfig, getTermEnableFundConfig } from '@/services/settleStrategyServices';
import { getBankLovConfig, getCreateSelectConfig } from '@/utils/api';
import { useErrIndex, useErrorsMap } from './hooks';

export const Store = createContext();

const changedModalReducer = (state, payload) => {
  return isArray(payload) ? payload : [...state, payload];
};

export default (props) => {
  const {
    children,
    history,
    sourceCode,
    match = {},
    location = {},
    settleConfigId: propSettleConfigId,
  } = props;
  const { pathname, state, search = '' } = location;
  const { params = {} } = match;
  const refsMap = useRef({}); // 收集锚点dom
  const isPlat = !isTenantRoleLevel(); // 平台级策略菜单判断
  const { operate, settleConfigId: paramSettleConfigId } = params;
  const allFlag = operate === 'all';
  const editFlag = operate === 'edit'; // 新建、编辑
  const historyFlag = operate === 'history'; // 历史版本
  const componentFlag = propSettleConfigId; // 引用结算策略详情组件预留判断
  const settleConfigId = propSettleConfigId || paramSettleConfigId;
  const platModalFlag = sourceCode === 'platModal'; // 租户预览平台策略详情
  const [activeKey, setActiveKey] = useState('base');
  const [errIndexsMap, emitErrIndex] = useErrIndex(activeKey);
  const [errorsMap, emitErrorsMap] = useErrorsMap(emitErrIndex);
  const [changedModals, emitChangeModals] = useReducer(changedModalReducer, []);
  const [fundEnableFlag, setFundEnableFlag] = useState(0);
  const [payEnableFlag, setPayEnableFlag] = useState(0);
  const [supBankInfoValidityControlFlag, setSupBankInfoValidityControlFlag] = useState(0);
  // 对账发票付款单据行数配置表配置
  const [documentLineConfig, setDocumentLineConfig] = useState([]);
  // 协同模式
  const billCollaborativeModeDs = useDataSet(
    () => collaborativeModeDS('BILL', platModalFlag, 'billModeId'),
    [platModalFlag]
  );
  const payCollaborativeModeDs = useDataSet(
    () => collaborativeModeDS('PAYMENT', platModalFlag, 'collaborativeModeId'),
    [platModalFlag]
  );
  const invCollaborativeModeDs = useDataSet(
    () => collaborativeModeDS('INVOICE', platModalFlag, 'collaborativeModeId'),
    [platModalFlag]
  );
  // 审批方式
  const billApproveMethodDs = useDataSet(() => approveMethodDS('BILL', platModalFlag), [
    platModalFlag,
  ]);
  const invApproveMethodDs = useDataSet(() => approveMethodDS('INVOICE', platModalFlag), [
    platModalFlag,
  ]);
  const payApproveMethodDs = useDataSet(() => approveMethodDS('PAYMENT', platModalFlag), [
    platModalFlag,
  ]);
  // 对账维度
  const billDimensionDs = useDataSet(() => dimensionDS('BILL', platModalFlag), [platModalFlag]);
  const invDimensionDs = useDataSet(() => dimensionDS('INVOICE', platModalFlag), [platModalFlag]);
  const payDimensionDs = useDataSet(() => dimensionDS('PAYMENT', platModalFlag), [platModalFlag]);
  // 付款操作权限
  const payOprPermissionDs = useDataSet(() => payOprPermissionDS('PAYMENT', platModalFlag), [
    platModalFlag,
  ]);
  // 付款规则
  const payRuleDs = useDataSet(() => payRuleDS(platModalFlag), [platModalFlag]);
  // 付款预付款核销默认金额
  const payDefaultAmountDs = useDataSet(() => payDefaultAmountDS(platModalFlag), [platModalFlag]);
  // 条件查询数据 平台级的策略不查询接口
  const billConditionSelectDs = useDataSet(
    () =>
      conditionSelectDS({
        modelCode: 'ssta_bill_header',
        documentType: 'BILL',
        queryFlag: !isPlat,
      }),
    [isPlat]
  );
  const invConditionSelectDs = useDataSet(
    () =>
      conditionSelectDS({
        modelCode: 'ssta_settle_header',
        documentType: 'INVOICE',
        queryFlag: !isPlat,
      }),
    [isPlat]
  );
  const payConditionSelectDs = useDataSet(
    () =>
      conditionSelectDS({
        modelCode: 'ssta_settle_header',
        documentType: 'PAYMENT',
        queryFlag: !isPlat,
      }),
    [isPlat]
  );
  // 头信息
  const headerDs = useDataSet(
    () => ({
      ...headerDS(settleConfigId, editFlag),
      // 顺序决定校验的顺序，不可更改
      children: {
        paymentAmountInits: payDefaultAmountDs,
        paymentSettlePaymentRules: payRuleDs,
        paymentOptPermissions: payOprPermissionDs,
        paymentDimensionList: payDimensionDs,
        paymentApprovalConfigs: payApproveMethodDs,
        paymentCollaborativeModes: payCollaborativeModeDs,
        invoiceDimensionList: invDimensionDs,
        invoiceApprovalConfigs: invApproveMethodDs,
        invoiceCollaborativeModes: invCollaborativeModeDs,
        billDimensionList: billDimensionDs,
        billApprovalConfigs: billApproveMethodDs,
        billCollaborativeModes: billCollaborativeModeDs,
      },
    }),
    [
      editFlag,
      settleConfigId,
      billCollaborativeModeDs,
      billApproveMethodDs,
      billDimensionDs,
      invCollaborativeModeDs,
      invApproveMethodDs,
      invDimensionDs,
      payCollaborativeModeDs,
      payApproveMethodDs,
      payDimensionDs,
      payOprPermissionDs,
      payRuleDs,
      payDefaultAmountDs,
    ]
  );

  /**
   * @description: 收集需要定位的DOM集合
   * @param {Object} dom对象
   * @param {String} 储存在current里的属性名
   * @return {*}
   */
  const collectRef = useCallback((dom, key) => {
    refsMap.current[key] = dom?.container;
  }, []);

  const statusTagsMap = useMemo(
    () => ({
      info: intl.get('ssta.settleStrategy.view.tag.default').d('预设'),
      error: intl.get('ssta.settleStrategy.view.tag.error').d('未完成'),
      success: intl.get('ssta.settleStrategy.view.tag.success').d('完成'),
    }),
    []
  );

  const titleMap = useMemo(
    () => ({
      base: intl.get(`ssta.settleStrategy.view.settleStrategy.baseInfo`).d('基本信息'),
      affair: intl.get(`ssta.settleStrategy.view.title.settleAffairConfig`).d('结算事务配置'),
      bill: intl.get(`ssta.settleStrategy.view.title.billRuleConfig`).d('对账单规则配置'),
      invoice: intl.get(`ssta.settleStrategy.view.title.invRuleConfig`).d('发票申请结算单配置'),
      payment: intl.get(`ssta.settleStrategy.view.title.payRuleConfig`).d('付款申请结算单配置'),
    }),
    []
  );

  /**
   * @description: 计算tag的属性
   * @param {String} 错误集合的属性名
   * @return {Object} tag属性
   */
  const getTagProps = useCallback(
    (key) => {
      const tagProps = {};
      if (!isEmpty(errorsMap[key])) {
        tagProps.color = 'error';
      } else if (
        headerDs.current?.get('versionNumber') === 1 &&
        headerDs.current?.get('objectVersionNumber') === 1
      ) {
        tagProps.color = 'info';
      } else {
        tagProps.color = 'success';
      }
      tagProps.value = statusTagsMap[tagProps.color];
      return tagProps;
    },
    [headerDs, errorsMap, statusTagsMap]
  );

  useEffect(() => {
    if (!isPlat) {
      handleSearchEnablePayConfig();
      handleSearchSupBankInfoValidityControl();
    }
    handleSearchTermEnableFundConfig();
  }, [handleSearchTermEnableFundConfig, handleSearchSupBankInfoValidityControl, isPlat]);

  const handleSearchEnablePayConfig = useCallback(async () => {
    const res = await getEnablePayConfig();
    if (res) {
      setPayEnableFlag(res?.payEnableFlag);
    }
  }, [setPayEnableFlag]);

  const handleSearchTermEnableFundConfig = useCallback(async () => {
    const res = await getTermEnableFundConfig();
    if (res) {
      setFundEnableFlag(res?.fundEnableFlag);
    }
  }, [setFundEnableFlag]);

  const handleSearchSupBankInfoValidityControl = useCallback(async () => {
    const res = await getBankLovConfig();
    if (isEmpty(res)) {
      setSupBankInfoValidityControlFlag(1);
    }
  }, [setSupBankInfoValidityControlFlag]);

  useEffect(() => {
    getCreateSelectConfigSearch();
  }, []);

  const getCreateSelectConfigSearch = useCallback(async () => {
    if (!isPlat) {
      // 优先使用租户的配置
      const resMap = await Promise.all([getCreateSelectConfig(), getCreateSelectConfig(true)]);
      const platConfigList = resMap?.[1] || [];
      const tenantConfigList = resMap?.[0] || [];
      if (isArray(platConfigList) && isArray(tenantConfigList)) {
        platConfigList.map((item) => {
          const tenantConfigItem = tenantConfigList.find(
            (ele) => item.documentType === ele.documentType
          );
          if (tenantConfigItem) {
            item.limitNum = tenantConfigItem?.limitNum;
          }
          return item;
        });
        setDocumentLineConfig(platConfigList || []);
      }
    }
  }, [isPlat]);

  const storeValue = useMemo(() => {
    return {
      isPlat,
      state,
      search,
      pathname,
      history,
      refsMap,
      allFlag,
      headerDs,
      editFlag,
      errorsMap,
      activeKey,
      historyFlag,
      errIndexsMap,
      emitErrIndex,
      setActiveKey,
      componentFlag,
      platModalFlag,
      emitErrorsMap,
      settleConfigId,
      billCollaborativeModeDs,
      invCollaborativeModeDs,
      payCollaborativeModeDs,
      billDimensionDs,
      invDimensionDs,
      payDimensionDs,
      billApproveMethodDs,
      invApproveMethodDs,
      payApproveMethodDs,
      payRuleDs,
      payOprPermissionDs,
      payDefaultAmountDs,
      getTagProps,
      collectRef,
      titleMap,
      changedModals,
      emitChangeModals,
      billConditionSelectDs,
      invConditionSelectDs,
      payConditionSelectDs,
      payEnableFlag,
      fundEnableFlag,
      supBankInfoValidityControlFlag,
      documentLineConfig,
    };
  }, [
    isPlat,
    state,
    search,
    pathname,
    history,
    refsMap,
    allFlag,
    headerDs,
    editFlag,
    errorsMap,
    activeKey,
    historyFlag,
    errIndexsMap,
    emitErrIndex,
    setActiveKey,
    componentFlag,
    platModalFlag,
    emitErrorsMap,
    settleConfigId,
    billCollaborativeModeDs,
    invCollaborativeModeDs,
    payCollaborativeModeDs,
    billDimensionDs,
    invDimensionDs,
    payDimensionDs,
    billApproveMethodDs,
    invApproveMethodDs,
    payApproveMethodDs,
    payRuleDs,
    payOprPermissionDs,
    payDefaultAmountDs,
    getTagProps,
    collectRef,
    titleMap,
    changedModals,
    emitChangeModals,
    billConditionSelectDs,
    invConditionSelectDs,
    payConditionSelectDs,
    payEnableFlag,
    fundEnableFlag,
    supBankInfoValidityControlFlag,
    documentLineConfig,
  ]);

  useEffect(() => {
    headerDs.addEventListener('update', handleUpdateHeader);
    return () => {
      headerDs.removeEventListener('update', handleUpdateHeader);
    };
  }, [headerDs, handleUpdateHeader]);

  const handleUpdateHeader = useCallback(({ record, name, value }) => {
    if (name === 'invoiceMatchRuleCode') {
      if (value === 'OFFLINE_INVOICE') {
        record.set({
          directInvoiceType: '',
        });
      }
      if (value === 'DIRECT_INVOICING') {
        record.set({
          enableCheckFlag: 0,
        });
        record.set('invoiceVerifyNodeList', []);
        record.set('verifyTaxNumConsistencyList', null);
      }
    }
    if (name === 'directInvoiceType' && value !== 'INVOICE_PLATFORM') {
      record.set({
        directInvoicePoint: '',
      });
    }
    if (name === 'enableCheckResultControlFlag' && value !== '1') {
      record.set({
        checkResultConditionList: null,
      });
    }

    if (name === 'invoiceVerifyNodeList' && isEmpty(value)) {
      record.set('verifyTaxNumConsistencyList', null);
    }
    if (name === 'enableCheckFlag') {
      const { invoiceVerifyNodeList = [] } = record?.toData() || {};
      if (invoiceVerifyNodeList.includes('AFTER_INVOICE_CHECK')) {
        record.set('invoiceVerifyNodeList', []);
        record.set('verifyTaxNumConsistencyList', null);
      }
    }
    if (name === 'autoInvoiceScenarioType') {
      const debitEffectiveNode = record?.get('debitEffectiveNode');
      record.set({
        debitEffectiveNode: 'SETTLE_OR_BILLED',
      });
      if (value === 'DEBIT' && debitEffectiveNode === 'INVOICE_CREATE') {
        // 当基础场景是帐，同时生效节点是创建发票结算单 清空生成单据状态 清空创建方阵营
        record.set({
          debitDocumentStatus: '',
          debitCamp: '',
        });
      } else if (
        (value === 'DEBIT' && debitEffectiveNode === 'SETTLE_OR_BILLED') ||
        value === 'EC'
      ) {
        // 当基础场景=帐扣 且 生效节点=事务推入结算池或对账完成   或 基础场景=电商直连开票 时，生成单据状态默认值为【已提交】
        record.set({
          debitDocumentStatus: 'SUBMITED',
          debitCamp: 'PURCHASER',
        });
      } else if (value === 'OFFLINE_INVOICE') {
        // 当基础场景=线下开票时，生成单据状态默认值为【新建】
        record.set({
          debitDocumentStatus: 'NEW',
          debitCamp: 'PURCHASER',
        });
      } else if (value === 'INVOICE_PLATFORM') {
        // 当基础场景=平台开票直连开票时,生效节点默认值为【事务推入结算池或对账完成】，生成单据状态默认值为【新建】，创建方阵营默认值为【供应商】，创建人类型默认值为空
        record.set({
          debitDocumentStatus: 'NEW',
          debitCamp: 'SUPPLIER',
        });
      }
    }
    if (name === 'debitEffectiveNode') {
      const autoInvoiceScenarioType = record?.get('autoInvoiceScenarioType');
      if (autoInvoiceScenarioType === 'DEBIT' && value === 'INVOICE_CREATE') {
        record.set({
          debitDocumentStatus: '',
        });
      } else if (autoInvoiceScenarioType === 'DEBIT' && value === 'SETTLE_OR_BILLED') {
        record.set({
          debitDocumentStatus: 'SUBMITED',
        });
      }
    }
    if (name === 'debitCamp') {
      record.set({ debitCreatorType: undefined, debitCreatedByLov: undefined });
    }
    // 如果二次确认为否，把二次确认审批方式的值置空
    if (name === 'confirmAgainFlag' && value !== '1') {
      record.set({
        confirmAgainApprovedMethodCode: '',
      });
    }
    // 如果直连开票节点为提交时，清空二次确认标志和二次确认审批方式的值
    if (name === 'directInvoicePoint' && value !== 'APPROVED') {
      record.set({
        confirmAgainFlag: '',
      });
      record.set({
        confirmAgainApprovedMethodCode: '',
      });
    }
    // 对账单 如果印章类型如果是拖拽，静默签改为否
    if (name === 'billSealType' && value === 'DRAG_SEAL') {
      record.set({
        billSilentSignatureFlag: '0',
      });
    }
  }, []);

  return (
    <Store.Provider value={storeValue}>
      <ModalProvider location={location}>{children}</ModalProvider>
    </Store.Provider>
  );
};
