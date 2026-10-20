import React, { PureComponent } from 'react';
import { Collapse, Tag, Select, Pagination, Spin, Form, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction, isNil } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Attachment } from 'choerodon-ui/pro';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import annexImg from '@/assets/item-icon.svg';
import styles from './index.less';
import ItemLineTable from './ItemLineTable';
import LadderLevel from '../../components/LadderLevel';
import PriceCharts from '../../components/PriceCharts';

const { Panel } = Collapse;
const { Option } = Select;

@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  fetchItemQuoteLineLoading: loading.effects['inquiryHall/fetchItemQuoteLine'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class ItemLineList extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'itemLineList');
    }
    this.state = {
      loadingObj: {},
      expand: {}, // 展开数据
      isShow: {}, // 数据是否查询显示
      updateState: false,
      rfxLineItemId: undefined, // 最后打开的rfxLineItemId
      activePanel: [], // 展开的panel
    };
    this.itemLineTable = {};
  }

  @Bind()
  changeCollapse(active) {
    this.setState({
      activePanel: active,
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

  // 在元素被渲染并写入 DOM 之前调用
  getSnapshotBeforeUpdate(preProps) {
    const {
      inquiryHall: { itemQuoteLine },
    } = this.props;
    const {
      inquiryHall: { itemQuoteLine: preLine },
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
    const { dispatch, organizationId, rfxHeaderId } = this.props;
    const loadingObj = {
      [rfxLineItemId]: { fetchItemQuoteLineLoading: true },
    };
    this.setState({ loadingObj });
    dispatch({
      type: 'inquiryHall/fetchItemQuoteLine',
      payload: {
        page,
        organizationId,
        rfxLineItemId,
        rfxHeaderId,
        customizeUnitCode: 'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
      },
    }).then((res) => {
      if (res) {
        this.setState({ loadingObj: { [rfxLineItemId]: { fetchItemQuoteLineLoading: false } } });
      }
    });
  }

  /**
   * 获取表格数据rfxLineItemId
   */
  @Bind()
  clickCollapseChange(e, item) {
    const { changeCurrentPaneActiveSelected } = this.props;
    const { expand, isShow } = this.state;
    if (!isShow[item.rfxLineItemId]) {
      this.fetchItemLineTableList({}, item.rfxLineItemId);
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
    });
    changeCurrentPaneActiveSelected([], item.rfxLineItemId);
  }

  /**
   * 物品明细-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineItemId) {
    const {
      dispatch,
      inquiryHall: { itemQuoteLine, itemQuoteLinePagination = {} },
    } = this.props;
    const { updateState } = this.state;
    // 改变分页，先把对应得rfxLineItemId得数据清空，再重新查询
    const newItemQuoteLine = itemQuoteLine.filter((item) => item.rfxLineItemId !== rfxLineItemId);
    delete itemQuoteLinePagination[rfxLineItemId];
    dispatch({
      type: 'inquiryHall/updateState',
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
      dispatch,
      inquiryHall: { itemLineChange = false, itemQuoteLine = [] },
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = itemQuoteLine.filter((r) => r.rfxLineItemId == rfxLineItemId);
    if (value !== 'RECOMMENDATION' && !isEmpty(newDataSource)) {
      newDataSource.forEach(
        (item) => item.$form && item.$form.setFieldsValue({ suggestedFlag: 0 })
      );
    }
    if (!itemLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          itemLineChange: true,
        },
      });
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
   * @param {*} node - react node
   */
  @Bind()
  handleRef(callKey, node) {
    this.itemLineTable[callKey] = node;
  }

  /**
   * 渲染历史最低价信息
   */
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
          <div>
            {intl
              .get('ssrc.inquiryHall.view.message.historyQuoteAnalysis')
              .d('（点击查看历史报价分析）')}
          </div>
        </React.Fragment>
      );
    } else {
      title = intl.get('ssrc.inquiryHall.model.inquiryHall.temporarilyNoData').d('暂无数据');
    }
    return title;
  }

  renderHeaderInfo(item = {}) {
    const {
      selectedPolicy = [],
      form: { getFieldDecorator },
      // organizationId,
    } = this.props;
    const chartFlag = 'i';
    const { expand } = this.state;
    const { taxIncludedFlag, taxRate } = item || {};

    return (
      <div className={styles.itemList} onClick={(e) => this.clickCollapseChange(e, item)}>
        <div
          className={styles.itemListImg}
          onClick={(e) => this.openPriceCharts(e, chartFlag, item.rfxLineItemId)}
        >
          <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
        </div>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <div className={styles.itemListHeaderTop}>
              <span className={styles.itemListNum}>
                <Tooltip
                  title={item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                >
                  {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                </Tooltip>
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  style={{ color: 'rgba(41, 190, 206, 1)', margin: '0 4px' }}
                  type={!expand[`${item.rfxLineItemId}`] ? 'down' : 'up'}
                />
              </span>
            </div>
            <div className={styles.itemListHeaderBottom}>
              {item.attachmentUuid ? (
                <span onClick={(e) => this.clickStrategy(e)}>
                  {/* <Upload
                    filePreview
                    bucketName="private-bucket"
                    bucketDirectory="ssrc-rfx-rfxitem"
                    attachmentUUID={item.attachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
                  /> */}
                  <Attachment
                    bucketName="private-bucket"
                    bucketDirectory="ssrc-rfx-rfxitem"
                    value={item.attachmentUuid}
                    viewMode="popup"
                    readOnly
                  />
                </span>
              ) : (
                <p className={styles.itemListDes}>
                  <span style={{ width: '40px', display: 'inline-block' }} />
                </p>
              )}
              <span className={styles.itemListDesItem}>{item.itemRemark}</span>
            </div>

            <span className={styles.tagstyle}>
              <Tag className={styles.line}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
                {item.rfxLineItemNum}
              </Tag>
              <Tag className={styles.rfxQuantity}>
                {item.rfxQuantity}（{item.uomName}）
              </Tag>
              {item.itemCategoryName ? (
                <Tag className={styles.other}>{item.itemCategoryName}</Tag>
              ) : (
                ''
              )}
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
            </span>
            <span className={styles.itemListTag} onClick={(e) => this.clickStrategy(e)}>
              <span className={styles['historical-low']}>
                <Tooltip title={this.renderHistoricalLowTip(item.priceLibHistoryDTO)}>
                  <a onClick={() => this.handleViewHistoryLow(item)}>
                    {intl.get('ssrc.inquiryHall.model.inquiryHall.historicalLow').d('历史最低价')}：
                    {item.priceLibHistoryDTO &&
                    (item.priceLibHistoryDTO.unitPrice || item.priceLibHistoryDTO.unitPrice === 0)
                      ? item.priceLibHistoryDTO.unitPrice
                      : intl.get('ssrc.inquiryHall.view.message.empty').d('暂无')}
                  </a>
                </Tooltip>
              </span>
              <Form.Item className={styles.selectedPolicyItemStyle}>
                {getFieldDecorator(`value#${item.rfxLineItemId}`, {
                  initialValue:
                    item.selectionStrategy === null ? undefined : item.selectionStrategy,
                })(
                  <Select
                    allowClear
                    disabled={item.eliminateRoundNumber === 1}
                    size="small"
                    className={styles.selectStyle}
                    onChange={(value) => this.changeTableData(value, item.rfxLineItemId)}
                    placeholder={intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.strategy`)
                      .d('选择策略')}
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
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      checkWay,
      headerList = [],
      organizationId,
      loading,
      inquiryHall: {
        itemQuoteLine = [],
        itemQuoteLinePagination = {},
        header = {},
        itemLinePagination,
      },
      onChangePagination,
      form,
      hideModal,
      viewLadderLevel,
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
      allottedQuantityChange,
      showQuotationDetail,
      changeCurrentPaneActiveSelected = () => {},
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [],
      itemLineTableSelectedKeys = [],
      changeItemLineTableSelection = () => {},
    } = this.props;
    const { loadingObj, activePanel } = this.state;
    const priceChartsProps = {
      loading: itemChartsLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };
    const tableProps = {
      customizeTable,
      header,
      checkWay,
      organizationId,
      form,
      loadingObj,
      onRef: this.handleRef,
      viewLadderLevel,
      fetchQuotationDetail,
      handleQuotationDetail,
      allottedQuantityChange,
      dataSource: itemQuoteLine,
      pagination: itemQuoteLinePagination,
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      showQuotationDetail,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
      changeItemLineTableSelection,
    };
    const ladderLevelModalProps = {
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
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={this.renderHeaderInfo(item)}
                  key={item.rfxLineItemId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  <ItemLineTable {...tableProps} rfxLineItemId={item.rfxLineItemId} />
                </Panel>
              ))}
          </Collapse>
        </Spin>
        <Pagination
          className={styles.pagination}
          {...itemLinePagination}
          onChange={(page, pageSize) => onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => onChangePagination(current, size)}
        />
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
