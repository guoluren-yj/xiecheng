import moment from 'moment';
import intl from 'utils/intl';
import { isNil, isEmpty } from 'lodash';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();
const headerInfoDS = ({ user = {}, isDisable = true, setHidden, setSourceHidden }) => ({
  forceValidate: true,
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
      required: !isDisable,
    },
    {
      name: 'companyId',
      type: 'object',
      label: intl.get('sslm.sample.model.company').d('公司'),
      textField: 'companyName',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      dynamicProps: {
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') !== 'SRM',
        lovPara: ({ record }) => {
          const params = { tenantId: organizationId };
          if (record.get('supplierId')) {
            params.supplierCompanyId = (record.get('supplierId') || {}).supplierId;
          }
          return params;
        },
      },
      transformResponse: (value, data) =>
        value
          ? {
              companyId: data.companyId,
              companyName: data.companyName,
              defaultAddress: data.companyAddress,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.companyId : null),
    },
    {
      name: 'companyName',
      bind: 'companyId.companyName',
      label: intl.get('sslm.sample.model.company').d('公司'),
    },
    {
      name: 'companyAddress',
      bind: 'companyId.defaultAddress',
    },
    {
      name: 'ouId',
      type: 'object',
      label: intl.get('sslm.sample.model.ou').d('业务实体'),
      textField: 'ouName',
      lovCode: 'SPFM.USER_AUTH.OU',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: (record.get('companyId') || {}).companyId,
        }),
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') !== 'SRM',
      },
      transformResponse: (value, data) =>
        value
          ? {
              ouId: data.ouId,
              ouName: data.ouName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.ouId : null),
    },
    {
      name: 'ouName',
      bind: 'ouId.ouName',
      label: intl.get('sslm.sample.model.ou').d('业务实体'),
    },
    {
      name: 'invOrganizationId',
      type: 'object',
      label: intl.get('sslm.sample.model.organization').d('库存组织'),
      textField: 'organizationName',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          ouId: (record.get('ouId') || {}).ouId,
        }),
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') !== 'SRM',
      },
      transformResponse: (value, data) =>
        value
          ? {
              organizationId: data.invOrganizationId,
              organizationName: data.organizationName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.organizationId : null),
    },
    {
      name: 'organizationName',
      bind: 'invOrganizationId.organizationName',
      label: intl.get('sslm.sample.model.organization').d('库存组织'),
    },
    {
      name: 'supplierId',
      type: 'object',
      label: intl.get('sslm.sample.model.supplier').d('供应商'),
      lovCode: 'SSLM.SAMPLE_SUPPLIER',
      required: !isDisable,
      textField: 'supplierName',
      dynamicProps: {
        lovPara: ({ record }) => {
          const params = { tenantId: organizationId };
          if (record.get('companyId')) {
            params.companyId = (record.get('companyId') || {}).companyId;
          }
          return params;
        },
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') === 'SOURCE',
      },
      transformResponse: (value, data) =>
        value
          ? {
              supplierId: data.supplierId,
              supplierName: data.supplierName,
              supplierTenantId: data.supplierTenantId,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.supplierId : null),
    },
    {
      name: 'supplierName',
      bind: 'supplierId.supplierName',
      label: intl.get('sslm.sample.model.supplier').d('供应商'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierId.supplierTenantId',
    },
    {
      name: 'supplierTypeCode',
      label: intl.get('sslm.sample.model.supplyType').d('供应商类型'),
      lookupCode: 'SSLM.SUPPLIER_TYPE',
      required: !isDisable,
    },
    {
      name: 'supplierTypeCodeMeaning',
      label: intl.get('sslm.sample.model.supplyType').d('供应商类型'),
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
      required: !isDisable,
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get('sslm.sample.model.typeCode').d('送样类型'),
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
      defaultValue: user.realName,
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
      required: !isDisable,
    },
    {
      name: 'recUserIdLov',
      type: 'object',
      label: intl.get('sslm.sample.model.recUserName').d('接样人'),
      lovCode: 'SSLM.SEND_REC_USER',
      textField: 'realName',
      lovPara: { organizationId },
      transformResponse: (value, data) =>
        data.recUserId
          ? {
              id: data.recUserId,
              realName: data.recUserIdName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.id : null),
    },
    {
      name: 'recUserId',
      bind: 'recUserIdLov.id',
    },
    {
      name: 'recUserIdName',
      bind: 'recUserIdLov.realName',
      ignore: 'always',
      transformResponse: (value, object) => {
        return (object || {}).recUserName;
      },
    },
    {
      name: 'recUserPhone',
      type: 'tel',
      regionField: 'recInternationalTelCode',
      label: intl.get('sslm.sample.model.recUserPhone').d('接样人联系电话'),
      required: !isDisable,
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('recInternationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'recInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      required: !isDisable,
    },
    {
      name: 'sampleSendAddress',
      label: intl.get('sslm.sample.model.sampleSendAddress').d('送样地址'),
      required: !isDisable,
    },
    {
      name: 'documentSource',
      lookupCode: 'SSLM_SAMPLE_DOCUMENT_SOURCE',
      label: intl.get('sslm.sample.model.sample.documentSource').d('送样申请来源'),
    },
    {
      name: 'remark',
      label: intl.get('sslm.sample.model.remark').d('备注'),
    },
    {
      name: 'receiveUnitId',
      type: 'object',
      label: intl.get('sslm.sample.model.receiveUnit').d('接收部门'),
      lovCode: 'SPRM.USER_DEPARTMENT',
      textField: 'unitName',
      transformResponse: (value, data) =>
        value
          ? {
              unitId: data.receiveUnitId,
              unitName: data.receiveUnitName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.unitId : null),
    },
    {
      name: 'unitName',
      bind: 'receiveUnitId.unitName',
    },
    {
      name: 'receiveUnitName',
      bind: 'receiveUnitId.unitName',
      label: intl.get('sslm.sample.model.receiveUnit').d('接收部门'),
    },
    {
      name: 'needFeedbackFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.needFeedback').d('需要供应商反馈'),
      defaultValue: 1,
      falseValue: 0,
      trueValue: 1,
    },
    {
      name: 'confirmationFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.confirmationFlag').d('直接确认'),
      defaultValue: 0,
      falseValue: 0,
      trueValue: 1,
      dynamicProps: {
        disabled: ({ record }) => {
          // 需要供应商反馈： 为否 可编辑--- false
          //               为是 不可编辑---- true
          return Boolean(+record.get('needFeedbackFlag'));
        },
      },
    },
    { name: 'isShowUomCodeFlag' },
  ],
  transport: {
    read: ({ dataSet }) => {
      // 根据id查询详情
      const { queryParameter: { detailReqId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/${detailReqId}`,
        method: 'get',
        data: {},
        params: {
          customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO',
        },
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/batchRemove`,
      method: 'post',
      data,
      params: {
        customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO',
      },
    }),
  },
  events: {
    update: ({ dataSet, name, value }) => {
      switch (name) {
        case 'companyId':
          dataSet.current.set({
            ouId: null,
            invOrganizationId: null,
            sampleSendAddress: (value || {}).defaultAddress,
          });
          break;
        case 'ouId':
          dataSet.current.set({
            invOrganizationId: null,
          });
          break;
        case 'invOrganizationId': {
          // 库存组织没有地址时用公司带出的地址
          const companyAddress = dataSet.current.get('companyAddress');
          dataSet.current.set({
            sampleSendAddress: (value || {}).address || companyAddress,
          });
          break;
        }
        case 'confirmationFlag':
          setHidden(!value);
          // 直接确认不勾选，隐藏行信息部分字段，并清空字段值。
          if (!value) {
            dataSet.children.infoDtoList.forEach(record => {
              record.set('sampleResult', undefined);
              record.set('remark', undefined);
              record.set('trialResultsUuid', undefined);
            });
          }
          break;
        case 'needFeedbackFlag':
          if (value) {
            dataSet.current.set('confirmationFlag', 0);
          }
          break;
        case 'recUserIdLov': {
          const { unitId } = value || {};
          // srm-113331需求带出接收部门
          dataSet.current.set({
            recUserName: (value || {}).realName,
            receiveUnitId: unitId ? { unitId } : null,
            receiveUnitName: (value || {}).unitName,
            recUserPhone: (value || {}).phone,
            recInternationalTelCode: (value || {}).internationalTelCode,
          });
          break;
        }
        default:
          break;
      }
    },
    load: ({ dataSet }) => {
      // 初始化的时候根据是否确认判断是否展示  试用结果，使用说明，试用附件
      setHidden(!(dataSet.current && dataSet.current.get('confirmationFlag')));
      setSourceHidden(dataSet.current?.get('documentSource') !== 'SOURCE');
    },
  },
});

const listLineDS = () => ({
  primaryKey: 'sampleId',
  dataToJSON: 'all',
  autoLocateFirst: false,
  fields: [
    {
      name: 'lineNum',
      label: intl.get('sslm.sample.model.lineNum').d('行号'),
      disabled: true,
    },
    {
      name: 'itemLov',
      type: 'object',
      textField: 'itemCode',
      lovCode: 'SSLM.SAMPLE_ITEM_CODE',
      dynamicProps: {
        lovPara: ({ dataSet: { parent } }) => {
          const supplierCompanyId = (parent.current.get('supplierId') || {}).supplierId;
          return {
            tenantId: organizationId,
            supplierCompanyId,
          };
        },
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') !== 'SRM',
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
      name: 'itemId',
    },
    {
      name: 'itemName',
      required: true,
      label: intl.get('sslm.sample.model.itemName').d('物料名称'),
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.sample.model.itemDesc').d('物料说明'),
    },
    {
      name: 'uomCode',
      type: 'object',
      label: intl.get('sslm.sample.model.uomName').d('单位'),
      required: true,
      lovCode: 'SMDM.ITEM.UOM.ORG',
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        textField: ({ dataSet: { parent } }) => {
          const isShowUomCodeFlag = parent?.current?.get('isShowUomCodeFlag');
          if (!isShowUomCodeFlag) {
            return 'uomName';
          }
          return 'uomCodeAndName';
        },
      },
      transformResponse: (value, data) =>
        value
          ? {
              uomId: data.uomId,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomCodeAndName: data.uomCodeAndName,
              uomPrecision: data.uomPrecision,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.uomCode : null),
    },
    {
      name: 'uomId',
      bind: 'uomCode.uomId',
    },
    {
      name: 'uomName',
      bind: 'uomCode.uomName',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomCode.uomCodeAndName',
    },
    {
      name: 'uomPrecision',
      bind: 'uomCode.uomPrecision',
    },
    {
      name: 'itemCategoryCode',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      required: true,
      label: intl.get('sslm.sample.model.itemCategoryCode').d('品类代码'),
      textField: 'categoryCode',
      valueField: 'categoryCode',
      dynamicProps: {
        lovPara: ({ record, dataSet: { parent } }) => {
          const supplierCompanyId = (parent?.current?.get('supplierId') || {}).supplierId;
          return {
            supplierCompanyId,
            itemId: record.get('itemId'),
            tenantId: organizationId,
            businessObjectCode: 'SRM_C_SRM_SSLM_SAMPLE_SEND_REQ',
          };
        },
        disabled: ({ record }) =>
          !isNil(record.get('documentSource')) && record.get('documentSource') !== 'SRM',
      },
      optionsProps: {
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
      label: intl.get('sslm.sample.model.itemCategoryName').d('品类名称'),
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
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
      name: 'sourceNum',
      label: intl.get('sslm.sample.model.sample.sourceNum').d('来源单据编号'),
    },
    {
      name: 'itemNum',
      label: intl.get('sslm.sample.model.sample.itemNum').d('来源单据行号'),
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
        url: `${SRM_SSLM}/v1/${organizationId}/sample-infos/${detailReqId}/list`,
        method: 'get',
        params: {
          ...params,
          customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO',
        },
        data: {},
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/sample-infos/batchRemove`,
      data: data.map(n => ({ sampleId: n.sampleId })),
      method: 'post',
      params: {
        customizeUnitCode: 'SSLM.SAMPLE_DELIVERY_PUBLISH.SAMPLE_INFO',
      },
    }),
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'itemCategoryCode') {
        // 传的对象 后续建议改成字符串
        record.set('itemCategoryName', value);
      }
    },
  },
});

export { headerInfoDS, listLineDS };
