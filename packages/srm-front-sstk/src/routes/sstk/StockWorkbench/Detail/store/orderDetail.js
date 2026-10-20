import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';

import { fetchCurrentStock } from '../../api';

const organizationId = getCurrentOrganizationId();

const IN_LOV_CODE = {
  companyLOvCode: 'SPFM.USER_AUTH.COMPANY',
  organizationLovCode: 'STCK.USER_AUTH.INVORG',
  inventoryLovCode: 'STCK.USER_AUTH.INVENTORY',
  locationLovCode: 'HPFM.LOCATION_URL',
  itemLovCode: 'STCK.IN_ORDER_ITEM',
};
const OUT_LOV_CODE = {
  companyLOvCode: 'STCK.OUT_ORDER_COMPANY',
  organizationLovCode: 'STCK.OUT_ORDER_INV_ORG',
  inventoryLovCode: 'STCK.OUT_ORDER_INVENTORY',
  locationLovCode: 'STCK.OUT_ORDER_LOCATION',
  batchLovCode: 'STCK.OUT_ORDER_BATCH_NUM', // 批次号 出库单是值集 入库是文本
  itemLovCode: 'STCK.OUT_ORDER_ITEM',
};

// 单据头公共字段
const getCommonHeader = () => {
  return [
    {
      label: intl.get('sstk.stockWorkbench.model.orderNum').d('库存单号'),
      name: 'orderNum',
      disabled: true,
    },
    {
      label: intl.get('sstk.stockWorkbench.model.orderName').d('标题'),
      name: 'orderName',
      required: true,
    },
    {
      label: intl.get('sstk.common.model.status').d('状态'),
      name: 'statusCode',
    },
    {
      label: intl.get('sstk.stockWorkbench.model.orderType').d('业务类型'),
      name: 'orderType',
      required: true,
      // lookupCode: 'STCK.IN_OUT_ORDER.ORDER_TYPE',
      // defaultValue: 'TRANSFER',
    },
    {
      label: intl.get('sstk.common.model.creator').d('创建人'),
      name: 'realName',
    },
    {
      label: intl.get('sstk.common.model.model.creationDate').d('创建时间'),
      type: 'dateTime',
      name: 'creationDate',
    },
    {
      label: intl.get('sstk.common.model.remark').d('备注'),
      name: 'remark',
      maxLength: 360,
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('hzero.common.view.title.attachmentList').d('内部附件'),
    },
  ];
};

// 公司、库存组织、库房
// 库存组织带出公司， 库房带出库存组织、公司
const getCommonCompany = ({
  companyLabel = '',
  organizationLabel = '',
  inventoryLabel = '',
  companyName = '',
  organizationName = '',
  inventoryName = '',
  companyLOvCode = '',
  organizationLovCode = '',
  inventoryLovCode = '',
}) => {
  const getName = (name = '', type = '', filter = 'Lov') => (name.split(filter) || [])[0] + type;
  const _companyId = getName(companyName, 'Id');
  const _organizationId = getName(organizationName, 'Id');
  return [
    {
      label: companyLabel,
      name: companyName,
      type: 'object',
      lovCode: companyLOvCode,
      valueField: 'companyId',
      textField: 'companyName',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      transformResponse: (_, record) => {
        return record
          ? {
            companyName: record.inCompanyName,
            companyId: record.inCompanyId,
          }
          : null;
      },
    },
    {
      name: _companyId,
      bind: `${companyName}.companyId`,
    },
    {
      name: getName(companyName, 'Name'),
      bind: `${companyName}.companyName`,
    },
    {
      label: organizationLabel, //  outInvOrganizationLov
      name: organizationName,
      type: 'object',
      ignore: 'always',
      required: true,
      lovCode: organizationLovCode,
      valueField: 'organizationId',
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get(companyName)?.companyId,
        }),
      },
    },
    {
      name: _organizationId,
      bind: `${organizationName}.organizationId`,
    },
    {
      name: getName(organizationName, 'Name'),
      bind: `${organizationName}.organizationName`,
    },
    {
      label: inventoryLabel,
      name: inventoryName,
      type: 'object',
      lovCode: inventoryLovCode,
      valueField: 'inventoryId',
      textField: 'inventoryName',
      ignore: 'always',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get(companyName)?.companyId,
          organizationId: record.get(organizationName)?.organizationId,
        }),
      },
    },
    {
      // name: 'outInventoryId',
      // bind: 'outInventoryLov.inventoryId',
      name: getName(inventoryName, 'Id'),
      bind: `${inventoryName}.inventoryId`,
    },
    {
      // name: 'inInventoryName',
      // bind: 'inventoryLov.inventoryName',
      name: getName(inventoryName, 'Name'),
      bind: `${inventoryName}.inventoryName`,
    },
  ];
};

// 库位
const getCommonLocation = ({
  locationLabel = '',
  locationName = '',
  locationLovCode = '',
  bindCompanyName = '',
  bindOrgInventoryName = '',
  bindInventoryName = '',
  prefix = '',
  operateType,
}) => {
  const getName = (name = '', type = 'Id', filter = 'Lov') => {
    let _name = (name.split(filter) || [])[0];
    if (prefix) _name = _name.slice(0, 1).toUpperCase() + _name.slice(1);
    return prefix + _name + type;
  };
  const relaInventoryLov = operateType === 'IN' ? 'inInventoryLov' : 'outInventoryLov';
  return [
    {
      label: locationLabel,
      name: locationName,
      type: 'object',
      lovCode: locationLovCode,
      valueField: 'locationId',
      textField: 'locationName',
      ignore: 'always',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          const {
            outInventoryId,
            inInventoryId,
          } = record.get('customHeaderInfo') || {};
          return (filterNullValueObject({
            tenantId: organizationId,
            batchNum: record.get('batchNumLov')?.batchNum,
            inventoryId: operateType !== 'TRANSFER'
              ? record.get(relaInventoryLov)?.inventoryId
              : locationName === 'inLocationLov'
                ? inInventoryId
                : outInventoryId,
            itemId: operateType !== 'IN' && locationName !== 'inLocationLov' ? record.get('itemId') : null,
          }));
        },
        // 调拨单公司库房库存组织在头上，另行判断
        disabled: ({ record }) => {
          const {
            outInventoryId,
            inInventoryId,
            inCompanyId,
            outCompanyId,
            inInvOrganizationId,
            outInvOrganizationId,
          } = record.get('customHeaderInfo') || {};
          if (operateType !== 'TRANSFER') {
            return !record.get(bindCompanyName)?.companyId
              || !record.get(bindOrgInventoryName)?.organizationId
              || !record.get(bindInventoryName)?.inventoryId
              || (!record.get('itemId') && operateType === 'OUT');
          }
          else {
            return locationName === 'inLocationLov'
              ? !inCompanyId || !inInvOrganizationId || !inInventoryId
              : !outCompanyId || !outInvOrganizationId || !outInventoryId || !record.get('itemId');
          }
        },
        // 出库操作库位必输
        required: () => locationName === 'outLocationLov' || prefix === 'out',
      },
    },
    {
      name: getName(locationName, 'Id'),
      bind: `${locationName}.locationId`,
    },
    {
      name: getName(locationName, 'Name'),
      bind: `${locationName}.locationName`,
    },
  ];
};

// 出入库存单头
const orderHeaderDS = (inOutHeaderId) => ({
  autoCreate: true,
  autoQuery: false,
  fields: getCommonHeader(),
  transport: {
    read: {
      url: `/stck/v1/${organizationId}/in-out-order-headers?inOutHeaderId=${inOutHeaderId}&detailFlag=1`,
      method: 'GET',
    },
  },
});

// 调拨单头
const allocationOrderHeaderDS = (inOutHeaderId) => ({
  autoCreate: true,
  autoQuery: false,
  fields: [
    ...getCommonHeader(),
    ...getCommonCompany({
      companyLabel: intl.get('sstk.stockWorkbench.model.allocationOutCompany').d('调出公司'),
      organizationLabel: intl.get('sstk.stockWorkbench.model.allocationOutOrganization').d('调出库存组织'),
      inventoryLabel: intl.get('sstk.stockWorkbench.model.allocationOutInventory').d('调出库房'),
      companyName: 'outCompanyLov',
      organizationName: 'outInvOrganizationLov',
      inventoryName: 'outInventoryLov',
      ...OUT_LOV_CODE,
    }),
    ...getCommonCompany({
      companyLabel: intl.get('sstk.stockWorkbench.model.allocationInCompany').d('调入公司'),
      organizationLabel: intl.get('sstk.stockWorkbench.model.allocationInOrganization').d('调入库存组织'),
      inventoryLabel: intl.get('sstk.stockWorkbench.model.allocationInInventory').d('调入库房'),
      companyName: 'inCompanyLov',
      organizationName: 'inInvOrganizationLov',
      inventoryName: 'inInventoryLov',
      ...IN_LOV_CODE,
    }),
  ],
  transport: {
    read: {
      url: `/stck/v1/${organizationId}/in-out-order-headers?inOutHeaderId=${inOutHeaderId}&detailFlag=1`,
      method: 'GET',
    },
  },
  events: {
    update: ({ record, name, value, oldValue }) => {
      // 有值清空下清空调出公司
      if (name === 'outCompanyLov') {
        if (oldValue?.companyId && value?.companyId !== oldValue?.companyId) {
          record.set('outInvOrganizationLov', null);
          record.set('outInventoryLov', null);
        }
        // 回写
        if (value?.companyId && value?.organizationId && value?.inventoryId) {
          record.set('outInvOrganizationLov', value);
          record.set('outInventoryLov', value);
        }
      }
      // 有值清空下清空调入公司
      if (name === 'inCompanyLov') {
        if (oldValue?.companyId && value?.companyId !== oldValue?.companyId) {
          record.set('inInvOrganizationLov', null);
          record.set('inInventoryLov', null);
        }
        // 回写
        if (value?.companyId && value?.organizationId && value?.inventoryId) {
          record.set('inInvOrganizationLov', value);
          record.set('inInventoryLov', value);
        }
      }
      // 有值清空下清空调出库存组织
      if (name === 'outInvOrganizationLov') {
        if (oldValue?.organizationId && value?.organizationId !== oldValue?.organizationId) {
          record.set('outInventoryLov', null);
        }
        if (value?.organizationId) {
          record.set('outCompanyLov', value);
        }
      }
      // 有值清空下清空调入库存组织
      if (name === 'inInvOrganizationLov') {
        if (oldValue?.organizationId && value?.organizationId !== oldValue?.organizationId) {
          record.set('inInventoryLov', null);
        }
        if (value?.organizationId) {
          record.set('inCompanyLov', value);
        }
      }
      if (name === 'outInventoryLov') {
        if (value?.inventoryId) {
          record.set('outCompanyLov', value);
          record.set('outInvOrganizationLov', value);
        }
      }
      if (name === 'inInventoryLov') {
        if (value?.inventoryId) {
          record.set('inCompanyLov', value);
          record.set('inInvOrganizationLov', value);
        }
      }
    },
  },
});

const setCurrentStock = async (record, operateType) => {
  const {
    outCompanyId,
    outInvOrganizationId,
    outInventoryId,
  } = record.get('customHeaderInfo') || {};
  const _locationId = operateType === 'OUT'
    ? record.get('locationLov')?.locationId
    : record.get('outLocationLov')?.locationId;
  // 有物料才有库存
  if (record.get('itemId')) {
    const res = getResponse(await fetchCurrentStock([{
      companyId: operateType === 'OUT' ? record.get('outCompanyId') : outCompanyId,
      invOrganizationId: operateType === 'OUT' ? record.get('outInvOrganizationId') : outInvOrganizationId,
      inventoryId: operateType === 'OUT' ? record.get('outInventoryId') : outInventoryId,
      itemId: record.get('itemId'),
      locationId: _locationId,
      batchNum: record.get('batchNum'),
    }]));
    if (res) {
      record.set('currentStock', (res || [])[0]?.currentStock);
    }
  }
};

const orderLineDS = (readOnly, operateType = 'IN', remote) => {
  const prefix = operateType === 'IN' ? 'in' : 'out';
  const isOut = operateType !== 'IN'; // 调拨单 物料为出库的值集
  const lovSet = isOut ? OUT_LOV_CODE : IN_LOV_CODE;
  const companyLov = `${prefix}CompanyLov`;
  const orgLov = `${prefix}InvOrganizationLov`;
  const inventoryLov = `${prefix}InventoryLov`;
  // const locationLov = `${prefix}locationLov`;
  // 非调拨单显示 公司、库存组织、库房 出库、入库 值集不同
  const commonFields = operateType !== 'TRANSFER' ? getCommonCompany({
    companyLabel: intl.get('sstk.stockWorkbench.model.companyName').d('公司'),
    organizationLabel: intl.get('sstk.stockWorkbench.model.invOrganization').d('库存组织'),
    inventoryLabel: intl.get('sstk.stockWorkbench.model.inventory').d('库房'),
    companyName: companyLov,
    organizationName: orgLov,
    inventoryName: inventoryLov,
    ...lovSet,
  }) : [];
  const locationFields = operateType === 'TRANSFER'
    ? [
      ...getCommonLocation({
        locationLabel: intl.get('sstk.stockWorkbench.model.outLocation').d('调出库位'),
        locationName: 'outLocationLov',
        locationLovCode: OUT_LOV_CODE.locationLovCode,
        operateType,
      }),
      ...getCommonLocation({
        locationLabel: intl.get('sstk.stockWorkbench.model.inLocation').d('调入库位'),
        locationName: 'inLocationLov',
        locationLovCode: IN_LOV_CODE.locationLovCode,
        operateType,
      }),
    ]
    : getCommonLocation({
      locationLabel: intl.get('sstk.stockWorkbench.model.location').d('库位'),
      locationName: 'locationLov',
      locationLovCode: lovSet.locationLovCode,
      bindCompanyName: companyLov,
      bindOrgInventoryName: orgLov,
      bindInventoryName: inventoryLov,
      prefix,
      operateType,
    });
  // 入库批次号手动输入，出库调拨值集
  const batchField = isOut
    ? [
      {
        label: intl.get('sstk.common.model.batchNum').d('批次号'),
        name: 'batchNumLov',
        type: 'object',
        lovCode: lovSet.batchLovCode,
        // required: true,
        valueField: 'batchNum',
        textField: 'batchNum',
        dynamicProps: {
          lovPara: ({ record }) => {
            const {
              outInventoryId,
            } = record.get('customHeaderInfo') || {};
            return filterNullValueObject({
              tenantId: organizationId,
              itemId: record.get('itemLov')?.itemId,
              inventoryId: operateType === 'OUT' ? record.get('outInventoryLov')?.inventoryId : outInventoryId, // 出库
              locationId: operateType === 'TRANSFER' ? record.get('outLocationLov')?.locationId : record.get('locationLov')?.locationId,
            });
          },
          disabled: ({ record }) => !record.get('itemLov')?.itemId,
        },
        ignore: 'always',
      },
      {
        name: 'batchNum',
        bind: 'batchNumLov.batchNum',
      },
    ]
    : [
      {
        label: intl.get('sstk.common.model.batchNum').d('批次号'),
        name: 'batchNum',
      }];
  return {
    autoCreate: false,
    autoQuery: false,
    primaryKey: 'orderLineId',
    cacheSelection: true,
    pageSize: 20,
    selection: readOnly ? false : 'multiple',
    // 埋点: 优品道
    fields: remote.process('LINE_DS_FIELDS',
      [
        ...commonFields,
        {
          name: 'lineNum',
          label: intl.get('sstk.common.model.sourceLineCode').d('行号'),
          type: 'string',
        },
        // 物料带出单位
        // 入库不限制物料
        {
          label: intl.get('sstk.common.model.itemCode').d('物料编码'),
          name: 'itemLov',
          type: 'object',
          lovCode: lovSet.itemLovCode,
          valueField: 'itemId',
          textField: 'itemCode',
          dynamicProps: {
            lovPara: ({ record }) => {
              const {
                outInventoryId,
              } = record.get('customHeaderInfo') || {};
              return {
                tenantId: organizationId,
                inventoryId: operateType === 'OUT'
                  ? record.get('outInventoryLov')?.inventoryId
                  : operateType === 'TRANSFER'
                    ? outInventoryId
                    : null,
              };
            },
            // 调拨单另行处理
            disabled: ({ record }) => {
              const {
                outInventoryId,
              } = record.get('customHeaderInfo') || {};
              if (operateType !== 'TRANSFER') {
                return !record.get(inventoryLov)?.inventoryId;
              }
              return !outInventoryId;
            },
          },
          ignore: 'always',
          required: true,
        },
        {
          name: 'itemCode',
          bind: 'itemLov.itemCode',
        },
        {
          name: 'itemId',
          bind: 'itemLov.itemId',
        },
        {
          name: 'uomPrecision',
          bind: 'itemLov.uomPrecision',
        },
        {
          name: 'batchFlag',
          bind: 'itemLov.batchFlag',
        },
        {
          label: intl.get('sstk.common.model.itemName').d('物料名称'),
          name: 'itemName',
          bind: 'itemLov.itemName',
          disabled: true,
        },
        {
          label: intl.get('sstk.common.model.uom').d('单位'),
          name: 'uomLov',
          type: 'object',
          lovCode: 'SMDM.UOM',
          valueField: 'uomId',
          textField: 'uomName',
          ignore: 'always',
          required: true,
          lovPara: { tenantId: organizationId },
          dynamicProps: {
            disabled: () => operateType !== 'IN',
          },
        },
        {
          name: 'uomId',
          bind: 'uomLov.uomId',
        },
        {
          name: 'uomName',
          bind: 'uomLov.uomName',
        },
        ...batchField,
        ...locationFields,
        {
          label: operateType === 'OUT'
            ? intl.get('sstk.stockWorkbench.model.modifiedNum').d('出库数量')
            : operateType === 'IN'
              ? intl.get('sstk.stockWorkbench.model.inModifiedNum').d('入库数量')
              : intl.get('sstk.stockWorkbench.model.modifiedNumTransfer').d('调拨数量'),
          name: 'modifiedNum',
          type: 'number',
          required: true,
          min: 0,
          dynamicProps: {
            max: ({ record }) => record.get('currentStock'),
            precision: ({ record }) => record.get('uomPrecision'),
          },
        },
        {
          label: intl.get('sstk.stockWorkbench.model.currentStock').d('当前库存量'),
          name: 'currentStock',
          type: 'number',
        },
      ], { operateType }),
    events: {
      update: async ({ record, name, value, oldValue }) => {
        if (name === companyLov) {
          // 清空自己 主动改变值
          if ((oldValue?.companyId && value?.companyId !== oldValue?.companyId)) {
            record.set(orgLov, null);
            record.set(inventoryLov, null);
          }
          // 回写（库房带出公司、组织，再清楚组织，再更改库房）
          if (value?.companyId && value?.organizationId && value?.inventoryId) {
            record.set(orgLov, value);
            record.set(inventoryLov, value);
          }
          if (operateType === 'TRANSFER') {
            record.set('inLocationLov', null);
            record.set('outLocationLov', null);
          } else {
            record.set('locationLov', null);
          }
          record.set('itemLov', null);
          record.set('uomLov', null);
          record.set('batchNumLov', null);
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
        }
        // 库存组织带出公司
        if (name === orgLov) {
          // 清空自己
          if (oldValue?.organizationId && value?.organizationId !== oldValue?.organizationId) {
            record.set(inventoryLov, null);
          }
          if (value?.organizationId) {
            record.set(companyLov, value);
          }
          if (operateType === 'TRANSFER') {
            record.set('inLocationLov', null);
            record.set('outLocationLov', null);
          } else {
            record.set('locationLov', null);
          }
          record.set('itemLov', null);
          record.set('uomLov', null);
          record.set('batchNumLov', null);
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
        }
        // 库房带出库存组织、公司
        if (name === inventoryLov) {
          if (value?.inventoryId) {
            record.set(companyLov, value);
            record.set(orgLov, value);
          }
          if (operateType === 'TRANSFER') {
            record.set('inLocationLov', null);
            record.set('outLocationLov', null);
          } else {
            record.set('locationLov', null);
          }
          record.set('itemLov', null);
          record.set('uomLov', null);
          record.set('batchNumLov', null);
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
        }
        if (name === 'itemLov') {
          record.set('batchNumLov', null);
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
          if (!value) record.set('currentStock', null);
        }
        if (name === 'batchNumLov') {
          if (operateType === 'TRANSFER') {
            record.set('inLocationLov', null);
            record.set('outLocationLov', null);
          } else {
            record.set('locationLov', null);
          }
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
        }
        if (['locationLov', 'outLocationLov'].includes(name)) {
          if (operateType !== 'IN') {
            setCurrentStock(record, operateType);
          }
        }
      },
    },
    transport: {
      read: {
        url: `/stck/v1/${organizationId}/in-out-order-lines`,
        method: 'GET',
      },
      destroy: {
        url: `/stck/v1/${organizationId}/in-out-order-lines `,
        method: 'DELETE',
      },
    },
  };
};

export {
  orderHeaderDS,
  orderLineDS,
  allocationOrderHeaderDS,
};