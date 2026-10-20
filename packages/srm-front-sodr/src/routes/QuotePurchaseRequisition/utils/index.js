import React from 'react';
import { runInAction } from 'mobx';
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import FlexLinkModal from '@/routes/components/FlexLinkModal';
import { checkInvOrganization } from '@/services/orderWorkspaceService';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { getPrecision } from '@/routes/components/utils/index';

const organizationId = getUserOrganizationId();
/**
 *来源系统 srm, erp, 目录化， 电商
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function sourceSystem() {
  const systemSource = { srm: 'SRM', erp: 'ERP', catalogMall: 'CATALOGUE', elMall: 'E-COMMERCE' };
  return systemSource;
}

/**
 *订单来源 申请转订单, 手工创建订单, 寻源转订单，协议转订单
 * @returns {{prRequest: string, prOrder: string, source: string, pcOrder: string}}
 */
export function sourceBill() {
  const billSource = {
    prRequest: 'PURCHASE_REQUEST',
    prOrder: 'PURCHASE_ORDER',
    source: 'source',
    pcOrder: 'CONTRACT_ORDER',
  };
  return billSource;
}

/**
 *参考价格弹框内链接打开其他页面
 * @param {{value: string,record:object, type:string}}
 * @returns {{ReactNode}}
 */
export function getFlexLink(val, record, type) {
  let path = '';
  let search = {};
  let params = {};
  const { priceSource, sourceFromId } = record;
  switch (priceSource) {
    // PO / CON / RFX / BID
    case 'PO':
      path =
        type === 'h0'
          ? `/sodr/send-order/detail/:id`
          : `/sodr/order-workspace/detail/all-orders/:id`;
      params = { id: sourceFromId };
      search = querystring.stringify({
        openFrom: 'modal',
      });
      break;
    case 'CONTRACT':
      path = '/sodr/purchase-order-maintain/purchase/detail';
      search = querystring.stringify({ pcHeaderId: sourceFromId, openFrom: 'modal' });
      break;
    case 'RFX':
      path = '/sodr/purchase-order-maintain/source-from-requisition/query-rfq/:rfxId';
      params = { rfxId: sourceFromId };
      search = querystring.stringify({
        libFlag: `order`,
        sourcePage: 'order',
        rfxStatus: 'FINISHED',
        inComingStatus: 'CHECK_PENDING',
      });
      break;
    case 'BID':
      path = '/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/:bidId';
      params = { bidId: sourceFromId };
      search = querystring.stringify({
        // libFlag: `order`,
        // sourcePage: 'order',
        openFrom: 'modal',
        source: 'NONE',
      });
      break;
    default:
      path = '';
      break;
  }
  const _search = `?${search}`;
  const _location = {
    hash: '',
    pathname: path,
    search: _search,
  };
  const flexLinkProps = {
    path,
    type,
    text: val,
    location: _location,
    match: {
      params,
      path,
    },
    history: {
      ...window.dvaApp._history,
      location: _location,
    },
  };
  // eslint-disable-next-line react/react-in-jsx-scope
  return <FlexLinkModal {...flexLinkProps} />;
}

/**
 * 批量编辑字段校验规则
 * @param {Object} fields 批量编辑字段
 * @returns {Boolean} 是否继续批量编辑
 */
export async function validateBatchEditing(fields = {}) {
  const errList = [];
  const fieldKeys = Object.keys(fields);
  const fieldsName = {
    invOrganizationId: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
    ouId: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    itemId: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    costId: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
    invInventoryId: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
  };
  const rules = [
    {
      included: ['invOrganizationId'],
      notInclud: ['costId'],
      keyList: [['invOrganizationId', 'ouId', 'itemId']],
    },
    {
      included: ['costId'],
      notInclud: ['invOrganizationId'],
      keyList: [['costId', 'ouId']],
    },
    {
      included: ['invOrganizationId', 'costId'],
      notInclud: [],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
      ],
    },
    {
      included: ['invOrganizationId'],
      notInclud: ['costId', 'invInventoryId'],
      keyList: [['invOrganizationId', 'ouId', 'itemId']],
    },
    {
      included: ['costId'],
      notInclud: ['invOrganizationId', 'invInventoryId'],
      keyList: [['costId', 'ouId']],
    },
    {
      included: ['invInventoryId'],
      notInclud: ['invOrganizationId', 'costId'],
      keyList: [['invInventoryId', 'invOrganizationId']],
    },
    {
      included: ['invOrganizationId', 'costId'],
      notInclud: ['invInventoryId'],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
      ],
    },
    {
      included: ['invOrganizationId', 'invInventoryId'],
      notInclud: ['costId'],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
    {
      included: ['costId', 'invInventoryId'],
      notInclud: ['invOrganizationId'],
      keyList: [
        ['costId', 'ouId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
    {
      included: ['invOrganizationId', 'costId', 'invInventoryId'],
      notInclud: [],
      keyList: [
        ['invOrganizationId', 'ouId', 'itemId'],
        ['costId', 'ouId'],
        ['invInventoryId', 'invOrganizationId'],
      ],
    },
  ];
  const currentRule = rules
    .sort((a, b) => b.included.length - a.included.length)
    .find((i) => {
      const included = i.included.every((n) => fieldKeys.includes(n));
      const notInclud = i.notInclud.find((n) => fieldKeys.includes(n));
      return included && !notInclud;
    });
  if (currentRule) {
    currentRule.keyList.forEach((i, index) => {
      const errmsg = intl
        .get('sodr.common.model.common.validatefieldsRule', {
          list: String(i.map((n) => `【${fieldsName[n]}】`)),
        })
        .d('{list}存在从属关系校验');
      const err = currentRule.keyList.length > 1 ? `${index + 1}. ${errmsg}` : errmsg;
      errList.push(err);
    });
    if (!isEmpty(errList)) {
      const result = await Modal.confirm({
        children: intl
          .get('sodr.common.model.common.validateBatchEditingMsg', {
            errList: String(errList),
          })
          .d('{errList},保存时如上校验不通过的行将不执行批量编辑，是否确认批量编辑?'),
      });
      return result === 'ok';
    }
  }
  return true;
}

export async function handleBatchOk({
  ds,
  batchMaintenanceDs,
  hasPriceLibrary = false,
  headerInfoDs,
  remote,
  remoteCode,
}) {
  // 暂不考虑个性化，批量编辑的所有值都来自于个性化单元
  const { selected, all } = ds;
  const batchRecord = batchMaintenanceDs.current;
  // 校验
  const allData = all.map((i) => i.toJSONData());
  const selectedData = selected.map((i) => i.toJSONData());
  const { __id, _status, __dirty, ...data } = batchRecord.toJSONData();
  const { invOrganizationId } = data;
  const validateRes = (await validateBatchEditing(data)) && (await batchMaintenanceDs.validate());
  if (!validateRes) return false;
  if (invOrganizationId) {
    let checkRes;
    const poHeaderDetailDTO = headerInfoDs?.current.toData();
    const res = await checkInvOrganization({
      list: { poHeaderDetailDTO, poLineDetailDTOs: isEmpty(selected) ? allData : selectedData },
      invOrganizationId,
    });
    try {
      checkRes = getResponse(JSON.parse(res));
    } catch {
      checkRes = res;
    }
    if (checkRes !== 'SUCCESS') return false;
  }
  // 记录
  const fieldMapValues = [];
  const fields = batchMaintenanceDs.fields.toJSON();
  for (const i in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
      const value = fields[i].getValue(batchRecord);
      const bind = fields[i].get('bind');
      if (value && !bind) {
        fieldMapValues.push([i, value]);
      }
    }
  }
  if (isEmpty(selected)) {
    // const oldMap = ds.getState('fieldMap') || {};
    const oldMapValues = ds.getState('fieldMapValues') || [];
    ds.setState({
      // fieldMap: { ...oldMap, ...data },
      fieldMapValues: [...oldMapValues, ...fieldMapValues],
    });
  }

  const otherOperation = remote
    ? remote.process(`${remoteCode}_PROCESS_OTHER_OPERATION`, false, {
        batchMaintenanceDs,
        ds,
        headerInfoDs,
        hasPriceLibrary,
      })
    : false;
  if (otherOperation) {
    return;
  }

  // 获取的值集顺序会影响库存组织的值，前端更新排序
  // fieldMapValues.sort(([a], [b]) => {
  //   return b.length - a.length;
  // });
  const batchRecordKeys = ds.getState('batchRecordKeys') || new Set([]);
  // 赋值
  runInAction(() => {
    (isEmpty(selected) ? ds : selected).forEach((i) => {
      fieldMapValues.forEach(([key, value]) => {
        const field = i.getField(key);
        // const priceFlag =
        //   ['enteredTaxIncludedPrice', 'unitPrice'].includes(key) &&
        //   i.get('priceLibraryId') &&
        //   i.get('priceTaxId');
        const priceEdit =
          ['enteredTaxIncludedPrice', 'unitPrice'].includes(key) && hasPriceLibrary
            ? !i.get('priceLibraryId')
            : true;
        if (!field.disabled && priceEdit && value) {
          i.set({ [key]: value });
          batchRecordKeys.add(i.key);
        }
      });
    });
  });
  ds.setState({ batchRecordKeys });
  batchMaintenanceDs.reset();
}

export async function crosspageBatch({ dataSet, hasPriceField = false }) {
  const fieldMap = dataSet.getState('fieldMap');
  const fieldMapValues = dataSet.getState('fieldMapValues');
  const { invOrganizationId } = fieldMap || {};
  // 跨页批量编辑
  if (fieldMapValues) {
    let validateResult = true;
    const needValidateLines = dataSet.filter((i) => i.status === 'sync').map((i) => i.toJSONData());
    if (invOrganizationId && !isEmpty(needValidateLines)) {
      let checkRes;
      const res = await checkInvOrganization({
        list: needValidateLines,
        invOrganizationId,
      });
      try {
        checkRes = getResponse(JSON.parse(res));
      } catch {
        checkRes = res;
      }
      if (checkRes !== 'SUCCESS') validateResult = false;
    }
    if (validateResult) {
      const batchRecordKeys = dataSet.getState('batchRecordKeys');
      runInAction(() => {
        dataSet.forEach((i) => {
          if (!batchRecordKeys.has(i.key)) {
            fieldMapValues.forEach(([key, value]) => {
              const field = i.getField(key);
              const priceEdit = ['enteredTaxIncludedPrice', 'unitPrice', 'taxId'].includes(key)
                ? !i.get('priceLibraryId')
                : true;
              const priceFlag = hasPriceField ? priceEdit : true;
              if (!field.disabled && !field.get('bind') && priceFlag) {
                i.set({ [key]: value });
                batchRecordKeys.add(i.key);
              }
            });
          }
        });
      });
    }
  }
}

export function batchMaintenance(props) {
  const getHeader = (_props) => {
    const { type, header } = props;
    const masterRecord = type === 'agreement' ? header : _props?.getState('headerInfoDs')?.current;
    return masterRecord;
  };
  const getOrgId = (record) => {
    // const _record = lineInfoDs.selected[0] || lineInfoDs.get(0);
    const _record = record;
    return _record?.get('invOrganizationId.organizationId');
  };
  return {
    dataToJSON: 'normal',
    autoCreate: true,
    fields: [
      {
        name: 'taxId',
        label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
        type: 'object',
        lovCode: 'SMDM.TAX',
        lovPara: {
          enabledFlag: 1,
          tenantId: organizationId,
        },
        transformResponse: (value) => value && { taxId: value },
        transformRequest: (value) => value?.taxId,
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        name: 'costId',
        label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
        type: 'object',
        lovCode: 'SPRM.COST_CENTER',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            const header = getHeader(dataSet);
            const { companyId } = header?.toJSONData() || {};
            return {
              companyId,
              tenantId: organizationId,
              ouId: header && header?.get('ouId')?.ouId,
            };
          },
        },
        transformResponse: (value) => value && { costId: value },
        transformRequest: (value) => value?.costId,
      },
      {
        name: 'costCode',
        bind: 'costId.costCode',
      },
      {
        name: 'costName',
        bind: 'costId.costName',
      },
      {
        name: 'needByDate',
        type: 'date',
        label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      },
      {
        name: 'invOrganizationId',
        label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
        type: 'object',
        lovCode: 'SPUC.SMDM.INV_ORG',
        dynamicProps: {
          lovPara: ({ dataSet, record }) => {
            const header = getHeader(dataSet);
            return {
              enabledFlag: 1,
              tenantId: organizationId,
              ouId: header && header.get('ouId')?.ouId,
              itemId: record.get('itemId'),
            };
          },
        },
        transformResponse: (value) => value && { invOrganizationId: value },
        transformRequest: (value) => value?.organizationId,
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'invInventoryId',
        label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
        type: 'object',
        lovCode: 'SODR.INVENTORY',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              tenantId: organizationId,
              organizationId: getOrgId(record),
            };
          },
        },
        transformResponse: (value) => value && { inventoryId: value },
        transformRequest: (value) => value?.inventoryId,
      },
      {
        name: 'inventoryName',
        bind: 'invInventoryId.inventoryName',
      },
      {
        name: 'enteredTaxIncludedPrice',
        type: 'number',
        label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrice').d('含税单价'),
        min: 0,
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ dataSet }) => {
            const header = getHeader(dataSet);
            const defaultPrecision = header?.get('defaultPrecision');
            return getPrecision(defaultPrecision);
          },
          disabled: ({ dataSet }) => {
            const header = getHeader(dataSet);
            return header?.get('benchmarkPriceType') === 'NET_PRICE';
          },
        },
      },
      {
        name: 'unitPrice',
        type: 'number',
        label: intl.get('sodr.workspace.model.common.unitPrice').d('不含税单价'),
        min: 0,
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision: ({ dataSet }) => {
            const header = getHeader(dataSet);
            const defaultPrecision = header?.get('defaultPrecision');
            return getPrecision(defaultPrecision);
          },
          disabled: ({ dataSet }) => {
            const header = getHeader(dataSet);
            const benchmarkPriceType = header?.get('benchmarkPriceType');
            return benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined;
          },
        },
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'invOrganizationId') {
          record.set({ invInventoryId: null, invLocationId: null });
        }
        if (name === 'invInventoryId') {
          record.set({
            invLocationId: null,
          });
        }
      },
    },
  };
}
