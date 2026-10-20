import { math } from 'choerodon-ui/dataset';
import { DataSet, Icon, Modal, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import React from 'react';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';
import notification from 'utils/notification';

import { fetchOnlyCount, fetchOperationFlagService, revokeApproveService } from '@/utils/commonApi';
import { tableDs } from './ds';

const organizationId = getCurrentOrganizationId();

// 根据未税单价计算出含税单价
export function caculateTaxPrice(unitPrice, tax, precision) {
  const _precision = precision >= 0 ? precision : 10;
  const _tax = math.plus(math.multipliedBy(tax, 0.01), 1);
  const taxPrice = math.multipliedBy(unitPrice, _tax);
  return math.toFixed(taxPrice, _precision);
}
// 根据含税单价计算出未税单价
export function caculateNoTaxPrice(taxPrice, tax, precision) {
  // 未税单价*(1+税率) = 含税单价
  const _precision = precision >= 0 ? precision : 10;
  const _tax = math.plus(math.multipliedBy(tax, 0.01), 1);
  const unitPrice = math.div(taxPrice, _tax);
  return math.toFixed(unitPrice, _precision);
}

// 税率变化、未税单价、含税单价发生变化 优先以未税单价计算含税单价
export function taxChangeGetPriceTaxPrice(unitPrice, taxPrice, tax, precision) {
  if (unitPrice) {
    return caculateTaxPrice(unitPrice, tax, precision);
  }
  if (taxPrice) {
    return caculateNoTaxPrice(taxPrice, tax, precision);
  }
}

// 获取record字段集合
export function getRecordFields(record, fields = []) {
  const data = {};
  fields.forEach((field) => {
    data[field] = record.get(field);
  });
  return data;
}

// 列表查询后处理审批/审批拒绝按钮逻辑
async function handleApproveFunc({ dataSet }) {
  const keys = dataSet.reduce((pre, record) => {
    const { businessKey } = record.get(['tenantId', 'skuCode', 'businessKey']);
    if (businessKey) {
      pre.push(businessKey);
    }
    return pre;
  }, []);
  if (isEmpty(keys)) return;
  // 查询是否可以审批businessKey的对象
  const map = getResponse(await queryBatchApprovaFlag(keys));
  // 查询简易审批进度
  const historyMap = getResponse(await queryBatchSimpleApprovalHistory(keys));
  // 查询是否可以撤销审批接口
  const res = getResponse(await fetchOperationFlagService(keys));
  // 可以撤销审批businessKey集合
  const canRevokeList = Object.keys(res).filter((n) => {
    const { REVOKE } = res[n] || {};
    return REVOKE;
  });
  dataSet.forEach((r) => {
    const { businessKey } = r.get(['tenantId', 'skuCode', 'businessKey']);
    // 目录化后端返回，电商前端自己拼接
    r.init({
      wflApproveFlag: Number(!!map[businessKey]),
      wflRevokeApproveFlag: Number(canRevokeList.includes(businessKey)),
      ...(map[businessKey] || {}),
      simpleApprovalHistory: historyMap[businessKey] || [],
    });
  });
}

// 生成状态集合/ds集合
export function getStatusAndDs(type, { req, isSup = false, ...initParams } = {}) {
  const { skuType = 'CATA' } = initParams;
  const purUrl1 = `/smpc/v1/${organizationId}/pur-skus`; // 查旧的采
  const supUrl1 = `/smpc/v1/${organizationId}/sup-skus`; // 查旧的供
  const purUrl2 = `${purUrl1}/new`; // 查新的采
  const supUrl2 = `${supUrl1}/new`; // 查新的供
  const ecUrl = `${purUrl1}/ec-list`;

  const customPrefixSup = 'SMPC.WORKBENCH_SUP.LIST';
  const customPrefixPur = 'SMPC.WORKBENCH_PUR.LIST';
  const customPrefixEc = 'SMPC.WORKBENCH_PUR.LIST_EC';
  const customPrefixReceive = 'SMPC.WORKBENCH_PUR.LIST_RECEIVE';

  // 领用商品实质来自目录化
  const isReceive = skuType === 'RECEIVE';
  const receiveSkuType = isReceive ? 'CATA' : skuType;

  const flagAllParam =
    !isSup && isReceive
      ? {
          recycleFlag: 0,
          receiveFlag: 1,
        }
      : {};

  const statusList = [
    {
      value: '1',
      tabKey: 'all',
      meaning: intl.get('smpc.workbench.view.all').d('全部'),
      params: {
        skuType: receiveSkuType,
        ...flagAllParam,
      },
      sort: 8,
      exportCode: skuType === 'RECEIVE' ? 'SMPC_RECEIVE_SKU_EXPORT' : '',
      url: isSup ? supUrl2 : skuType === 'CATA' ? purUrl2 : skuType === 'RECEIVE' ? purUrl1 : ecUrl,
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_ALL.SEARCH_BAR', `${customPrefixSup}_ALL`];
        } else if (!isSup && skuType === 'EC') {
          return ['SMPC.WORKBENCH_PUR.EC_SKU.SEARCH_BAR', `${customPrefixEc}_ALL`];
        } else if (!isSup && skuType === 'RECEIVE') {
          return ['SMPC.WORKBENCH_PUR.RECEIVE_SKU.SEARCH_BAR', `${customPrefixReceive}_ALL`];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU.SEARCH_BAR', `${customPrefixPur}_ALL`];
        }
      },
    },
    {
      value: '2',
      tabKey: 'waitSubmit',
      meaning: intl.get('smpc.workbench.view.waitSubmit').d('待提交'),
      params: { skuType, tabCode: 'NEW' },
      isFilter: ['EC', 'RECEIVE'].includes(skuType),
      sort: 1,
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_NEW.SEARCH_BAR', `${customPrefixSup}_NEW`];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU_NEW.SEARCH_BAR', `${customPrefixPur}_NEW`];
        }
      },
    },
    {
      value: '3',
      tabKey: 'shelf',
      meaning: intl.get('smpc.workbench.view.shelf').d('已上架'),
      params: { skuType, shelfFlag: 1 },
      sort: 5,
      isFilter: skuType === 'RECEIVE',
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_SHELF.SEARCH_BAR', `${customPrefixSup}_SHELF`];
        } else if (!isSup && skuType !== 'CATA') {
          return ['SMPC.WORKBENCH_PUR.EC_SKU_SHELF.SEARCH_BAR', `${customPrefixEc}_SHELF`];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU_SHELF.SEARCH_BAR', `${customPrefixPur}_SHELF`];
        }
      },
    },
    {
      value: '4',
      tabKey: 'waitShelf',
      meaning: intl.get('smpc.workbench.view.unshelf').d('待上架'),
      params: { skuType, shelfFlags: '0,2,3,4' },
      sort: 4,
      isFilter: skuType === 'RECEIVE',
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_WAIT_SHELF.SEARCH_BAR', `${customPrefixSup}_WAIT_SHELF`];
        } else if (!isSup && skuType !== 'CATA') {
          return [
            'SMPC.WORKBENCH_PUR.EC_SKU_WAIT_SHELF.SEARCH_BAR',
            `${customPrefixEc}_WAIT_SHELF`,
          ];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU_WAIT_SHELF.SEARCH_BAR', `${customPrefixPur}_WAIT_SHELF`];
        }
      },
    },
    {
      value: '5',
      tabKey: 'waitApprove',
      meaning: intl.get('smpc.workbench.view.waitApprove').d('待审批'),
      url: `/smpc/v1/${organizationId}/${isSup ? 'sup-' : ''}skus/query-sku-temporary`,
      params: { approveStatus: 'WAITING,WORKFLOW_WAITING,EXTERNAL_WAITING' },
      isFilter: ['EC', 'RECEIVE'].includes(skuType),
      sort: 2,
      dsProps: {
        paging: 'server',
        idField: 'skuTemporaryId',
        primaryKey: 'skuTemporaryId',
        parentField: '__versionId',
        modifiedCheck: false,
        record: {
          dynamicProps: {
            selectable(record) {
              return record.get('approveStatus') !== 'WORKFLOW_WAITING';
            },
          },
        },
        events: {
          load: ({ dataSet }) => handleApproveFunc({ dataSet, skuType }),
          append: ({ dataSet }) => {
            dataSet.forEach((record) => {
              if (record.get('__versionId')) {
                Object.assign(record, { selectable: false });
              }
            });
          },
        },
      },
      getCustomizeUnitCode: () => {
        if (isSup) {
          return [
            'SMPC.WORKBENCH_SUP.SKU_WAIT_APPROVE.SEARCH_BAR',
            `${customPrefixSup}_WAIT_APPROVE`,
          ];
        } else {
          return [
            'SMPC.WORKBENCH_PUR.SKU_WAIT_APPROVE.SEARCH_BAR',
            `${customPrefixPur}_WAIT_APPROVE`,
          ];
        }
      },
    },
    {
      value: '6',
      tabKey: 'approved',
      meaning: (
        <>
          <span style={{ verticalAlign: 'middle' }}>
            {intl.get('smpc.workbench.view.approveReject').d('审批拒绝')}
          </span>
          <Tooltip
            title={intl
              .get('smpc.workbench.view.approveReject.help')
              .d('默认数据范围：商品发生过审批拒绝的所有申请数据')}
          >
            <Icon type="help" style={{ fontSize: 16, marginLeft: 4, marginRight: 0 }} />
          </Tooltip>
        </>
      ),
      url: `/smpc/v1/${organizationId}/${isSup ? 'sup-' : ''}skus/query-sku-temporary`,
      params: { approveStatus: 'REJECT' },
      isFilter: ['EC', 'RECEIVE'].includes(skuType),
      sort: 3,
      dsProps: { primaryKey: 'skuTemporaryId' },
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_APPROVE.SEARCH_BAR', `${customPrefixSup}_APPROVE`];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU_APPROVE.SEARCH_BAR', `${customPrefixPur}_APPROVE`];
        }
      },
    },
    {
      value: '7',
      tabKey: 'expired',
      meaning: intl.get('smpc.workbench.view.expired').d('已失效'),
      params: { skuType, validFlag: 0 },
      sort: 9,
      isFilter: ['EC', 'RECEIVE'].includes(skuType),
      customizeUnitCode: 'SMPC.WORKBENCH_PUR.SKU_NEW.SEARCH_BAR',
      getCustomizeUnitCode: () => {
        if (isSup) {
          return ['SMPC.WORKBENCH_SUP.SKU_EXPIRE.SEARCH_BAR', `${customPrefixSup}_EXPIRE`];
        } else {
          return ['SMPC.WORKBENCH_PUR.SKU_EXPIRE.SEARCH_BAR', `${customPrefixPur}_EXPIRE`];
        }
      },
    },
    {
      value: '8',
      tabKey: 'recycle',
      meaning: intl.get('smpc.workbench.view.recycle').d('回收站'),
      params: {
        skuType: receiveSkuType,
        recycleFlag: 1,
        receiveFlag: isReceive ? 1 : undefined,
      },
      sort: 10,
      url: skuType === 'RECEIVE' ? purUrl1 : ecUrl,
      isFilter: skuType === 'CATA',
      exportCode: skuType === 'RECEIVE' ? 'SMPC_RECEIVE_SKU_EXPORT' : 'SMPC_EC_SKU_RECYCLE_EXPORT',
      getCustomizeUnitCode: () => {
        if (!isSup && skuType === 'RECEIVE') {
          return [
            'SMPC.WORKBENCH_PUR.RECEIVE_SKU_RECYCLE.SEARCH_BAR',
            `${customPrefixReceive}_RECYCLE`,
          ];
        }
        return ['SMPC.WORKBENCH_PUR.EC_SKU_RECYCLE.SEARCH_BAR', `${customPrefixEc}_RECYCLE`];
      },
    },
    {
      value: '9',
      tabKey: 'approving',
      meaning: intl.get('smpc.workbench.view.approving').d('审批中'),
      params: {
        skuType,
        ecApproveFlag: 1,
      },
      sort: 4,
      isFilter: ['CATA', 'RECEIVE'].includes(skuType),
      getCustomizeUnitCode: () => {
        return ['SMPC.WORKBENCH_PUR.EC_SKU_APPROVING.SEARCH_BAR', `${customPrefixEc}__APPROVING`];
      },
      dsProps: {
        events: {
          load: ({ dataSet }) => handleApproveFunc({ dataSet, skuType }),
        },
      },
    },
  ];

  const filterList = statusList.filter((f) => !f.isFilter); // 条件过滤Tab,
  filterList.sort((prev, next) => prev.sort - next.sort);
  if (type === 'status') return filterList;
  const dsMap = {};
  const ecExportUrl = `/smec/v1/${organizationId}/pur-skus/ec-list`;
  // 自由 || 电商 整理得到ds信息
  const newList = filterList.map((f) => {
    const {
      value,
      url = isSup ? supUrl1 : skuType === 'CATA' ? purUrl1 : ecUrl,
      params = {},
      dsProps = {},
      getCustomizeUnitCode,
    } = f;
    const [customizeUnitCode, tableCustomizeUnitCode] = getCustomizeUnitCode();
    const paraCode = `${customizeUnitCode},${tableCustomizeUnitCode}`;
    const exportUrl =
      skuType === 'EC'
        ? `${ecExportUrl}/export?customizeUnitCode=${paraCode}`
        : `${url}/export?customizeUnitCode=${paraCode}`;
    // 不显示商品单位税率币种的导出
    // const exportUrl2 = ;
    const dsName = `ds_${value}`;
    // 都是一个DS,只是根据不同条件筛选数据
    const table = new DataSet(tableDs(url, { ...params, customizeUnitCode: paraCode }, dsProps));
    dsMap[dsName] = {
      table,
      exportUrl,
      customizeUnitCode,
      tableCustomizeUnitCode,
      getPara: () => {
        if (table.queryDataSet && table.queryDataSet.current) {
          const queryPara = table.queryDataSet.current.toJSONData();
          const skuCodes = table.getQueryParameter('skuCodes');
          delete queryPara.__dirty;
          delete queryPara.__id;
          delete queryPara._status;
          return {
            skuCodes,
            ...params,
            ...queryPara,
            ...(skuType === 'EC' ? { catalogIds: queryPara?.catalogIds?.split(',') } : null), // 电商导出针对目录字段需要传数组
            exportSearchbarUnitCode: customizeUnitCode,
          };
        }
      },
      // 勾选导出剔除筛选器条件
      getDefaultPara: () => ({
        ...params,
        customizeUnitCode: paraCode,
      }),
      search: async (isFirst = true, otherParams, cached = true) => {
        const page = isFirst ? 1 : table.currentPage;
        await table.query(page, otherParams, cached);
      },
      queryCount: async () => {
        const res = getResponse(await fetchOnlyCount(url, params));
        if (res) {
          return res;
        }
        return {};
      },
    };
    return { ...f, ds: dsMap[dsName], exportUrl, customizeUnitCode, tableCustomizeUnitCode };
  });
  if (type === 'ds') return dsMap;

  return [newList, dsMap];
}

/**
 * 撤销审批
 */
export async function handleRevokeApprove(businessKey, callback = (e) => e) {
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm').d('提示'),
    children: intl
      .get('hzero.common.view.revokeApproval.tip')
      .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
    onOk: async () => {
      const res = getResponse(await revokeApproveService(businessKey));
      if (isEmpty(res)) {
        notification.success();
        if (callback) {
          callback();
        }
      } else {
        notification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: res,
        });
      }
    },
  });
}
