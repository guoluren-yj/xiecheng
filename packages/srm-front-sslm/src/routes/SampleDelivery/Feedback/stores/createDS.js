import moment from 'moment';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();

const headerInfoDS = reqId => ({
  autoCreate: true,
  fields: [
    {
      name: 'reqNum',
      label: intl.get('sslm.sample.model.reqNum').d('申请单号'),
    },
    {
      name: 'reqUserName',
      label: intl.get('sslm.sample.model.reqUserId').d('申请人'),
    },
    {
      name: 'reqStatus',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
      lookupCode: 'SSLM.PROCESS_STATUS',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'reqUserPhone',
      type: 'tel',
      regionField: 'reqInternationalTelCode',
      label: intl.get('sslm.sample.model.reqUserPhone').d('申请人联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('reqInternationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'reqInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'company',
      type: 'object',
      label: intl.get('sslm.sample.model.sample.customer').d('客户'),
      noCache: true,
      required: true,
      textField: 'companyName',
      lovCode: 'HPFM.COMPANY',
      lovPara: { tenantId },
      transformResponse: (value, data) =>
        data.companyId
          ? {
              companyId: data.companyId,
              companyName: data.companyName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.companyId : null),
    },
    {
      name: 'companyName',
      bind: 'company.companyName',
      label: intl.get('sslm.sample.model.sample.customer').d('客户'),
    },
    {
      name: 'companyId',
      bind: 'company.companyId',
      required: true,
    },
    {
      name: 'ou',
      type: 'object',
      label: intl.get('sslm.sample.model.ou').d('业务实体'),
      noCache: true,
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId,
          companyId: record.get('companyId'),
        }),
      },
      transformResponse: (value, data) =>
        data.ouId
          ? {
              ouId: data.ouId,
              ouName: data.ouName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.ouId : null),
    },
    {
      name: 'ouName',
      bind: 'ou.ouName',
      label: intl.get('sslm.sample.model.ou').d('业务实体'),
    },
    {
      name: 'ouId',
      bind: 'ou.ouId',
    },
    {
      name: 'supplier',
      type: 'object',
      label: intl.get('sslm.sample.model.company').d('公司'),
      lovCode: 'SPFM.ASSIGNED_COMPANY_UNDER_SUPPLIER',
      required: true,
      textField: 'companyName',
      dynamicProps: {
        lovPara: ({ record }) => {
          const params = { tenantId: organizationId };
          if (record.get('companyId')) {
            params.companyId = record.get('companyId');
          }
          return params;
        },
        disabled: ({ record }) => !record.get('companyId'),
      },
      transformResponse: (value, data) =>
        data.supplierId
          ? {
              companyId: data.supplierId,
              companyName: data.supplierName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.companyId : null),
    },
    {
      name: 'supplierName',
      bind: 'supplier.companyName',
      label: intl.get('sslm.sample.model.company').d('公司'),
    },
    {
      name: 'supplierId',
      bind: 'supplier.companyId',
    },
    {
      name: 'supplierTenantId',
      defaultValue: organizationId,
    },
    {
      name: 'supplierTypeCode',
      label: intl.get('sslm.sample.model.supplyType').d('供应商类型'),
      lookupCode: 'SSLM.SUPPLIER_TYPE',
      required: true,
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
      dynamicProps: {
        required: ({ record }) =>
          record.get('supplierTypeCode') === 'AGENT' || record.get('supplierTypeCode') === 'TRADER',
      },
    },
    {
      name: 'typeCode',
      label: intl.get('sslm.sample.model.typeCode').d('送样类型'),
      lookupCode: 'SSLM.TYPE_CODE',
      required: true,
    },
    {
      name: 'urgencyDegree',
      label: intl.get('sslm.sample.model.urgencyDegree').d('紧急程度'),
      lookupCode: 'SSLM.SAMPLE_URGENCY_DEGREE',
    },
    {
      name: 'urgencyDegreeMeaning',
      label: intl.get('sslm.sample.model.urgencyDegree').d('紧急程度'),
    },
    {
      name: 'recUserName',
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
    },
    {
      name: 'recUserPhone',
      type: 'tel',
      regionField: 'recInternationalTelCode',
      label: intl.get('sslm.sample.model.recUserPhone').d('接样人联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('recInternationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'recInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'sampleSendAddress',
      label: intl.get('sslm.sample.model.sampleSendAddress').d('送样地址'),
      required: true,
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'needFeedbackFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.needFeedback').d('需要供应商反馈'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },

    // 样品信息
    {
      name: 'sendUserName',
      label: intl.get('sslm.sample.model.sendUserName').d('送样人姓名'),
    },
    {
      name: 'sendUserPhone',
      type: 'tel',
      regionField: 'sendInternationalTelCode',
      label: intl.get('sslm.sample.model.sendUserPhone').d('送样人联系电话'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('sendInternationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'sendInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'sendTypeCode',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      required: !!reqId,
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
      dynamicProps: {
        disabled: ({ record }) => record.get('sendTypeCode') !== 'EXPRESS_DELIVERY',
      },
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      required: !!reqId,
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
      transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'supplierRemark',
      label: intl.get('sslm.sample.model.supplierRemark').d('供应商备注'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      // 根据id查询详情
      const { queryParameter: { detailReqId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/sample-send-reqs/${detailReqId}`,
        method: 'get',
        data: {},
        params: {
          customizeUnitCode:
            'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_BASIC_INFO,SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_LINE_FORM',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        const allData = dataSet.toData();
        if (!isEmpty(allData)) {
          dataSet.loadData([]);
          allData.forEach(record => {
            dataSet.create(record);
          });
        }
      }
    },
    update: ({ dataSet, name }) => {
      switch (name) {
        case 'company':
          dataSet.current.set({
            supplier: null,
          });
          break;
        default:
          break;
      }
    },
  },
});

const listLineDS = () => ({
  primaryKey: 'sampleId',
  dataToJSON: 'all',
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      name: 'lineNum',
      label: intl.get('sslm.sample.model.lineNum').d('行号'),
      disabled: true,
    },
    {
      name: 'itemLov',
      type: 'object',
      noCache: true,
      textField: 'itemCode',
      lovCode: 'SSLM.SAMPLE_ITEM_CODE',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId,
          };
        },
      },
      label: intl.get('sslm.sample.model.itemCode').d('物料编码'),
      transformResponse: (_value, record) => {
        return {
          itemId: record.itemId,
          itemCode: record.itemCode,
          itemName: record.itemName,
          itemDesc: record.itemDesc,
        };
      },
      transformRequest: value => (!isEmpty(value) ? value.itemCode : null),
    },
    {
      name: 'itemCode',
      // bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      required: true,
      // bind: 'itemLov.itemName',
      label: intl.get('sslm.sample.model.itemName').d('物料名称'),
    },
    {
      name: 'itemDesc',
      // bind: 'itemLov.itemDesc',
      label: intl.get('sslm.sample.model.itemDesc').d('物料说明'),
    },
    {
      name: 'uoLov',
      type: 'object',
      label: intl.get('sslm.sample.model.uomName').d('单位'),
      required: true,
      noCache: true,
      lovCode: 'SMDM.ITEM.UOM.ORG',
      lovPara: { tenantId },
      textField: 'uomCodeAndName',
      transformResponse: (value, data) =>
        data.uomId
          ? {
              uomId: data.uomId,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomCodeAndName: data.uomCodeAndName,
              uomPrecision: data.uomPrecision,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.uomId : null),
    },
    {
      name: 'uomId',
      bind: 'uoLov.uomId',
    },
    {
      name: 'uomCode',
      bind: 'uoLov.uomCode',
    },
    {
      name: 'uomName',
      bind: 'uoLov.uomName',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uoLov.uomCodeAndName',
    },
    {
      name: 'uomPrecision',
      bind: 'uoLov.uomPrecision',
    },
    {
      name: 'itemCategoryCode',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      noCache: true,
      label: intl.get('sslm.sample.model.itemCategoryCode').d('品类代码'),
      textField: 'categoryCode',
      valueField: 'categoryCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            itemId: record.get('itemId'),
            businessObjectCode: 'SRM_C_SRM_SSLM_SAMPLE_SEND_REQ',
          };
        },
      },
      optionsProps: {
        treeFlag: 'Y',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'itemCategoryName',
      type: 'object',
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      label: intl.get('sslm.sample.model.itemCategoryName').d('品类名称'),
    },
    {
      name: 'reqQuantity',
      type: 'number',
      label: intl.get('sslm.sample.model.reqQuantity').d('送样需求数量'),
      required: true,
      max: 99999999999999999999,
    },
    {
      name: 'reqTime',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.reqTime').d('送样需求时间'),
      required: true,
      transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      required: true,
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
      transformRequest: value => value && moment(value).format(DEFAULT_DATETIME_FORMAT),
    },
    {
      name: 'sendTypeCode',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      required: true,
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
      dynamicProps: {
        disabled: ({ record }) => record.get('sendTypeCode') !== 'EXPRESS_DELIVERY',
      },
    },
    {
      name: 'tryUseDepartment',
      label: intl.get('sslm.sample.model.tryUseDepartment').d('试用部门'),
    },
    {
      name: 'tryUseWorkshop',
      label: intl.get('sslm.sample.model.tryUseWorkshop').d('试用车间'),
    },
    {
      name: 'sampleResult',
      lookupCode: 'SSLM_SAMPLE_RESULT',
      label: intl.get('sslm.sample.model.tryUseResults').d('试用结果'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.sample.tryUseRemark').d('试用说明'),
    },
    {
      name: 'trialResultsUuid',
      label: intl.get('sslm.sample.model.sample.trialResultsAttachment').d('试用结果附件'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'buyerAttachmentUuid',
      label: intl.get('sslm.sample.model.buyerAttachmentUuid').d('采购方附件'),
      disabled: true,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sslm.sample.model.attachmentUuid').d('供应商附件'),
    },
  ],
  transport: {
    read: ({ dataSet, params }) => {
      const { queryParameter: { detailReqId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/sample-infos/${detailReqId}/list`,
        method: 'get',
        params: {
          ...params,
          customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_SAMPLE_INFO',
        },
        data: {},
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${tenantId}/sample-infos/batchRemove`,
      data: data.map(n => ({ sampleId: n.sampleId })),
      method: 'post',
      params: {
        customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_CALLBACK.SUPPLIER_SAMPLE_INFO',
      },
    }),
  },
  events: {
    update: ({ name, value, record }) => {
      // if (name === 'itemLov') {
      //   if (value) {
      //     record.set('uoLov', { uomCode: value.uomCode, uomName: value.uomName });
      //   } else {
      //     record.set('uoLov', null);
      //   }
      // }
      if (name === 'itemCategoryCode') {
        // 传的对象 后续建议改成字符串
        record.set('itemCategoryName', value);
      }
    },
  },
});

export { headerInfoDS, listLineDS };
