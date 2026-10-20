/**
 *
 * @date: 2020/7/21
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  primaryKey: 'evalEventLineId',
  cacheSelection: true,
  fields: [
    {
      name: 'categoryNameLov',
      lovCode: 'SMDM.TREE_ITEM_CATEGORY',
      ignore: 'always',
      type: 'object',
      dynamicProps: {
        required: ({ record }) => !(record && record.get('itemCodeLov')),
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          itemId: record.get('itemId'),
        }),
      },
      optionsProps: {
        paging: 'server',
        childrenField: 'children',
      },
      label: intl.get('sslm.eventRecord.model.evalEventLine.categoryName').d('品类名称'),
    },
    {
      name: 'categoryId',
      bind: 'categoryNameLov.categoryId',
      label: intl.get('sslm.eventRecord.model.evalEventLine.categoryId').d('品类id'),
    },
    {
      name: 'categoryCode',
      bind: 'categoryNameLov.categoryCode',
      label: intl.get('sslm.eventRecord.model.evalEventLine.categoryCode').d('品类代码'),
    },
    {
      name: 'categoryName',
      readOnly: true,
      bind: 'categoryNameLov.categoryName',
      label: intl.get('sslm.eventRecord.model.evalEventLine.categoryName').d('品类名称'),
    },
    {
      name: 'itemCodeLov',
      type: 'object',
      lovCode: 'SMDM.ITEM',
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => !(record && record.get('categoryNameLov')),
        lovPara: ({ record }) => ({
          categoryId: record.get('categoryId'),
          tenantId: organizationId,
        }),
      },
      label: intl.get('sslm.eventRecord.model.evalEventLine.itemName').d('物料名称'),
    },
    {
      name: 'itemId',
      bind: 'itemCodeLov.partnerItemId',
    },
    {
      name: 'itemCode',
      bind: 'itemCodeLov.itemCode',
      label: intl.get('sslm.eventRecord.model.evalEventLine.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      bind: 'itemCodeLov.itemName',
      readOnly: true,
      label: intl.get('sslm.eventRecord.model.evalEventLine.itemName').d('物料名称'),
    },
    {
      name: 'specification',
      label: intl.get('sslm.eventRecord.model.evalEventLine.specification').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('sslm.eventRecord.model.evalEventLine.model').d('型号'),
    },
    {
      name: 'uomIdLov',
      lovCode: 'SMDM.UOM_BACK_ID',
      type: 'object',
      ignore: 'always',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get('sslm.eventRecord.model.evalEventLine.uomId').d('单位'),
      textField: 'uomCodeAndName',
    },
    {
      name: 'uomId',
      bind: 'uomIdLov.uomId',
      label: intl.get('sslm.eventRecord.model.evalEventLine.uomId').d('单位'),
    },
    {
      name: 'uomName',
      bind: 'uomIdLov.uomName',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomIdLov.uomCodeAndName',
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      label: intl.get('sslm.eventRecord.model.evalEventLine.quantity').d('数量'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.eventRecord.model.evalEventLine.remark').d('备注'),
    },
    {
      name: 'tenantId',
      defaultValue: organizationId,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-line`,
        method: 'GET',
        data: {},
        params: {
          ...params,
          evalEventHeaderId: data.evalEventHeaderId,
          customizeUnitCode: data.customizeUnitCode,
        },
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-event-line/batchDel`,
        method: 'DELETE',
        data: data.map(item => item.evalEventLineId),
        params,
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      switch (name) {
        case 'itemCodeLov': {
          if (value) {
            const {
              categoryId,
              categoryCode,
              categoryName,
              specifications,
              model,
              uomId,
              uomName,
            } = value || {};
            record.set('categoryNameLov', {
              categoryId,
              categoryCode,
              categoryName,
            });
            record.set('specification', specifications);
            record.set('model', model);
            record.set('uomIdLov', {
              uomId,
              uomName,
            });
          } else {
            record.set('categoryNameLov', null);
            record.set('specification', null);
            record.set('model', null);
            record.set('uomIdLov', null);
          }
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});
