import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { getUomName, getQtyName } from '@/utils/utils';

const itemLineDataSet = (options = {}) => {
  const { organizationId, doubleUnitFlag, rfxHeaderId, customizeUnitCode } = options || {};

  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        dynamicProps: {
          label: () => {
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomName',
        dynamicProps: {
          label: () => {
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        label: intl.get(`ssrc.offlineResultEntry.model.offlineEntry.deliveryPeriod`).d('供货周期'),
        name: 'currentDeliveryCycle',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.controlProtocolFlag`).d('控制协议数量'),
        name: 'controlProtocolFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
      },
      {
        name: 'costPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
        type: 'number',
      },
      {
        name: 'model',
        type: 'string',
        label: intl.get('ssrc.common.specification').d('型号'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        type: 'number',
      },
      {
        name: 'estimatedPrice',
        label: intl.get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`).d('预估单价(含税)'),
        type: 'number',
      },
      {
        name: 'resultExecutionStrategy',
        label: intl.get(`ssrc.resultsQuery.model.resultsQuery.executiveStrategy`).d('寻源执行策略'),
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
      //   name: 'ladderInquiryFlag',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
      //   name: 'ladderOffer',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplateName`).d('报价模板'),
      //   name: 'templateName',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
      //   name: 'quotationDetailFlag',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
      //   name: 'floatTypeMeaning',
      // },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
      //   name: 'quotationRange',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
      },
      {
        label: intl.get('ssrc.common.view.freightInclude').d('含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.common.model.common.attachment').d('附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        disabled: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        dataIndex: 'newPrice',
        type: 'number',
      },
      {
        name: 'rfxHeaderId',
        type: 'string',
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        const queryParamData = {
          customizeUnitCode,
          rfxHeaderId,
          ...data,
        };

        if (!organizationId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/items`,
          method: 'GET',
          data: queryParamData,
        };
      },
    },
  };
};

export { itemLineDataSet };
