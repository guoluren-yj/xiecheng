import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
// import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();
// const commonPrompt = 'sprm.common.model.common';

const projectLineDs = ({ initCuxTablePageSize }) => ({
  autoQuery: false,
  primaryKey: 'prLineId',
  cacheSelection: true,
  pageSize: initCuxTablePageSize || 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
      type: 'string',
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sodr.common.model.common.lineNum`).d('行号'),
      type: 'string',
    },
    {
      name: 'itemCode',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.commonName`).d('通用名'),
      name: 'commonName',
      width: 150,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物品分类'),
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
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'quantity',
      width: 80,
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
      },
    },
    { label: intl.get(`sprm.common.model.common.uomName`).d('单位'), name: 'secondaryUomName' },
    {
      label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
      name: 'secondaryQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('secondaryUomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价（含税）'),
      name: 'secondaryTaxInUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.occupiedQuantity`).d('剩余可占用数量'),
      name: 'occupiedQuantity',
      type: 'number',
      width: 140,
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
      name: 'uomName',
      width: 80,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      name: 'currencyCode',
      width: 80,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
      width: 170,
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
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierItemNumDesc`).d('供应商料号描述'),
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
      viewMode: 'popup',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-applyToInquiry',
      width: 140,
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/pro-refer-pr/workbench-pr-line`,
        method: 'GET',
        data: {
          ...data,
          prCustomizeFilterFlag: 1,
          erpControlFlag: 1,
          customizeUnitCode:
            'SPRM.PURCHASE_EXECUTION_ALL.SIEC_PROJECT,SPRM.PURCHASE_EXECUTION_ALL.SIEC_FILTER',
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

export { projectLineDs };
