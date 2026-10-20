import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();

const biddingTableDs = () => ({
  autoQuery: true,
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
      label: intl.get(`ssrc.bidHall.model.bidHall.itemName`).d('物品描述'),
      type: 'string',
    },
    {
      name: 'categoryName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCatalog`).d('物料分类'),
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
      name: 'ouName',
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.inventory`).d('库存组织'),
      name: 'invOrganizationName',
      type: 'string',
    },
    {
      name: 'quantity',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.quantity`).d('数量'),
      type: 'number',
    },
    {
      name: 'occupiedQuantity',
      label: intl
        .get(`sodr.quotePurchaseRequisition.view.message.restPoQuantity`)
        .d('剩余可下单数量'),
      type: 'number',
    },
    {
      name: 'uomName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.uomCode`).d('单位'),
      type: 'string',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.currencyCode`).d('币种'),
      name: 'currencyCode',
      type: 'string',
    },
    {
      name: 'neededDate',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.neededDate`).d('需求日期'),
      type: 'date',
    },
    {
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.applyPerson`).d('申请人'),
      name: 'prRequestedName',
      type: 'string',
    },

    {
      name: 'executorName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.executedByName`).d('需求执行人'),
      type: 'string',
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.unitName`).d('需求部门'),
      name: 'unitName',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.dateOfApplication`).d('申请日期'),
      name: 'requestDate',
      type: 'date',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.dataSources`).d('数据来源'),
      name: 'prSourcePlatformMeaning',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.distributivePerson`).d('最后分配时间'),
      name: 'assignedDate',
      type: 'date',
    },
  ],
  queryFields: [
    {
      name: 'displayPrNum',
      type: 'string',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
    },
    {
      name: 'ouId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.OU',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.ouId,
    },
    {
      name: 'categoryId',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物品分类'),
      type: 'object',
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      lovPara: { organizationId },
      noCache: true,
      transformRequest: (value) => value && value.categoryId,
      lovDefineAxiosConfig: (code) => {
        const lovConfig = lovDefineAxiosConfig(code);
        return {
          ...lovConfig,
          transformResponse: [
            ...lovConfig.transformResponse,
            (data) => {
              return {
                ...data,
                treeFlag: 'Y',
                idField: 'categoryId',
                parentIdField: 'parentCategoryId',
              };
            },
          ],
        };
      },
    },
    {
      name: 'purchaseAgentId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.purchaseAgentId,
    },
    {
      name: 'itemId',
      label: intl.get(`sodr.quotePurchaseRequisition.view.message.itemCode`).d('物料编码'),
      type: 'object',
      lovCode: 'SPRM.ITEM',
      lovPara: { organizationId },
      transformRequest: (value) => value && value.itemId,
    },
  ],

  transport: {
    read: ({ data, params }) => {
      const queryData = {
        ...data,
        ...params,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_POLL.BIDDING_LIST,SPRM.PURCHASE_REQUISITION_POLL.BIDDING_FILTER',
      };
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/share/application`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { biddingTableDs };
