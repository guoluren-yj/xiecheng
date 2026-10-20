import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { useRenderTag } from '@/hooks/useRenderTag';
import { retryData } from '@/services/oms/ecBillService';
import notification from 'utils/notification';
import { getStartToEndDates } from '@/utils/utils';
import { fetchOnlyCount } from '@/utils/commonApi';

// eslint-disable-next-line import/no-cycle
import { openModal, openLogModal } from './detailModal';

const organizationId = getCurrentOrganizationId();

const skuColorList = [
  { colorType: 'success', matchList: ['SUCCESS'] },
  { colorType: 'failed', matchList: ['FAILED'] },
  { colorType: 'warning', matchList: ['EXECUTING'] },
];

const skuDetailColorList = [
  { colorType: 'success', matchList: ['SUCCESS', 'DATA_REPEAT_FAIL'] },
  { colorType: 'failed', matchList: ['PRE_FAIL', 'CHECK_FAIL', 'ASYN_FAIL', 'FAILED', 'CHECK_MESSAGE_FAIL'] },
  { colorType: 'warning', matchList: ['NEW', 'PRE_WAITING', 'ASYN_WAITING', 'PRE_SUCCESS', 'MESSAGE_BLOCK', 'CHECK_INVOICE_FAIL'] },
];

const ecOrderColorList = [
  { colorType: 'success', matchList: ['PRE_OCCUPIED_SUCCESS', 'CONFIRM_SUCCESS', 'CANCEL_PRE_OCCUPIED_SUCCESS', 'CANCEL_SUCCESS', 'CHECKOUT_SUCCESS', 'PUNCHOUT_CONFIRM_SUCCESS', 'INITIATE_PAYMENT_SUCCESS', 'PAYMENT_NOTICE_SUCCESS'] },
  { colorType: 'failed', matchList: ['PRE_OCCUPIED_FAILED', 'CONFIRM_FAILED', 'CANCEL_PRE_OCCUPIED_FAILED', 'CANCEL_FAILED', 'CHECKOUT_FAILED', 'PUNCHOUT_CONFIRM_FAILED', 'INITIATE_PAYMENT_FAILED', 'PAYMENT_NOTICE_FAILED'] },
];

const subEcOrderColorList = [
  { colorType: 'success', matchList: ['CONSIGNMENT_SUCCESS', 'DELIVERY_SUCCESS', 'ORDER_RECEIPT_SUCCESS', 'CANCEL_SUCCESS'] },
  { colorType: 'failed', matchList: ['CONSIGNMENT_FAILED', 'DELIVERY_FAILED', 'ORDER_RECEIPT_FAILED', 'CANCEL_FAILED'] },
];

const afsColorList = [
  { colorType: 'success', matchList: ['AFS_CONFIRM_SUCCESS', 'AFS_APPLY_SUCCESS', 'AFS_CANCEL_SUCCESS', 'AFS_AUDIT_SUCCESS', 'AFS_UPDATE_SEND_INFO_SUCCESS', 'AFS_RESULT_SUCCESS'] },
  { colorType: 'failed', matchList: ['AFS_CONFIRM_FAILED', 'AFS_APPLY_FAILED', 'AFS_CANCEL_FAILED', 'AFS_AUDIT_FAILED', 'AFS_UPDATE_SEND_INFO_FAILED', 'AFS_RESULT_FAILED'] },
];

const invocieColorList = [
  { colorType: 'success', matchList: ['INVOICE_SUBMIT_SUCCESS', 'INVOICE_RECEIPT_SUCCESS', 'CANCEL_INVOICE_SUCCESS', 'REVERSE_INVOICE_SUCCESS', 'CANCEL_REVERSE_INVOICE_SUCCESS'] },
  { colorType: 'failed', matchList: ['INVOICE_SUBMIT_FAILED', 'INVOICE_RECEIPT_FAILED', 'CANCEL_INVOICE_FAILED', 'REVERSE_INVOICE_FAILED', 'CANCEL_REVERSE_INVOICE_FAILED'] },
  { colorType: 'warning', matchList: ['INVOICE_RECEIPT_PROCESSING'] },
];

const stateColorList = [
  { colorType: 'success', matchList: ['BILL_NOTICE_SUCCESS', 'BILL_DIF_SUCCESS', 'BILL_CONFIRM_SUCCESS'] },
  { colorType: 'failed', matchList: ['BILL_NOTICE_FAILED', 'BILL_DIF_FAILED', 'BILL_CONFIRM_FAILED'] },
];



const parentTabs = () => {
  const _tabs = [
    {
      tab: intl.get('smodr.ecBill.view.sku').d('商品'),
      key: 'SKU',
      panes: [
        {
          tab: intl.get('smodr.ecBill.view.all').d('全部'),
          key: 'UPDATE',
          customizedCode: "SMOP.EC.TABLE.SKU.ALL.TABLE",
          customReal: true,
          queryUrl: `/smep/v1/${organizationId}/ec-product/workbench-page`,
          searchCode: 'SMOP.EC.TABLE.SKU.ALL_BAR',
        },
        // {
        //   tab: intl.get('smodr.ecBill.view.detail').d('明细'),
        //   key: 'PUTAWAY',
        //   customizedCode: "SMODR.EC.BILL.WORKBENCH.PUTAWAY",
        //   queryUrl: `/smep/v1/${organizationId}/ec-product/workbench-details`,
        //   searchCode: 'SMOP.EC.TABLE.SKU.DETAIL_BAR',
        // },
      ],
    },
    {
      tab: intl.get('smodr.ecBill.view.order').d('订单'),
      key: 'ORDER',
      panes: [
        {
          tab: intl.get('smodr.ecBill.view.ecOrder').d('电商订单'),
          key: 'ECORDER',
          customizedCode: "SMODR.EC.BILL.WORKBENCH.ECORDER",
          queryUrl: `/smep/v1/${organizationId}/ec-order-records/list`,
          searchCode: 'SMOP.EC.TABLE.EC_ORDER_RECORD_BAR',
        },
        {
          tab: intl.get('smodr.ecBill.view.delivery').d('送货单'),
          key: 'DELIVERY',
          customizedCode: "SMODR.EC.BILL.WORKBENCH.DELIVERY",
          queryUrl: `/smep/v1/${organizationId}/ec-sub-order-records/list`,
          searchCode: 'SMOP.EC.TABLE.EC_SUB_ORDER_RECORD',
        },
      ],
    },
    {
      tab: intl.get('smodr.ecBill.view.afsale').d('售后'),
      key: 'AFSALE',
      panes: [
        {
          tab: intl.get('smodr.ecBill.view.all').d('全部'),
          key: 'AFALL',
          customizedCode: "SMODR.EC.BILL.WORKBENCH.AFALL",
          searchCode: 'SMOP.EC.TABLE.EC_AFTER_SALE_RECORD_BAR',
          queryUrl: `/smep/v1/${organizationId}/ec-after-sale-records/list`,
        },
      ],
    },
    {
      tab: intl.get('smodr.ecBill.view.settle').d('结算'),
      key: 'SETTLE',
      panes: [
        {
          tab: intl.get('smodr.ecBill.view.statement').d('对账'),
          key: 'STATEMENT',
          customizedCode: "SMODR.EC.BILL.WORKBENCH.BILL",
          searchCode: 'SMOP.EC.TABLE.EC_BILL_RECORD_BAR',
          queryUrl: `/smep/v1/${organizationId}/ec-bill-records/list`,
        },
        {
          tab: intl.get('smodr.ecBill.view.invoice').d('发票'),
          key: 'INVOICE',
          searchCode: 'SMOP.EC.TABLE.EC_INVOICE_RECORD_BAR',
          customizedCode: "SMODR.EC.BILL.WORKBENCH.INVOICE",
          queryUrl: `/smep/v1/${organizationId}/ec-invoice-records/list`,
        },
      ],
    },
  ];
  return _tabs.map(group => {
    return {
      ...group,
      panes: group.panes.map(pane => ({
        ...pane,
        queryCount: async () => {
          const res = getResponse(await fetchOnlyCount(pane.queryUrl, pane.params));
          if (res) {
            return res;
          }
          return {};
        },
      })),
    };
  });
};

const detailConfig = (record) => ({
  'UPDATE': {
    queryUrl: `/smep/v1/${organizationId}/ec-product/workbench-details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.UPDATE.DETAIL",
    params: { messageKey: record?.get('thirdSkuCode')},
    searchCode: 'SMOP.EC.TABLE.SKU.BILL_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () =>
          getStartToEndDates(record?.get('lastUpdateDate'), -1, 1, 'M'),
        },
      },
    },
  },
  'PUTAWAY': {
    queryUrl: `/smep/v1/${organizationId}/ec-product/workbench-details`,
    searchCode: 'SMOP.EC.TABLE.SKU.DETAIL_BAR',
    customizedCode: "SMODR.EC.BILL.WORKBENCH.PUTAWAY.DETAIL",
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
  'ECORDER': {
    queryUrl: `/smep/v1/${organizationId}/ec-order-records/details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.ECORDER.DETAIL",
    params: { ecCompanyCode: record?.get('ecCompanyCode'), ecOrderCode: record?.get('ecOrderCode'), srmOrderCode: record?.get('srmOrderCode') },
    searchCode: 'SMOP.EC.TABLE.EC_ORDER_RECORD_DETAILS_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
  'DELIVERY': {
    queryUrl: `/smep/v1/${organizationId}/ec-sub-order-records/details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.DELIVERY.DETAIL",
    params: { ecCompanyCode: record?.get('ecCompanyCode'), ecSubOrderCode: record?.get('ecSubOrderCode') },
    searchCode: 'SMOP.EC.TABLE.EC_SUB_ORDER_RECORD_DETAILS_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
  'AFALL': {
    queryUrl: `/smep/v1/${organizationId}/ec-after-sale-records/details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.AFALL.DETAIL",
    params: { ecCompanyCode: record?.get('ecCompanyCode'), afsApplyCode: record?.get('afsApplyCode'), ecAfsApplyCode: record?.get('ecAfsApplyCode') },
    searchCode: 'SMOP.EC.TABLE.EC_AFTER_SALE_RECORD_DETAILS_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
  'STATEMENT': {
    queryUrl: `/smep/v1/${organizationId}/ec-bill-records/details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.STATEMENT.DETAIL",
    params: { ecCompanyCode: record?.get('ecCompanyCode'), ecBillCode: record?.get('ecBillCode') },
    searchCode: 'SMOP.EC.TABLE.EC_BILL_RECORD_DETAILS_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
  'INVOICE': {
    queryUrl: `/smep/v1/${organizationId}/ec-invoice-records/details`,
    customizedCode: "SMODR.EC.BILL.WORKBENCH.INVOICE.DETAIL",
    params: { ecCompanyCode: record?.get('ecCompanyCode'), applicationNo: record?.get('applicationNo') },
    searchCode: 'SMOP.EC.TABLE.EC_INVOICE_RECORD_DETAILS_BAR',
    searchBarConfig: {
      expandable: false,
      fieldProps: {
        creationDate: {
          defaultValue: () => getStartToEndDates(record?.get('creationDate'), 0, 6, 'M'),
        },
      },
    },
  },
});

const dsFieldsMap = (key) => ({
  'SKU': [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(skuColorList, record?.get('status'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record }) => {
        return (
          <a onClick={() => openModal({ record, key, parentKey: 'SKU', title: `${intl.get('smodr.ecBill.model.skuCalledRecord').d('商品调用记录')}-${record.get('thirdSkuCode') || ''}` })}>
            {intl.get('smodr.ecBill.model.calledRecord').d('调用记录')}
          </a>
        );
      },
    },
    {
      name: 'thirdSkuCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecSkuId').d('电商商品编码'),
      filter: key === 'UPDATE',
      width: 110,
    },
    {
      name: 'messageKey',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecSkuId').d('电商商品编码'),
      filter: key === 'PUTAWAY',
      width: 110,
      // renderer: ({ text, record }) => {
      //   return (
      //     <a onClick={() => openModal({ record, key, parentKey: 'SKU' })} color='primary'>{text}</a>
      //   );
      // },
    },
    {
      name: 'categoryCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.classifyId').d('分类编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.ecBill.model.skuName').d('商品名称'),
      width: 200,
    },
    {
      name: 'salePrice',
      type: 'number',
      label: intl.get('smodr.ecBill.model.salePrice').d('销售价格'),
    },
    {
      name: 'marketPrice',
      type: 'number',
      label: intl.get('smodr.ecBill.model.marketPrice').d('市场价格'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.lastUpdateDate').d('更新时间'),
      width: 140,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.pushTime').d('推品时间'),
      width: 140,
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplier').d('供应商'),
      width: 180,
    },
  ].filter(i => i.filter !== false),
  'ORDER': [
    {
      name: 'ecOrderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      filter: key === 'ECORDER',
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(ecOrderColorList, record?.get('ecOrderStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'ecSubOrderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      filter: key === 'DELIVERY',
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(subEcOrderColorList, record?.get('ecSubOrderStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record }) => {
        const title = key === 'ECORDER'
          ? `${intl.get('smodr.ecBill.model.ecCalledRecord').d('电商订单调用记录')}-${record.get('ecOrderCode') || ''}`
          : `${intl.get('smodr.ecBill.model.songCalledRecord').d('送货单调用记录')}-${record.get('ecConsignmentCode') || ''}`;
        return (
          <a onClick={() => openModal({ record, key, parentKey: 'ORDER', title })}>
            {intl.get('smodr.ecBill.model.calledRecord').d('调用记录')}
          </a>
        );
      },
    },
    {
      name: 'ecSubOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdSonOrderId').d('电商子订单编码'),
      filter: key === 'DELIVERY',
      width: 180,
    },
    {
      name: 'ecOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商订单编码'),
      filter: key === 'DELIVERY',
      width: 180,
    },
    {
      name: 'ecConsignmentCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecConsignmentsCode').d('电商送货单编码'),
      filter: key === 'DELIVERY',
      // renderer: ({ text, record }) => {
      //   return (
      //     <a onClick={() => openModal({ record, key, parentKey: 'ORDER' })} color='primary'>{text || '-'}</a>
      //   );
      // },
    },
    {
      name: 'srmOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.srmMallOrderCode').d('商城订单编码'),
      // filter: key === 'ECORDER',
      width: 180,
    },
    {
      name: 'ecOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdOrderId').d('电商订单编码'),
      filter: key === 'ECORDER',
      width: 180,
      // renderer: ({ text, record }) => {
      //   return (
      //     <a onClick={() => openModal({ record, key, parentKey: 'ORDER' })} color='primary'>{text}</a>
      //   );
      // },
    },
    {
      name: 'ecOrderAmount',
      type: 'number',
      label: intl.get('smodr.ecBill.model.allAmount').d('订单总金额'),
      filter: key === 'ECORDER',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.buyerDate').d('下单时间'),
      filter: key === 'ECORDER',
      width: 140,
    },
    {
      name: 'creatorName',
      type: 'string',
      label: intl.get('smodr.ecBill.model.buyerName').d('下单人'),
      filter: key === 'ECORDER',
    },
    {
      name: 'creatorCompany',
      type: 'string',
      label: intl.get('smodr.ecBill.model.buyerCompany').d('下单公司'),
      filter: key === 'ECORDER',
      width: 180,
    },
    {
      name: 'consignmentTime',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.deliveryDate').d('配送时间'),
      filter: key === 'DELIVERY',
      width: 140,
    },
    {
      name: 'ecCompanyCodeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplier').d('供应商'),
      width: 180,
    },
  ].filter(i => i.filter !== false),
  'AFSALE': [
    {
      name: 'ecApplyStatusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(afsColorList, record?.get('ecApplyStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record }) => {
        const title = `${intl.get('smodr.ecBill.model.afCalledRecord').d('售后调用记录')}-${record.get('ecAfsApplyCode') || ''}`;
        return (
          <a onClick={() => openModal({ record, key, parentKey: 'AFSALE', title })}>
            {intl.get('smodr.ecBill.model.calledRecord').d('调用记录')}
          </a>
        );
      },
    },
    {
      name: 'afsApplyCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsMallApplyId').d('商城售后申请单编码'),
    },
    {
      name: 'ecAfsApplyCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsApplyId').d('电商售后申请单编码'),
      // renderer: ({ text, record }) => {
      //   return (
      //     text ?
      //       <a onClick={() => openModal({ record, key, parentKey: 'AFSALE' })} color='primary'>{text}</a>
      //       : <span>-</span>
      //   );
      // },
    },
    {
      name: 'ecSubOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.thirdSonOrderId').d('电商子订单编码'),
      width: 180,
    },
    {
      name: 'applyTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsType').d('售后类型'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.afsTime').d('售后申请时间'),
    },
    {
      name: 'ecCompanyCodeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplier').d('供应商'),
    },
  ],
  'SETTLE': [
    {
      name: 'ecInvoiceStatusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      filter: key === 'INVOICE',
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(invocieColorList, record?.get('ecInvoiceStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'ecBillStatusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      filter: key === 'STATEMENT',
      width: 110,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(stateColorList, record?.get('ecBillStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record }) => {
        const title = key === 'INVOICE'
          ? `${intl.get('smodr.ecBill.model.invliceCalledRecord').d('发票调用记录')}-${record.get('applicationNo') || ''}`
          : `${intl.get('smodr.ecBill.model.stateCalledRecord').d('对账调用记录')}-${record.get('ecBillCode') || ''}`;
        return (
          <a onClick={() => openModal({ record, key, parentKey: 'SETTLE', title })}>
            {intl.get('smodr.ecBill.model.calledRecord').d('调用记录')}
          </a>
        );
      },
    },
    {
      name: 'ecBillCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.billIdCode').d('电商对账单编码'),
      filter: key === 'STATEMENT',
      // renderer: ({ text, record }) => {
      //   return (
      //     <a onClick={() => openModal({ record, key, parentKey: 'SETTLE' })} color='primary'>{text}</a>
      //   );
      // },
    },
    {
      name: 'ecTotalBatch',
      type: 'number',
      label: intl.get('smodr.ecBill.model.batchNum').d('总批次数量'),
      filter: key === 'STATEMENT',
    },
    {
      name: 'ecTotalBatchAmount',
      type: 'number',
      label: intl.get('smodr.ecBill.model.billIdAccount').d('对账单总额'),
      filter: key === 'STATEMENT',
    },
    {
      name: 'ecBillDate',
      type: 'date',
      label: intl.get('smodr.ecBill.model.dispatchDate').d('出账日期'),
      filter: key === 'STATEMENT',
    },
    {
      name: 'ecFinalPayDate',
      type: 'date',
      label: intl.get('smodr.ecBill.model.deadline').d('最后还款日'),
      filter: key === 'STATEMENT',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.billCreationDate').d('账单接收时间'),
      filter: key === 'STATEMENT',
      width: 140,
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.ecBill.model.applicationNo').d('开票申请编码'),
      filter: key === 'INVOICE',
      width: 180,
      // renderer: ({ text, record }) => {
      //   return (
      //     <a onClick={() => openModal({ record, key, parentKey: 'SETTLE' })} color='primary'>{text}</a>
      //   );
      // },
    },
    {
      name: 'totalBatchAmount',
      type: 'number',
      label: intl.get('smodr.ecBill.model.totalBatchAmount').d('发票总金额'),
      filter: key === 'INVOICE',
      width: 140,
    },
    {
      name: 'invoiceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.invoiceType').d('发票类型'),
      filter: key === 'INVOICE',
      width: 180,
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('smodr.ecBill.model.invoiceHead').d('发票抬头'),
      filter: key === 'INVOICE',
      width: 180,
    },
    {
      name: 'invoiceContentMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.invoiceContent').d('发票内容'),
      filter: key === 'INVOICE',
      width: 100,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('申请时间'),
      filter: key === 'INVOICE',
    },
    {
      name: 'ecCompanyCodeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.supplier').d('供应商'),
    },
  ].filter(i => i.filter !== false),
});

const detailDsFieldsMap = (key, lastRecord) => ({
  'SKU': [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 120,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(skuDetailColorList, record?.get('status'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record, dataSet }) => {
        return (
          <span className='action-link'>
            <Button onClick={() => openLogModal({ record, key: key || 'PUTAWAY', parentKey: 'SKU', lastRecord })} color='primary' funcType='link'>
              {intl.get('smodr.ecBill.view.looklog').d('查看日志')}
            </Button>
            {(record.get('retryFlag')) === 1 && (
              <Button
                onClick={async () => {
                  const res = getResponse(await retryData({ messageId: record.get('messageId') }));
                  if (res && res.success) {
                    notification.success();
                    dataSet.query();
                  } else if(res) {
                    notification.warning({ message: res?.resultMsg });
                  }
                }}
                color='primary'
                funcType='link'
              >
                {intl.get('smodr.ecBill.view.retry').d('重试')}
              </Button>
            )}
          </span>
        );
      },
    },
    {
      name: 'pullTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.serveName').d('服务名称'),
    },
    // {
    //   name: 'messageKey',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.ecSkuCode').d('电商商品编码'),
    // },
    // {
    //   name: 'errorHandle',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.questionDispose').d('问题处理方'),
    // },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.failRes').d('失败原因'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.calledTime').d('调用时间'),
      width: 140,
    },
  ],
  'ORDER': [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 120,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(skuDetailColorList, record?.get('status'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record, dataSet }) => {
        return (
          <span className='action-link'>
            <Button onClick={() => openLogModal({ record, key, parentKey: 'ORDER', lastRecord })} color='primary' funcType='link'>
              {intl.get('smodr.ecBill.view.looklog').d('查看日志')}
            </Button>
            {(record.get('retryFlag')) === 1 && (
              <Button
                onClick={async () => {
                  const res = getResponse(await retryData({ messageId: record.get('messageId') }));
                  if (res && res.success) {
                    notification.success();
                    dataSet.query();
                  } else if(res) {
                    notification.warning({ message: res?.resultMsg });
                  }
                }}
                color='primary'
                funcType='link'
              >
                {intl.get('smodr.ecBill.view.retry').d('重试')}
              </Button>
            )}
          </span>
        );
      },
    },
    {
      name: 'pullTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.serveName').d('服务名称'),
    },
    // {
    //   name: 'ecSubOrderCode',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.ecSubOrderCode').d('电商子订单编码'),
    // },
    // {
    //   name: 'errorHandle',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.questionDispose').d('问题处理方'),
    // },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.failRes').d('失败原因'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.calledTime').d('调用时间'),
      width: 140,
    },
  ],
  'AFSALE': [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 120,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(skuDetailColorList, record?.get('status'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record, dataSet }) => {
        return (
          <span className='action-link'>
            <Button onClick={() => openLogModal({ record, key, parentKey: 'AFSALE', lastRecord })} color='primary' funcType='link'>
              {intl.get('smodr.ecBill.view.looklog').d('查看日志')}
            </Button>
            {(record.get('retryFlag')) === 1 && (
              <Button
                onClick={async () => {
                  const res = getResponse(await retryData({ messageId: record.get('messageId') }));
                  if (res && res.success) {
                    notification.success();
                    dataSet.query();
                  } else if(res) {
                    notification.warning({ message: res?.resultMsg });
                  }
                }}
                color='primary'
                funcType='link'
              >
                {intl.get('smodr.ecBill.view.retry').d('重试')}
              </Button>
            )}
          </span>
        );
      },
    },
    {
      name: 'pullTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.serveName').d('服务名称'),
    },
    // {
    //   name: 'ecAfsOrderCode',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.ecAfsOrderCode').d('电商售后申请单编码'),
    // },
    // {
    //   name: 'errorHandle',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.questionDispose').d('问题处理方'),
    // },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.failRes').d('失败原因'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.calledTime').d('调用时间'),
      width: 140,
    },
  ],
  'SETTLE': [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.status').d('状态'),
      width: 120,
      renderer: ({ record, text }) => {
        const { color, initStyle } = useRenderTag(skuDetailColorList, record?.get('status'));
        return (
          <Tag color={color} style={initStyle}>
            {text}
          </Tag>
        );
      },
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.ecBill.model.operation').d('操作'),
      renderer: ({ record, dataSet }) => {
        return (
          <span className='action-link'>
            <Button onClick={() => openLogModal({ record, key, parentKey: 'SETTLE', lastRecord })} color='primary' funcType='link'>
              {intl.get('smodr.ecBill.view.looklog').d('查看日志')}
            </Button>
            {(record.get('retryFlag')) === 1 && (
              <Button
                onClick={async () => {
                  const res = getResponse(await retryData({ messageId: record.get('messageId') }));
                  if (res && res.success) {
                    notification.success();
                    dataSet.query();
                  } else if(res) {
                    notification.warning({ message: res?.resultMsg });
                  }
                }}
                color='primary'
                funcType='link'
              >
                {record.get('status') === 'CHECK_INVOICE_FAIL' ? intl.get('smodr.ecBill.view.retry.handle').d('手动回执') : intl.get('smodr.ecBill.view.retry').d('重试')}
              </Button>
            )}
          </span>
        );
      },
    },
    {
      name: 'pullTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.serveName').d('服务名称'),
      width: 140,
    },
    // {
    //   name: 'applicationNo',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.invoiceCode').d('开票申请编码'),
    //   filter: key === 'INVOICE',
    // },
    // {
    //   name: 'ecSettleCode',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.ecSettleCode').d('电商对账单编码'),
    //   filter: key === 'STATEMENT',
    // },
    // {
    //   name: 'errorHandle',
    //   type: 'string',
    //   label: intl.get('smodr.ecBill.model.questionDispose').d('问题处理方'),
    // },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.failRes').d('失败原因'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.calledTime').d('调用时间'),
    },
  ].filter(i => i.filter !== false),
});


export { parentTabs, dsFieldsMap, detailDsFieldsMap, detailConfig, skuColorList, skuDetailColorList };
