import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';

const decimalSum = (arr) => {
  if (arr.some((item) => isNaN(item))) {
    return math.sum(...arr);
  } else {
    const transformArr = arr.map((item) => item || 0);
    return math.sum(...transformArr);
  }
};

const invoiceAndUpdate = (documentType, updateFlag) => documentType === 'INVOICE' && updateFlag;

const paymentAndUpdate = (documentType, updateFlag) => documentType === 'PAYMENT' && updateFlag;

const validator = ({
  record,
  name,
  zeroError, // 不能为零
  signCheck, // 需同号的字段
  maxCheck, // 绝对值不能超过的字段
  otherCheckor, // 补充校验
  positiveFlag, // 是否是正数
}) => {
  const value = record.get(name);
  const signValue = record.get(signCheck);
  const maxValue = record.get(maxCheck);
  const text = record.dataSet.getField(name).get('label');
  if (zeroError && value === 0) {
    return intl.get(`ssta.common.message.validate.cannotBeZero`, { text }).d(`{text}不能为零`);
  }
  if (positiveFlag && value <= 0) {
    return intl.get(`ssta.common.message.validate.mustPositiveNum`, { text }).d(`{text}必须大于零`);
  }
  if (signValue && value * signValue < 0) {
    const signText = record.dataSet.getField(signCheck).get('label');
    return intl
      .get(`ssta.common.message.validate.sameSign`, { text, signText })
      .d(`{text}和{signText}需同号`);
  }
  if (maxCheck && decimalSum([math.abs(value || 0), math.negated(math.abs(maxValue || 0))]) > 0) {
    const maxText = record.dataSet.getField(maxCheck).get('label');
    return intl
      .get(`ssta.common.message.validate.cannotExceed`, { text, maxText })
      .d(`{text}不能超过{maxText}`);
  }
  if (otherCheckor && otherCheckor.checkFlag) {
    return otherCheckor.checkDes;
  }
  return true;
};

const settleLineConfig = {
  // 数量
  quantity: {
    // 结算单类型=开票&结算匹配维度=数量&部分匹配-开票为Y
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('invoicePartMatchFlag') === 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableQuantity',
        maxCheck: 'enableQuantity',
      });
    },
  },
  // 基准单价
  netPrice: {
    // 结算单类型=开票&结算匹配维度=数量&单价调整为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('priceUpdFlag') === 1 &&
      record.get('settleBasePrice') === 'NET_PRICE',
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'orignPrice',
      });
    },
  },
  // 基准金额
  netAmount: {
    // 结算单类型=开票&结算匹配维度=金额&部分匹配-开票为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) &&
      record.get('settleMatchDimension') === 'AMOUNT' &&
      record.get('invoicePartMatchFlag') === 1 &&
      record.get('settleBasePrice') === 'NET_PRICE',
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableAmount',
        maxCheck: 'enableAmount',
      });
    },
  },
  // 税率
  taxRateLov: {
    // 结算单类型=开票&税率调整=Y
    preEditor: (record, documentType, updateFlag) =>
      record.get('taxRateUpdFlag') === 1 && invoiceAndUpdate(documentType, updateFlag),
  },
  // 税额
  taxAmount: {
    // 结算单类型=开票&税额调整=Y
    preEditor: (record, documentType, updateFlag) =>
      record.get('taxAmountUpdFlag') === 1 && invoiceAndUpdate(documentType, updateFlag),
  },
  // 基准单价
  taxIncludedPrice: {
    // 结算单类型=开票&结算匹配维度=数量&单价调整为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('priceUpdFlag') === 1 &&
      record.get('settleBasePrice') === 'TAX_INCLUDED_PRICE',
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'orignPrice',
      });
    },
  },
  // 基准金额
  taxIncludedAmount: {
    // 结算单类型=开票&结算匹配维度=金额&部分匹配-开票为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) &&
      record.get('settleMatchDimension') === 'AMOUNT' &&
      record.get('invoicePartMatchFlag') === 1 &&
      record.get('settleBasePrice') === 'TAX_INCLUDED_PRICE',
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableAmount',
        maxCheck: 'enableAmount',
      });
    },
  },
  // 本次付款金额
  paymentAmount: {
    // 部分匹配-付款为Y & 结算单类型=付款 ||结算单类型=开票
    preEditor: (record, documentType, updateFlag) =>
      invoiceAndUpdate(documentType, updateFlag) ||
      (paymentAndUpdate(documentType, updateFlag) && record.get('paymentPartMatch') === 1),
    /**
     * 1.当结算单类型=开票时，校验【本次开票含税金额-本次付款金额-本次预付款核销金额】小于0，否则报错“结算事务xxx本次付款金额超过可付款金额，请检查”
     * 2.当结算单类型=付款时，校验【已开票含税金额-付款占用金额-本次付款金额-本次预付款核销金额】小于0，否则报错“结算事务xxx本次付款金额超过可付款金额，请检查”
     */
    preValidator: (name, record) => {
      const { dataSet } = record;
      const { documentType } = dataSet;
      const {
        paidAmount,
        invoicedAmount,
        taxIncludedAmount,
        paymentAmount,
        applyAmount,
        settleNum,
      } = record.get([
        'paidAmount',
        'invoicedAmount',
        'taxIncludedAmount',
        'paymentAmount',
        'applyAmount',
        'settleNum',
        'amountPrecision',
      ]);
      const invAmount = decimalSum([
        math.abs(taxIncludedAmount || 0),
        math.negated(math.abs(paymentAmount || 0)),
        math.negated(math.abs(applyAmount || 0)),
      ]);
      const payAmount = decimalSum([
        math.abs(invoicedAmount || 0),
        math.negated(math.abs(paymentAmount || 0)),
        math.negated(math.abs(applyAmount || 0)),
        math.negated(math.abs(paidAmount || 0)),
      ]);
      return validator({
        name,
        record,
        signCheck:
          documentType === 'INVOICE'
            ? 'taxIncludedAmount'
            : documentType === 'PAYMENT'
            ? 'invoicedAmount'
            : undefined,
        otherCheckor: [
          {
            checkFlag:
              (documentType === 'INVOICE' && invAmount < 0) ||
              (documentType === 'PAYMENT' && payAmount < 0),
            checkDes: `${intl
              .get(`ssta.common.message.validate.settlement`)
              .d(`结算事务`)}${settleNum}${intl
              .get(`ssta.common.message.validate.cannotExceed.PayableAmount`)
              .d(`本次付款金额超过可付款金额，请检查`)}`,
          },
        ],
      });
    },
  },
  // 每
  unitPriceBatch: {
    preEditor: (record, _, updateFlag) => {
      const { unitPriceBatchUpdFlag, settleMatchDimension } =
        record?.get(['unitPriceBatchUpdFlag', 'settleMatchDimension']) || {};
      return updateFlag && Boolean(unitPriceBatchUpdFlag) && settleMatchDimension === 'QUANTITY';
    },
    preValidator: (name, record) => validator({ name, record, positiveFlag: true }),
  },
};

const billLineConfig = {
  // 数量
  quantity: {
    // 可编辑：结算匹配维度=数量&部分匹配为Y
    preEditor: (record, action) =>
      action === 'UPDATE' &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('partMatchFlag') === 1 &&
      record.get('priceShiledFlag') !== 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableQuantity',
        maxCheck: 'enableQuantity',
      });
    },
  },
  // 基准单价
  netPrice: {
    // 可编辑：结算匹配维度=数量 & 单价调整为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, action) =>
      action === 'UPDATE' &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('priceUpdFlag') === 1 &&
      record.get('settleBasePrice') === 'NET_PRICE' &&
      record.get('priceShiledFlag') !== 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'orignPriceMeaning',
      });
    },
  },
  // 基准金额
  netAmount: {
    // 可编辑： 结算匹配维度=金额&部分匹配为Y
    preEditor: (record, action) =>
      action === 'UPDATE' &&
      record.get('settleMatchDimension') === 'AMOUNT' &&
      record.get('partMatchFlag') === 1 &&
      record.get('settleBasePrice') === 'NET_PRICE' &&
      record.get('priceShiledFlag') !== 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableAmountMeaning',
        maxCheck: 'enableAmountMeaning',
      });
    },
  },
  // 基准单价
  taxIncludedPrice: {
    // 可编辑：结算匹配维度=数量 & 单价调整为Y；再按照基准价判断是不含税还是含税能改
    preEditor: (record, action) =>
      action === 'UPDATE' &&
      record.get('settleMatchDimension') === 'QUANTITY' &&
      record.get('priceUpdFlag') === 1 &&
      record.get('settleBasePrice') === 'TAX_INCLUDED_PRICE' &&
      record.get('priceShiledFlag') !== 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'orignPriceMeaning',
      });
    },
  },
  // 基准金额
  taxIncludedAmount: {
    // 可编辑： 结算匹配维度=金额&部分匹配为Y
    preEditor: (record, action) =>
      action === 'UPDATE' &&
      record.get('settleMatchDimension') === 'AMOUNT' &&
      record.get('partMatchFlag') === 1 &&
      record.get('settleBasePrice') === 'TAX_INCLUDED_PRICE' &&
      record.get('priceShiledFlag') !== 1,
    preValidator: (name, record) => {
      return validator({
        name,
        record,
        zeroError: true,
        signCheck: 'enableAmountMeaning',
        maxCheck: 'enableAmountMeaning',
      });
    },
  },
};

const settleActionFlagger = (record, role, actions, otherProps = {}) => {
  const purchaserFlagger = (action) => {
    const {
      camp,
      cancelCamp,
      syncStatus,
      asyncErpFlag,
      settleStatus,
      erpCancelType,
      confirmApproveMethod,
      cancelApproveMethod,
      confirmCollaborativeMode,
      cancelCollaborativeMode,
      refundStatus,
      settleType,
      partSynchronizeErpCancelFlag,
    } =
      record?.get([
        'camp',
        'cancelCamp',
        'syncStatus',
        'asyncErpFlag',
        'settleStatus',
        'erpCancelType',
        'confirmApproveMethod',
        'cancelApproveMethod',
        'confirmCollaborativeMode',
        'cancelCollaborativeMode',
        'refundStatus',
        'settleType',
        'partSynchronizeErpCancelFlag',
      ]) || {};
    const { workflowCaller } = otherProps || {};
    switch (action) {
      case 'UPDATE':
        // 单据状态为“新建”、“已退回”、“直连开票失败”,“直连开票异常”,“直连开票成功”；创建方阵营“采购方”，
        return (
          ['NEW', 'RETURN', 'INVOICE_FAILED', 'INVOICE_EXCEPTION', 'INVOICE_SUCCESS'].includes(
            settleStatus
          ) && camp === 'PURCHASER'
        );
      case 'APPROVE':
        // 1.单据状态“已提交”，协同模式-确认=单边协同，或者协同模式-确认=双边协同&创建方阵营=销售方；&审批方式-确认=功能审批的数据；
        // 2.单据状态“取消中”且同步ERP状态不等于“ERP取消中|ERP部分取消”，协同模式-取消=单边协同；或者协同模式-取消=双边协同&取消方阵营=销售方；&审批方式-取消=功能审批的数据；
        return (
          (settleStatus === 'SUBMITED' &&
            confirmApproveMethod === 'FUNCTIONAL' &&
            (confirmCollaborativeMode === 'SINGLE' ||
              (confirmCollaborativeMode === 'DOUBLE' && camp === 'SUPPLIER'))) ||
          (settleStatus === 'CANCELING' &&
            !['ERP_CANCELING', 'ERP_CANCEL_PARTLY'].includes(syncStatus) &&
            cancelApproveMethod === 'FUNCTIONAL' &&
            (cancelCollaborativeMode === 'SINGLE' ||
              (cancelCollaborativeMode === 'DOUBLE' && cancelCamp === 'SUPPLIER'))) ||
          settleStatus === 'CONFIRMING_AGAIN' ||
          (['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus) &&
            workflowCaller?.getApproveFlag(record))
        );
      case 'CANCEL':
        // 1.单据状态“已确认”，同步ERP状态：“无需导入”/“未导入”/“导入失败”，协同模式-取消=“单边协同”/“双边协同”；
        // 2.根据结算单主策略对应最新ERP取消类型，
        // 若取消类型=ERP发起取消，则单据状态“已确认”，同步ERP状态：“ERP退回”，协同模式-取消=“单边协同”/“双边协同”；
        // 若取消类型=SRM发起取消，则单据状态为“已确认”，同步ERP状态：“ERP取消失败”/“导入成功”，协同模式-取消=“单边协同”/“双边协同”；
        // 若取消类型=SRM发起取消，则单据状态为“已确认”，同步ERP状态：“部分导入”，部分同步成功=是，协同模式-取消=“单边协同”/“双边协同”；(暂时只做了发票，不影响其他单据)
        // 同时如果是预付款 当预付款类型=退款时，已确认状态的结算单不出现取消
        return (
          ((settleStatus === 'CONFIRM' &&
            ['WITHOUT_SYNC', 'UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus)) ||
            (settleStatus === 'CONFIRM' &&
              erpCancelType === 'ERP' &&
              syncStatus === 'ERP_RETURN') ||
            (settleStatus === 'CONFIRM' &&
              erpCancelType === 'SRM' &&
              (['ERP_RETURN', 'SYNC_SUCCESS', 'ERP_CANCEL_FAILURE'].includes(syncStatus) ||
                (syncStatus === 'SYNC_PARTLY' && Number(partSynchronizeErpCancelFlag) === 1)))) &&
          (settleType !== 'PREPAYMENT' ||
            (settleType === 'PREPAYMENT' &&
              !(settleStatus === 'CONFIRM' && refundStatus === 'REFUND') &&
              !(refundStatus === 'BE_REFUNDED' && settleStatus === 'REFUNDING')))
        );
      case 'SYNC':
        // 单据状态“已确认”，同步ERP状态“未导入”/“导入失败”/“ERP退回”且主策略对应的同步ERP状态为Y【这个策略要取最新的不跟版本走】
        // 单据状态”取消中“，同步ERP状态”ERP部分取消“/“部分退回”,且主策略对应的同步ERP状态为Y【这个策略要取最新的不跟版本走】
        return (
          ((settleStatus === 'CONFIRM' &&
            ['UNSYNCHRONIZED', 'SYNC_FAILURE', 'ERP_RETURN', 'SYNC_PARTLY'].includes(syncStatus)) ||
            (settleStatus === 'CANCELING' &&
              ['ERP_CANCEL_PARTLY', 'RETURN_PARTLY'].includes(syncStatus))) &&
          Boolean(asyncErpFlag)
        );
      case 'SYNC_MODAL':
        // 判断状态弹框 同步只校验结算单状态
        return ['CONFIRM', 'CANCELING'].includes(settleStatus);
      default:
        return false;
    }
  };
  const supplierFlagger = (action) => {
    const {
      camp,
      cancelCamp,
      syncStatus,
      settleStatus,
      erpCancelType,
      confirmApproveMethod,
      cancelApproveMethod,
      confirmCollaborativeMode,
      cancelCollaborativeMode,
      partSynchronizeErpCancelFlag,
    } =
      record?.get([
        'camp',
        'cancelCamp',
        'syncStatus',
        'settleStatus',
        'erpCancelType',
        'confirmApproveMethod',
        'cancelApproveMethod',
        'confirmCollaborativeMode',
        'cancelCollaborativeMode',
        'partSynchronizeErpCancelFlag',
      ]) || {};
    switch (action) {
      case 'UPDATE':
        // 单据状态为“新建”、“已退回”、“直连开票失败”、“直连开票异常”；创建方阵营“销售方”
        return (
          ['NEW', 'RETURN', 'INVOICE_FAILED', 'INVOICE_EXCEPTION'].includes(settleStatus) &&
          camp === 'SUPPLIER'
        );
      case 'APPROVE':
        // 1.单据状态“已提交”，协同模式-确认=双边协同&创建方阵营=采购方&确认-审批方式=功能审批；
        // 2.单据状态“取消中”且同步ERP状态不等于“ERP取消中|ERP部分取消”&取消-审批方式=功能审批&协同模式-取消=双边协同&取消方阵营=采购方。
        // 3.单据状态“供应商待确认”或者“供应商待取消”；点击审核进入审核界面
        return (
          (settleStatus === 'SUBMITED' &&
            confirmApproveMethod === 'FUNCTIONAL' &&
            confirmCollaborativeMode === 'DOUBLE' &&
            camp === 'PURCHASER') ||
          (settleStatus === 'CANCELING' &&
            !['ERP_CANCELING', 'ERP_CANCEL_PARTLY'].includes(syncStatus) &&
            cancelApproveMethod === 'FUNCTIONAL' &&
            cancelCollaborativeMode === 'DOUBLE' &&
            cancelCamp === 'PURCHASER') ||
          ['WAIT_SUPPLIER_CONFIRM', 'WAIT_SUPPLIER_CANCEL'].includes(settleStatus)
        );
      case 'CANCEL':
        // 1.单据状态“已确认”，同步ERP状态：“无需导入”/“未导入”/“导入失败”，协同模式-取消=“双边协同”；
        // 2.根据结算单主策略对应最新ERP取消类型，
        // 若取消类型=ERP发起取消，则单据状态“已确认”，同步ERP状态：“ERP退回”，协同模式-取消=“双边协同”；
        // 若取消类型=SRM发起取消，则单据状态为“已确认”，同步ERP状态：“ERP取消失败”/“导入成功”，协同模式-取消=“双边协同”；
        // 若取消类型=SRM发起取消，则单据状态为“已确认”，同步ERP状态：“部分导入”，部分同步成功=是，协同模式-取消=“双边协同”；(暂时只做了发票，不影响其他单据)
        return (
          (settleStatus === 'CONFIRM' &&
            cancelCollaborativeMode === 'DOUBLE' &&
            ['WITHOUT_SYNC', 'UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(syncStatus)) ||
          (settleStatus === 'CONFIRM' &&
            erpCancelType === 'ERP' &&
            syncStatus === 'ERP_RETURN' &&
            cancelCollaborativeMode === 'DOUBLE') ||
          (settleStatus === 'CONFIRM' &&
            erpCancelType === 'SRM' &&
            (['ERP_RETURN', 'SYNC_SUCCESS', 'ERP_CANCEL_FAILURE'].includes(syncStatus) ||
              (syncStatus === 'SYNC_PARTLY' && Number(partSynchronizeErpCancelFlag) === 1)) &&
            cancelCollaborativeMode === 'DOUBLE')
        );
      default:
        return false;
    }
  };
  const flagger = role === 'supplier' ? supplierFlagger : purchaserFlagger;
  return Array.isArray(actions) ? actions.map((item) => flagger(item)) : flagger(actions);
};

const taxInvoiceCheckFlagger = (data = {}) => {
  const {
    notPub = true, // 不是工作流
    autoFlag, // 自动查验
    updateFlag, // 可编辑
    approveFlag, // 可审批
    headerInfo = {},
  } = data;
  const { documentType, settleStatus, autoCheckFlag, checkPointCode, enableCheckFlag } = headerInfo;
  const commonFlag = enableCheckFlag && documentType === 'INVOICE';
  if (updateFlag) {
    const updateCommonFlag = commonFlag && ['INITIATE', 'BOTH'].includes(checkPointCode);
    return autoFlag ? updateCommonFlag && autoCheckFlag : updateCommonFlag;
  } else if (approveFlag || !notPub) {
    const approveCommonFlag =
      commonFlag &&
      ['CONFIRM', 'BOTH'].includes(checkPointCode) &&
      ['SUBMITED_APPROVING', 'SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(settleStatus);
    return autoFlag ? approveCommonFlag && autoCheckFlag : approveCommonFlag;
  }
};

const noZeroValidator = (value, name, record) => {
  const text = record.dataSet.getField(name).get('label');
  if (value === 0) {
    return intl.get(`ssta.common.message.validate.cannotBeZero`, { text }).d(`{text}不能为零`);
  }
};

// 【一键默认计划金额】逻辑为：
// 1、结算单主策略配置「付款管控规则来源=订单来源付款计划」，且当前「付款维度=采购订单」
// 2、结算单主策略配置「付款管控规则来源=协议来源付款计划」，且当前「付款维度=采购协议」
// 3、结算单主策略配置「付款管控规则来源=订单来源付款计划」，且当前「付款维度=采购订单行」
const clickDefaultPlanAmountFlagger = ({
  paymentDimension,
  paymentDimensionParam,
  paymentControlRuleSource,
}) => {
  return (
    (paymentDimension === 'PO' &&
      paymentDimensionParam === 'PO' &&
      paymentControlRuleSource === 'ORDER') ||
    (paymentDimension === 'CONTRACT' &&
      paymentDimensionParam === 'CONTRACT' &&
      paymentControlRuleSource === 'CONTRACT') ||
    (paymentDimension === 'PO_LINE' &&
      paymentDimensionParam === 'PO_LINE' &&
      paymentControlRuleSource === 'ORDER')
  );
};

export {
  settleLineConfig,
  billLineConfig,
  settleActionFlagger,
  decimalSum,
  taxInvoiceCheckFlagger,
  noZeroValidator,
  clickDefaultPlanAmountFlagger,
};
