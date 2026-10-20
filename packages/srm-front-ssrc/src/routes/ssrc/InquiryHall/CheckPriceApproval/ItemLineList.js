import React, { Component } from 'react';
import { Collapse, Tag, Select, Pagination, Spin, Form, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, compose, isNil } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import annexImg from '@/assets/item-icon.svg';
import { PRIVATE_BUCKET } from '_utils/config';
import { INQUIRY } from '@/utils/globalVariable';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import styles from './index.less';
import ItemLineTable from './ItemLineTable';
import LadderLevel from '../../components/LadderLevel';
import PriceCharts from '../../components/PriceCharts';

const { Panel } = Collapse;
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
      updateState: false,
      rfxLineItemId: undefined, // 最后打开的rfxLineItemId
    };
    this.itemLineTable = {};
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

  /**
   * 获取表格数据
   */
  @Bind()
  fetchItemLineTableList(page = {}, rfxLineItemId) {
    const { dispatch, organizationId, header = {}, sourceKey = INQUIRY } = this.props;
    const { rfxHeaderId } = header;
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
        customizeUnitCode: `SSRC.${sourceKey}_HALL_CHECK_PRICE.TAB_ITEM_DTL`,
        checkApproveFlag: 1,
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
    const newItemQuoteLine = itemQuoteLine.filter((item) => +item.rfxLineItemId !== rfxLineItemId);
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

  renderHeaderInfo(item) {
    const {
      selectedPolicy = [],
      form: { getFieldDecorator },
      organizationId,
    } = this.props;
    const chartFlag = 'i';
    const { expand } = this.state;
    const { taxIncludedFlag, taxRate } = item || {};

    return (
      <div className={styles.container} onClick={(e) => this.clickCollapseChange(e, item)}>
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
                  <div className={styles.leftBoxTitle}>
                    {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
                  </div>
                </Tooltip>
              </span>
              <Icon
                style={{ color: 'rgba(41, 190, 206, 1)', margin: '0 4px' }}
                type={!expand[`${item.rfxLineItemId}`] ? 'down' : 'up'}
              />
            </div>
            <div onClick={(e) => this.clickStrategy(e)} style={{ display: 'flex' }}>
              {item.attachmentUuid ? (
                <span onClick={(e) => this.clickStrategy(e)}>
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-rfxitem"
                    attachmentUUID={item.attachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    btnText={intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
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
        <div className={styles.middleBox}>
          <Tag className={styles.line}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
            {item.rfxLineItemNum}
          </Tag>
          <Tag className={styles.rfxQuantity}>
            <Tooltip title={`${item.rfxQuantity}（${item.uomName}）`} placement="topLeft">
              {item.rfxQuantity}（{item.uomName}）
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
          {item.winedAmount ? (
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
          )}
        </div>
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

  @Bind()
  renderTable(tableProps, rfxLineItemId) {
    return <ItemLineTable {...tableProps} rfxLineItemId={rfxLineItemId} />;
  }

  render() {
    const {
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
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      priceDataSource,
      supplierNameList,
      onHidePriceCharts,
      priceChartsvisible,
      itemChartsLoading,
      showQuotationDetail,
      customizeTable,
      sourceKey = INQUIRY,
      onComparePriceHistory,
      remote,
    } = this.props;
    const { loadingObj } = this.state;
    const priceChartsProps = {
      loading: itemChartsLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };
    const tableProps = {
      customizeTable,
      header,
      organizationId,
      form,
      loadingObj,
      onRef: (callKey, node) => {
        this.itemLineTable[callKey] = node;
      },
      sourceKey,
      viewLadderLevel,
      showQuotationDetail,
      dataSource: itemQuoteLine,
      pagination: itemQuoteLinePagination,
      onChange: this.changePagination,
      onComparePriceHistory,
      remote,
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
    const { total = 0 } = itemLinePagination || {};
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse bordered={false}>
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={this.renderHeaderInfo(item)}
                  key={item.rfxLineItemId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  {this.renderTable(tableProps, item.rfxLineItemId)}
                </Panel>
              ))}
          </Collapse>
        </Spin>
        {total > 10 && (
          <Pagination
            className={styles.pagination}
            {...itemLinePagination}
            onChange={(page, pageSize) => onChangePagination(page, pageSize)}
            onShowSizeChange={(current, size) => onChangePagination(current, size)}
          />
        )}
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
