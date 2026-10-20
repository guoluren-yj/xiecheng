import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils'; // 租户ID

// import { fetchTreeChildData } from '@/services/PurchaseManageNewService';

const organizationId = getCurrentOrganizationId();

const deepExpand = (ds) => {
  // eslint-disable-next-line no-unused-expressions
  ds?.records?.forEach((r) => {
    const _r = r;
    if (r.get('children')) {
      _r.isExpanded = true;
    }
    if (r.get('children')) {
      deepExpand(r.get('children'));
    }
  });
};

// const deepFetchAndAppend = (dataSet, data) => {
//   const { enabledFlag } = dataSet.queryDataSet?.toData()[0] || {};
//   data.forEach((record) => {
//     if(record.hasChildren) {
//       fetchTreeChildData(
//         filterNullValueObject({
//           parentPurUnitId: record.purUnitId,
//           page: 0,
//           size: dataSet.pageSize,
//           enabledFlag,
//         })
//       ).then(res => {
//         const { content = [] } = res || {};
//         if(content.length > 0) {
//           dataSet.appendData(content);
//         }
//         deepFetchAndAppend(dataSet, content);
//       });
//     }
//   });
// };

const getCommonFields = (sourceType, level) => {
  return [
    {
      name: 'comLov',
      type: 'object',
      label: intl.get('sagm.purchaseManageNew.model.companyName').d('公司'),
      lovCode: 'HPFM.COMPANY',
      valueField: 'companyId',
      textField: 'companyName',
      ignore: 'always',
      disabled: sourceType === 'BUSINESS_UNIT',
      lovPara: {
        tenantId: organizationId,
      },
      transformResponse: (_, record) =>
        record.companyId
          ? {
              companyName: record.companyName,
              companyId: record.companyId,
            }
          : null,
      dynamicProps: {
        required: ({ record }) => record.get('invLov'),
      },
    },
    {
      name: 'companyId',
      bind: 'comLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'comLov.companyName',
    },
    {
      name: 'invLov',
      type: 'object',
      label: intl.get('sagm.purchaseManageNew.model.inventoryUnit').d('库存组织'),
      lovCode: 'SPFM.COMPANY_INVORGNIZATION',
      valueField: 'organizationId',
      textField: 'organizationName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => ({
          companyId: record.get('companyId'),
          tenantId: organizationId,
        }),
        // 第三层的不能编辑 （批量编辑可以，行上填值做了控制）
        disabled: ({ record }) =>
          sourceType === 'BUSINESS_UNIT' &&
          level === 'INV_ORGANIZATION' &&
          record.get('levelPath')?.split('|').length === 3,
      },
      transformResponse: (_, record) =>
        record.invOrganizationId
          ? {
              organizationName: record.invOrganizationName,
              organizationId: record.invOrganizationId,
            }
          : null,
    },
    {
      name: 'invOrganizationId',
      bind: 'invLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'invLov.organizationName',
    },
    {
      name: 'purLov',
      type: 'object',
      label: intl.get('sagm.purchaseManageNew.model.purchaseUnit').d('采购组织'),
      lovCode: 'HPFM.PURCHASE_ORGANIZATION ',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      ignore: 'always',
      disabled: sourceType === 'PUR_ORGANIZATION',
      lovPara: {
        tenantId: organizationId,
      },
      transformResponse: (_, record) =>
        record.purOrganizationId
          ? {
              organizationName: record.purOrganizationName,
              purchaseOrgId: record.purOrganizationId,
            }
          : null,
    },
    {
      name: 'purOrganizationId',
      bind: 'purLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purLov.organizationName',
    },
  ];
};
const tableDS = (sourceType, level) => {
  return {
    idField: 'purUnitId',
    autoQuery: false,
    parentField: 'parentPurUnitId',
    cacheSelection: true,
    primaryKey: 'purUnitId',
    pageSize: 20,
    paging: 'server',
    fields: [
      {
        name: 'enabledFlag',
        label: intl.get('sagm.purchaseManageNew.model.status').d('状态'),
        type: 'number',
      },
      {
        name: 'parentPurUnitId',
      },
      {
        name: 'purUnitCode',
        label: intl.get('sagm.purchaseManageNew.model.unitCode').d('组织编码'),
      },
      {
        name: 'purUnitName',
        label: intl.get('sagm.purchaseManageNew.model.unitName').d('组织名称'),
      },
      {
        name: 'aliasName',
        label: intl.get('sagm.purchaseManageNew.model.alias').d('别名'),
        maxLength: 360,
        type: 'intl',
      },
      ...getCommonFields(sourceType, level),
      {
        name: 'operate',
        label: intl.get('hzero.common.action').d('操作'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `/sagm/v1/${organizationId}/pur-units/first-unit`,
          method: 'GET',
          data: {
            ...data,
            customizeUnitCode: 'SAGM.PURCHASE_MANAGE.SEARCHBAR_TABLE',
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        const deepAppend = (r) => {
          if (r.children && r.children.length) {
            dataSet.appendData(r.children);
            r.children.forEach((f) => deepAppend(f));
          }
        };
        // 编码或目录 || 别名查询全部展开
        const { aliasName, purUnitCodeName } = dataSet.queryDataSet?.toData()[0] || {};
        const needDeepExpand = purUnitCodeName || aliasName;
        if (needDeepExpand) {
          dataSet.forEach((record) => {
            const child = record.get('children');
            if (child && child.length > 0) {
              dataSet.appendData(child);
              child.forEach((f) => deepAppend(f));
            }
          });
          deepExpand(dataSet);
        }
        // 状态查询展开到二级，但接口只返回了一级目录， 需手动查询
        //   if(enabledFlag) {
        //     dataSet.forEach((record) => {
        //       if(record.get('hasChildren')) {
        //         fetchTreeChildData(
        //           filterNullValueObject({
        //             parentPurUnitId: record.get('purUnitId'),
        //             page: 0,
        //             size: dataSet.pageSize,
        //             enabledFlag,
        //           })
        //         ).then(res => {
        //           const { content = [], totalPages } = res || {};
        //           const showMore = totalPages > 1;
        //           dataSet.appendData(content);
        //           if (showMore) {
        //             dataSet.appendData([{ showMore, parentPurUnitId: record.get('purUnitId') }]);
        //           }
        //         });
        //       }
        //     });
        //     deepExpand(dataSet);
        //   }
      },
      // 勾选子节点后刷新（子节点没有了），取消全选，手动去掉缓存的子节点
      batchUnSelect: ({ dataSet }) => {
        if (dataSet.cachedSelected.length > 0) {
          dataSet.clearCachedSelected();
        }
      },
    },
  };
};

const batchFormDS = (sourceType, level) => ({
  autoCreate: true,
  fields: [
    {
      name: 'aliasName',
      label: intl.get('sagm.purchaseManageNew.model.alias').d('别名'),
      maxLength: 360,
      type: 'intl',
    },
    ...getCommonFields(sourceType, level),
  ],
});

export { tableDS, batchFormDS };
