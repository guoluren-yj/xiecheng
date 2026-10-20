import React, { useMemo, useRef } from 'react';
import { CheckBox, TextField, Tooltip, Attachment, Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
// import { math } from 'choerodon-ui/dataset';
import { useComputed } from 'mobx-react-lite';
import { isNil, isEmpty, noop } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { numberSeparatorRender } from '@/utils/renderer';
import { yesOrNoRender } from 'utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import SVGIcon from '@/routes/components/SvgIcon';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';
import OldAttachment from '@/routes/ssrc/components/Attachment';
import OverflowContainer from '@/routes/ssrc/components/TooltipContainer/index.js';
import DocFlow from '_components/DocFlow';

import TableCell from './TableCell';
import { getComputedTagStyle } from '../utils/utils';
import { computedColumnCellEditable, computedCheckBoxIsChecked } from './helpers';
import {
  ObserverGroupHeaderCheckBox,
  ObserverSupplierGroupRendererCell,
} from './ObserverTableComp';

import tableStyles from './index.less';

const imgUr = require('@/assets/d-attachment.svg');

const promptCode = 'ssrc.inquiryHall';
const DefaultWidth = 240;
const MinWidth = 150;
const DefaultColumns = [];
const tableCellStyle = {
  height: 22,
  width: '100%',
};

// 获取最新值
const useLatestValue = (value) => {
  const valueRef = useRef(value);
  valueRef.current = value;
  return valueRef;
};

// 自定义table columns hook
const useItemTableColumns = (options, deps) => {
  if (isEmpty(deps)) return DefaultColumns;
  if (isNil(deps)) return []; // 暂不考虑依赖不存在
  const {
    itemTableRef,
    scoreTableRef,
    taxFlag,
    detailFlag = false,
    doubleUnitFlag,
    handleQuantity = noop,
    showLadderQuotation = noop,
    multiCurrencyFlag,
    organizationId,
    newQuotationFlag = 0,
    checkItemLineHigh = false,
    checkQuotationLineHigh = false,
    bidFlag = false,
    remote,
  } = options;
  const itemColumns = useComputed(() => {
    const [
      aggregation,
      shareDs,
      columnsChange,
      dimensionCode,
      handleClickColumnCell,
      handleMouseEnterColumnCell,
      handleMouseLeaveColumnCell,
      handleChangeCellCheckBox,
      columnExpandedALlStatus,
      viewItemLineApplicationOrgModal,
      onComparePriceHistory,
    ] = deps;
    // 核价方式
    const checkWay = shareDs?.getState('checkWay');
    let aggregationColumns = [
      {
        title: intl
          .get(`${promptCode}.view.message.title.headerGroupAggregation`)
          .d('头分组聚合列'), // 可在个性化内显示, 给header使用
        header: ({ aggregationTree, title }) => {
          const aggregationQuotationTree = aggregationTree
            ? React.cloneElement(aggregationTree[1], {
                column: {
                  ...aggregationTree[1]?.props?.column,
                  aggregationLimit: checkQuotationLineHigh || 3,
                  aggregationLimitDefaultExpanded: false,
                },
                hideLabel: true,
              })
            : title;
          return aggregationTree ? aggregationQuotationTree : title;
        },
        onCell: ({ record }) =>
          !computedColumnCellEditable(record) && {
            className: tableStyles['c7n-pro-table-cell-disabled'],
          },
        renderer: ({ record, dataSet, aggregationTree, headerGroup, rowGroup }) => {
          const cellProps = {
            record,
            columnExpandedALlStatus,
            dataSet,
            detailFlag,
            itemTableRef,
            scoreTableRef,
            columnsChange,
            dimensionCode,
            aggregationTree,
            // headerGroup,
            headerGroup: aggregation ? headerGroup : rowGroup,
            handleClickColumnCell,
            handleMouseEnterColumnCell,
            handleMouseLeaveColumnCell,
            handleChangeCellCheckBox,
            rowGroup,
          };
          return <TableCell {...cellProps} />;
        },
        aggregation: true,
        aggregationLimit: checkItemLineHigh || 4,
        aggregationLimitDefaultExpanded: false,
        key: 'itemDetail',
        align: 'left',
        children: [
          doubleUnitFlag && {
            name: taxFlag ? 'validQuotationSecPrice' : 'validNetSecondaryPrice',
            width: 100,
            align: 'right',
            tooltip: 'none',
            renderer: ({ value }) => {
              return (
                <Tooltip title={numberSeparatorRender(value)}>
                  {numberSeparatorRender(value)}
                </Tooltip>
              );
            },
          },
          {
            name: taxFlag ? 'validQuotationPrice' : 'validNetPrice',
            tooltip: 'none',
            renderer: ({ value, record }) => {
              const origin = (
                <div style={{ color: !multiCurrencyFlag && record.get('markFlag') === 1 && 'red' }}>
                  <OverflowContainer>{numberSeparatorRender(value)}</OverflowContainer>
                </div>
              );
              const dom = remote
                ? remote.process(
                    'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_COLUMNS_TAX_FIELD',
                    origin,
                    {
                      record,
                      bidFlag,
                      aggregation,
                    }
                  )
                : origin;
              return (
                <Tooltip
                  title={
                    !multiCurrencyFlag && record.get('markFlag') === 1
                      ? shareDs.current.get('checkRecommendationStrategyDetail') === 'MAX_PRICE_WIN'
                        ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
                        : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')
                      : null
                  }
                  placement="topLeft"
                >
                  {dom}
                </Tooltip>
              );
            },
          },
          multiCurrencyFlag && {
            name: taxFlag ? 'baseQuotationPrice' : 'baseNetPrice',
            width: 120,
            align: 'right',
            tooltip: 'none',
            renderer: ({ value, record }) => {
              return (
                <Tooltip
                  title={
                    !multiCurrencyFlag && record.get('markFlag') === 1
                      ? shareDs.current.get('checkRecommendationStrategyDetail') === 'MAX_PRICE_WIN'
                        ? intl.get('ssrc.inquiryHall.model.inquiryHall.maxPrice').d('最高价')
                        : intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价')
                      : null
                  }
                  placement="topLeft"
                >
                  <div style={{ color: record.get('markFlag') === 1 && 'red' }}>
                    <OverflowContainer>{numberSeparatorRender(value)}</OverflowContainer>
                  </div>
                </Tooltip>
              );
            },
          },
          doubleUnitFlag && { name: 'validQuotationSecQuantity' },
          { name: 'validQuotationQuantity' },
          {
            name: taxFlag ? 'localLnTotalAmount' : 'localLnNetAmount',
            tooltip: 'none',
            renderer: ({ value }) => (
              <Tooltip title={numberSeparatorRender(value)}>{numberSeparatorRender(value)}</Tooltip>
            ),
          },
          { name: 'taxRate', renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-') },
          {
            name: 'ladderInquiryFlag',
            align: 'left',
            renderer: ({ value, record }) =>
              value === 1 ? (
                <a onClick={(e) => showLadderQuotation(record, e)}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
                </a>
              ) : null,
          },
          {
            name: 'quotationDetailFlag',
            align: 'left',
            renderer: ({ record }) => (
              <QuotationDetail
                rowData={record}
                uiType="c7n"
                sourceFrom="RFX"
                allowBuyerViewFlag
                bidFlag={bidFlag}
              />
            ),
          },
          { name: 'priceBatchQuantity' },
          { name: 'validDeliveryCycle' },
          {
            name: 'validExpiryDateFrom',
            editor: (record) => !detailFlag && computedColumnCellEditable(record),
          },
          {
            name: 'validExpiryDateTo',
            editor: (record) => !detailFlag && computedColumnCellEditable(record),
          },
          {
            name: 'attachmentUuid',
            width: 120,
            renderer: ({ record }) => {
              return !newQuotationFlag ? (
                <Attachment
                  readOnly
                  record={record}
                  name="attachmentUuid"
                  viewMode="popup"
                  key={record.get('attachmentUuid')}
                  data={{
                    tenantId: organizationId,
                  }}
                  funcType="link"
                />
              ) : (
                <FileGroup
                  name="attachmentUuid"
                  record={record}
                  uiType="c7n-pro"
                  fileType="LINE"
                  fileCountName="lineTotalDisplayFileCount"
                />
              );
            },
          },
          // { name: 'quotationLineStatusMeaning' },
          { name: 'referencePrice' },
          {
            name: 'differentPrice',
            renderer: ({ record }) => {
              if (
                (!taxFlag
                  ? record.get(doubleUnitFlag ? 'validNetSecondaryPrice' : 'validNetPrice')
                  : record.get(
                      doubleUnitFlag ? 'validQuotationSecPrice' : 'validQuotationPrice'
                    )) !== null &&
                (record.get('referencePrice') || record.get('referencePrice') === 0)
              ) {
                return numberSeparatorRender(
                  math.minus(
                    !taxFlag
                      ? record.get(doubleUnitFlag ? 'validNetSecondaryPrice' : 'validNetPrice')
                      : record.get(
                          doubleUnitFlag ? 'validQuotationSecPrice' : 'validQuotationPrice'
                        ),
                    record.get('referencePrice')
                  )
                );
              }
            },
          },
          { name: 'preQuotationPrice' },
          { name: 'initialFluctuation' },
          {
            name: 'priceCompareToFirst',
            width: 120,
            renderer: ({ value }) => {
              if (math.gt(value, 0)) {
                return `↑ ${value}`;
              } else if (math.lt(value, 0)) {
                return `↓ ${value}`;
              } else {
                return value;
              }
            },
          },
          { name: 'changePercent' },
          { name: 'newPrice' },
          { name: 'minPrice' },
          checkWay === 'quantity' &&
            dimensionCode !== 'ALL' && {
              name: 'allottedQuantity',
              editor: (record) =>
                !detailFlag &&
                !doubleUnitFlag && (
                  <C7nPrecisionInputNumber name="allottedQuantity" record={record} uom="uomId" />
                ),
            },
          doubleUnitFlag &&
            checkWay === 'quantity' &&
            dimensionCode !== 'ALL' && {
              name: 'allottedSecondaryQuantity',
              editor: (record) =>
                !detailFlag && (
                  <C7nPrecisionInputNumber
                    name="allottedSecondaryQuantity"
                    record={record}
                    uom="secondaryUomId"
                    onChange={(val) => handleQuantity(val, record)}
                  />
                ),
            },
          checkWay !== 'quantity' &&
            dimensionCode !== 'ALL' && {
              name: 'allottedRatio',
              editor: !detailFlag,
            },
          dimensionCode !== 'ALL' &&
            Object.assign(
              {
                name: 'suggestedRemark',
                tooltip: 'none',
                editor: (record) =>
                  !detailFlag ? (
                    // <Tooltip
                    //   title={record.get('suggestedRemark')}
                    //   placement="left"
                    //
                    //   // autoAdjustOverflow={false}
                    // >
                    <TextField
                      name="suggestedRemark"
                      style={{ height: !aggregation ? '28px' : '20px' }}
                      record={record}
                    />
                  ) : (
                    false
                  ),
              },
              detailFlag && {
                renderer: ({ value }) => <Tooltip title={value}>{value}</Tooltip>,
              }
            ),
          dimensionCode !== 'ALL' && {
            name: taxFlag ? 'localSuggestedLnTotalAmount' : 'localSuggestedLnNetAmount',
            tooltip: 'none',
            width: 150,
            renderer: ({ value }) => (
              <Tooltip title={numberSeparatorRender(value)}>{numberSeparatorRender(value)}</Tooltip>
            ),
          }, // 基准价判断
          {
            name: 'applicationScopeFlag',
            width: 100,
            renderer: ({ record }) => {
              const { rfxLineItemId = null, applicationScopeFlag = 0 } = record?.get([
                'rfxLineItemId',
                'applicationScopeFlag',
              ]);
              if (!applicationScopeFlag || !rfxLineItemId) {
                return '-';
              } else {
                return (
                  <a
                    disabled={!applicationScopeFlag || !rfxLineItemId}
                    onClick={() => viewItemLineApplicationOrgModal(record)}
                  >
                    {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
                  </a>
                );
              }
            },
          },
          {
            name: 'comparePriceHistory',
            width: 120,
            renderer: ({ record }) =>
              record.quotationLineId !== null ? (
                <a onClick={(e) => onComparePriceHistory(record, e)}>
                  {intl.get(`hzero.common.button.view`).d('查看')}
                </a>
              ) : (
                ''
              ),
          },
          {
            name: 'weightPrice',
          },
          {
            name: 'priceFluctuation',
          },
          {
            name: 'quotationLineSavingAmount',
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                value={value}
                financial={record.get('localCurrencyCode')}
                type="c7n"
                readOnly
              />
            ),
          },
          {
            name: 'quotationLineSavingRatio',
            renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
          },
          {
            name: 'itemSignPostPrice',
            // renderer: ({ value }) => (
            //   <PrecisionInputNumber
            //     value={value}
            //     type="c7n"
            //     readOnly
            //   />
            // ),
          },
          {
            name: 'itemDimensionRank',
            width: 140,
          },
        ].filter(Boolean),
        width: DefaultWidth,
        minWidth: MinWidth,
        defaultWidth: DefaultWidth,
      },
    ].filter(Boolean);

    aggregationColumns = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_TABLE_COLUMNS_PROPS',
          aggregationColumns,
          {
            bidFlag,
          }
        )
      : aggregationColumns;

    // if (aggregation || 1) {
    // 区分: 物料/整单
    if (dimensionCode === 'ITEM') {
      return aggregationColumns;
    } else {
      return [
        // 默认fields
        {
          header: ({ aggregationTree, title }) => (aggregationTree ? aggregationTree[0] : title),
          children: aggregationColumns,
          __nest__: true, // 组合头
        },
      ];
    }
    // }
  }, [...deps, taxFlag, newQuotationFlag, multiCurrencyFlag]);
  return itemColumns;
};

// 老附件展示
const showUploadModal = (record) => {
  const {
    businessAttachmentUuid,
    techAttachmentUuid,
    bargainBusinessAttachmentUuid,
    bargainTechAttachmentUuid,
    roundBusinessAttachmentUuid,
    roundTechAttachmentUuid,
  } = record.get([
    'businessAttachmentUuid',
    'techAttachmentUuid',
    'bargainBusinessAttachmentUuid',
    'bargainTechAttachmentUuid',
    'roundBusinessAttachmentUuid',
    'roundTechAttachmentUuid',
  ]);
  const AttachmentsProps = {
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'ssrc-rfx-quotationheader',
    viewOnly: true,
    checkPriceFlag: 1,
    businessUuid: businessAttachmentUuid,
    techUuid: techAttachmentUuid,
    bargainBusUuid: bargainBusinessAttachmentUuid,
    bargainTechUuid: bargainTechAttachmentUuid,
    roundBusUuid: roundBusinessAttachmentUuid,
    roundTechUuid: roundTechAttachmentUuid,
  };
  Modal.open({
    key: 'check-price-header-attachment',
    title: intl.get(`${promptCode}.model.library.attachmentUuid`).d('附件'),
    closable: true,
    footer: null,
    style: {
      width: 800,
    },
    children: <OldAttachment {...AttachmentsProps} />,
  });
};

const useScoreTableColumns = (deps) => {
  const scoreColumns = useMemo(
    () => [
      {
        name: 'score',
        title: intl.get(`${promptCode}.view.message.title.score`).d('评分'),
        titleEditable: false,
        tooltip: 'none',
        align: 'left',
        header: ({ dataSet, group, title }) => {
          const inHeaderRecord = group?.totalRecords?.find((record) => record.get('showInHeader'));
          const { totalScore, candidateSuggestion } = inHeaderRecord.get([
            'sumPassStatus',
            'totalScore',
            'candidateSuggestion',
          ]);
          return group ? (
            <div>
              <div>
                <span>{totalScore || '-'}</span>
              </div>
              {/* 区分商务技术时, 才显示分组信息 */}
              {dataSet.current?.get('sourceRuleType') === 'DIFF' &&
                group?.totalRecords.reduce((list, record) => {
                  const { score, showInHeader } = record.get([
                    'score',
                    'titleMeaning',
                    'showInHeader',
                  ]);
                  if (showInHeader) {
                    list.push(
                      <div>
                        <span>{score || '-'}</span>
                      </div>
                    );
                  }
                  return list;
                }, [])}
              <Tooltip title={candidateSuggestion} placement="top">
                <div className={tableStyles.candidateSuggestion}>
                  <div>{candidateSuggestion || '-'}</div>
                </div>
              </Tooltip>
            </div>
          ) : (
            title
          );
        },
        renderer: ({ value, record }) => {
          const {
            sumPassStatus,
            sumPassStatusMeaning,
            approvedCount,
            allExpertCount,
            supplierScoreTitle,
            technologyApprovedCount,
            businessApprovedCount,
            tempIndicateId,
            rankTeam,
          } = record.get([
            'sumPassStatus',
            'sumPassStatusMeaning',
            'approvedCount',
            'allExpertCount',
            'supplierScoreTitle',
            'technologyApprovedCount',
            'businessApprovedCount',
            'tempIndicateId',
            'rankTeam',
          ]);
          const totalContent =
            sumPassStatus === 'ALL_PASS'
              ? sumPassStatusMeaning
              : `${sumPassStatusMeaning}${approvedCount}/${allExpertCount}`;
          const redFlag =
            rankTeam === 0 &&
            (sumPassStatus === 'UN_PASS' ||
              (tempIndicateId === 'TECH' && technologyApprovedCount === 0) ||
              (tempIndicateId === 'BUSINESS' && businessApprovedCount === 0));
          return (
            <span className={redFlag ? tableStyles.red : ''}>
              {['SCORE_PASS', 'PASS'].includes(supplierScoreTitle) && allExpertCount
                ? totalContent
                : value}
            </span>
          );
        },
        onCell: ({ record }) =>
          computedColumnCellEditable(record) || {
            className: tableStyles['c7n-pro-table-cell-disabled'],
          },
        width: DefaultWidth,
        footer: ({ aggregationTree }) => aggregationTree,
        minWidth: MinWidth,
        defaultWidth: DefaultWidth,
      },
    ],
    deps
  );
  return scoreColumns;
};

const useItemGroups = (
  deps,
  { detailFlag, doubleUnitFlag, bidFlag, checkItemLineHigh = false, remote, rfxHeaderId }
) => {
  const [
    taxFlag,
    shareDs,
    aggregation,
    companyGroupType,
    itemGroupType,
    dimensionCode,
    handleClickToSoreInfo,
    handleClickToOtherInfo,
    handleClickToQuotationInfo,
    handleClickColumnHeader,
    handleMouseEnterColumnHeader,
    handleMouseLeaveColumnHeader,
    handleChangeGroupHeaderCheckBox,
    handleChangeColumnHeaderCheckBox,
    handleChangeRowHeaderCheckBox,
    count,
    handleClickRiskScan,
    enterpriceRiskControllerButtonsObj,
    newQuotationFlag = 0,
    // organizationId,
  ] = deps;
  return useMemo(() => {
    let itemGroupColumn = {}; // 物料分组列
    if (dimensionCode === 'ITEM') {
      const children = [
        { name: 'rfxLineItemNum', hidden: aggregation },
        {
          name: 'docFlow',
          renderer: ({ record }) => {
            return (
              <DocFlow tableName="ssrc_rfx_line_item" tablePk={record.get('rfxLineItemId')} />
            );
          },
        },
        { name: 'itemName', hidden: aggregation },
        { name: 'itemCode', hidden: aggregation },
        { name: 'itemCategoryName', hidden: aggregation },
        { name: 'uomName' },
        doubleUnitFlag && { name: 'secondaryUomName' },
        { name: 'rfxQuantity' },
        doubleUnitFlag && { name: 'secondaryQuantity' },
        { name: 'specs' },
        {
          name: 'itemSavingAmount',
          renderer: ({ value, record }) => (
            <PrecisionInputNumber
              value={value}
              financial={record.get('localCurrencyCode')}
              type="c7n"
              readOnly
            />
          ),
        },
        // {
        //   name: 'itemSignPostPrice',
        //   renderer: ({ value, record }) => (
        //     <PrecisionInputNumber
        //       value={value}
        //       financial={record.get('currencyCode')}
        //       type="c7n"
        //       readOnly
        //     />
        //   ),
        // },
        {
          name: 'itemSavingRatio',
          renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
        },
        {
          name: 'itemMinMaxSuggestedFlag',
          renderer: ({ value }) => yesOrNoRender(value),
        },
      ].filter(Boolean);
      itemGroupColumn = {
        name: 'rfxLineItemId',
        type: itemGroupType,
        columnProps: {
          header: () => (
            <span className={tableStyles.columnsHeader}>
              {intl
                .get(`${promptCode}.model.inquiryHall.commonQuotationInfo`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('{quotationName}信息')}
            </span>
          ),
          resizable: false,
          align: 'left',
          aggregation: true,
          aggregationLimit: checkItemLineHigh || 2,
          aggregationLimitDefaultExpanded: false,
          children: remote
            ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_COLUMNS', children, {
                bidFlag,
              })
            : children,
          renderer: ({ record, text, rowGroup }) => {
            if (rowGroup) {
              const { totalRecords = [] } = rowGroup;
              const validTotalRecords = totalRecords.filter((item) => !item.get('rankTeam'));
              const itemCheckSelectFlag = record.get('itemCheckSelectFlag');
              const itemName = totalRecords[0]?.get('itemName') || '';

              // 下面无法监测,调试发现这里勾选可能有问题  rowGroup实际没用到
              const { indeterminate, checked } = computedCheckBoxIsChecked({
                record,
                rowGroup,
                totalRecords: validTotalRecords,
                dimensionCode,
                type: 'rowHeader',
              });
              return (
                <div className={tableStyles.itemLines}>
                  <div style={{ display: 'flex' }}>
                    {!detailFlag && (
                      <div className="checkBox">
                        <CheckBox
                          indeterminate={indeterminate}
                          checked={checked}
                          onChange={(value) =>
                            handleChangeRowHeaderCheckBox({
                              totalRecords: validTotalRecords,
                              rowGroup,
                              value,
                              record,
                              dimensionCode,
                              itemName,
                            })
                          }
                        />
                      </div>
                    )}

                    <OverflowContainer
                      style={{
                        marginLeft: !detailFlag ? '8px' : '',
                      }}
                    >
                      {intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号')}:{' '}
                      {record.get('rfxLineItemNum')}{' '}
                      {record.get('itemCode') ? `${record.get('itemCode')}-` : ''}
                      {record.get('itemName')}
                    </OverflowContainer>
                  </div>
                  <div
                    style={{
                      marginLeft: !detailFlag ? '8px' : '',
                      display: 'flex',
                    }}
                  >
                    <Tooltip title={record.get('itemCategoryName') || '-'} placement="topLeft">
                      <Tag style={getComputedTagStyle('itemCategoryName')}>
                        {record.get('itemCategoryName') || '-'}
                      </Tag>
                    </Tooltip>
                    {!!itemCheckSelectFlag && (
                      <Tag style={getComputedTagStyle('itemSelected')}>
                        {intl.get(`${promptCode}.view.tag.selected`).d('已选用')}
                      </Tag>
                    )}
                  </div>
                  <div
                    style={{
                      fontWeight: 400,
                      marginLeft: !detailFlag ? '8px' : '',
                    }}
                  >
                    {/* 聚合信息 */}
                    {text}
                  </div>
                </div>
              );
            }
            return text;
          },
          width: 240,
        },
      };
    } else {
      const children = [
        { name: 'rfxLineItemNum', hidden: aggregation },
        { name: 'itemName', hidden: aggregation },
        { name: 'itemCode', hidden: aggregation },
        { name: 'itemCategoryName', hidden: aggregation },
        { name: 'uomName' },
        doubleUnitFlag && { name: 'secondaryUomName' },
        { name: 'rfxQuantity' },
        doubleUnitFlag && { name: 'secondaryQuantity' },
        { name: 'specs' },
        {
          name: 'itemSavingAmount',
          renderer: ({ value, record }) => (
            <PrecisionInputNumber
              value={value}
              financial={record.get('localCurrencyCode')}
              type="c7n"
              readOnly
            />
          ),
        },
        // {
        //   name: 'itemSignPostPrice',
        //   renderer: ({ value, record }) => (
        //     <PrecisionInputNumber
        //       value={value}
        //       financial={record.get('currencyCode')}
        //       type="c7n"
        //       readOnly
        //     />
        //   ),
        // },
        {
          name: 'itemSavingRatio',
          renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
        },
        {
          name: 'itemMinMaxSuggestedFlag',
          renderer: ({ value }) => yesOrNoRender(value),
        },
      ].filter(Boolean);
      itemGroupColumn = {
        name: 'rfxLineItemId',
        type: itemGroupType,
        columnProps: {
          header: () => (
            <div className={tableStyles.gruopHeaderInfo}>
              {intl.get(`${promptCode}.model.inquiryHall.wholePackageSelected`).d('整单选用')}
            </div>
          ),
          width: 240,
          align: 'left',
          children: [
            {
              header: () => (
                <span className={tableStyles.columnsHeader}>
                  {intl
                    .get(`${promptCode}.model.inquiryHall.commonQuotationInfo`, {
                      quotationName: getQuotationName(bidFlag),
                    })
                    .d('{quotationName}信息')}
                </span>
              ),
              key: 'quotationInfo',
              align: 'left',
              lock: 'left',
              aggregation: true,
              aggregationLimit: checkItemLineHigh || 2,
              aggregationLimitDefaultExpanded: false,
              width: 240,
              children: remote
                ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_COLUMNS', children, {
                    bidFlag,
                  })
                : children,
              renderer: ({ record, text }) => {
                const itemCheckSelectFlag = record.get('itemCheckSelectFlag');
                return (
                  <div className={tableStyles.itemLines} style={{ cursor: 'pointer' }}>
                    <OverflowContainer>
                      {intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号')}:{' '}
                      {record.get('rfxLineItemNum')}{' '}
                      {record.get('itemCode') ? `${record.get('itemCode')}-` : ''}
                      <Tooltip title={record.get('itemName') || '-'}>
                        {record.get('itemName')}
                      </Tooltip>
                    </OverflowContainer>
                    <div>
                      <Tag style={getComputedTagStyle('itemCategoryName')}>
                        {record.get('itemCategoryName') || '-'}
                      </Tag>
                      {!!itemCheckSelectFlag && (
                        <Tag style={getComputedTagStyle('itemSelected')}>
                          {intl.get(`${promptCode}.view.tag.selected`).d('已选用')}
                        </Tag>
                      )}
                    </div>
                    <div style={{ fontWeight: 400 }}>
                      {/* 聚合信息 */}
                      {text}
                    </div>
                  </div>
                );
              },
            },
          ],
        },
      };
    }

    itemGroupColumn = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_NEW_C7N_PROCESS_ITEM_GROUPS_COLUMNS_PROPS',
          itemGroupColumn,
          {
            bidFlag,
          }
        )
      : itemGroupColumn;

    const aggChildren = [
      !aggregation &&
        dimensionCode === 'ITEM' && {
          name: 'suggestedFlag',
          editor: (record) => {
            const { validDataFlag, rankTeam } = record.get(['validDataFlag', 'rankTeam']);
            return !detailFlag && !rankTeam && validDataFlag !== 0;
          },
        },
      !aggregation &&
        dimensionCode === 'ALL' && {
          name: 'allSelectFlag',
          editor: (record) => {
            const rankTeam = record.get('rankTeam');
            return !detailFlag && !rankTeam;
          },
        },
      {
        name: 'supplierCompanyInfo',
        hidden: aggregation,
        width: 300,
        renderer: ({ record }) => {
          const { rank, rankTeam, supplierStatusMeaning } = record.get([
            'rank',
            'rankTeam',
            'supplierStatusMeaning',
          ]);
          const tagStyle = {
            border: 0,
            marginLeft: '8px',
            backgroundColor: rank === 1 ? 'rgba(252,160,0,0.10)' : 'rgba(0,0,0,0.06)',
            color: rank === 1 ? '#F88D10' : 'rgba(0,0,0,0.65)',
          };
          return (
            <div>
              {record.get('supplierCompanyName')}
              {/* {!!rank && (
                <Tag style={tagStyle}>
                  {intl.get(`${promptCode}.model.inquiryHall.supplierRank`).d('排名')}
                  {rank}
                </Tag>
              )} */}
              {!!rankTeam && <Tag style={tagStyle}>{supplierStatusMeaning}</Tag>}
            </div>
          );
        },
      },
      {
        name: 'allAllottedRatio',
        tooltip: 'none',
        renderer: ({ record, value }) =>
          !detailFlag ? (
            <TextField
              restrict="0-9"
              name="allAllottedRatio"
              style={tableCellStyle}
              record={record}
            />
          ) : (
            value || '-'
          ),
      },
      {
        name: 'allSuggestedRemark',
        renderer: ({ record, value }) =>
          !detailFlag ? (
            <Tooltip title={value} placement="left" autoAdjustOverflow={false}>
              <TextField name="allSuggestedRemark" style={tableCellStyle} record={record} />
            </Tooltip>
          ) : (
            <Tooltip title={value} placement="left" autoAdjustOverflow={false}>
              {value || '-'}
            </Tooltip>
          ),
      },
      taxFlag
        ? {
            name: 'localSuggestedQtnTotalAmount',
            with: 200,
            header: intl
              .get(`${promptCode}.model.inquiryHall.selectedTotalAmount`)
              .d('选用金额(含税)'),
            renderer: ({ value }) => {
              return (
                <Tooltip title={numberSeparatorRender(value)} theme="light">
                  {numberSeparatorRender(value)}
                </Tooltip>
              );
            },
          }
        : {
            name: 'localSuggestedQtnNetAmount',
            with: 200,
            header: intl
              .get(`${promptCode}.model.inquiryHall.selectedNetAmount`)
              .d('选用金额(不含税)'),
            renderer: ({ value }) => {
              return (
                <Tooltip title={numberSeparatorRender(value)} theme="light">
                  {numberSeparatorRender(value)}
                </Tooltip>
              );
            },
          },
      taxFlag
        ? {
            name: 'supplierTotalAmount',
            aggregationTreeIndex: 1,
          }
        : {
            name: 'supplierNetAmount',
            aggregationTreeIndex: 1,
          },
      {
        name: 'quotationAndItem',
        aggregationTreeIndex: 1,
        renderer: ({ record }) => {
          const quotationCount = record.get('quotationCount');
          const allItemCount = shareDs.getState('allItemCount');
          return quotationCount ? `${quotationCount}/${allItemCount}` : 0;
        },
      },
      { name: 'supplierTaxAmount', aggregationTreeIndex: 1 },
      {
        name: 'supplierSavingAmount',
        aggregationTreeIndex: 1,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('localCurrencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'supplierSavingRatio',
        aggregationTreeIndex: 1,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        aggregationTreeIndex: 1,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'quotationInfo',
        hidden: aggregation,
        renderer: ({ record }) => (
          <a onClick={() => handleClickToQuotationInfo(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        name: 'scoreInfo',
        hidden: aggregation,
        renderer: ({ record }) => {
          const { score, sumPassStatus, approvedCount, rankTeam } = record.get([
            'score',
            'sumPassStatus',
            'approvedCount',
            'rankTeam',
          ]);
          const value = sumPassStatus || score;
          return value ? (
            <a onClick={() => handleClickToSoreInfo(record)}>
              <span className={rankTeam === 0 && approvedCount === 0 ? tableStyles.red : ''}>
                {value}
              </span>
            </a>
          ) : (
            '-'
          );
        },
      },
      {
        name: 'otherInfo',
        hidden: aggregation,
        renderer: ({ record }) => (
          <a onClick={() => handleClickToOtherInfo(record)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      !aggregation && {
        name: 'supplierAttachmentUuid',
        renderer: ({ record }) => {
          return !newQuotationFlag ? (
            <a onClick={() => showUploadModal(record)}>
              <SVGIcon path={imgUr} />
              <span style={{ marginLeft: '7px' }}>
                {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                <RenderFileTotalCount record={record} uiType="c7n-pro" />
              </span>
            </a>
          ) : (
            <FileGroup record={record} fileType="HEADER" isNeedName />
          );
        },
      },
      !aggregation &&
        enterpriceRiskControllerButtonsObj.RISK_SCAN && {
          name: 'riskScan',
          renderer: ({ record }) => (
            <a onClick={() => handleClickRiskScan(record.get('supplierCompanyId'))}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.riskScan`).d('风险扫描')}
            </a>
          ),
        },
    ].filter(Boolean);
    return [
      {
        name: 'rfxLineSupplierId',
        // type: 'header',
        type: companyGroupType,
        // type: 'none',
        columnProps: {
          header: ({ groups }) => {
            // 计算勾选状态
            const checkBoxProps = {
              groups,
              detailFlag,
              dimensionCode,
              handleChangeGroupHeaderCheckBox,
            };
            const showSelectFlag = !detailFlag;

            return (
              <div className={tableStyles['ssrc-check-table-group-header-wrap']}>
                <div>
                  {showSelectFlag && (
                    <div className="checkBox">
                      {' '}
                      <ObserverGroupHeaderCheckBox {...checkBoxProps} />{' '}
                    </div>
                  )}
                  <span style={{ marginLeft: showSelectFlag ? '8px' : '' }}>
                    {intl
                      .get(`${promptCode}.view.message.title.supplierCompanySelected`, {
                        count,
                      })
                      .d(`选用 {count} 家供应商`)}
                  </span>
                </div>
                <div
                  className={tableStyles['count-supplier-text']}
                  style={{ marginLeft: showSelectFlag ? '24px' : '' }}
                >
                  {intl
                    .get(`${promptCode}.view.message.title.commonSupplierCompanyParticipated`, {
                      count: shareDs.getState('qutationSupplierSize'),
                      quotationName: getQuotationName(bidFlag),
                    })
                    .d(`共计 {count} 家参与{quotationName}`)}
                </div>
              </div>
            );
          },
          renderer: ({ text, headerGroup, record, dataSet }) => {
            const itemGroupCellProps = {
              text,
              record,
              dataSet,
              bidFlag,
              detailFlag,
              headerGroup,
              dimensionCode,
              handleClickColumnHeader,
              handleMouseEnterColumnHeader,
              handleMouseLeaveColumnHeader,
              handleChangeColumnHeaderCheckBox,
              handleClickRiskScan,
              RISK_SCAN: enterpriceRiskControllerButtonsObj.RISK_SCAN,
              newQuotationFlag,
            };
            return <ObserverSupplierGroupRendererCell {...itemGroupCellProps} />;
          },
          aggregationLimit: 3, // column 所对应的 header
          aggregationLimitDefaultExpanded: false,
          children: remote
            ? remote.process('SSRC_CHECK_PRICE_NEW_C7N_PROCESS_GROUP_COLUMNS', aggChildren, {
                bidFlag,
                rfxHeaderId,
              })
            : aggChildren,
          style: { textAlign: 'left' },
          headerStyle: { textAlign: 'left' },
          width: 275,
          tooltip: 'none',
        },
      },
      itemGroupColumn,
    ];
  }, deps);
};

const useScoreGroups = (deps) => {
  const [otherInfoColumns] = deps;
  return useMemo(
    () => [
      {
        name: 'rfxLineSupplierId', // 做为 column 的列脚 footer
        type: 'header',
        hidden: true,
        columnProps: {
          align: 'left',
          aggregationLimit: 3,
          aggregationLimitDefaultExpanded: false,
          children: otherInfoColumns,
          width: 240,
        },
      },
      {
        name: 'tempIndicateId',
        parentField: 'parentIndicateId',
        type: 'column',
        columnProps: {
          header: () => (
            <span className={tableStyles.columnsHeader}>
              {intl.get(`${promptCode}.model.inquiryHall.scoreInfo`).d('评分信息')}
            </span>
          ),
          resizable: false,
          renderer: ({ record }) => record.get('scoreMeaning'),
          width: 240,
          footer: (
            <div className={tableStyles.gruopHeaderInfo}>
              {intl.get(`${promptCode}.view.message.otherInfo`).d('其他信息')}
            </div>
          ),
        },
      },
    ],
    deps
  );
};

export { useLatestValue, useItemTableColumns, useScoreTableColumns, useItemGroups, useScoreGroups };
