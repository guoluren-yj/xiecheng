import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { isNil, isFunction } from 'lodash';
import { SLOD_DIRECTORY } from '@/utils/constant';
// import { queryBatchApprovaFlag } from '_utils/utils';
// import { getBatchOperationFlag } from '@/routes/components/utils';
// import moment from 'moment';

const organizationId = getCurrentOrganizationId();
// 基本信息
const headerInfoDataSet = ({
  change,
  unitCode,
  nodeTemplateType,
  handleInfoDataUpdate,
  setAlertFlag,
}) => ({
  dataToJSON: 'all',
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'displayAsnNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
      disabled: true,
    },
    {
      name: 'displayLabelNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
      disabled: true,
    },
    {
      name: 'displayPlanNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
      disabled: true,
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.nodeConfigName').d('单据类型'),
      disabled: true,
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
      disabled: true,
    },
    {
      name: 'createdName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
      disabled: true,
    },
    {
      name: 'createdUnitAll',
      type: 'object',
      label: intl.get('slod.deliveryWorkbench.model.common.createdUnitName').d('创建人部门'),
      lovCode: 'SPUC.USER_AUTHORITY_UNIT',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
          };
        },
      },
    },
    {
      name: 'createdUnitName',
      type: 'string',
      bind: 'createdUnitAll.unitName',
    },
    {
      name: 'createdUnitId',
      type: 'string',
      bind: 'createdUnitAll.unitId',
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建日期'),
      disabled: true,
    },
    {
      name: 'statusCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCode').d('状态'),
      disabled: true,
    },
    {
      name: 'packageMethod',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.packageMethod').d('包装模式'),
      lookupCode: 'SLOD.PACKAGE_METHOD',
      disabled: true,
      // defaultValue: 'INDEPENDENT_PACKAGE',
      // required: nodeTemplateType === 'UNIQUE_LABEL',
    },
    {
      name: 'purchaseRemark', // 计划单明细头备注
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseRemark').d('采购方备注'), // 根据当前创建人判断，若为采购方，则此字段可编辑，否则只读
      disabled: true,
    },
    {
      name: 'supplierRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierRemark').d('供应商备注'), // 根据当前创建人判断，若为供应商，则此字段可编辑，否则只读
      dynamicProps: {
        disabled: ({ dataSet }) =>
          dataSet?.getState(`change`) ? isNil(dataSet?.getState(`supplierRemark`)) : true,
      },
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.asnTypeCodeMeaning').d('单据分类'),
      disabled: true,
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyId').d('供应商'),
      disabled: true,
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.shipDate').d('发货日期'),
      max: 'expectedArriveDate',
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`shipDate`)) : true),
        required: ({ dataSet }) => (change ? !isNil(dataSet?.getState(`shipDate`)) : false),
      },
    },
    {
      name: 'expectedArriveDate',
      type: 'string', // date
      label: intl.get('slod.deliveryWorkbench.model.common.expectedArriveDate').d('预计到货日期'),
      min: 'shipDate',
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`expectedArriveDate`)) : true),
        required: ({ dataSet }) =>
          change ? !isNil(dataSet?.getState(`expectedArriveDate`)) : false,
      },
    },
    {
      name: 'deliveryAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`deliveryAddress`)) : true),
      },
    },
    {
      name: 'shipTotalQuantity',
      type: 'data',
      label:
        nodeTemplateType === 'PLAN'
          ? intl.get('slod.deliveryWorkbench.model.common.totalPlanQuantity').d('单据计划总数')
          : intl.get('slod.deliveryWorkbench.model.common.totalQuantity').d('发货总数'),
      disabled: true,
    },
    {
      name: 'shipTaxIncludedAmount',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.totalAmount').d('发货总额'),
      disabled: true,
    },
    {
      name: 'transportType',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.transportType').d('运输类型'),
      lookupCode: 'SLOD.ASN_TRANSPORT_TYPE',
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`transportType`)) : false),
      },
    },
    {
      name: 'logisticsCompanyCode',
      type: 'object',
      label: intl.get('slod.deliveryWorkbench.model.common.logisticsCompanyName').d('物流公司'),
      lovCode: 'SINV.ASN_SHIPPER_NAME',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
          };
        },
        disabled: ({ dataSet }) =>
          change ? isNil(dataSet?.getState(`logisticsCompanyCode`)) : false,
      },
      transformRequest: (value) => value && value.value,
      transformResponse: (value, object) =>
        value
          ? {
              value,
              logisticsCompanyName: object?.meaning,
            }
          : null,
    },
    {
      name: 'logisticsCompanyName',
      type: 'string',
      bind: 'logisticsCompanyCode.meaning',
    },
    {
      name: 'carNumber',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.carNumber').d('车牌号'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`carNumber`)) : false),
      },
    },
    {
      name: 'expressNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.expressNum').d('快递单号'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`expressNum`)) : false),
      },
    },
    {
      name: 'logisticsCost',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.logisticsCost').d('物流费用'),
    },
    {
      name: 'logisticsStaff',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.logisticsStaff').d('配送员'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`logisticsStaff`)) : false),
      },
    },
    {
      name: 'logisticsPhoneNum',
      type: 'tel',
      // pattern: /^1[3-9]\d{9}$/,
      regionField: 'internationalTelCode',
      label: intl.get('slod.deliveryWorkbench.model.common.logisticsPhoneNum').d('配送电话'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`logisticsPhoneNum`)) : false),
      },
    },
    {
      name: 'internationalTelCode',
      type: 'string',
      lookupCode: 'HPFM.IDD',
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`logisticsPhoneNum`)) : false),
      },
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
      disabled: true,
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`receiveAddress`)) : true),
      },
    },
    {
      name: 'contactName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.contactName').d('联系人'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`contactName`)) : false),
      },
    },
    {
      name: 'contactTelNum',
      type: 'tel',
      // pattern: /^1[3-9]\d{9}$/,
      regionField: 'contactsTelCode',
      label: intl.get('slod.deliveryWorkbench.model.common.contactTelNum').d('联系人电话'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`contactTelNum`)) : false),
        required: ({ record, dataSet }) => {
          const configSheetFlag = dataSet?.getState('configSheetFlag');
          if (nodeTemplateType === 'ASN') {
            if (configSheetFlag) {
              return false;
            }
            return (
              record?.get('logisticsCompanyCode') ||
              record?.get('logisticsCompanyCode')?.value ||
              record?.get('expressNum')
            );
          }
          return false;
        },
      },
    },
    {
      name: 'contactsTelCode',
      type: 'string',
      lookupCode: 'HPFM.IDD',
      label: intl.get('slod.deliveryWorkbench.model.common.internationalTelCode').d('区号'),
      dynamicProps: {
        disabled: ({ dataSet }) => (change ? isNil(dataSet?.getState(`contactTelNum`)) : false),
      },
    },
    {
      name: 'linkFirst',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.linkHeaderFirst').d('头链接字段1'),
    },
    {
      name: 'camp', // 不可删除，此字段用于判断发货进入采购方还是供应商
      type: 'string',
      lookupCode: 'SLOD.CAMP_CODE',
      label: intl.get('slod.deliveryWorkbench.model.common.camp').d('登陆阵营'),
      defaultValue: 'SUPPLIER',
    },
    {
      name: 'changingFlag',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.changingFlag').d('变更标识'),
    },
    {
      name: 'pageProperty', // 不可删除，此字段用于判断变更
      type: 'string',
      lookupCode: 'SLOD.FRONT_PAGE_PROPS',
      label: intl.get('slod.deliveryWorkbench.model.common.pageProperty').d('页面属性'),
      disabled: true,
    },
  ],
  events: {
    load: async ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.set({ camp: 'SUPPLIER', currentTabs: 'all' });
        if (change) {
          record.set({ pageProperty: '1' });
        } else {
          record.set({ pageProperty: '0' });
        }
      });
      const businessKeys = dataSet.current.get('businessKeys');
      if (businessKeys) {
        // 获取审批按钮显示状态
        // const approvaFlags = await queryBatchApprovaFlag([businessKeys]);
        // // 获取撤销审批按钮状态
        // const operationFlags = await getBatchOperationFlag([businessKeys]);
        dataSet.setState({ approvaFlags: {}, operationFlags: {} });
      }
    },
    update: ({ name, value, record, dataSet }) => {
      if (isFunction(handleInfoDataUpdate)) {
        handleInfoDataUpdate({ name, value, record, dataSet });
      }
      if (
        isFunction(setAlertFlag) &&
        nodeTemplateType === 'ASN' &&
        (name === 'expressNum' || name === 'logisticsCompanyCode')
      ) {
        if (!isNil(record.get('expressNum')) || record.get('logisticsCompanyCode')) {
          setAlertFlag(true);
        } else {
          setAlertFlag(false);
        }
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { nodeTemplateCode, nodeConfigId, headerId, ...other } = data.params || {};
      const {
        templateCode,
        templateVersion,
        cuszTplStageCode = 'SUBMIT',
        cuszTplPageCode = 'DELIVERY_WORKBENCH.DETAIL',
      } = data.tplInfo || {};
      let params;
      if (unitCode) {
        params = {
          customizeUnitCode: unitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/detail/header/${headerId}?campKey=s`,
        method: 'GET',
        params,
        data: other,
      };
    },
  },
});

// 附件信息
const attachmentDataSet = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'purchaseAttachmentUuid',
      type: 'attachment',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseAttachmentUuid').d('采购方附件'),
      bucketDirectory: SLOD_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierAttachmentUuid').d('供应商附件'),
      bucketDirectory: SLOD_DIRECTORY,
    },
  ],
});

// 物流补录信息
const logisticsDataSet = () => ({
  selection: false,
  autoQuery: false,
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'logisticsCompany',
      type: 'object',
      lovCode: 'SINV.ASN_SHIPPER_NAME',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.logisticCompany`).d('物流公司'),
      transformRequest: (value) => value?.value,
    },
    {
      name: 'logisticsCompanyMeaning',
      bind: 'logisticsCompany.meaning',
    },
    {
      name: 'logisticsStaff',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.logisticsStaff`).d('联系人员'),
    },
    {
      name: 'logisticsContactInfo',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.logisticsContactInfo`).d('联系方式'),
    },
    {
      name: 'logisticsCost',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.logisticsCost`).d('物流费用'),
    },
    {
      name: 'expressNum',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.expressNum`).d('快递单号'),
    },
    {
      name: 'logisticsPhoneNum',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.logisticsPhoneNum`).d('收件人手机号'),
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      dynamicProps: {
        required: ({ record }) => record.getField('logisticsPhoneNum').required,
      },
    },
    {
      name: 'logisticsReceiptStatus',
      label: intl
        .get(`slod.deliveryWorkbench.model.receipt.logisticsReceiptStatus`)
        .d('物流签收状态'),
      type: 'object',
      lookupCode: 'SINV.ASN_LOGISTICS_STATUS',
      transformRequest: (value) => value?.value,
    },
    { name: 'logisticsReceiptStatusMeaning', bind: 'logisticsReceiptStatus.meaning' },
    {
      name: 'carNumber',
      label: intl.get(`slod.deliveryWorkbench.model.receipt.carNumber`).d('车牌号'),
    },
  ],
});

export { headerInfoDataSet, attachmentDataSet, logisticsDataSet };
