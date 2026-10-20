/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-10-11 15:25:58
 * @LastEditors: yiping.liu
 * @LastEditTime: 2023-03-15 10:05:47
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { getUomName, getQuantityName } from '@/utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { INQUIRY } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSRC}/v1`;

const PurchaseRequestDS = (sourceKey = INQUIRY) => {
  return {
    autoQuery: false,
    cacheSelection: true,
    pageSize: 20,
    primaryKey: 'prLineId',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationNum`).d('申请编号'),
        name: 'displayPrNum',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
        name: 'displayLineNum',
        width: 80,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationNumOrLineNo`)
          .d('申请编号-行号'),
        name: 'displayPrNumOrDisplayLineNum',
        width: 230,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        width: 150,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格'),
        name: 'referencePrice',
        width: 90,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
        name: 'commonName',
        width: 150,
      },
      {
        label: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        name: 'categoryName',
        width: 100,
      },
      {
        label: intl.get('ssrc.common.company').d('公司'),
        name: 'companyName',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ouName`).d('业务实体'),
        name: 'ouName',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
        width: 130,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantities`).d('数量'),
        name: 'secondaryQuantity',
        width: 80,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
        name: 'occupiedQuantity',
        width: 140,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
        width: 80,
      },
      {
        name: 'quantity',
        width: 80,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQuantityName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        width: 80,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
        width: 80,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'neededDate',
        width: 120,
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人'),
        name: 'prRequestedName',
        width: 130,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandExecutor`).d('需求执行人'),
        name: 'executorName',
        width: 100,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
        name: 'unitName',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requestDate`).d('申请日期'),
        name: 'requestDate',
        width: 170,
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
        name: 'remark',
        width: 200,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prSourcePlatform`).d('数据来源'),
        name: 'prSourcePlatformMeaning',
        width: 130,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignedDate`).d('最后分配时间'),
        name: 'assignedDate',
        width: 170,
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingNum`).d('图号'),
        name: 'drawingNum',
        width: 130,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.drawingVersion`).d('图纸版本'),
        name: 'drawingVersion',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.surfaceFlag`).d('表面处理'),
        name: 'surfaceTreatFlag',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNum`).d('供应商料号'),
        name: 'supplierItemCode',
        width: 120,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`)
          .d('供应商料号描述'),
        name: 'supplierItemNumDesc',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectCategory`).d('项目类别'),
        name: 'projectCategoryMeaning',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prTypeName`).d('申请类型'),
        name: 'prTypeName',
        width: 150,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.demandAccessories`).d('需求附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
        width: 140,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.requirementDesc`).d('需求描述'),
        name: 'headerRemark',
        width: 200,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedSupplier`).d('建议供应商'),
        name: 'supplierCompanyName',
        width: 180,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${prefix}/${organizationId}/share/application-post`,
          method: 'POST',
          params: {
            ...params,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE,SSRC.${sourceKey}_HALL.NEW_EDIT.PURCHASEREQUEST_FORM`,
          },
          data: {
            ...data,
            erpControlFlag: 1,
            sourceDocumentType: sourceKey === 'BID' ? 'NEW_BID' : 'RFX',
            prCustomizeFilterFlag: 1,
          },
        };
      },
    },
  };
};

export default PurchaseRequestDS;
