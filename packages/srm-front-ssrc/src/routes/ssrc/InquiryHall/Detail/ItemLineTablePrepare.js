import React, { PureComponent } from 'react';
import { Table, ModalProvider, Attachment } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import DocFlow from '_components/DocFlow';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { TooltipTitle } from '@/utils/utils';

@observer
export default class ItemLineTablePrepare extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  @Bind
  batchImportOk() {
    const { itemLineTableDS } = this.props;
    itemLineTableDS.query();
    this.forceUpdate();
  }

  // 适应范围查看
  viewItemLineApplicationOrgModal = (record = {}) => {
    const { viewApplicationOrgModal = () => {} } = this.props;
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // table columns
  getColumns() {
    const {
      rfxInfoDS = {},
      header,
      btnFlag = false,
      // organizationId,
      viewLadderLevelPrepare,
      linktoPrNumDetail,
      itemLineTableDS = {},
      doubleUnitFlag = false,
      disabledAllLinkFlag = false,
      remote,
      bidFlag = false,
      rfxId,
    } = this.props;

    const { biddingHallFlag } = rfxInfoDS?.getQueryParameter('commonProps') || {};
    const {
      sourceCategory,
      biddingFlag,
      biddingMode,
      biddingTarget,
      expandResultsFlag = 0, // 拓展寻源结果
      resultsExpandingDimensions = '', // 拓展寻源结果维度
      resultsExpandingHierarchy = '',
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
    } = // 拓展寻源结果层级
      rfxInfoDS?.current?.get([
        'sourceCategory',
        'biddingFlag',
        'biddingMode',
        'biddingTarget',
        'expandResultsFlag',
        'resultsExpandingDimensions',
        'resultsExpandingHierarchy',
        'isBritishBidTrafficLight',
        'biddingTrialBiddingFlag',
      ]) || {};

    // const SourceFrom = rfxInfoDS.current ? rfxInfoDS.current.get('sourceFrom') : null;

    // 单据来源为采购申请转立项转寻源
    const purchaseRequestFlag = itemLineTableDS?.some((item) => item && item?.get('prLineId'));

    // 竞价大厅标识 sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
    const newBiddingFlag =
      biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    // 起竞价显示标识 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
    const startingBiddingPriceFlag =
      newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && biddingTarget === 'UNIT_PRICE';

    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'ITEM_LINE';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'ITEM_LINE' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';

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
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
        name: 'docFlow',
        width: 80,
        hidden: btnFlag || disabledAllLinkFlag,
        renderer: ({ record }) =>
          btnFlag || disabledAllLinkFlag ? null : (
            <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.get('rfxLineItemId')} />
          ),
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
      /**
       * 此列二开，禁止修改参数名
       */
      {
        name: 'itemCode',
        width: 150,
      },
      /**
       * 此列二开，禁止修改参数名
       */
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
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 120,
      },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 150,
            align: 'right',
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
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedPrice',
            width: 150,
            align: 'right',
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
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      header.priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 150,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'netEstimatedAmount',
            width: 150,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      {
        name: 'batchPrice',
        width: 150,
        align: 'right',
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
        align: 'right',
      },
      {
        width: 150,
        name: 'demandDate',
      },
      startingBiddingPriceFlag && isBritishBidTrafficLight !== 1
        ? {
            // 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】，任一不满足时隐藏
            // 红绿灯模式 不显示
            width: 150,
            name: 'startingBiddingPrice',
            align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      startingBiddingPriceFlag
        ? {
            width: 150,
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
      startingBiddingPriceFlag
        ? {
            width: 150,
            name: 'safePrice',
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
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
                  bidFlag={bidFlag}
                  buttonText={intl.get(`hzero.common.button.view`).d('查看')}
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
      purchaseRequestFlag // 是否申请转询价
        ? {
            name: 'prNum',
            width: 150,
            renderer: ({ record, value }) => {
              const prData = record.get('prData');
              const prHeaderId = record.get('prHeaderId');
              if (prHeaderId) {
                if (prData) {
                  return JSON.parse(prData).map((prItem) => {
                    return (
                      <a
                        onClick={() => linktoPrNumDetail(record, prItem.prHeaderId)}
                        disabled={disabledAllLinkFlag}
                      >
                        {`${prItem.displayPrNum}|${prItem.displayLineNum}`}{' '}
                      </a>
                    );
                  });
                } else {
                  return (
                    <a
                      onClick={() => linktoPrNumDetail(record, prHeaderId)}
                      disabled={disabledAllLinkFlag}
                    >
                      {value}
                    </a>
                  );
                }
              } else {
                return value;
              }
            },
          }
        : null,
      purchaseRequestFlag
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
        editor: true,
        renderer: ({ record }) => (
          // <Upload
          //   filePreview
          //   viewOnly
          //   bucketName={PRIVATE_BUCKET}
          //   bucketDirectory="ssrc-rfx-rfxitem"
          //   attachmentUUID={record.get('attachmentUuid')}
          //   tenantId={organizationId}
          // />
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            value={record.get('attachmentUuid')}
            viewMode="popup"
            fileSize={FIlESIZE}
          />
        ),
      },
      {
        name: 'applicationScopeFlag',
        width: 100,
        renderer: ({ record }) => {
          const { rfxLineItemId = null, applicationScopeFlag = 0 } = record?.get([
            'rfxLineItemId',
            'applicationScopeFlag',
          ]);

          return (
            <a
              disabled={!applicationScopeFlag || !rfxLineItemId}
              onClick={() => this.viewItemLineApplicationOrgModal(record)}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
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

    return remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_ITEM_COLUMN', columns, {
          bidFlag,
          rfxId,
          rfxInfoDS,
          itemLineTableDS,
          linktoPrNumDetail,
          purchaseRequestFlag,
          disabledAllLinkFlag,
          that: this,
        })
      : columns;
  }

  getItemButtons = () => {
    const {
      remote,
      rfxInfoDS = {},
      header,
      itemLineTableDS = {},
      disabledAllLinkFlag = false,
      bidFlag = false,
      rfxId,
    } = this.props;

    let buttons = [];

    buttons = remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_PROCESS_ITEM_BUTTONS', buttons, {
          bidFlag,
          rfxId,
          header,
          rfxInfoDS,
          itemLineTableDS,
          disabledAllLinkFlag,
          that: this,
        })
      : buttons;

    buttons = buttons?.filter(Boolean);

    return buttons;
  };

  render() {
    const { customizeTable, custLoading, itemLineTableDS, rfx = {} } = this.props;
    const { unitCodeSymbol } = rfx;

    return (
      <ModalProvider>
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ITEM` },
          <Table
            bordered
            custLoading={custLoading}
            dataSet={itemLineTableDS}
            rowKey="rfxLineItemId"
            columns={this.getColumns()}
            buttons={this.getItemButtons()}
            style={{ maxHeight: 450 }}
          />
        )}
      </ModalProvider>
    );
  }
}
