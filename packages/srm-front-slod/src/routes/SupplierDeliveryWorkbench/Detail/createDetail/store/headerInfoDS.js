import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { isFunction, isNil } from 'lodash';
import { SLOD_DIRECTORY } from '@/utils/constant';

// import moment from 'moment';

const organizationId = getCurrentOrganizationId();
// 基本信息
const headerInfoDataSet = ({
  id,
  unitCode,
  nodeTemplateType,
  handleInfoDataUpdate,
  setAlertFlag,
}) => ({
  dataToJSON: 'all ',
  primaryKey: id,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'displayAsnNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
    },
    {
      name: 'displayLabelNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
    },
    {
      name: 'displayPlanNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayAsnNum').d('单据编号'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.nodeConfigName').d('单据类型'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
    },
    {
      name: 'createdName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'createdUnitAll',
      type: 'object',
      // textField: 'createdUnitName',
      // valueField: 'createdUnitId',
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
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'statusCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.statusCode').d('状态'),
    },
    {
      name: 'packageMethod',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.packageMethod').d('包装模式'),
      lookupCode: 'SLOD.PACKAGE_METHOD',
      defaultValue: 'INDEPENDENT_PACKAGE',
      required: nodeTemplateType === 'UNIQUE_LABEL',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'purchaseRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseRemark').d('采购方备注'), // 根据当前创建人判断，若为采购方，则此字段可编辑，否则只读
    },
    {
      name: 'supplierRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierRemark').d('供应商备注'), // 根据当前创建人判断，若为供应商，则此字段可编辑，否则只读
    },
    {
      name: 'asnTypeCodeMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.asnTypeCodeMeaning').d('单据分类'),
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.shipDate').d('发货日期'),
      required: nodeTemplateType === 'ASN',
      max: 'expectedArriveDate',
    },
    {
      name: 'expectedArriveDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.expectedArriveDate').d('预计到货日期'),
      required: nodeTemplateType === 'ASN',
      min: 'shipDate',
    },
    {
      name: 'deliveryAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
      // required: nodeTemplateType === 'ASN',
    },
    {
      name: 'shipTotalQuantity',
      type: 'data',
      label:
        nodeTemplateType === 'PLAN'
          ? intl.get('slod.deliveryWorkbench.model.common.totalPlanQuantity').d('单据计划总数')
          : intl.get('slod.deliveryWorkbench.model.common.totalQuantity').d('发货总数'),
    },
    {
      name: 'shipTaxIncludedAmount',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.totalAmount').d('发货总额'),
    },
    {
      name: 'transportType',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.transportType').d('运输类型'),
      lookupCode: 'SLOD.ASN_TRANSPORT_TYPE',
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
    },
    {
      name: 'expressNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.expressNum').d('快递单号'),
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
    },
    {
      name: 'logisticsPhoneNum',
      type: 'tel',
      // pattern: /^1[3-9]\d{9}$/,
      regionField: 'internationalTelCode',
      label: intl.get('slod.deliveryWorkbench.model.common.logisticsPhoneNum').d('配送电话'),
      dynamicProps: {
        pattern: ({ record }) => record?.get('internationalTelCode') === '+86' && /^1[3-9]\d{9}$/,
      },
    },
    {
      name: 'internationalTelCode',
      type: 'string',
      lookupCode: 'HPFM.IDD',
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
    },
    {
      name: 'carriersName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.carriersName').d('加工厂'),
    },
    {
      name: 'processingPlantAddress',
      type: 'string',
      label: intl
        .get('slod.deliveryWorkbench.model.common.processingPlantAddress')
        .d('加工厂收货地址'),
    },
    {
      name: 'contactName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.contactName').d('联系人'),
    },
    {
      name: 'contactTelNum',
      type: 'tel',
      // pattern: /^1[3-9]\d{9}$/,
      regionField: 'contactsTelCode',
      label: intl.get('slod.deliveryWorkbench.model.common.contactTelNum').d('联系人电话'),
      dynamicProps: {
        pattern: ({ record }) => record?.get('contactsTelCode') === '+86' && /^1[3-9]\d{9}$/,
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
      disabled: true,
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
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { status: 'create' });
        record.set({ camp: 'SUPPLIER', pageProperty: '0', currentTabs: 'created' });
      });
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

export { headerInfoDataSet, attachmentDataSet };
