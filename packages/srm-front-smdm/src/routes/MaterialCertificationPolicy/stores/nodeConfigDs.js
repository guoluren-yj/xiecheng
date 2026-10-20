import intl from 'utils/intl';
import { SRM_MDM, PRIVATE_BUCKET } from '_utils/config';
import { isFunction, isArray } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const nodeListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  selection: false,
  pageSize: 20,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-nodes`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'orderSeq',
      type: 'number',
      required: true,
      step: 1,
      min: 0,
      label: intl.get(`${commonPrompt}.NodeorderSeq`).d('阶段顺序'),
      dynamicProps: {
        disabled: ({ record }) => !!record.get('nodeId'),
      },
      validator: (value, _, record) => {
        if (Number(record.get('orderSeq')) <= 0) {
          return intl.get(`${commonPrompt}.orderSeqMustExceedZero`).d('阶段顺序必须大于零');
        }
        return true;
      },
    },
    {
      name: 'nodeCode',
      type: 'string',
      required: true,
      lookupCode: 'SMDM_ITEM_AUTH_NODE_CODE',
      label: intl.get(`${commonPrompt}.certificationNodeName`).d('认证阶段名称'),
    },
    {
      name: 'nodeVersionNumber',
      type: 'number',
      label: intl.get(`${commonPrompt}.versionNumber`).d('版本号'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      disabled: true,
    },
    {
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_NODE_STATUS',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      disabled: true,
      label: intl.get(`${commonPrompt}.lastUpdateDate`).d('最后更新时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get(`hzero.common.buttom.action`).d('操作'),
    },
  ],
});

const headerInfoDs = ({ nodeId, isHistory }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  selection: false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/${
        isHistory ? 'item-auth-node-hiss' : 'item-auth-nodes'
      }/${nodeId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'orderSeq',
      type: 'number',
      required: true,
      step: 1,
      label: intl.get(`${commonPrompt}.NodeorderSeq`).d('阶段顺序'),
      dynamicProps: {
        disabled: ({ record }) => !!record.get('nodeId'),
      },
      validator: (value, _, record) => {
        if (Number(record.get('orderSeq')) <= 0) {
          return intl.get(`${commonPrompt}.orderSeqMustExceedZero`).d('阶段顺序必须大于零');
        }
        return true;
      },
    },
    {
      name: 'nodeCode',
      type: 'string',
      required: true,
      lookupCode: 'SMDM_ITEM_AUTH_NODE_CODE',
      label: intl.get(`${commonPrompt}.certificationNodeName`).d('认证阶段名称'),
      dynamicProps: {
        disabled: ({ record }) => !!record.get('nodeId'),
      },
    },
    {
      name: 'nodeVersionNumber',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.versionNumber`).d('版本号'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      disabled: true,
    },
    {
      name: 'enabledFlag',
      type: 'string',
      required: true,
      disabled: true,
      lookupCode: 'SMDM_ITEM_AUTH_NODE_STATUS',
      defaultValue: '0',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      disabled: true,
      label: intl.get(`${commonPrompt}.lastUpdateDate`).d('最后更新时间'),
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'nodeCode') {
        if (value) {
          const data = record.getField('nodeCode').getLookupData(value, record);
          record.set({
            nodeCodeMeaning: data.meaning,
          });
        } else {
          record.set({
            nodeCodeMeaning: null,
          });
        }
      }
    },
  },
});

const attachmentListDS = ({ nodeId, readOnly, handleCuxCode, isHistory }) => {
  const { cuxCode = [], cuxCodeField = [] } = isFunction(handleCuxCode) ? handleCuxCode() : {};
  return {
    selection: readOnly ? false : 'multiple',
    autoQuery: false,
    cacheSelection: true,
    cacheModified: true,
    dataToJSON: 'all',
    primaryKey: 'nodeAttachmentId',
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/${
          isHistory ? 'item-auth-node-attach-hiss' : 'item-auth-node-attachs'
        }/${nodeId}`,
        method: 'GET',
      },
      destroy: {
        url: `${SRM_MDM}/v1/${tenantId}/item-auth-node-attachs`,
        method: 'DELETE',
      },
    },
    fields: [
      {
        name: 'attachmentCode',
        type: 'string',
        required: true,
        label: intl.get(`${commonPrompt}.attachmentCode`).d('附件编码'),
        validator: (value) => {
          if (value) {
            const reg = /[\u4E00-\u9FA5]/;
            if (reg.test(value)) {
              return intl.get(`${commonPrompt}.attachmentCodeVaildator`).d('附件编码不能输入中文');
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
        dynamicProps: {
          disabled: ({ record }) => !!record.get('nodeAttachmentId'),
        },
      },
      {
        name: 'attachmentName',
        type: 'string',
        required: true,
        label: intl.get(`${commonPrompt}.attachmentName`).d('附件名称'),
      },
      {
        name: 'attachmentTypeCode',
        type: 'string',
        required: true,
        lookupCode: 'SMDM_ITEM_AUTH_NODE_ATT_TYPE',
        label: intl.get(`${commonPrompt}.attachmentTypeCode`).d('附件类型'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        // count: 1,
        // max: 1,
        label: intl.get(`${commonPrompt}.attachmentTemplate`).d('附件模版'),
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get(`${commonPrompt}.purchaseRequiredFlag`).d('采购方是否必传'),
      },
      {
        name: 'supplierRequiredFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        label: intl.get(`${commonPrompt}.supplierRequiredFlag`).d('供应商是否必传'),
      },
      {
        name: 'attachDeleteFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get(`${commonPrompt}.attachDeleteFlag`).d('是否可删除'),
        dynamicProps: {
          disabled: ({ record }) =>
            ['SAMPLE_ATTACHMENT', 'UNIQUE_ATTACHMENT'].includes(record.get('attachmentTypeCode')),
        },
      },
      {
        name: 'supplierVisibleFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        dynamicProps: {
          disabled: ({ record }) => !!record.get('supplierRequiredFlag'),
        },
        label: intl.get(`${commonPrompt}.supplierVisibleFlag`).d('是否供应商可见'),
      },
      {
        name: 'itemAuthNodeAttRoleList',
        type: 'object',
        lovCode: 'SMDM.ITEM_AUTH_ROLE',
        multiple: true,
        label: intl.get(`${commonPrompt}.itemAuthNodeAttRoleList`).d('附件可查询角色'),
      },
      {
        name: 'attachRoleIdList',
        bind: 'itemAuthNodeAttRoleList.roleId',
      },
      {
        name: 'itemAuthNodeAttUserList',
        type: 'object',
        lovCode: 'SMDM.ITEM_AUTH_NODE_ATT_USER',
        multiple: true,
        label: intl.get(`${commonPrompt}.itemAuthNodeAttUserList`).d('指定用户'),
      },
      {
        name: 'attachUserIdList',
        bind: 'itemAuthNodeAttUserList.userId',
      },
      {
        name: 'itemAuthNodeAttCategoryList',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        multiple: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId,
            enabledFlag: 1,
            businessObjectCode:
              record?.get('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
          }),
        },
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        label: intl.get(`${commonPrompt}.itemAuthNodeAttCategoryList`).d('指定品类'),
      },
      {
        name: 'attachCategoryIdList',
        bind: 'itemAuthNodeAttCategoryList.categoryId',
      },
      {
        name: 'itemAuthNodeAttSupcatList',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER_CATEGORY',
        multiple: true,
        // dynamicProps: {
        //   disabled: ({ record }) => !record.get('supplierVisibleFlag'),
        // },
        transformResponse(value) {
          if (value && isArray(value)) {
            return value.map((ele) => ({
              ...ele,
              categoryDescription: ele.supplierCategoryDescription,
              categoryId: ele.supplierCategoryId,
            }));
          } else {
            return null;
          }
        },
        label: intl.get(`${commonPrompt}.itemAuthNodeAttSupcatList`).d('可见供应商分类'),
      },
      {
        name: 'attachSupcatIdList',
        bind: 'itemAuthNodeAttSupcatList.categoryId',
      },

      // 历史
      {
        name: 'itemAuthNodeAttRoleHList',
        type: 'object',
        lovCode: 'SMDM.ITEM_AUTH_ROLE',
        multiple: true,
        label: intl.get(`${commonPrompt}.itemAuthNodeAttRoleList`).d('附件可查询角色'),
      },
      {
        name: 'itemAuthNodeAttUserHList',
        type: 'object',
        lovCode: 'SMDM.ITEM_AUTH_NODE_ATT_USER',
        multiple: true,
        label: intl.get(`${commonPrompt}.itemAuthNodeAttUserList`).d('指定用户'),
      },
      {
        name: 'itemAuthNodeAttCateHList',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        multiple: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId,
            enabledFlag: 1,
            businessObjectCode:
              record?.get('sourcePlatform') === 'SRM' ? 'SRM_C_SMDM_ITEM_AUTH_REQ' : null,
          }),
        },
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        label: intl.get(`${commonPrompt}.itemAuthNodeAttCategoryList`).d('指定品类'),
      },
      {
        name: 'itemAuthNodeAttSupcHList',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER_CATEGORY',
        multiple: true,
        disabled: true,
        // dynamicProps: {
        //   disabled: ({ record }) => !record.get('supplierVisibleFlag'),
        // },
        transformResponse(value) {
          if (value && isArray(value)) {
            return value.map((ele) => ({
              ...ele,
              categoryDescription: ele.supplierCategoryDescription,
              categoryId: ele.supplierCategoryId,
            }));
          } else {
            return null;
          }
        },
        label: intl.get(`${commonPrompt}.itemAuthNodeAttSupcatList`).d('可见供应商分类'),
      },
    ]
      .filter((item) => !cuxCode.includes(item?.name))
      .concat(cuxCodeField),
    events: {
      update: ({ name, record, value }) => {
        if (name === 'supplierRequiredFlag') {
          if (value) {
            record.set({
              supplierVisibleFlag: 1,
            });
          }
        }
        // if (name === 'supplierVisibleFlag') {
        //   record.set({
        //     itemAuthNodeAttSupcatList: null,
        //   });
        // }
        if (
          name === 'attachmentTypeCode' &&
          ['SAMPLE_ATTACHMENT', 'UNIQUE_ATTACHMENT'].includes(value)
        ) {
          record.set({ attachDeleteFlag: 0 });
        }
      },
    },
  };
};

export { nodeListDS, headerInfoDs, attachmentListDS };
