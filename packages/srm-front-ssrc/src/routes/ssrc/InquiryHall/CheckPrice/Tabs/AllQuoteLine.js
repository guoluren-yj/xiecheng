import React, { useMemo, Fragment, useImperativeHandle, useCallback, memo } from 'react';
import {
  Table,
  Attachment,
  DataSet,
  Form,
  Select,
  Button,
  Output,
  Modal,
  CheckBox,
} from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { compose, noop, isNil } from 'lodash';
import { observer } from 'mobx-react';

import { yesOrNoRender, dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender, roundEliminateC7N, useTernaryExpression } from '@/utils/renderer';
import { batchChangeChooseStrategy } from '@/services/inquiryHallService';
import { PRIVATE_BUCKET } from '_utils/config';

import { INQUIRY } from '@/utils/globalVariable';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import { withOverride, calculateBasicQty } from '@/utils/utils';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import NoQuotedItemView from '@/routes/ssrc/InquiryHall/CheckPrice/components/NoQuotedItemView';
import styles from './index.less';
import { strategyDS, ladderQuotationTableDS } from '../store/AllQuoteLineDS';

const AllQuoteLine = (props) => {
  const {
    remote,
    history,
    bidFlag,
    organizationId,
    quoteLineDs,
    rfxHeaderId,
    checkWay,
    customizeTable,
    fetchQueryPriceInfoLoading,
    fetchItemLine,
    allQuoteLineRef,
    sourceKey = INQUIRY,
    renderValidQuotationQuantity = noop,
    basicInfoDs,
    setState = () => {},
    doubleUnitFlag = false,
    onComparePriceHistory = () => {},
    dispatch,
    modelName = 'inquiryHall',
    clearAllTable = () => {},
    fetchHeaderInfo = noop,
    getAllTabTableCommonColumns,
  } = props;

  const { current } = basicInfoDs || {};
  const { rankRule, priceTypeCode, auctionDirection, multiCurrencyFlag, newQuotationFlag } = current
    ? current?.get([
        'rankRule',
        'priceTypeCode',
        'auctionDirection',
        'multiCurrencyFlag',
        'newQuotationFlag',
      ])
    : {};

  const ladderDS = remote
    ? remote.process(
        'SSRC_CHECK_PRICE_LADDER_QUOTATION_TABLE_DS_ALL_QUOTATION',
        ladderQuotationTableDS(doubleUnitFlag),
        {}
      )
    : ladderQuotationTableDS(doubleUnitFlag);

  // const applicationScopeRef = useRef();
  const strategyDs = useMemo(() => new DataSet(strategyDS()), []);
  const ladderQuotationTableDs = useMemo(() => new DataSet(ladderDS), [ladderDS, remote]);

  useImperativeHandle(allQuoteLineRef, () => {
    // 需要被暴露出去的方法或变量
    return {
      strategyDs,
    };
  });

  // 改变选择策略
  const changeStrategy = (value) => {
    // 选择策略成功回调
    const successCallBack = (options = {}) => {
      const { notificationSuccessFlag = 1 } = options || {};

      clearAllTable(null, '1');
      dispatch({
        type: `${modelName}/updateState`,
        payload: {
          supplierLine: [],
          supplierQuoteLinePagination: {},
        },
      });
      fetchHeaderInfo();
      if (notificationSuccessFlag) {
        notification.success();
      }
      quoteLineDs.query();
      fetchItemLine();
    };

    const tableData = quoteLineDs.toData();
    const rfxQuotationLineList = tableData.filter((item) => item.suggestedFlag);
    const strategySubmit = () => {
      if (value) {
        // 给全部报价明细ds设置selectStrategy
        quoteLineDs.setState('selectStrategy', value);
        setState({ btnLoading: true });
        batchChangeChooseStrategy({
          rfxHeaderId,
          selectStrategy: value,
          rfxQuotationLineList,
        })
          .then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              if (remote?.event) {
                remote.event.fireEvent('changeStrategySuccessCallBack', {
                  successCallBack,
                  fetchHeaderInfo,
                  result,
                  res,
                });
              } else {
                successCallBack();
              }
            } else if (remote?.event) {
              remote.event.fireEvent('changeStrategyFailedCallBack', {
                successCallBack,
                fetchHeaderInfo,
                result,
                res,
              });
            }
          })
          .finally(() => setState({ btnLoading: false }));
      }
    };
    if (remote?.event) {
      remote.event.fireEvent('strategySubmitCallBack', {
        value,
        rfxHeaderId,
        rfxQuotationLineList,
        successCallBack,
        strategySubmit,
        setState,
        quoteLineDs,
      });
    } else {
      strategySubmit();
    }
  };

  // 适用范围
  const viewItemLineApplicationOrgModal = (record) => {
    const { rfxLineItemId, applicationScopeFlag = 0 } = record?.get([
      'rfxLineItemId',
      'applicationScopeFlag',
    ]);
    viewApplicationOrgModal({
      sourceLineItemId: rfxLineItemId,
      applicationScopeFlag,
    });
  };

  // 查看适用范围
  const viewApplicationOrgModal = (param = {}) => {
    const handleViewApplicationModal = (params = {}) => {
      const { queryParams = {} } = params || {};
      const Props = {
        queryParams: {
          organizationId,
          sourceHeaderId: rfxHeaderId,
          sourceFrom: 'RFX',
          ...(queryParams || {}),
        },
        sourceHeaderId: rfxHeaderId,
        organizationId,
      };
      const modalKey = Modal.key();
      Modal.open({
        destroyOnClose: true,
        closable: true,
        key: modalKey,
        drawer: true,
        bodyStyle: {
          padding: 0,
        },
        title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
        children: <ApplicationScopeDetail {...Props} />,
        style: { width: '1000px' },
      });
    };
    const remoteProps = {
      rfxHeaderId,
      organizationId,
      bidFlag,
      queryParams: { ...(param || {}) },
      handleViewApplicationModal,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteViewApplicationModalEvent', remoteProps);
    } else {
      handleViewApplicationModal(remoteProps);
    }
  };

  const showLadderQuotation = async (record) => {
    const { quotationLineId, suggestedFlag } = record.get(['quotationLineId', 'suggestedFlag']);
    const customizeUnitCode = `SSRC.${sourceKey}_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`;

    ladderQuotationTableDs.setState('lineRecord', record);
    ladderQuotationTableDs.setQueryParameter('commonProps', {
      quotationLineId,
      customizeUnitCode,
    });
    await ladderQuotationTableDs.query();

    if (ladderQuotationTableDs.length) {
      ladderQuotationTableDs.forEach((lineRecord) => {
        if (lineRecord) {
          lineRecord.set('suggestedFlag', suggestedFlag);
        }
      });
    }

    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderFrom',
        width: 120,
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryLadderTo',
        width: 120,
      }),
      {
        name: 'ladderFrom',
        width: 140,
      },
      {
        name: 'ladderTo',
        width: 140,
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'validLadderSecPrice',
        width: 100,
      }),

      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetLadderSecPrice',
        width: 100,
      }),

      {
        name: 'validLadderPrice',
        width: 120,
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
      },
      {
        name: 'cumulativeFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'validBargainPrice',
        width: 130,
      },
      {
        name: 'remark',
        width: 100,
      },
    ].filter(Boolean);
    const modalProps = {};

    const cuxModalProps = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_LADDER_QUOTATION_MODAL_PROPS', modalProps, {
          ladderQuotationTableDs,
          bidFlag,
          quotationLineId,
          customizeUnitCode,
          record,
        })
      : modalProps;

    Modal.open({
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
      style: {
        width: 742,
      },
      drawer: true,
      footer: undefined,
      closable: true,
      className: styles['rfx-ladder-quotation-modal-wrapper'],
      children: (
        <React.Fragment>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          <Form
            labelLayout="vertical"
            columns={3}
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              value={record.get('companyName')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={record.get('itemCode')}
            />
            <Output
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={record.get('itemName')}
            />
          </Form>
          <h3 className={styles['ladder-sub-title']}>
            <div className={styles['ladder-sub-title-line']} />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.quotationInfo').d('报价信息')}
          </h3>
          {customizeTable(
            { code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE` },
            <Table dataSet={ladderQuotationTableDs} columns={columns} />
          )}
        </React.Fragment>
      ),
      afterClose: () => {
        ladderQuotationTableDs.loadData([]);
      },
      ...(cuxModalProps || {}),
    });
  };

  /**
   * 渲染单价样式
   * 竞价方向为正向时，行号相同的物料，单价最高的标红
   * 否则，单价最小的标红
   */
  // const renderValidQuotationPrice = (val, record, flag) => {
  //   if (val === null) {
  //     return null;
  //   }

  //   const { itemLineFloorPrice, itemLineHighestPrice } = record.get([
  //     'itemLineFloorPrice',
  //     'itemLineHighestPrice',
  //   ]);

  // let rfxLineItemNumList = [];
  // if (flag) {
  //   rfxLineItemNumList =
  //     dataSource &&
  //     dataSource
  //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
  //       .map((r) => r.baseQuotationPrice);
  // } else {
  //   rfxLineItemNumList =
  //     dataSource &&
  //     dataSource
  //       .filter((item) => item.rfxLineItemNum === record.rfxLineItemNum)
  //       .map((r) => r.validQuotationPrice);
  // }
  // const validQuotationPriceMax = Math.max(...rfxLineItemNumList);
  // const validQuotationPriceMin = Math.min(...rfxLineItemNumList);
  //   let min = null;
  //   let max = null;
  //   if (flag) {
  //     min = itemLineFloorPrice;
  //     max = itemLineHighestPrice;
  //   }
  //   let mean = '';
  //   const formatValue = numberSeparatorRender(val);
  //   if (auctionDirection === 'FORWARD') {
  //     mean = max === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
  //   } else {
  //     mean = min === val ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
  //   }
  //   return mean;
  // };

  /**
   * 根据报价方向, 过滤选择策略
   */
  const handleOptionsFilter = useCallback(
    (record) => {
      let filterResult = true; // 无要求 `NONE`
      const currentOptionValue = record.get('value');

      if (auctionDirection === 'FORWARD') {
        // 报价方向为英式（越来越高）时, `FORWARD`
        filterResult = currentOptionValue !== 'MINIMUM';
      }
      if (auctionDirection === 'REVERSE') {
        // 报价方向为荷兰式（越来越低）时 `REVERSE`
        filterResult = currentOptionValue !== 'MAXIMUM';
      }

      const cuxProps = {
        basicInfoDs,
        record,
      };

      filterResult = remote
        ? remote.process(
            'SSRC_CHECK_PRICE_PROCESS_HANDLEOPTIONSFILTER_RETURN',
            filterResult,
            cuxProps
          )
        : filterResult;

      return filterResult;
    },
    [auctionDirection, basicInfoDs, remote]
  );

  const suggestedFlagChange = withOverride.call(
    props,
    useCallback(
      function suggestedFlagChange(value, record) {
        const { rfxQuantity, secondaryQuantity } = record.get(['rfxQuantity', 'secondaryQuantity']);
        if (value) {
          record.set('allottedSecondaryQuantity', secondaryQuantity);
          record.set('suggestedFlag', 1);
          record.set('allottedQuantity', rfxQuantity);
          record.set('allottedRatio', 100);
        } else {
          record.set('allottedQuantity', '');
          record.set('allottedSecondaryQuantity', '');
          record.set('allottedRatio', '');
          record.set('suggestedRemark', '');
          record.set('suggestedFlag', 0);
        }
      },
      [doubleUnitFlag]
    ),
    'suggestedFlagChange'
  );

  // 分配数量
  const handleQuantity = (val, record) => {
    const { itemId, quotationLineId, uomId, secondaryUomId } = record.get([
      'itemId',
      'quotationLineId',
      'uomId',
      'secondaryUomId',
    ]);
    if (val) {
      if (doubleUnitFlag && itemId) {
        // eslint-disable-next-line no-unused-expressions
        calculateBasicQty({
          secondaryQuantity: val,
          itemId,
          businessKey: quotationLineId || record.id,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        })?.then((res) => {
          record.set('allottedQuantity', res ?? '');
        });
      } else {
        record.set('allottedQuantity', val);
      }
    } else if (val === 0) {
      record.set('allottedQuantity', val);
    }
  };

  /**
   * 表格行事件
   * [东博] 重写, 谨慎修改!!!
   * @protected
   */
  const renderRow = withOverride.call(
    props,
    useCallback(function renderRow({ dataSet, record, index, expandedRow }) {
      return remote
        ? remote?.process(
            'SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_ROW_RENDER',
            {},
            {
              record,
              dataSet,
              index,
              expandedRow,
              bidFlag,
              props,
            }
          )
        : {};
    }, []),
    'renderRow'
  );

  const colorRemote = remote
    ? remote?.process('SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_COLUMNS_COLOR', 'red')
    : 'red';

  const commonColumns = getAllTabTableCommonColumns ? getAllTabTableCommonColumns() : [];

  const preColumns = useMemo(
    () => [
      // 此列二开，禁止修改字段名
      {
        name: 'suggestedFlag',
        width: 60,
        renderer: ({ record }) => {
          return (
            <CheckBox
              name="suggestedFlag"
              record={record}
              onChange={(value) => suggestedFlagChange(value, record)}
            />
          );
        },
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 120,
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
              onClick={() => viewItemLineApplicationOrgModal(record)}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        },
      },
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryUomName',
        width: 100,
      }),
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 250,
        renderer: ({ value, record }) => roundEliminateC7N(value, record),
      },
      {
        name: 'candidateSuggestion',
        width: 100,
      },
      {
        name: 'stageDescription',
        width: 120,
      },
      multiCurrencyFlag
        ? {
            name: 'quotationCurrencyCode',
            width: 100,
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'exchangeRate',
            width: 100,
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validQuotationSecPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      }),
      {
        name: 'validQuotationPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validQuotationPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'priceCoefficient',
            width: 100,
          }
        : '',
      rankRule === 'WEIGHT_PRICE'
        ? {
            name: 'weightPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : '',
      useTernaryExpression(doubleUnitFlag, {
        name: 'validNetSecondaryPrice',
        width: 100,
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validNetSecondaryPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      }),
      {
        name: 'validNetPrice',
        width: 100,
        renderer: ({ value, record }) => {
          if (record.get('redField') === 'validNetPrice') {
            return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
          } else {
            return numberSeparatorRender(value);
          }
        },
      },
      {
        name: 'perNetPrice',
        width: 120,
      },
      {
        name: 'perTaxIncludedPrice',
        width: 120,
      },
      {
        name: 'referencePrice',
        width: 120,
      },
      {
        name: 'differentPrice',
        width: 100,
        renderer: ({ record }) => {
          if (
            (priceTypeCode === 'NET_PRICE'
              ? record.get(doubleUnitFlag ? 'validNetSecondaryPrice' : 'validNetPrice')
              : record.get(doubleUnitFlag ? 'validQuotationSecPrice' : 'validQuotationPrice')) !==
              null &&
            (record.get('referencePrice') || record.get('referencePrice') === 0)
          ) {
            return numberSeparatorRender(
              math.minus(
                priceTypeCode === 'NET_PRICE'
                  ? record.get(doubleUnitFlag ? 'validNetSecondaryPrice' : 'validNetPrice')
                  : record.get(doubleUnitFlag ? 'validQuotationSecPrice' : 'validQuotationPrice'),
                record.get('referencePrice')
              )
            );
          }
        },
      },
      multiCurrencyFlag
        ? {
            name: 'baseQuotationPrice',
            width: 100,
            align: 'right',
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'baseQuotationPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : '',
      multiCurrencyFlag
        ? {
            name: 'baseNetPrice',
            align: 'right',
            width: 100,
            renderer: ({ value, record }) => {
              if (record.get('redField') === 'baseNetPrice') {
                return <span style={{ color: colorRemote }}>{numberSeparatorRender(value)}</span>;
              } else {
                return numberSeparatorRender(value);
              }
            },
          }
        : '',
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => {
          const renderProps = {
            rowData: record,
            sourceFrom: 'RFX',
            uiType: 'c7n',
            allowBuyerViewFlag: 1,
            tableDS: quoteLineDs,
            pageFrom: 'checkPrice',
            bidFlag,
          };

          const QUOTATION = <QuotationDetail {...renderProps} />;
          const render = remote
            ? remote.render(
                'SSRC_CHECK_PRICE_TABLE_COLUMNS_QUOTATIONDETAIL',
                QUOTATION,
                renderProps
              )
            : QUOTATION;

          return render;
        },
      },
      {
        name: 'priceBatchQuantity',
        width: 110,
        align: 'right',
      },
      useTernaryExpression(doubleUnitFlag && checkWay === 'quantity', {
        name: 'allottedSecondaryQuantity',
        width: 100,
        align: 'right',
        editor: (record) => {
          return (
            <C7nPrecisionInputNumber
              name="allottedSecondaryQuantity"
              record={record}
              uom="secondaryUomId"
              onChange={(val) => handleQuantity(val, record)}
            />
          );
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      }),
      checkWay === 'quantity'
        ? {
            name: 'allottedQuantity',
            width: 100,
            align: 'right',
            editor: (record) => {
              return (
                <C7nPrecisionInputNumber name="allottedQuantity" record={record} uom="uomId" />
              );
            },
            renderer: ({ value, record }) =>
              doubleUnitFlag && record.get('itemId')
                ? numberSeparatorRender(value)
                : numberSeparatorRender(value, record.getState('uom_precision')),
          }
        : {
            name: 'allottedRatio',
            width: 120,
            editor: true,
          },
      {
        name: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        name: 'taxIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'suggestedRemark',
        width: 100,
        editor: true,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => showLadderQuotation(record)}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'preQuotationPrice',
        width: 100,
      },
      {
        name: 'priceFluctuation',
        width: 100,
        align: 'right',
      },
      {
        name: 'initialFluctuation',
        width: 130,
      },
      {
        name: 'priceCompareToFirst',
        width: 130,
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
      useTernaryExpression(doubleUnitFlag, {
        name: 'secondaryQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      }),
      useTernaryExpression(doubleUnitFlag, {
        name: 'validQuotationSecQuantity',
        width: 100,
        renderer: ({ value, record }) => renderValidQuotationQuantity(value, record, 'all'),
      }),
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationQuantity',
        width: 100,
        renderer: ({ value, record }) => renderValidQuotationQuantity(value, record, 'all'),
      },
      {
        name: 'totalPrice',
        width: 100,
        align: 'right',
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'netAmount',
        width: 140,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedPrice',
            width: 100,
          }
        : {
            name: 'netEstimatedPrice',
            width: 100,
          },
      priceTypeCode === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'estimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                value={value}
                financial={record.get('currencyCode')}
                type="c7n"
                readOnly
              />
            ),
          }
        : {
            name: 'netEstimatedAmount',
            width: 100,
            renderer: ({ value, record }) => (
              <PrecisionInputNumber
                value={value}
                financial={record.get('currencyCode')}
                type="c7n"
                readOnly
              />
            ),
          },
      {
        name: 'validQuotationRemark',
        width: 120,
      },
      {
        name: 'paymentTypeName',
        width: 120,
      },
      {
        name: 'paymentTermName',
        width: 120,
      },
      {
        name: 'attachmentUuid',
        width: 120,
        renderer: ({ value, record }) => {
          return !newQuotationFlag ? (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              value={value}
              viewMode="popup"
              funcType="link"
              name="attachmentUuid"
              previewTarget="_blank"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
      {
        name: 'origin',
        width: 120,
      },
      {
        name: 'validExpiryDateFrom',
        width: 150,
        renderer: ({ value }) => dateRender(value),
        editor: true,
      },
      {
        name: 'validExpiryDateTo',
        width: 150,
        renderer: ({ value }) => dateRender(value),
        editor: true,
      },
      {
        name: 'validPromisedDate',
        width: 120,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
        editor: true,
        sortable: true,
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPurchaseQuantity',
        width: 120,
        editor: (record) => {
          return <C7nPrecisionInputNumber name="minPurchaseQuantity" record={record} uom="uomId" />;
        },
        renderer: ({ value, record }) =>
          numberSeparatorRender(value, record.getState('uom_precision')),
      },
      // 该字段二开，请勿修改字段名
      {
        name: 'minPackageQuantity',
        width: 100,
        editor: true,
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
        width: 100,
        renderer: ({ record, value }) => {
          let cuxFreightAmountProps = {};
          cuxFreightAmountProps = remote
            ? remote.process(
                'SSRC_CHECK_PRICE_PROCESS_ALL_FREIGHT_AMOUNT_PROPS',
                cuxFreightAmountProps,
                {
                  that: this,
                  record,
                }
              )
            : cuxFreightAmountProps;
          cuxFreightAmountProps = cuxFreightAmountProps || {};

          return (
            <PrecisionInputNumber
              value={value}
              financial={record.get('quotationCurrencyCode')}
              readOnly
              {...cuxFreightAmountProps}
            />
          );
        },
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'rfxLineItemNum',
        width: 60,
      },
      {
        name: 'changePercent',
        width: 100,
      },
      {
        name: 'newPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'minPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'supplierSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'supplierSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'itemSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'quotationLineSavingAmount',
        width: 130,
        renderer: ({ value, record }) => (
          <PrecisionInputNumber
            value={value}
            financial={record.get('currencyCode')}
            type="c7n"
            readOnly
          />
        ),
      },
      {
        name: 'quotationLineSavingRatio',
        width: 130,
        renderer: ({ value }) => (!isNil(value) ? `${value}%` : '-'),
      },
      {
        name: 'itemSignPostPrice',
      },
      {
        name: 'comparePriceHistory',
        width: 120,
        renderer: ({ record }) =>
          record.quotationLineId !== null ? (
            <a onClick={() => onComparePriceHistory(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
      ...commonColumns,
    ],
    [checkWay, multiCurrencyFlag, rankRule, priceTypeCode, newQuotationFlag, doubleUnitFlag]
  );

  const columns = remote
    ? remote.process('SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_COLUMNS', preColumns, {
        history,
        bidFlag,
        basicInfoDs,
        current,
        suggestedFlagChange,
      })
    : preColumns;

  const preTableProps = {
    columns,
    dataSet: quoteLineDs,
    style: { maxHeight: '70vh' },
    onRow: renderRow,
    virtual: true,
    virtualCell: true,
  };

  const tableProps = remote
    ? remote.process('SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_PROPS', preTableProps, {
        bidFlag,
        pageProps: props,
      })
    : preTableProps;

  const getTableProps = withOverride.call(
    props,
    function getTableProps(prop) {
      return prop;
    },
    'getTableProps'
  );

  let headerButtons = [
    fetchQueryPriceInfoLoading ? (
      <span colSpan={4} style={{ textAlign: 'right' }}>
        <Button icon="sync" loading={fetchQueryPriceInfoLoading}>
          {intl.get(`ssrc.inquiryHall.view.message.button.updating`).d('更新中')}
        </Button>
      </span>
    ) : (
      <span colSpan={4} />
    ),
    <Select
      name="selectedPolicyValue"
      onChange={changeStrategy}
      labelWidth={120}
      optionsFilter={handleOptionsFilter}
      disabled={
        remote
          ? remote.process('SSRC_CHECK_PRICE_PROCESS_SELECTED_POLICYVALUE_DISABLED', false, {
              basicInfoDs,
            })
          : false
      }
    />,
  ];

  headerButtons = remote
    ? remote.process('SSRC_CHECK_PRICE_PROCESS_ALL_TABLE_BUTTONS', headerButtons, {
        pageProps: props,
      })
    : headerButtons;

  return (
    <Fragment>
      <NoQuotedItemView headerDs={basicInfoDs} />
      <div>
        <Form dataSet={strategyDs} columns={5} labelWidth={80}>
          {headerButtons}
        </Form>
      </div>
      <div id="ssrc-check-price-all-quote-line-table-wrap">
        {customizeTable(
          { code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL` },
          <Table {...getTableProps(tableProps)} />
        )}
      </div>
    </Fragment>
  );
};

const hocAllQuoteLine = (Comp) => {
  return compose(memo, observer)(Comp);
};

export { AllQuoteLine, hocAllQuoteLine };

export default hocAllQuoteLine(AllQuoteLine);
