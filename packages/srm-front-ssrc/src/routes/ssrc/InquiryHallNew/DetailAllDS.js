import intl from 'utils/intl';
import { getUomName, getQtyName } from '@/utils/utils';
import { getDateFormat, getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import { PrefixV2, getQuotationName } from '@/utils/globalVariable';

const ItemLineTableDS = (config = {}) => {
  const { bidFlag } = config || {};
  const quotationName = getQuotationName(bidFlag);

  return {
    primaryKey: 'rfxLineItemId',
    autoQuery: false,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'rfxStatusMeaning',
        type: 'string',
        // label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
      },

      {
        label: intl.get('ssrc.inquiryHall.view.card.sublabel.itemInfo').d('物料信息') + 1,
        name: 'itemOne',
        type: 'string',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemLineineNumber`).d('物料行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: getDateFormat(),
      },

      // 2
      {
        label: intl.get('ssrc.inquiryHall.view.card.sublabel.itemInfo').d('物料信息') + 2,
        name: 'itemTwo',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        name: 'batchPrice',
        align: 'right',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },

      // 3
      {
        name: 'rfxInfo',
        // label: intl.get('ssrc.inquiryHall.view.inquiryHall.RFXInfo').d('询价单信息'),
      },
      {
        name: 'rfxNum',
        type: 'string',
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.commonRFXNo.', {
            categoryCode: bidFlag ? 'BID' : 'RFX',
          })
          .d('{categoryCode}单号'),
      },
      {
        name: 'rfxTitle',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.label').d('标题'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingTemplate').d('寻源模板'),
      },
      {
        name: 'sourceCategoryMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      },
      {
        name: 'secondarySourceCategoryMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
      },
      {
        name: 'sourceMethodMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
      },
      {
        name: 'offlineWholeFlagMeaning',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.offlineWholeFlagMeaning').d('采购方式'),
      },
      // 4
      {
        // label: intl.get('ssrc.common.view.time').d('时间'),
        name: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, { quotationName })
          .d(`{quotationName}开始时间`),
        name: 'quotationStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
            quotationName,
          })
          .d(`{quotationName}截止时间`),
        name: 'quotationEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
      },

      // 5
      {
        name: 'organizationInfo',
        // label: intl.get(`ssrc.inquiryHall.view.orgInfos`).d('组织信息'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'purOrganizationName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
      },

      {
        name: 'quotationRule',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
        name: 'quotationTypeMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
        name: 'sealedQuotationFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`).d('报价方向'),
        name: 'auctionDirectionMeaning',
      },

      {
        name: 'creationInfo',
      },
      {
        label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        name: 'createdByName',
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
        name: 'sourceCreationDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
        name: 'createdUnitName',
      },
    ],
    transport: {
      read: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { ...others } = commonProps;
        const { advancedData = {}, ...otherData } = data || {};
        const newData = { ...others, ...(advancedData || {}), ...otherData };
        const organizationId = getCurrentOrganizationId();

        return {
          url: `${PrefixV2}/${organizationId}/rfx/list/all/item`,
          method: 'GET',
          data: newData,
        };
      },
    },
  };
};

export { ItemLineTableDS };
