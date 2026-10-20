import React, { Component } from 'react';
import { Tag, Select, Pagination, Spin, Form, Modal, Icon, Tooltip } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isFunction, compose, isNil } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import annexImg from '@/assets/item-icon.svg';
import { INQUIRY, BID, getQuotationName } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
import { numberSeparatorRender } from '@/utils/renderer';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';
import ItemLineTable from './ItemLineTable';
import LadderLevel from '../../components/LadderLevelDoubleUnit';
import PriceCharts from '../../components/PriceCharts';
import ListRender from './ListRender';

const { Option } = Select;

class ItemLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      loadingObj: {},
      expand: {}, // 展开数据
      isShow: {}, // 数据是否查询显示
      rfxLineItemId: undefined, // 最后打开的rfxLineItemId
      activePanel: [],
      expandAllFlag: false,
      clickAllFlag: false,
    };
    this.itemLineTable = {};
  }

  @Bind()
  changeCollapse(active) {
    const { headerList = [] } = this.props;
    const { activePanel } = this.state;
    this.setState({
      activePanel: active,
      expandAllFlag: active.length === headerList.length,
      clickAllFlag: active.length === headerList.length && activePanel.length + 1 === active.length,
    });
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

  @Bind()
  getContainerRef(ref = {}) {
    this.scrollerContainerRef = ref?.current;
  }

  /**
   * 获取表格数据rfxLineItemId
   */
  @Bind()
  clickCollapseChange(e, item) {
    const { expand, isShow, scrollTo } = this.state;
    if (!isShow[item.rfxLineItemId]) {
      this.setState({ rfxLineItemId: item.rfxLineItemId });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineItemId]: !expand[item.rfxLineItemId],
      },
      isShow: {
        ...isShow,
        [item.rfxLineItemId]: true,
      },
      expandAllFlag: false,
    });
    if (scrollTo && this.scrollerContainerRef) {
      this.scrollerContainerRef.scrollTo(0, this.scrollerContainerRef.scrollTop + 1);
    }
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

  renderHistoricalLowTip(priceLibHistoryDTO) {
    let title = '';
    if (
      priceLibHistoryDTO &&
      (priceLibHistoryDTO.unitPrice || priceLibHistoryDTO.unitPrice === 0)
    ) {
      let creationDate = dateRender(priceLibHistoryDTO.creationDate);
      creationDate = creationDate.split('-');
      title = (
        <React.Fragment>
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
        </React.Fragment>
      );
    } else {
      title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');
    }
    return title;
  }

  /**
   * 【逻辑说明】
  1.物料行的报价供应商数量=0,供应商数量显示红色；0<物料行的报价供应商数量<最少报价供应商数量，供应商数量显示蓝色；物料行的报价供应商数量≥最少报价供应商数量,供应商数量显示绿色
    */
  renderSupplierQuotationInfo = (item) => {
    const { headerInfoDs, bidFlag } = this.props;
    const { supplierQuotedCount = null } = item || {};

    const { minQuotedSupplier } = headerInfoDs?.current
      ? headerInfoDs.current?.get(['minQuotedSupplier'])
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
      form: { getFieldDecorator },
      doubleUnitFlag = false,
      remote,
      headerInfoDs,
      sourceKey = INQUIRY,
      history,
    } = this.props;
    const chartFlag = 'i';
    const { expand } = this.state;
    // 在外层调用跳到指定位置
    this.scrollTo = scrollTo;
    const { taxIncludedFlag, taxRate } = item || {};

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
          'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_CODE_STYLE',
          {},
          {
            item,
            bidFlag: sourceKey === BID,
            headerInfoDs,
          }
        )
      : {};

    const headerMiddleComp = (
      <div className={styles.middleBox}>
        {remote
          ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_FIRST_TAG', null, {
              item,
              styles,
              headerInfoDs,
              bidFlag: sourceKey === BID,
              history,
            })
          : null}
        <Tag className={styles.line}>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{item.rfxLineItemNum}
        </Tag>
        <Tag className={styles.rfxQuantity}>
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
              'SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_LINE_LIST_WINED_AMOUNT_TAG',
              winedAmountTag,
              {
                item,
                className: styles.winedAmount,
              }
            )
          : winedAmountTag}
        {remote
          ? remote.process('SSRC_CHECK_PRICE_NEW_APPROVAL_PROCESS_ITEM_LINE_LIST_MORE_TAG', null, {
              item,
              styles,
              headerInfoDs,
            })
          : null}
      </div>
    );

    return (
      <div
        className={styles.container}
        onClick={(e) => this.clickCollapseChange(e, item, scrollTo)}
      >
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
          ? remote.render(
              'SSRC_CHECK_PRICE_NEW_APPROVAL_RENDER_ITEM_HEADER_MIDDLE',
              headerMiddleComp,
              {
                item,
                headerInfoDs,
                bidFlag: sourceKey === BID,
                styles,
                doubleUnitFlag,
              }
            )
          : headerMiddleComp}
        {this.renderSupplierQuotationInfo(item)}
        <div className={styles.rightBox} onClick={(e) => this.clickStrategy(e)}>
          <div className={styles['historical-low']}>
            <Tooltip
              title={this.renderHistoricalLowTip(item.priceLibHistoryDTO)}
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
          <Form.Item className={styles.selectedPolicyItemStyle}>
            {getFieldDecorator(`value#${item.rfxLineItemId}`, {
              initialValue: item.selectionStrategy === null ? undefined : item.selectionStrategy,
            })(
              <Select
                disabled
                allowClear
                size="small"
                className={styles.selectStyle}
                placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.strategy`).d('选择策略')}
              >
                {selectedPolicy &&
                  selectedPolicy.map((index) => (
                    <Option key={index.value} value={index.value}>
                      {index.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
        </div>
      </div>
    );
  }

  /**
   * [三生制药] 二开
   * @protected
   */
  // renderHeaderInfo1(item) {
  //   const {
  //     selectedPolicy = [],
  //     form: { getFieldDecorator },
  //     organizationId,
  //   } = this.props;
  //   const chartFlag = 'i';
  //   const { expand } = this.state;
  //   return (
  //     <div className={styles.itemList} onClick={(e) => this.clickCollapseChange(e, item)}>
  //       <div
  //         className={styles.itemListImg}
  //         onClick={(e) => this.openPriceCharts(e, chartFlag, item.rfxLineItemId)}
  //       >
  //         <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
  //       </div>
  //       <div className={styles.itemListHeaderInfo}>
  //         <div className={styles.itemListHeader}>
  //           <span className={styles.itemListNum}>
  //             {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
  //           </span>
  //           <span className={styles.itemListNumRight}>
  //             <Icon
  //               style={{ color: '#1D2129', margin: '0 4px' }}
  //               type={!expand[`${item.rfxLineItemId}`] ? 'down' : 'up'}
  //             />
  //           </span>
  //           <span className={styles.tagstyle}>
  //             <span className={styles.lineTagFlexContainer}>
  //               <Tag className={styles.line}>
  //                 {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
  //                 {item.rfxLineItemNum}
  //               </Tag>
  //               <Tag className={styles.rfxQuantity}>
  //                 <Tooltip title={`${item.rfxQuantity}（${item.uomName}）`}>
  //                   {item.rfxQuantity}（{item.uomName}）
  //                 </Tooltip>
  //               </Tag>
  //               {item.itemCategoryName ? (
  //                 <Tag className={styles.other}>{item.itemCategoryName}</Tag>
  //               ) : (
  //                 ''
  //               )}
  //               {item.quotationRange ? (
  //                 <Tag className={styles.other}>
  //                   {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
  //                   {item.quotationRange}
  //                 </Tag>
  //               ) : (
  //                 ''
  //               )}
  //               {item.taxRate ? (
  //                 <Tag className={styles.other}>
  //                   {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：
  //                   {item.taxRate}
  //                 </Tag>
  //               ) : (
  //                 <Tag className={styles.other}>
  //                   {intl.get(`ssrc.inquiryHall.model.inquiryHall.noTaxRate`).d('不含税')}
  //                 </Tag>
  //               )}
  //               {item.winedAmount ? (
  //                 <Tag color="rgba(71,184,129,0.20)" style={{ color: '#47B881' }}>
  //                   {`${
  //                     item.priceTypeCode === 'TAX_INCLUDED_PRICE'
  //                       ? intl.get('ssrc.inquiryHall.model.inquiryHall.taxIncluded').d('含税')
  //                       : intl.get('ssrc.inquiryHall.model.inquiryHall.untaxed').d('未税')
  //                   }`}
  //                   {intl.get('ssrc.inquiryHall.model.goods.acceptMoney').d('中标金额')}：
  //                   {`${item.winedAmount} ${item.currencyCode}`}
  //                 </Tag>
  //               ) : (
  //                 ''
  //               )}
  //             </span>
  //           </span>
  //           <span className={styles.itemListTag} onClick={(e) => this.clickStrategy(e)}>
  //             <Form.Item className={styles.selectedPolicyItemStyle}>
  //               {getFieldDecorator(`value#${item.rfxLineItemId}`, {
  //                 initialValue:
  //                   item.selectionStrategy === null ? undefined : item.selectionStrategy,
  //               })(
  //                 <Select
  //                   disabled
  //                   allowClear
  //                   size="small"
  //                   className={styles.selectStyle}
  //                   placeholder={intl
  //                     .get(`ssrc.inquiryHall.model.inquiryHall.strategy`)
  //                     .d('选择策略')}
  //                 >
  //                   {selectedPolicy &&
  //                     selectedPolicy.map((index) => (
  //                       <Option key={index.value} value={index.value}>
  //                         {index.meaning}
  //                       </Option>
  //                     ))}
  //                 </Select>
  //               )}
  //             </Form.Item>
  //           </span>
  //         </div>
  //         <p className={styles.itemListDes}>
  //           {item.attachmentUuid ? (
  //             <span onClick={(e) => this.clickStrategy(e)}>
  //               <Upload
  //                 filePreview
  //                 bucketName={PRIVATE_BUCKET}
  //                 bucketDirectory="ssrc-rfx-rfxitem"
  //                 attachmentUUID={item.attachmentUuid}
  //                 tenantId={organizationId}
  //                 viewOnly
  //                 btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
  //               />
  //             </span>
  //           ) : (
  //             <p className={styles.itemListDes}>
  //               <span style={{ width: '40px', display: 'inline-block' }} />
  //             </p>
  //           )}
  //           <span className={styles.itemListDesItem}>{item.itemRemark}</span>
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

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
    const { modelName = 'inquiryHall' } = this.props;
    const {
      headerList = [],
      organizationId,
      loading,
      [modelName]: { itemLinePagination },
      onChangePagination,
      form,
      hideModal,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      priceDataSource,
      supplierNameList,
      onHidePriceCharts,
      priceChartsvisible,
      itemChartsLoading,
      showQuotationDetail,
      customizeTable,
      rfxHeaderId,
      headerInfoDs,
      sourceKey = INQUIRY,
      doubleUnitFlag = false,
      onComparePriceHistory,
      remote,
      itemLinePageSize,
      batchSearchData,
      batchSearchDataKeys,
      openExpandAllFlag,
      searchPriceLoading,
      isPub,
      getAllTabTableCommonColumns,
      location,
    } = this.props;
    const { loadingObj, activePanel, expandAllFlag, clickAllFlag } = this.state;
    const priceChartsProps = {
      loading: itemChartsLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };
    const tableProps = {
      doubleUnitFlag,
      customizeTable,
      headerInfoDs,
      organizationId,
      form,
      loadingObj,
      onRef: (callKey, node) => {
        this.itemLineTable[callKey] = node;
      },
      sourceKey,
      viewLadderLevel,
      rfxHeaderId,
      showQuotationDetail,
      onComparePriceHistory,
      expandAllFlag,
      itemLineTable: this.itemLineTable,
      searchPriceLoading,
      clickAllFlag,
      isPub,
      getAllTabTableCommonColumns,
      location,
    };
    const ladderLevelModalProps = {
      doubleUnitFlag,
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
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
      <React.Fragment>
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
              changeCollapse: this.changeCollapse,
              lineKey: 'rfxLineItemId',
              renderLineTable: this.renderItemLineTable,
              pagesize: itemLinePageSize,
              batchSearchData,
              batchSearchDataKeys,
              expandAllFlag,
              tableMap: this.itemLineTable,
              openExpandAllFlag,
              getContainerRef: this.getContainerRef,
            }}
          />
          {total > 10 && (
            <Pagination
              className={styles.pagination}
              {...itemLinePagination}
              onChange={(page, pageSize) => onChangePagination(page, pageSize)}
              onShowSizeChange={(current, size) => onChangePagination(current, size)}
            />
          )}
        </Spin>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
        {priceChartsvisible && (
          <Modal {...modelProps}>
            <PriceCharts {...priceChartsProps} />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}

const HOCItemLineList = (Comp) =>
  compose(
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      fetchItemQuoteLineLoading: loading.effects['inquiryHall/fetchItemQuoteLine'],
      organizationId: getCurrentOrganizationId(),
    })),
    Form.create({ fieldNameProp: null })
  )(Comp);

export default HOCItemLineList(ItemLineList);

export { HOCItemLineList, ItemLineList };
