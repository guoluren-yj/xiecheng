import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
} from '@/routes/components/utils/constant';

// 设置sodr国际化前缀 - common - message
const modelPrompt = 'sodr.sendOrder.model.common';
const sodrCommonPrompt = 'sodr.common.model.common';
const commonPrompt = 'sprm.common.model.common';

export default ({
  organizationId,
  poHeaderId,
  sourceFromCancel,
  evaluationDs,
  listDs,
  otherDs,
  associateDs,
}) => {
  const customizeUnitCode = sourceFromCancel
    ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER,SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA'
    : 'SODR.SEND_ORDER_DETAIL.HEADER,SODR.SEND_ORDER_DETAIL.DELIVERY_CATA';
  const saveCustomizeUnitCode = sourceFromCancel
    ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER,SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE,SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER,SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
    : 'SODR.SEND_ORDER_DETAIL.HEADER,SODR.SEND_ORDER_DETAIL.BASIC,SODR.SEND_ORDER_DETAIL.OTHER,SODR.SEND_ORDER_DETAIL.INVOICE';
  return {
    autoQuery: true,
    dataToJSON: 'all',
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`,
        params: {
          camp: 1,
          customizeUnitCode,
        },
        method: 'GET',
      },
      submit: ({ data: [header] }) => {
        const {
          poLineDetailDTOs: oldPoLineDetailDTOs,
          $evaluationDs,
          ...oldPoHeaderDetailDTO
        } = header;
        const poLineOtherDTOs = otherDs.toJSONData();
        const poLineAssociateDTOs = associateDs.toJSONData();
        const oldPoLineDetail = oldPoLineDetailDTOs.map((i) => {
          const other = poLineOtherDTOs.find((j) => j.poLineLocationId === i.poLineLocationId);
          const associate = poLineAssociateDTOs.find(
            (j) => j.poLineLocationId === i.poLineLocationId
          );
          return {
            ...i,
            ...other,
            ...associate,
          };
        });
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-header/purchase/save`,
          params: {
            customizeUnitCode: saveCustomizeUnitCode,
          },
          data: {
            poHeaderDetailDTO: oldPoHeaderDetailDTO,
            poLineDetailDTOs: oldPoLineDetail,
          },
          method: 'PUT',
          transformResponse(resp) {
            const data = JSON.parse(resp);
            const { poHeaderDetailDTO, poLineDetailDTOs, failed } = data;
            if (failed) {
              return data;
            }
            return [
              {
                ...poHeaderDetailDTO,
                poLineDetailDTOs,
                $evaluationDs,
              },
            ];
          },
        };
      },
    },
    dataKey: null,
    fields: [
      {
        name: 'displayPoNum',
        label: intl.get(`${modelPrompt}.orderNum`).d('订单号'),
      },
      {
        name: 'releaseNum',
        label: intl.get(`${modelPrompt}.releaseNum`).d('发放号'),
      },
      {
        name: 'versionNum',
        label: intl.get(`${modelPrompt}.versionNum`).d('版本号'),
      },
      {
        name: 'amount',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.taxNotIncludeAmount`).d('不含税金额'),
      },
      {
        name: 'taxIncludeAmount',
        label: intl.get(`${modelPrompt}.taxIncludeAmount`).d('含税金额'),
      },
      {
        name: 'currencyCode',
        label: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
      },
      {
        name: 'companyName',
        label: intl.get('entity.company.tag').d('公司'),
      },
      {
        name: 'supplierId',
        label: intl.get(`${sodrCommonPrompt}.supplierId`).d('供应商'),
      },
      {
        name: 'supplierSiteName',
        label: intl.get(`${modelPrompt}.supplierSites`).d('供应商地点'),
      },
      {
        name: 'poTypeDesc',
        label: intl.get(`${modelPrompt}.orderType`).d('订单类型'),
      },
      {
        name: 'purchaseOrgName',
        label: intl.get(`${sodrCommonPrompt}.purOrganizationId`).d('采购组织'),
      },
      {
        name: 'agentId',
        label: intl.get(`${modelPrompt}.purchaseAgent`).d('采购员'),
      },
      {
        name: 'releasedDate',
        type: 'dateTime',
        label: intl.get(`${modelPrompt}.releaseTime`).d('发布时间'),
      },
      {
        name: 'shipToLocationAddress',
        label: intl.get(`${modelPrompt}.shipToLocationAddress`).d('收货方地址'),
      },
      {
        name: 'billToLocationAddress',
        label: intl.get(`${modelPrompt}.billToLocationAddress`).d('收单方地址'),
      },
      {
        name: 'termsId',
        label: intl.get(`${modelPrompt}.paymentRules`).d('付款条款'),
      },
      {
        name: 'quantityTotal',
        type: 'number',
        label: intl.get(`${sodrCommonPrompt}.totalQuantity`).d('总数量'),
      },
      {
        name: 'poSourcePlatform',
        label: intl.get(`${modelPrompt}.sourcePlatform`).d('来源平台'),
      },
      {
        name: 'originalPoNum',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`).d('原订单号'),
      },
      {
        name: 'erpContractNum',
        label: intl.get(`${modelPrompt}.contractNum`).d('合同编号'),
      },
      {
        name: 'domesticCurrencyCode',
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`)
          .d('本币币种'),
      },
      {
        name: 'domesticTaxIncludeAmount',
        max: MAX_QUAN_NUMBER,
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
          .d('本币含税金额'),
      },
      {
        name: 'domesticAmount',
        max: MAX_QUAN_NUMBER,
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.domesticAmount`)
          .d('本币不含税金额'),
      },
      {
        name: 'supplierOrderTypeCode',
        label: intl
          .get(`sodr.quotePurchase.model.quotePurchase.supplierOrderTypeCode`)
          .d('京东e卡-code'),
      },
      {
        name: 'remark',
        label: intl.get(`${modelPrompt}.orderSummary`).d('订单摘要'),
        dynamicProps: {
          maxLength() {
            return sourceFromCancel ? undefined : 480;
          },
        },
      },
      {
        name: 'sourceOfTransferOrder',
        label: intl.get(`${sodrCommonPrompt}.sourceOfTransferOrder`).d('转单来源'),
      },
      {
        name: 'cooperationSupplierFlag',
        label: intl.get(`${sodrCommonPrompt}.cooperationSupplierFlag`).d('供应商参与协同标识'),
      },
      {
        name: 'electricSignFlag',
        label: intl.get(`${sodrCommonPrompt}.electricSignFlag`).d('电签标志'),
      },
      {
        name: 'electricSignStatus',
        label: intl.get(`${sodrCommonPrompt}.electricSignStatus`).d('电签状态'),
      },
      {
        name: 'electricSignOrder',
        label: intl.get(`${sodrCommonPrompt}.electricSignOrder`).d('签署顺序'),
      },
      {
        name: 'electricSignStage',
        label: intl.get(`${sodrCommonPrompt}.electricSignStage`).d('签署阶段'),
      },
      {
        name: 'pcNum',
        label: intl.get(`${sodrCommonPrompt}.orderPcNum`).d('订单协议单号'),
      },
      {
        name: 'shipToLocationAddress',
        label: intl.get(`${commonPrompt}.shipToLocationAddress`).d('收货方地址'),
      },
      {
        name: 'shipToLocContName',
        label: intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人'),
      },
      {
        name: 'shipToLocTelNum',
        label: intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话'),
      },
      {
        name: 'billToLocationAddress',
        label: intl.get(`${commonPrompt}.billToLocationAddress`).d('收单方地址'),
      },
      {
        name: 'billToLocContName',
        label: intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人'),
      },
      {
        name: 'billToLocTelNum',
        label: intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话'),
      },
      {
        name: 'receiverEmailAddress',
        label: intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱'),
      },
      {
        name: 'taxRegisterAddress',
        label: intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址'),
      },
      {
        name: 'taxRegisterNum',
        label: intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号'),
      },
      {
        name: 'taxRegisterBank',
        label: intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行'),
      },
      {
        name: 'taxRegisterBankAccount',
        type: 'secret',
        label: intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号'),
      },
      {
        name: 'invoiceTitle',
        label: intl.get(`${sodrCommonPrompt}.taxRegisterBank`).d('开票公司名称'),
      },
      {
        name: 'taxRegisterTel',
        label: intl.get(`${sodrCommonPrompt}.taxRegisterBankAccount`).d('税务登记电话'),
      },
      {
        name: 'invoiceTitleTypeName',
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
      },
      {
        name: 'invoiceMethodName',
        label: intl.get(`${commonPrompt}.invoiceMethod`).d('开票方式'),
      },
      {
        name: 'invoiceTypeName',
        label: intl.get(`${commonPrompt}.invoiceTitleTypeMeaning`).d('发票形式'),
      },
      {
        name: 'invoiceDetailTypeName',
        label: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
      },
      { name: 'filesNumber', type: 'number' },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get(`entity.attachment.type.purchaser`).d('采购方附件'),
        readOnly: true,
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
      },
      {
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        label: intl.get(`entity.attachment.type.supplier`).d('供应商附件'),
        readOnly: true,
        bucketName: BUCKET_NAME,
        bucketDirectory: SUPPLIER_DIRECTORY,
      },
      {
        name: 'purchaserInnerAttachmentUuid',
        type: 'attachment',
        bucketName: BUCKET_NAME,
        bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
      },
    ],
    children: {
      $evaluationDs: evaluationDs,
      poLineDetailDTOs: listDs,
      poLineOtherDTOs: otherDs,
      poLineAssociateDTOs: associateDs,
    },
  };
};
