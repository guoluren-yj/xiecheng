/* eslint-disable react/no-unused-state */
import React, { PureComponent, Fragment } from 'react';
import { Tag, Select, Pagination, Spin, Form, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, noop, isNil } from 'lodash';
import { connect } from 'dva';
import { Attachment } from 'choerodon-ui/pro';

// import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import annexImg from '@/assets/item-icon.svg';
import { numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, INQUIRY_HALL_LOWERCASE, getQuotationName } from '@/utils/globalVariable';
import LadderLevel from '@/routes/ssrc/components/LadderLevelDoubleUnit';
import BidLadderLevel from '@/routes/ssrc/components/LadderLevelDoubleUnit/BidIndex';
import PriceCharts from '@/routes/ssrc/components/PriceCharts';
import CombineComponent from '@/routes/components/CombineComponent';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

import ItemLineTable from './ItemLineTable';
import ListRender from './ListRender';
import styles from './index.less';

import { selectionInfoMap } from '../utils/constants';

const modelNameVar = INQUIRY_HALL_LOWERCASE;

const { Option } = Select;

class ItemLineList extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'itemLineList');
    }
    this.state = {
      isShow: {}, // 数据是否查询显示，查了一下逻辑，并没有啥用
      updateState: false,
      // rfxLineItemId: undefined, // 最后打开的rfxLineItemId
    };
    this.itemLineTable = {}; // 存放ds map
  }

  /**
   * 选择策略-停止折叠面板冒泡行为
   */
  @Bind()
  clickStrategy(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      modelName = 'inquiryHall',
      [modelName]: { itemQuoteLine },
    } = this.props;
    const {
      [modelName]: { itemQuoteLine: preLine },
    } = preProps;
    if (itemQuoteLine !== preLine) {
      return true;
    }
    return null;
  }

  // componentDidUpdate(preProps, preState, snap) {
  //   const {
  //     inquiryHall: { itemQuoteLine },
  //   } = this.props;
  //   const { rfxLineItemId = undefined } = this.state;
  //   if (snap !== null) {
  //     debugger
  //     if (!isEmpty(itemQuoteLine)) {
  //       let wholePackageList = {};
  //       const selectedItemQuoteLine = itemQuoteLine.filter(
  //         // eslint-disable-next-line
  //         item => item.rfxLineItemId == rfxLineItemId
  //       );
  //       selectedItemQuoteLine.forEach(item => {
  //         wholePackageList = {
  //           ...wholePackageList,
  //           [`${item.quotationLineId}#${item.rfxLineItemId}`]: item.$form.getFieldValue(
  //             'suggestedFlag'
  //           ),
  //         };
  //       });
  //       this.itemLineTable[rfxLineItemId].setState({
  //         suggestedFlagValue: {
  //           ...this.itemLineTable[rfxLineItemId].state.suggestedFlagValue,
  //           ...wholePackageList,
  //         },
  //       });
  //     }
  //   }
  // }

  /**
   * 获取表格数据
   * @param {*} page 分页信息
   * @param {*} rfxLineItemId 头id
   * @param {*} flag 是否是第一次点击头
   */
  @Bind()
  fetchItemLineTableList(page = {}, rfxLineItemId) {
    const {
      dispatch,
      organizationId,
      rfxHeaderId,
      sourceKey = INQUIRY,
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/fetchItemQuoteLine`,
      payload: {
        page,
        organizationId,
        rfxLineItemId,
        rfxHeaderId,
        customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
      },
    });
  }

  /**
   * 物品明细-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineItemId) {
    const {
      dispatch,
      modelName = 'inquiryHall',
      [modelName]: { itemQuoteLine, itemQuoteLinePagination = {} },
    } = this.props;
    const { updateState } = this.state;
    // 改变分页，先把对应得rfxLineItemId得数据清空，再重新查询
    const newItemQuoteLine = itemQuoteLine.filter((item) => item.rfxLineItemId !== rfxLineItemId);
    delete itemQuoteLinePagination[rfxLineItemId];
    dispatch({
      type: `${modelName}/updateState`,
      payload: { itemQuoteLine: newItemQuoteLine, itemQuoteLinePagination },
    });
    this.setState({ updateState: true }, () => {
      this.fetchItemLineTableList(page, rfxLineItemId, updateState);
    });
  }

  /**
   * 物品明细-表格内容改变
   * 选择非供应商推荐的时候，清空选用
   */
  @Bind()
  changeTableData(value, rfxLineItemId) {
    const {
      checkPriceTableChange = () => {},
      dispatch,
      modelName = 'inquiryHall',
      [modelName]: { itemLine = [] },
    } = this.props;
    const currentDs = this.itemLineTable[rfxLineItemId];
    if (value !== 'RECOMMENDATION' && currentDs) {
      currentDs.forEach((record) => {
        record.set('suggestedFlag', 0);
        record.set('allottedQuantity', '');
        record.set('allottedSecondaryQuantity', '');
        record.set('allottedRatio', '');
        record.set('suggestedRemark', '');
      });
    }

    let newItemLine = itemLine;
    newItemLine = newItemLine.map((item) => {
      if (item.rfxLineItemId === rfxLineItemId) {
        const sourceItem = item;
        sourceItem.selectionStrategy = value;
        return sourceItem;
      }
      return item;
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        itemLine: newItemLine,
      },
    });

    checkPriceTableChange(true);

    // 弃用此判断, 直接根据ds `dirty` 判断
    // if (!itemLineChange) {
    //   dispatch({
    //     type: 'inquiryHall/updateState',
    //     payload: {
    //       itemLineChange: true,
    //     },
    //   });
    // }
  }

  /**
   * 点击小图打开缩略图
   */
  @Bind()
  openPriceCharts(e, chartFlag, id) {
    const { onPriceCharts } = this.props;
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
    onPriceCharts(chartFlag, id);
  }

  /**
   * 查看历史最低价
   */
  @Bind()
  handleViewHistoryLow(item) {
    const { onHandleViewHistoryLow } = this.props;
    if (
      item.priceLibHistoryDTO &&
      (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
    ) {
      onHandleViewHistoryLow(item);
    }
  }

  /**
   * 绑定ref
   * @param {*} callKey - 外层列表key
   * @param {*} ds - dataSet
   */
  @Bind()
  handleRef(callKey, ds) {
    this.itemLineTable[callKey] = ds;
  }

  /**
   * 渲染历史最低价信息
   */
  @Bind()
  renderHistoricalLowTip(priceLibHistoryDTO, item) {
    const { remote } = this.props;

    let title = '';
    if (
      priceLibHistoryDTO &&
      (priceLibHistoryDTO.unitPrice || priceLibHistoryDTO.unitPrice === 0)
    ) {
      let creationDate = dateRender(priceLibHistoryDTO.creationDate);
      creationDate = creationDate.split('-');
      title = (
        <Fragment>
          <div>
            {priceLibHistoryDTO.supplierCompanyNum} {priceLibHistoryDTO.supplierCompanyName}
          </div>
          <div>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.historyPrice').d('历史单价')}：
            {priceLibHistoryDTO.unitPrice}/{priceLibHistoryDTO.uomName}
          </div>
          <div>
            {intl.get(`ssrc.common.taxRate`).d('税率')}： {priceLibHistoryDTO.taxRate}%
          </div>
          <div>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期')}：
            {creationDate[0]}
            {intl.get('ssrc.inquiryHall.date.unit.year').d('年')}
            {creationDate[1]}
            {intl.get('ssrc.inquiryHall.date.unit.month').d('月')}
            {creationDate[2]}
            {intl.get('ssrc.inquiryHall.date.unit.day').d('日')}
          </div>
        </Fragment>
      );
    } else {
      title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');
    }

    title = remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_ITEM_RENDERHISTORICALLOWTIP', title, {
          priceLibHistoryDTO,
          that: this,
          item,
        })
      : title;

    return title;
  }

  /**
   * 【逻辑说明】
  1.物料行的报价供应商数量=0,供应商数量显示红色；0<物料行的报价供应商数量<最少报价供应商数量，供应商数量显示蓝色；物料行的报价供应商数量≥最少报价供应商数量,供应商数量显示绿色
    */
  renderSupplierQuotationInfo = (item) => {
    const { basicInfoDs, bidFlag } = this.props;
    const { supplierQuotedCount = null } = item || {};

    const { minQuotedSupplier } = basicInfoDs?.current
      ? basicInfoDs.current?.get(['minQuotedSupplier'])
      : {};

    if (isNil(supplierQuotedCount)) {
      return '';
    }

    let color = 'red'; // === 0
    if (supplierQuotedCount > 0) {
      if (supplierQuotedCount < minQuotedSupplier) {
        color = 'blue';
      }
      if (supplierQuotedCount >= minQuotedSupplier) {
        color = 'green';
      }
    }

    const text = (
      <span>
        <span style={{ color }}>{supplierQuotedCount}</span>
        {intl
          .get(`ssrc.inquiryHall.model.inquiryHall.theSupplierQuotedNums`, {
            type: getQuotationName(bidFlag),
          })
          .d('家供应商{type}')}
      </span>
    );

    return (
      <span style={{ margin: '0 4px', maxWidth: '120px' }}>
        <Tooltip title={text}>{text}</Tooltip>
      </span>
    );
  };

  @Bind()
  renderHeaderInfo(item, scrollTo) {
    const {
      selectedPolicy = [],
      form,
      doubleUnitFlag = false,
      remote,
      bidFlag,
      basicInfoDs,
      expand = {},
      clickCollapseChange = () => {},
      history,
    } = this.props;
    const chartFlag = 'i';
    const { getFieldDecorator } = form;
    const { taxIncludedFlag, taxRate } = item || {};

    // 在外层调用跳到指定位置
    this.scrollTo = scrollTo;

    const otherProps = {
      basicInfoDs,
      bidFlag,
      that: this,
      item,
    };
    const selectedPolicyFilterValue = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_ITEM_SELECTED_POLICY_STRATEGY',
          selectedPolicy,
          otherProps
        )
      : selectedPolicy;

    const winedAmountTag = item.winedAmount ? (
      <Tag className={styles.winedAmount}>
        {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}
        {`(${
          item.priceTypeCode === 'TAX_INCLUDED_PRICE'
            ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
        })`}
        ：
        <Tooltip
          title={
            <span>
              <PrecisionInputNumber
                financial={item.currencyCode}
                type="hzero"
                readOnly
                value={item.winedAmount}
              />
              {item.currencyCode}
            </span>
          }
          placement="topLeft"
        >
          <span>
            <PrecisionInputNumber
              financial={item.currencyCode}
              type="hzero"
              readOnly
              value={item.winedAmount}
            />
            {item.currencyCode}
          </span>
        </Tooltip>
      </Tag>
    ) : (
      ''
    );

    const Styles = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_ITEM_CODE_STYLE',
          {},
          {
            item,
            basicInfoDs,
            bidFlag,
          }
        )
      : {};
    const getCuxStyle = (fieldName) => {
      return (
        (remote
          ? remote.process('SSRC_CHECK_PRICE_ITEM_LINE_FIELD_CUX_STYLE', {}, { fieldName })
          : {}) || {}
      );
    };

    const headerMiddleComp = (
      <div className={styles.middleBox}>
        {remote
          ? remote.process('SSRC_CHECK_PRICE_ITEM_LINE_LIST_PROCESS_FIRST_TAG', null, {
              item,
              styles,
              bidFlag,
              basicInfoDs,
              history,
            })
          : null}
        <Tag className={styles.line}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{item.rfxLineItemNum}
        </Tag>
        <Tag className={styles.rfxQuantity} style={getCuxStyle('rfxQuantity')}>
          <Tooltip
            title={`${item[doubleUnitFlag ? 'secondaryQuantity' : 'rfxQuantity']}（${
              item[doubleUnitFlag ? 'secondaryUomName' : 'uomName']
            }）`}
          >
            {item[doubleUnitFlag ? 'secondaryQuantity' : 'rfxQuantity']}（
            {item[doubleUnitFlag ? 'secondaryUomName' : 'uomName']}）
          </Tooltip>
        </Tag>
        {item.itemCategoryName ? <Tag className={styles.other}>{item.itemCategoryName}</Tag> : ''}
        {item.quotationRange ? (
          <Tag className={styles.other}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
            {item.quotationRange}
          </Tag>
        ) : (
          ''
        )}
        {taxIncludedFlag ? (
          <Tag className={styles.other}>
            {isNil(taxRate) ? (
              intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
            ) : (
              <>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：{taxRate}
              </>
            )}
          </Tag>
        ) : (
          <Tag className={styles.other}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.noTaxRate`).d('不含税')}
          </Tag>
        )}
        {remote
          ? remote.process(
              'SSRC_CHECK_PRICE_ITEM_LINE_LIST_PROCESS_WINED_AMOUNT_TAG',
              winedAmountTag,
              {
                item,
                className: styles.winedAmount,
                basicInfoDs,
              }
            )
          : winedAmountTag}
        {remote
          ? remote.process('SSRC_CHECK_PRICE_ITEM_LINE_LIST_PROCESS_MORE_TAG', null, {
              item,
              styles,
              basicInfoDs,
            })
          : null}
      </div>
    );

    let historyLowPriceDom = (
      <div className={styles['historical-low']}>
        <Tooltip
          title={this.renderHistoricalLowTip(item.priceLibHistoryDTO, item)}
          placement="topLeft"
        >
          <span>
            {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}：
            {item.priceLibHistoryDTO &&
            (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
              ? numberSeparatorRender(item.priceLibHistoryDTO.unitPrice)
              : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
          </span>
        </Tooltip>
      </div>
    );

    historyLowPriceDom = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_ITEM_HISTORY_LOW_PRICE_DOM',
          historyLowPriceDom,
          otherProps
        )
      : historyLowPriceDom;

    return (
      <div className={styles.container} onClick={(e) => clickCollapseChange(e, item, scrollTo)}>
        <div className={styles.leftBox}>
          <img
            src={annexImg}
            alt=""
            style={{ width: 44, height: 44, 'margin-right': '10px' }}
            onClick={(e) => this.openPriceCharts(e, chartFlag, item.rfxLineItemId)}
          />
          <span className={styles.leftBoxContent}>
            <div style={{ display: 'flex', 'align-items': 'baseline' }}>
              <span>
                <Tooltip
                  title={item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                  placement="topLeft"
                >
                  <div className={styles.leftBoxTitle} style={Styles}>
                    {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: '#1D2129', margin: '0 4px' }}
                type={!expand[`${item.rfxLineItemId}`] ? 'down' : 'up'}
              />
            </div>
            <div onClick={(e) => this.clickStrategy(e)} style={{ display: 'flex' }}>
              {item.attachmentUuid ? (
                <span onClick={(e) => this.clickStrategy(e)}>
                  <Attachment
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-rfxitem"
                    value={item.attachmentUuid}
                    viewMode="popup"
                    readOnly
                    className={styles.attachment}
                  />
                </span>
              ) : (
                ''
              )}
              <Tooltip title={item.itemRemark} placement="topLeft">
                <div className={styles.leftBoxRemark}>{item.itemRemark}</div>
              </Tooltip>
            </div>
          </span>
        </div>
        {remote
          ? remote.render('SSRC_CHECK_PRICE_RENDER_ITEM_HEADER_MIDDLE', headerMiddleComp, {
              item,
              basicInfoDs,
              bidFlag,
              styles,
              doubleUnitFlag,
            })
          : headerMiddleComp}
        {this.renderSupplierQuotationInfo(item)}
        {remote ? (
          remote.render(
            'SSRC_CHECK_PRICE_RENDER_ITEM_HEADER',
            <div className={styles.rightBox} onClick={(e) => this.clickStrategy(e)}>
              {historyLowPriceDom}
              <Form.Item className={styles.selectedPolicyItemStyle}>
                {getFieldDecorator(`value#${item.rfxLineItemId}`, {
                  initialValue:
                    item.selectionStrategy === null ? undefined : item.selectionStrategy,
                })(
                  <Select
                    allowClear
                    disabled={
                      remote
                        ? remote.process(
                            'SSRC_CHECK_PRICE_PROCESS_ITEMLINE_TABLEHEADER_SELECTPROPS',
                            item.eliminateRoundNumber === 1,
                            { item, bidFlag, basicInfoDs }
                          )
                        : item.eliminateRoundNumber === 1
                    }
                    size="small"
                    className={styles.selectStyle}
                    onChange={(value) => this.changeTableData(value, item.rfxLineItemId)}
                    placeholder={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.strategy`)
                      .d('选择策略')}
                  >
                    {selectedPolicyFilterValue &&
                      selectedPolicyFilterValue.map((selectOption) => (
                        <Option key={selectOption.value} value={selectOption.value}>
                          <Tooltip title={selectionInfoMap()[selectOption.value]} placement="left">
                            {selectOption.meaning}
                          </Tooltip>
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </div>,
            {
              item,
              selectedPolicy: selectedPolicyFilterValue,
              styles,
              form,
              clickStrategy: this.clickStrategy,
              renderHistoricalLowTip: this.renderHistoricalLowTip,
              changeTableData: this.changeTableData,
            }
          )
        ) : (
          <div className={styles.rightBox} onClick={(e) => this.clickStrategy(e)}>
            {historyLowPriceDom}
            <Form.Item className={styles.selectedPolicyItemStyle}>
              {getFieldDecorator(`value#${item.rfxLineItemId}`, {
                initialValue: item.selectionStrategy === null ? undefined : item.selectionStrategy,
              })(
                <Select
                  allowClear
                  disabled={
                    remote
                      ? remote.process(
                          'SSRC_CHECK_PRICE_PROCESS_ITEMLINE_TABLEHEADER_SELECTPROPS',
                          item.eliminateRoundNumber === 1,
                          { item, bidFlag, basicInfoDs }
                        )
                      : item.eliminateRoundNumber === 1
                  }
                  size="small"
                  className={styles.selectStyle}
                  onChange={(value) => this.changeTableData(value, item.rfxLineItemId)}
                  placeholder={intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.strategy`)
                    .d('选择策略')}
                >
                  {selectedPolicyFilterValue &&
                    selectedPolicyFilterValue.map((index) => (
                      <Option key={index.value} value={index.value}>
                        {index.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </div>
        )}
      </div>
    );
  }

  /**
   * 渲染物料table - [永祥] 二开, 谨慎修改!!!
   * @protected
   */
  @Bind()
  renderItemLineTable(tableProps, rfxLineItemId, formValue, remote) {
    return (
      <ItemLineTable
        {...tableProps}
        remote={remote}
        rfxLineItemId={rfxLineItemId}
        selectedPolicyValue={formValue}
      />
    );
  }

  render() {
    const {
      form,
      remote,
      checkWay,
      rfxHeaderId,
      headerList = [],
      organizationId,
      loading,
      modelName = 'inquiryHall',
      [modelName]: { itemLinePagination },
      onChangePagination,
      hideModal,
      viewLadderLevel,
      sourceKey = INQUIRY,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      handleQuotationDetail,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      priceDataSource,
      supplierNameList,
      onHidePriceCharts,
      priceChartsvisible,
      itemChartsLoading,
      fetchQuotationDetail,
      customizeTable,
      basicInfoDs,
      allottedQuantityChange,
      showQuotationDetail,
      changeCurrentPaneActiveSelected = () => {},
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [],
      itemLineTableSelectedKeys = [],
      renderValidQuotationQuantity = noop,
      changeItemLineTableSelection = () => {},
      takePrice = noop,
      doubleUnitFlag = false,
      onComparePriceHistory,
      bidFlag,
      activePanel = [],
      changeCollapse = () => {},
      fixedFlag,
      itemLinePageSize,
      expandAllFlag,
      batchSearchData,
      batchSearchDataKeys,
      priceDataObj,
      openExpandAllFlag,
      getContainerRef,
      searchPriceLoading,
      clickAllFlag,
      queryLadderQuotation,
      getAllTabTableCommonColumns,
      getExtranceInstance,
    } = this.props;
    const priceChartsProps = {
      loading: itemChartsLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };
    const tableProps = {
      form,
      takePrice,
      rfxHeaderId,
      basicInfoDs,
      doubleUnitFlag,
      customizeTable,
      checkWay,
      sourceKey,
      organizationId,
      renderValidQuotationQuantity,
      onRef: this.handleRef,
      viewLadderLevel,
      fetchQuotationDetail,
      handleQuotationDetail,
      allottedQuantityChange,
      onChangeTableData: this.changeTableData,
      showQuotationDetail,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
      changeItemLineTableSelection,
      onComparePriceHistory,
      headerList,
      bidFlag,
      expandAllFlag,
      itemLineTable: this.itemLineTable,
      priceDataObj,
      searchPriceLoading,
      clickAllFlag,
      getAllTabTableCommonColumns,
      getExtranceInstance,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      doubleUnitFlag,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      queryLadderQuotation,
      bidFlag,
      remote,
      remotePrefix: 'SSRC_CHECK_PRICE_LADDER_QUOTATION_H0',
    };

    const modelProps = {
      visible: priceChartsvisible,
      width: 805,
      footer: null,
      onCancel: onHidePriceCharts,
      bodyStyle: { height: 380, marginLeft: '12px', overflow: 'auto' },
      title: '',
    };
    const { total = 0 } = itemLinePagination || {};
    return (
      <Fragment>
        <Spin spinning={loading}>
          <ListRender
            {...{
              headerList,
              renderHeaderInfo: this.renderHeaderInfo,
              styles,
              tableProps,
              form,
              remote,
              activePanel,
              changeCollapse,
              lineKey: 'rfxLineItemId',
              renderLineTable: this.renderItemLineTable,
              pagesize: itemLinePageSize,
              batchSearchData,
              batchSearchDataKeys,
              expandAllFlag,
              tableMap: this.itemLineTable,
              openExpandAllFlag,
              getContainerRef,
            }}
          />
          {total > 10 && (
            <Pagination
              className={fixedFlag ? styles.fixedPagination : styles.pagination}
              {...itemLinePagination}
              onChange={(page, pageSize) => onChangePagination(page, pageSize)}
              onShowSizeChange={(current, size) => onChangePagination(current, size)}
            />
          )}
          {viewLadderLevelVisible &&
            (sourceKey === INQUIRY ? (
              <LadderLevel {...ladderLevelModalProps} />
            ) : (
              <BidLadderLevel {...ladderLevelModalProps} />
            ))}
          {priceChartsvisible && (
            <Modal {...modelProps}>
              <PriceCharts {...priceChartsProps} />
            </Modal>
          )}
        </Spin>
      </Fragment>
    );
  }
}

const withStandardCompEnhancer = (Comp) => {
  return CombineComponent({
    modelName: modelNameVar,
  })(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      fetchItemQuoteLineLoading: loading.effects[`${modelNameVar}/fetchItemQuoteLine`],
      organizationId: getCurrentOrganizationId(),
    }))(Form.create({ fieldNameProp: null })(Comp))
  );
};

export { withStandardCompEnhancer, ItemLineList };
export default withStandardCompEnhancer(ItemLineList);
