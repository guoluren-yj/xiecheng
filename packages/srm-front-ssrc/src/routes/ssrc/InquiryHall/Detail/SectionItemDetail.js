import React, { PureComponent } from 'react';
import { Table, ModalProvider, DataSet } from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { numberSeparatorRender } from '@/utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import { TooltipTitle } from '@/utils/utils';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import ItemLineTableDS from './SectionItemDetailDS';

export default class SectionItemDetail extends PureComponent {
  constructor(props) {
    super(props);

    const { rfxInfoDS } = props || {};

    this.state = {};
    this.itemLineTableDS = new DataSet(
      ItemLineTableDS({
        rfxInfoDS,
      })
    );
  }

  componentDidMount() {
    const { rfxId, record, rfx = {}, organizationId = null } = this.props;
    const { unitCodeSymbol = null } = rfx;
    const common = {
      rfxHeaderId: rfxId,
      organizationId,
      projectLineSectionId: record.projectLineSectionId,
    };
    this.itemLineTableDS.setQueryParameter('commonProps', {
      ...common,
      customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ITEM`,
    });
    this.itemLineTableDS.query();
  }

  // table columns
  getColumns() {
    const {
      rfxInfoDS = {},
      header,
      organizationId,
      viewLadderLevelPrepare,
      linktoPrNumDetail,
      doubleUnitFlag = false,
      disabledAllLinkFlag = false,
      rfx = {},
      biddingUnitPrice = false,
      judgeNewBiddingFlag = noop,
    } = this.props;

    const { bidFlag = false } = rfx || {};

    const SourceFrom = rfxInfoDS.current ? rfxInfoDS.current.get('sourceFrom') : null;

    const {
      expandResultsFlag = 0,
      resultsExpandingDimensions = '',
      resultsExpandingHierarchy = '',
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
      biddingMode,
      biddingTarget,
    } =
      rfxInfoDS?.current?.get([
        'expandResultsFlag', // 拓展寻源结果
        'resultsExpandingDimensions', // 拓展寻源结果维度
        'resultsExpandingHierarchy', // 拓展寻源结果层级
        'isBritishBidTrafficLight',
        'biddingTrialBiddingFlag',
        'biddingMode',
        'biddingTarget',
      ]) || {};

    // 单据来源为采购申请转立项转寻源
    const purchaseRequestFlag = this.itemLineTableDS?.some((item) => item && item?.get('prLineId'));

    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'ITEM_LINE' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';
    const newBiddingFlag = judgeNewBiddingFlag(header);

    // 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    // 单价竞价-启用红绿灯
    const unitPriceTrafficLight = startingBiddingPriceFlag && isBritishBidTrafficLight;

    // 单价竞价 - 试竞价 - 启用红绿灯
    const trialUnitPriceTrafficLight = unitPriceTrafficLight && biddingTrialBiddingFlag;

    const columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
        align: 'left',
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
        hidden: expandInvOrganizationVisible, // 隐藏 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'specs',
        width: 150,
      },
      {
        name: 'itemCategoryName',
        width: 150,
      },
      {
        name: 'secondaryQuantity',
        width: 100,
        align: 'left',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'secondaryUomName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'rfxQuantity',
            width: 120,
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'uomName',
            width: 120,
          }
        : null,
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 150,
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEstimatedPrice`)
                  .d('辅助单位对应的预估单价(含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.estimatedPrice`)
                  .d('预估单价(含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedPrice',
            width: 150,
            header: (
              <TooltipTitle
                tipValue={intl
                  .get(`ssrc.common.model.offlineEntry.secondaryEetEstimatedPrice`)
                  .d('辅助单位对应的预估单价(不含税)')}
                title={intl
                  .get(`ssrc.inquiryHall.model.offlineEntry.netEstimatedPrice`)
                  .d('预估单价(不含税)')}
                doubleUnitFlag={doubleUnitFlag}
              />
            ),
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 150,
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedAmount',
            width: 150,
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      {
        name: 'batchPrice',
        width: 150,
        align: 'left',
      },
      {
        name: 'taxIncludedFlag',
        width: 150,
        align: 'left',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        width: 150,
        name: 'taxRate',
        renderer: ({ record }) => {
          return record.get('taxIdMeaning');
        },
      },
      {
        width: 150,
        name: 'demandDate',
      },
      !newBiddingFlag
        ? {
            width: 120,
            name: 'ladderInquiryFlag',
            align: 'left',
            renderer: ({ value }) => yesOrNoRender(value),
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'ladderOffer',
            width: 100,
            renderer: ({ record }) => {
              return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
                <a onClick={() => viewLadderLevelPrepare(record)}>
                  {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
                </a>
              ) : null;
            },
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'templateName',
            width: 150,
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationDetailFlag',
            width: 100,
            renderer: ({ record }) =>
              record.get('rfxLineItemId') && record.get('creationDate') ? (
                <QuotationDetail
                  rowData={record}
                  uiType="c7n"
                  sourceFrom="RFX"
                  buttonText={intl.get(`hzero.common.button.view`).d('查看')}
                  bidFlag={bidFlag}
                />
              ) : null,
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'floatTypeMeaning',
            width: 140,
          }
        : null,
      !newBiddingFlag
        ? {
            name: 'quotationRange',
            width: 100,
            align: 'right',
          }
        : null,
      SourceFrom === 'DEMAND_POOL' || purchaseRequestFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => (
              <a onClick={() => linktoPrNumDetail(record.toData())} disabled={disabledAllLinkFlag}>
                {' '}
                {value}
              </a>
            ),
          }
        : null,
      SourceFrom === 'DEMAND_POOL' || purchaseRequestFlag
        ? {
            name: 'prDisplayLineNum',
            width: 150,
          }
        : null,
      {
        name: 'projectTaskName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ record }) => (
          <Upload
            filePreview
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={record.get('attachmentUuid')}
            tenantId={organizationId}
          />
        ),
      },
      {
        name: 'expandCompanyMeaning',
        width: 250,
        hidden: !expandCompanyVisible,
      },
      {
        name: 'expandInvOrganizationMeaning',
        width: 250,
        hidden: !expandInvOrganizationVisible,
      },
      biddingUnitPrice && isBritishBidTrafficLight !== 1
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            // 红绿灯模式 不显示
            width: 120,
            name: 'startingBiddingPrice',
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      biddingUnitPrice
        ? {
            width: 140,
            name: 'biddingQuotationRange',
            renderer: ({ record }) => {
              const { floatType, floatTypeMeaning, quotationRange } = record.get([
                'floatType',
                'floatTypeMeaning',
                'quotationRange',
              ]);
              if (floatType && floatTypeMeaning && !isNil(quotationRange)) {
                return `${floatTypeMeaning} | ${numberSeparatorRender(quotationRange)} ${
                  floatType === 'ratio' ? '%' : ''
                }`;
              } else if (floatType && floatTypeMeaning) {
                return `${floatTypeMeaning} | -`;
              }
              return '-';
            },
          }
        : null,
      biddingUnitPrice
        ? {
            width: 120,
            name: 'safePrice',
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'targetPriceLowerLimit',
        width: 180,
        hidden: !unitPriceTrafficLight,
        align: 'right',
        editor: false,
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'targetPriceUpperLimit',
        width: 180,
        hidden: !unitPriceTrafficLight,
        align: 'right',
        editor: false,
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'trialTargetPriceLowerLimit',
        width: 180,
        hidden: !trialUnitPriceTrafficLight,
        align: 'right',
        editor: false,
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
      },
      {
        name: 'trialTargetPriceUpperLimit',
        width: 180,
        hidden: !trialUnitPriceTrafficLight,
        align: 'right',
        editor: false,
        renderer: ({ value }) => {
          return numberSeparatorRender(value);
        },
      },
    ].filter(Boolean);

    return columns;
  }

  render() {
    const { customizeTable, custLoading = false, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return (
      <ModalProvider>
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ITEM` },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={this.itemLineTableDS}
            rowKey="rfxLineItemId"
            columns={this.getColumns()}
            style={{ maxHeight: 450 }}
          />
        )}
      </ModalProvider>
    );
  }
}
