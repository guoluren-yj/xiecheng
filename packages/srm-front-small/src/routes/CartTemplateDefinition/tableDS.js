import { sortBy } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { getTemplateStyle } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_MALLCART = '/smct';

export const tableDs = (templateStyle) => ({
  paging: 'false',
  autoQuery: false,
  selection: false,
  // pageSize: 20,
  // expandField: 'expend',
  primaryKey: 'mySubVersion',
  idField: 'mySubVersion',
  parentField: 'parentVersion',
  cacheSelection: false,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.status`).d('状态'),
      type: 'string',
      name: 'statusMeaning',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateCode`).d('模板编码'),
      name: 'templateCode',
      type: 'string',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateName`).d('模板名称'),
      type: 'string',
      name: 'templateName',
      required: true,
    },
    {
      label: intl.get('small.common.table.column.remark').d('备注'),
      name: 'remark',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.version`).d('版本'),
      name: 'version',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateType`).d('模板类型'),
      name: 'templateTypeMeaning',
      type: 'string',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.isOpen`).d('是否启用'),
      type: 'string',
      name: 'enableFlagMeaning',
      required: true,
      align: 'left',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateManage`).d('模板管理'),
      type: 'string',
      name: 'templateManage',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.edit`).d('操作'),
      type: 'object',
      name: 'edit',
    },
    {
      name: 'units',
      label: intl.get('small.mallHomeConfig.view.purchase.fenpei').d('采买组织分配'),
      type: 'object',
      textField: 'unitCodeName',
      valueField: 'unitId',
      multiple: true,
      transformResponse: (_, record) => {
        const { allUnitFlag, units } = record;
        const allUnit = {
          unitId: 'ALL',
          unitName: intl.get('smpc.product.model.allOrg').d('所有组织'),
        };
        const list = allUnitFlag === 1 ? [allUnit] : units;
        return list
          ? list.map((m) => ({
              ...m,
              unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
            }))
          : list;
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates/list`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/list`,
        method: 'GET',
        data: {
          ...data,
          templateStyle,
          customizeUnitCode:
            organizationId === 0
              ? 'CART-TEMPLATE_DEFINITION.SEARCH_BAR'
              : 'SMALL_TEMPLATE-LIST.SEARCH_BAR',
        },
        transformResponse: (res) => {
          try {
            const resp = JSON.parse(res);
            // 历史版本
            const historyList = resp.filter(i=> i.historyFlag===1) || [];
            const unHistoryList = resp.filter(i=> i.historyFlag!==1) || [];
            // 预定义
            const isPreDefineFlag = (item) => item.templateType === 'PREDEFINED';
            // 自定义头节点
            const isCustomFlag = (item) => ["DISABLED", "PUBLISHED"].includes(item.status);
            // 需要把预定义放第一行
            const sortUnHistoryList = sortBy(unHistoryList, (n) => {
              return !isPreDefineFlag(n);
            });
            const result = sortUnHistoryList.map(n => {
              const preDefineFlag = isPreDefineFlag(n);
              const customFlag = isCustomFlag(n);
              // 未发布状态只有列表不存在已发布和已经用的才会在头节点
              const parentVersion =
                customFlag ||
                preDefineFlag ||
                (n.status === 'UNPUBLISHED' &&
                  !unHistoryList.some(i => !isPreDefineFlag(i) && isCustomFlag(i)))
                  ? null
                  : 2;
              // 平台级
              if (organizationId === 0) {
                return {
                  ...n,
                  parentVersion: n.status === 'UNPUBLISHED' ? 1 : null,
                  historyList: n.status === 'PUBLISHED' ? historyList : null,
                  mySubVersion: n.status === 'PUBLISHED' ? 1 : 2,
                };
              }
              return {
                ...n,
                parentVersion,
                historyList: !isPreDefineFlag(n) && !parentVersion ? historyList : null,
                mySubVersion: preDefineFlag ? 1 : customFlag ? 2 : 3, // 1预定义2自定义3自定义子级
              };
            });
            return result;
          } catch  {
            return [];
          }
        },
      };
    },
    submit: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates`,
        method: 'PUT',
        data: { ...data[0], templateStyle: getTemplateStyle() },
      };
    },
  },
});

export const createDS = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle`).d('模板编码'),
      name: 'templateCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateName`).d('模板名称'),
      type: 'intl',
      name: 'templateName',
      required: true,
      validator: (val) => {
        if (val.length > 4) {
          return intl.get('small.common.cartTemplateDefinition.maxLength').d('名称最大长度为4');
        }
      },
    },
    {
      label: intl.get('small.common.table.column.remark').d('备注'),
      type: 'intl',
      name: 'remark',
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates`,
        method: 'POST',
        data: { ...data[0], templateStyle: getTemplateStyle() },
      };
    },
  },
});

export const editDS = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle`).d('模板编码'),
      name: 'templateCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateName`).d('模板名称'),
      type: 'intl',
      name: 'templateName',
      required: true,
      validator: (val) => {
        if (val.length > 4) {
          return intl.get('small.common.cartTemplateDefinition.maxLength').d('名称最大长度为4');
        }
      },
    },
    {
      label: intl.get('small.common.table.column.remark').d('备注'),
      type: 'intl',
      name: 'remark',
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/dimensiontemplates`
            : `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates`,
        method: 'PUT',
        data: { ...data[0], templateStyle: getTemplateStyle() },
      };
    },
  },
});

export const cloneDS = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle`).d('模板编码'),
      name: 'templateCode',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.templateName`).d('模板名称'),
      type: 'intl',
      name: 'templateName',
      required: true,
      validator: (val) => {
        if (val.length > 4) {
          return intl.get('small.common.cartTemplateDefinition.maxLength').d('名称最大长度为4');
        }
      },
    },
    {
      label: intl.get('small.common.table.column.remark').d('备注'),
      type: 'intl',
      name: 'remark',
    },
  ],
  // transport: {
  //   submit: ({ data }) => {
  //     return {
  //       url: `${SRM_MALLCART}/v1/${organizationId}/dimensiontemplates/copy`,
  //       method: 'POST',
  //       data: { ...data[0], templateId },
  //     };
  //   },
  // },
});

export const recordDS = () => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle`).d('操作'),
      name: 'operationType',
      type: 'string',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle.desc`).d('操作描述'),
      type: 'string',
      name: 'operationDescription',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle.people`).d('操作人'),
      type: 'string',
      name: 'operator',
    },
    {
      label: intl.get(`small.common.cartTemplateDefinition.model.handle.date`).d('操作日期'),
      type: 'string',
      name: 'lastUpdateDate',
    },
  ],
  transport: {
    read() {
      return {
        url:
          organizationId === 0
            ? `${SRM_MALLCART}/v1/template-historys`
            : `${SRM_MALLCART}/v1/${organizationId}/template-historys`,
        method: 'GET',
      };
    },
  },
});
