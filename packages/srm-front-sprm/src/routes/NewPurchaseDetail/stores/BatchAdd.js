/* //批量编辑字段的ds和行字段ds要一一对应 */
import intl from 'utils/intl';
import moment from 'moment';
import { isNumber } from 'lodash';

export default ({ organizationId, listDs, header }) => {
  return {
    paging: false,
    autoQuery: false,
    autoCreate: false,
    fields: [
      {
        name: 'receiveAddress',
        label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveContactName',
        label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = header?.get('prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        type: 'date',
        required: true,
        min: moment('1970-01-01'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        required: true,
        transformRequest: (value) => value?.invOrganizationId || value?.organizationId || value,
        dynamicProps: {
          lovPara({ record }) {
            return {
              ouId: record?.get('ouId')?.ouId || record?.get('ouId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              invOrganizationId: value,
              invOrganizationName: data.organizationName,
            };
          } else {
            return null;
          }
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'itemCode',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        multiple: true,
        dynamicProps: {
          disabled({ record }) {
            const itemLimitRule = listDs.getState('itemLimitRule') || [];
            const categoryId = record.get('categoryId');
            const invOrganizationId = record.get('invOrganizationId');
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              if (!categoryId) {
                return true;
              }
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              if (!invOrganizationId) {
                return true;
              }
            }
            return false;
          },
          lovPara({ record }) {
            const itemLimitRule = listDs.getState('itemLimitRule') || [];
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId:
                header?.get('companyId') ||
                record?.get('companyId')?.companyId ||
                record?.get('companyId'),
              headerCategoryId: header?.get('categoryId'),
              prTypeId: header.get('prTypeId'),
            };
            // 物料分类
            if (itemLimitRule.find((rule) => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId')?.categoryId || record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId =
                record.get('invOrganizationId')?.invOrganizationId ||
                record.get('invOrganizationId')?.organizationId ||
                record.get('invOrganizationId');
            }
            return params;
          },
        },
        required: true,
        optionsProps: {
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'itemId',
        bind: 'itemCode.itemId',
      },
      {
        name: 'itemName',
        label: intl.get('entity.item.name').d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        required: true,
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        transformRequest: (value) => value?.categoryId,
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              tiledFlag: 1,
              module: 'PR',
              purchaseOrgId: header?.get('purchaseOrgId'),
              queryCategoryId: header?.get('categoryId'),
              prTypeId: header?.get('prTypeId'),
              businessObjectCode: 'SRM_C_SRM_SPRM_PR_HEADER',
            };
          },
        },
        optionsProps: {
          paging: 'server',
          idField: 'categoryId',
          parentField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        name: 'quantity',
        validator: (value) => {
          if (isNumber(value) && value <= 0) {
            return intl.get(`sprm.common.message.mustExceedZero`).d('数量必须大于零');
          } else {
            return true;
          }
        },
        help: intl
          .get('sprm.common.model.common.purchaseQuantity.help')
          .d('该字段将根据物料带出的单位精度做截取'),
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
        required: true,
        precision: 10,
        type: 'number',
      },
      {
        name: 'companyId',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        const itemLimitRule = listDs.getState('itemLimitRule') || [];
        const prSourcePlatform = header?.get('prSourcePlatform');

        if (name === 'invOrganizationId') {
          if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
            if (value) {
              const { address } = value;
              record.set({
                receiveAddress:
                  prSourcePlatform === 'CATALOGUE' ? record.get('receiveAddress') : address,
              });
            }
            if (prSourcePlatform === 'SRM') {
              record.set({
                itemCode: null,
                itemName: null,
                itemId: null,
              });
            }
          } else {
            record.set({
              receiveAddress:
                prSourcePlatform === 'CATALOGUE' ? record.get('receiveAddress') : value?.address,
            });
          }
        }
        if (name === 'categoryId') {
          if (itemLimitRule.find((rule) => rule === 'categoryId')) {
            if (prSourcePlatform === 'SRM') {
              record.set({
                itemCode: null,
                itemName: null,
                itemId: null,
              });
            }
          }
        }
      },
    },
  };
};
