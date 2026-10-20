import React, { Component } from 'react';
import { Collapse, Tag, Pagination, Spin, Form, Modal, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { difference, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import annexImg from '@/assets/item-icon.svg';
import { PRIVATE_BUCKET } from '_utils/config';
import { INQUIRY } from '@/utils/globalVariable';
import styles from './index.less';
import ItemLineTable from './ItemLineTable';
import LadderLevel from '../../components/LadderLevelDoubleUnit';
import PriceCharts from '../../components/PriceCharts';

const { Panel } = Collapse;

@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  fetchItemQuoteLineLoading: loading.effects['inquiryHall/fetchItemQuoteLine'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class ItemLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      prevOpenKeys: [], // 之前打开的 Pane
      loadingObj: {},
      updateState: false,
      expand: {},
      rfxLineItemId: undefined, // 最后打开的rfxLineItemId
    };
    this.itemLineTable = {};
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

  componentDidUpdate(preProps, preState, snap) {
    const {
      inquiryHall: { itemQuoteLine },
    } = this.props;
    const { rfxLineItemId = undefined } = this.state;
    if (snap !== null) {
      if (!isEmpty(itemQuoteLine)) {
        let wholePackageList = {};
        const selectedItemQuoteLine = itemQuoteLine.filter(
          // eslint-disable-next-line
          (item) => item.rfxLineItemId == rfxLineItemId
        );
        selectedItemQuoteLine.forEach((item) => {
          wholePackageList = {
            ...wholePackageList,
            [`${item.quotationLineId}#${item.rfxLineItemId}`]: item.$form?.getFieldValue(
              'suggestedFlag'
            ),
          };
        });
        this.itemLineTable[rfxLineItemId].setState({
          suggestedFlagValue: {
            ...this.itemLineTable[rfxLineItemId].state.suggestedFlagValue,
            ...wholePackageList,
          },
        });
      }
    }
  }

  /**
   *
   * @param {string[]} openKeys - 新打开的 Pane
   */
  @Bind()
  clickCodllapseChange(openKeys) {
    const {
      dispatch,
      inquiryHall: { itemQuoteLine = [], itemQuoteLinePagination = {} },
    } = this.props;
    const { prevOpenKeys = [] } = this.state;
    const newOpenKeys = difference(openKeys, prevOpenKeys);
    if (isEmpty(newOpenKeys)) {
      // 关闭 Pane
      const closeKeys = difference(prevOpenKeys, openKeys);
      if (!isEmpty(itemQuoteLine)) {
        const newItemQuoteLine = itemQuoteLine.filter(
          (item) => item.rfxLineItemId !== closeKeys[0]
        );
        delete itemQuoteLinePagination[closeKeys[0]];
        dispatch({
          type: 'inquiryHall/updateState',
          payload: { itemQuoteLine: newItemQuoteLine, itemQuoteLinePagination },
        });
      }
    } else {
      // 打开新的 Pane
      this.fetchItemLineTableList({}, newOpenKeys[0]);
      this.setState({ rfxLineItemId: newOpenKeys[0] });
    }
    this.setState({ prevOpenKeys: openKeys });
  }

  /**
   * 获取表格数据rfxLineItemId
   */
  @Bind()
  clickCollapseChange(e, item) {
    const {
      dispatch,
      inquiryHall: { itemQuoteLine = [], itemQuoteLinePagination = {} },
    } = this.props;
    const { expand } = this.state;
    if (!expand[item.rfxLineItemId]) {
      this.fetchItemLineTableList({}, item.rfxLineItemId);
      this.setState({ rfxLineItemId: item.rfxLineItemId });
    } else if (!isEmpty(itemQuoteLine)) {
      const newItemQuoteLine = itemQuoteLine.filter((a) => a.rfxLineItemId !== item.rfxLineItemId);
      delete itemQuoteLinePagination[item.rfxLineItemId];
      dispatch({
        type: 'inquiryHall/updateState',
        payload: { itemQuoteLine: newItemQuoteLine, itemQuoteLinePagination },
      });
    }
    this.setState({
      expand: {
        ...expand,
        [item.rfxLineItemId]: !expand[item.rfxLineItemId],
      },
    });
  }

  /**
   * 获取表格数据
   */
  @Bind()
  fetchItemLineTableList(page = {}, rfxLineItemId) {
    const { dispatch, organizationId, rfxHeaderId, sourceKey = INQUIRY } = this.props;
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
        customizeUnitCode: `SSRC.${sourceKey}_HALL_PRETRIAL.ITEM_DETAIL`,
      },
    }).then((res) => {
      if (res) {
        this.setState({ loadingObj: { [rfxLineItemId]: { fetchItemQuoteLineLoading: false } } });
      }
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

  renderHeaderInfo(item) {
    const chartFlag = 'i';
    const { organizationId, doubleUnitFlag } = this.props;
    const { expand } = this.state;
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
            <span className={styles.itemListNum}>
              {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
            </span>
            <span className={styles.itemListNumRight}>
              <Icon
                className={styles.arrowIcon}
                type={!expand[`${item.rfxLineItemId}`] ? 'down' : 'up'}
              />
            </span>
            <span className={styles.tagstyle}>
              <Tag className={styles.line}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：
                {item.rfxLineItemNum}
              </Tag>
              <Tag className={styles.rfxQuantity}>
                {doubleUnitFlag ? item.secondaryQuantity : item.rfxQuantity}（
                {doubleUnitFlag ? item.secondaryUomName : item.uomName}）
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
              <Tag className={styles.other}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：
                {item.taxRate}
              </Tag>
            </span>
          </div>
          <p className={styles.itemListDes}>
            {item.attachmentUuid ? (
              <span onClick={(e) => this.clickStrategy(e)}>
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-rfxitem"
                  attachmentUUID={item.attachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  btnText={intl.get('hzero.common.upload.modal.title').d('附件')}
                  filePreview
                />
              </span>
            ) : (
              <p className={styles.itemListDes}>
                <span style={{ width: '40px', display: 'inline-block' }} />
              </p>
            )}
            <span className={styles.itemListDesItem}>{item.itemRemark}</span>
          </p>
        </div>
      </div>
    );
    // return (
    //   <div className={styles.itemList}>
    //     <div
    //       className={styles.itemListImg}
    //       onClick={e => this.openPriceCharts(e, chartFlag, item.rfxLineItemId)}
    //     >
    //       <img src={annexImg} alt="" style={{ width: 44, height: 44 }} />
    //     </div>
    //     <div className={styles.itemListHeaderInfo}>
    //       <div className={styles.itemListHeader}>
    //         <span className={styles.itemListNum}>
    //           {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
    //         </span>
    //         <Tag>
    //           {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{item.rfxLineItemNum}
    //         </Tag>
    //         {item.itemCategoryName ? <Tag>{item.itemCategoryName}</Tag> : ''}
    //         <Tag>
    //           {item.rfxQuantity}（{item.uomName}）
    //         </Tag>
    //         <Tag>
    //           {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}：
    //           {item.quotationRange}
    //         </Tag>
    //         <Tag>
    //           {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate(%)`).d('税率（%）')}：
    //           {item.taxRate}
    //         </Tag>
    //         <div style={{ clear: 'both' }} />
    //       </div>
    //       <p className={styles.itemListDes}>
    //         <span className={styles.itemListDesItem} onClick={e => this.clickStrategy(e)}>
    //           {item.attachmentUuid && (
    //             <Upload
    //               bucketName="ssrc-rfx-rfxitem"
    //               attachmentUUID={item.attachmentUuid}
    //               tenantId={organizationId}
    //               icon="download"
    //               viewOnly
    //             />
    //           )}
    //         </span>
    //         <span className={styles.itemListDesItem}>{item.itemRemark}</span>
    //       </p>
    //     </div>
    //   </div>
    // );
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
      customizeTable,
      sourceKey = INQUIRY,
      doubleUnitFlag,
      newQuotationFlag = 0,
    } = this.props;
    const priceChartsProps = {
      loading: itemChartsLoading,
      // loading: chartsLoading,
      priceDataSource,
      supplierNameList,
    };
    const { loadingObj } = this.state;
    const tableProps = {
      header,
      organizationId,
      form,
      loadingObj,
      sourceKey,
      viewLadderLevel,
      onRef: (callKey, node) => {
        this.itemLineTable[callKey] = node;
      },
      dataSource: itemQuoteLine,
      pagination: itemQuoteLinePagination,
      onChange: this.changePagination,
      customizeTable,
      doubleUnitFlag,
      newQuotationFlag,
    };
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
      doubleUnitFlag,
    };
    const modalProps = {
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
          <Collapse bordered={false}>
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
          <Modal {...modalProps}>
            <PriceCharts {...priceChartsProps} />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
