import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { isNil } from 'lodash';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const indexDS = (code, _record) => ({
  pageSize: 20,
  dataToJSON: 'all',
  selection: 'multiple',
  cacheSelection: true, // 跨页勾选
  forceValidate: true,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fieldType').d('类型'),
      name: 'fieldType',
      type: 'string',
      defaultValue: 'STANDARD',
      lookupCode: 'SLOD.DELIVERY_FIELD_TYPE',
      clearButton: false,
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('changeFieldId'),
        };
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fieldLocation').d('字段位置'),
      name: 'fieldLocation',
      type: 'string',
      lookupCode: code === 'ASN' ? 'SLOD.ASN_TABLE_NAME' : 'SLOD.PLAN_TABLE_NAME',
      required: true,
      defaultValue: code === 'ASN' ? 'SLOD_ASN_LINE' : 'SLOD_PLAN_LINE',
      dynamicProps: ({ record }) => {
        return {
          // disabled: record.get('fieldLocation'),
          disabled: record.get('changeFieldId'),
        };
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fieldCode').d('字段编码'),
      name: 'fieldAll',
      type: 'object',
      lovCode: 'SLOD.DELIVERY_FIELD_URL',
      required: true,
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId: organizationId,
            fieldType: record.get('fieldType'),
            fieldLocation: record.get('fieldLocation'),
            strategyLineId: record.get('strategyLineId'),
          };
        },
        disabled({ record }) {
          // return record.get('fieldCode');
          // return !record.get('fieldLocation') || record.get('fieldCode');
          return (
            !record.get('fieldLocation') || !record.get('fieldType') || record.get('changeFieldId')
          );
        },
      },
    },
    {
      name: 'fieldCode',
      type: 'string',
      bind: 'fieldAll.fieldCode',
    },
    {
      name: 'fieldName',
      type: 'string',
      bind: 'fieldAll.fieldName',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.changeVersion').d('变更版本'),
      name: 'changeVersion',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      help: intl
        .get('slod.deliveryWorkbench.model.common.versionHint')
        .d('字段变更完成后，新增数据版本。该字段勾选后才能选择变更是否交互。'),
      // dynamicProps: ({ record }) => {
      //   if (code === 'ASN') {
      //     return {
      //       disabled: record.get('fieldLocation') === 'SLOD_ASN_HEADER',
      //     };
      //   } else {
      //     return {
      //       disabled: record.get('fieldLocation') === 'SLOD_PLAN_HEADER',
      //     };
      //   }
      // },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.purchaserFlag').d('允许采购方变更'),
      name: 'purchaserFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        if (code === 'PLAN') {
          // 创建
          if (['actualQuantity', 'plannedArrivalDate']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['SUPPLIER']?.includes(_record?.get('createCampCode')),
            };
          }
          // 确认
          if (['quantity', 'confirmArrivalDate']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['SUPPLIER', 'NONE']?.includes(_record?.get('interactiveCampCode')),
            };
          }
          // 备注
          if (['supplierRemark', 'supplierLineRemark']?.includes(record.get('fieldCode'))) {
            return {
              disabled: true,
            };
          }
        }
        if (code === 'ASN') {
          // 创建
          if (['actualQuantity']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['SUPPLIER']?.includes(_record?.get('createCampCode')),
            };
          }
          // 确认
          if (['quantity']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['SUPPLIER', 'NONE']?.includes(_record?.get('interactiveCampCode')),
            };
          }
          // 备注
          if (['supplierRemark', 'supplierLineRemark']?.includes(record.get('fieldCode'))) {
            return {
              disabled: true,
            };
          }
        }
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.changeApprovalFlag').d('变更需内部审批'),
      name: 'changeApprovalFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        return {
          disabled:
            record?.get('purchaserFlag') === 0 ||
            record?.get('changeVersion') === 0 ||
            _record?.get('createCampCode') === 'SUPPLIER',
        };
      },
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.supplierConfirmFlag')
        .d('变更需供应商确认'),
      name: 'supplierConfirmFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('purchaserFlag') === 0 || record.get('changeVersion') === 0,
        };
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.supplierFlag').d('允许供应商变更'),
      name: 'supplierFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        if (code === 'PLAN') {
          // 创建
          if (['actualQuantity', 'plannedArrivalDate']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['PURCHASER']?.includes(_record?.get('createCampCode')),
            };
          }
          // 确认
          if (['quantity', 'confirmArrivalDate']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['PURCHASER', 'NONE']?.includes(_record?.get('interactiveCampCode')),
            };
          }
          // 备注
          if (['purchaseRemark', 'purchaseLineRemark']?.includes(record.get('fieldCode'))) {
            return {
              disabled: true,
            };
          }
        }
        if (code === 'ASN') {
          // 创建
          if (['actualQuantity']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['PURCHASER']?.includes(_record?.get('createCampCode')),
            };
          }
          // 确认
          if (['quantity']?.includes(record.get('fieldCode'))) {
            return {
              disabled: ['PURCHASER', 'NONE']?.includes(_record?.get('interactiveCampCode')),
            };
          }
          // 备注
          if (['purchaseRemark', 'purchaseLineRemark']?.includes(record.get('fieldCode'))) {
            return {
              disabled: true,
            };
          }
        }
      },
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.purchaserApprovalFlag')
        .d('变更需采购方审批'),
      name: 'purchaserApprovalFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        return {
          disabled:
            !_record?.get('interactiveType') ||
            _record?.get('interactiveType') === 'FUNCTIONAL' ||
            isNil(_record?.get('interactiveType'))
              ? true
              : record?.get('changeVersion') === 0 ||
                record?.get('supplierFlag') === 0 ||
                record?.get('purchaserConfirmFlag') === 1,
        };
      },
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.purchaserConfirmFlag')
        .d('变更需采购方确认'),
      name: 'purchaserConfirmFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: ({ record }) => {
        return {
          // disabled: record.get('purchaserApprovalFlag') === 1 ||
          // ['purchaseRemark', 'purchaseLineRemark']?.includes(record.get('fieldCode')),
          disabled:
            record.get('changeVersion') === 0 ||
            record.get('supplierFlag') === 0 ||
            record.get('purchaserApprovalFlag') === 1,
        };
      },
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.exportEsFlag').d('变更导出外部系统'),
      name: 'exportEsFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],
  // queryFields: [
  //   {
  //     label: intl.get('slod.deliveryWorkbench.model.common.fieldCode').d('字段编码'),
  //     name: 'fieldName',
  //     type: 'string',
  //   },
  // ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const { strategyLineId } = params || {};
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/change-field/${strategyLineId}`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { _record });
        // if (_record.get('createCampCode') === 'SUPPLIER') {
        // return record.set('changeApprovalFlag')===0;
        // }
      });
    },
    update: ({ record, name, value }) => {
      if (name === 'fieldType') {
        if (value === null) {
          record.set('fieldCode', '');
          record.set('fieldName', '');
        } else {
          record.set('fieldCode', '');
          record.set('fieldName', '');
        }
      }
      if (name === 'fieldLocation') {
        if (value === null) {
          record.set('changeVersion', 0);
          record.set('fieldCode', '');
          record.set('fieldName', '');
        } else {
          record.set('fieldCode', '');
          record.set('fieldName', '');
        }
      }
      // 版本，允许供应商变更改变控制 变更需采购方审批，变更需采购方确认 不勾选
      if (record.get('changeVersion') === 0 || record.get('supplierFlag') === 0) {
        record.set('purchaserApprovalFlag', 0);
        record.set('purchaserConfirmFlag', 0);
      }
      // 版本，允许采购方变更改变控制，变更需供应商确认 不勾选
      if (record.get('purchaserFlag') === 0 || record.get('changeVersion') === 0) {
        record.set('supplierConfirmFlag', 0);
        record.set('changeApprovalFlag', 0);
      }
      // 字段编码变更 后面所有全部清空勾选
      if (name === 'fieldAll') {
        record.set('changeVersion', 0);
        record.set('purchaserFlag', 0);
        record.set('changeApprovalFlag', 0);
        record.set('supplierConfirmFlag', 0);
        record.set('supplierFlag', 0);
        record.set('purchaserApprovalFlag', 0);
        record.set('purchaserConfirmFlag', 0);
        record.set('exportEsFlag', 0);
      }
    },
  },
});

export { indexDS };
