import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

const basicInfoDS = params => ({
  fields: [
    // 基础信息
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
      lookupCode: 'SSLM.PROCESS_STATUS',
      label: intl.get('sslm.sample.model.reqStatusMeaning').d('单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.creationDate').d('创建时间'),
    },
    {
      name: 'reqInternationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'reqUserPhone',
      type: 'tel',
      regionField: 'reqInternationalTelCode',
      label: intl.get('sslm.sample.model.reqUserPhone').d('申请人联系电话'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.sample.model.company').d('公司'),
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
          tenantId: organizationId,
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
      name: 'organization',
      type: 'object',
      label: intl.get('sslm.sample.model.organization').d('库存组织'),
      noCache: true,
      textField: 'organizationName',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          ouId: record.get('ouId'),
        }),
      },
      transformResponse: (value, data) =>
        data.invOrganizationId
          ? {
              organizationId: data.invOrganizationId,
              organizationName: data.organizationName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.organizationId : null),
    },
    {
      name: 'organizationName',
      bind: 'organization.organizationName',
      label: intl.get('sslm.sample.model.organization').d('库存组织'),
    },
    {
      name: 'invOrganizationId',
      bind: 'organization.organizationId',
    },
    {
      name: 'supplierName',
      label: intl.get('sslm.sample.model.sample.supplier').d('供应商'),
    },
    {
      name: 'supplierTypeCodeMeaning',
      label: intl.get('sslm.sample.model.supplierTypeCodeMeaning').d('供应商类型'),
    },
    {
      name: 'originFactoryName',
      label: intl.get('sslm.sample.model.originFactoryName').d('原厂名称'),
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get('sslm.sample.model.typeCode').d('送样类型'),
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
      name: 'confirmRemark',
      label: intl.get('sslm.sample.model.confirm.instructions').d('确认说明'),
    },
    {
      name: 'receiveUnitLov',
      type: 'object',
      label: intl.get('sslm.sample.model.receiveUnit').d('接收部门'),
      lovCode: 'SPRM.USER_DEPARTMENT',
      noCache: true,
      textField: 'unitName',
      transformResponse: (value, data) =>
        data.receiveUnitId
          ? {
              unitId: data.receiveUnitId,
              unitName: data.receiveUnitName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.unitId : null),
    },
    {
      name: 'receiveUnitId',
      bind: 'receiveUnitLov.unitId',
    },
    {
      name: 'receiveUnitName',
      bind: 'receiveUnitLov.unitName',
      label: intl.get('sslm.sample.model.receiveUnit').d('接收部门'),
    },
    {
      name: 'sampleAttachmentUuid',
      label: intl.get('sslm.sample.model.sample.sampleAttachment').d('相关附件'),
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
      lookupCode: 'SSLM.SEND_TYPE_CODE',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'supplierRemark',
      label: intl.get('sslm.sample.model.supplierRemark').d('供应商备注'),
    },
    {
      name: 'needFeedbackFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.needFeedback').d('需要供应商反馈'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'confirmationFlag',
      type: 'boolean',
      label: intl.get('sslm.sample.model.confirmationFlag').d('直接确认'),
      falseValue: 0,
      trueValue: 1,
    },
    {
      name: 'documentSource',
      lookupCode: 'SSLM_SAMPLE_DOCUMENT_SOURCE',
      label: intl.get('sslm.sample.model.sample.documentSource').d('送样申请来源'),
    },
    { name: 'isShowUomCodeFlag' },
  ],
  transport: {
    read: ({ data }) => {
      const { customizeUnitCode = '' } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-send-reqs/${params.detailReqId}`,
        method: 'get',
        data: {},
        params: {
          customizeUnitCode,
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
      const { setSourceHidden = () => {} } = params;
      // 初始化的时候根据是否确认判断是否展示  试用结果，使用说明，试用附件
      setSourceHidden(dataSet.current?.get('documentSource') !== 'SOURCE');
    },
    update: ({ dataSet, name, value }) => {
      switch (name) {
        case 'ou':
          dataSet.current.set({
            organization: null,
          });
          break;
        case 'organization':
          dataSet.current.set({
            sampleSendAddress: (value || {}).address,
          });
          break;
        default:
          break;
      }
    },
  },
});

const listLineDS = params => ({
  selection: false,
  autoLocateFirst: false,
  forceValidate: true,
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
      lovPara: { tenantId: organizationId },
      label: intl.get('sslm.sample.model.itemCode').d('物料编码'),
      transformResponse: (value, data) =>
        data.itemCode
          ? {
              itemCode: data.itemCode,
              itemName: data.itemName,
            }
          : null,
      transformRequest: value => (!isEmpty(value) ? value.itemCode : null),
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
      label: intl.get('sslm.sample.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      required: true,
      bind: 'itemLov.itemName',
      label: intl.get('sslm.sample.model.itemName').d('物料名称'),
    },
    {
      name: 'itemDesc',
      label: intl.get('sslm.sample.model.itemDesc').d('物料说明'),
    },
    {
      name: 'uoLov',
      type: 'object',
      label: intl.get('sslm.sample.model.uomName').d('单位'),
      required: params.isSupplierFlag,
      noCache: true,
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
        data.uomId
          ? {
              uomId: data.uomId,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomCodeAndName: data.uomCodeAndName,
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
      label: intl.get('sslm.sample.model.uomName').d('单位'),
    },
    {
      name: 'uomCodeAndName',
      bind: 'uoLov.uomCodeAndName',
    },
    {
      name: 'itemCategoryName',
      type: 'object',
      label: intl.get('sslm.sample.model.itemCategoryName').d('品类名称'),
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
    },
    {
      name: 'itemCategoryCode',
      type: 'object',
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      noCache: true,
      label: intl.get('sslm.sample.model.itemCategoryCode').d('品类代码'),
      textField: 'categoryCode',
      valueField: 'categoryCode',
      optionsProps: {
        treeFlag: 'Y',
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
      },
    },
    {
      name: 'reqQuantity',
      label: intl.get('sslm.sample.model.reqQuantity').d('送样需求数量'),
    },
    {
      name: 'reqTime',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.reqTime').d('送样需求时间'),
    },
    {
      name: 'expectedDeliveryDate',
      type: 'dateTime',
      label: intl.get('sslm.sample.model.expectedDeliveryDate').d('预计送达时间'),
    },
    {
      name: 'sendTypeCodeMeaning',
      label: intl.get('sslm.sample.model.sendTypeCode').d('送样方式'),
    },
    {
      name: 'trackingNumber',
      label: intl.get('sslm.sample.model.trackingNumber').d('快递单号'),
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
      name: 'sourceNum',
      label: intl.get('sslm.sample.model.sample.sourceNum').d('来源单据编号'),
    },
    {
      name: 'itemNum',
      label: intl.get('sslm.sample.model.sample.itemNum').d('来源单据行号'),
    },
  ],
  transport: {
    read: ({ data, params: newParams }) => {
      const { customizeUnitCode = '' } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-infos/${params.detailReqId}/list`,
        method: 'get',
        data: {},
        params: {
          ...newParams,
          customizeUnitCode,
        },
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'itemLov') {
        if (value) {
          record.set('uoLov', { uomCode: value.uomCode, uomName: value.uomName });
        } else {
          record.set('uoLov', null);
        }
      }
      if (name === 'itemCategoryCode') {
        // 传的对象 后续建议改成字符串
        record.set('itemCategoryName', value);
      }
    },
  },
});

export { basicInfoDS, listLineDS };
