import React, { Component } from 'react';
import { Collapse, Pagination, Spin, Form, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, join } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import SupplierLineTable from './SupplierLineTable';

const { Panel } = Collapse;
@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  organizationId: getCurrentOrganizationId(),
  loading: loading.effects['inquiryHall/fetchElSupplierDetail'],
}))
@Form.create({ fieldNameProp: null })
export default class SupplierLineList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      updateState: false,
    };
    this.supplierLineTable = {}; // 初始化this.supplierLineTable为对象
  }

  /**
   * 点击头标签-停止折叠面板冒泡行为
   */
  @Bind()
  rfxLineTag(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 供应商列表-表格内容改变
   */
  @Bind()
  changeTableData() {
    const {
      dispatch,
      inquiryHall: { supplierLineChange = false },
    } = this.props;
    if (!supplierLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          supplierLineChange: true,
        },
      });
    }
  }

  /**
   * 供应商-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineSupplierId) {
    const {
      dispatch,
      fetchSupplierLineTableList = () => {},
      inquiryHall: { eliSupplierLine, supplierQuoteLinePagination = {} },
      cacheSupplierLineTableMap,
      supplierLineTableSelectedKeys=[],
      setCacheDetailLineTableData,
      remote,
      bidFlag,
      header,
    } = this.props;
    const { updateState } = this.state;

    const commonHandlePageinationChange = () => {
      if (isFunction(setCacheDetailLineTableData)) {
        const sourceEliSupplierLine = eliSupplierLine.filter(item => item?.rfxLineSupplierId === rfxLineSupplierId);
        // 缓存数据
        setCacheDetailLineTableData({
          key: rfxLineSupplierId,
          pageData: sourceEliSupplierLine,
          selectKeys: supplierLineTableSelectedKeys,
          cacheLineTableMap: cacheSupplierLineTableMap,
        });
      }

      // 改变分页，先把对应得rfxLineSupplierId得数据清空，再重新查询
      const newSupplierQuoteLine = eliSupplierLine.filter(
        (item) => +item.rfxLineSupplierId !== rfxLineSupplierId
      );
      delete supplierQuoteLinePagination[rfxLineSupplierId];
      dispatch({
        type: 'inquiryHall/updateState',
        payload: { eliSupplierLine: newSupplierQuoteLine, supplierQuoteLinePagination },
      });
      this.setState({ updateState: true }, () => {
        fetchSupplierLineTableList(page, rfxLineSupplierId, updateState);
      });
    };

    const eventProps = {
      page,
      rfxLineSupplierId,
      that: this,
      bidFlag,
      commonHandlePageinationChange,
      tableFlag: 1,
      table: "supplier",
      fetchSupplierLineTableList,
      supplierLineTableSelectedKeys,
      header,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteSupplierTableListPaginationChange', eventProps);
    } else {
      commonHandlePageinationChange();
    }
  }

  suggestedRemarkRef;

  renderHeaderInfo(item) {
    const { clickCollapseSupplierChange = () => {}, expandSupplier } = this.props;
    return (
      <div className={styles.itemList} onClick={(e) => clickCollapseSupplierChange(e, item)}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <div className={styles.itemListHeaderTop}>
              <div className={styles.itemListHeaderTop}>
                <span className={styles.itemListNum}>
                  {item.supplierCompanyNum
                    ? `${item.supplierCompanyNum}-${item.supplierCompanyName}`
                    : item.supplierCompanyName}
                </span>
                <span className={styles.itemListNumRight}>
                  <Icon
                    className={styles.arrowIcon}
                    type={!expandSupplier[`${item.rfxLineSupplierId}`] ? 'down' : 'up'}
                  />
                </span>
                <span className={styles.tagstyle}>
                  {intl
                    .get('ssrc.inquiryHall.model.inquiryHall.totalQuotaionAmount')
                    .d('报价总金额:')}
                  <span className={styles.rfxQuantity}>{item.supplierTotalAmount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      headerList = [],
      organizationId,
      loading,
      inquiryHall: {
        eliSupplierLine = [], // 淘汰供应商行
        eliSupplierLinePagination = {},
        eliSupplierDetailPagination = {},
      },
      header = {},
      onChangePagination,
      form,
      customizeTable,
      viewLadderLevel,
      changeCurrentPaneActiveSelected = () => {},
      changeSupplierLineTableSelection = () => {},
      changeSupplierCollapse = () => {},
      currentPaneActiveSelected = {},
      supplierLineTableSelectedKeys = [],
      supplierLineTableSelectedRows = [],
      collapseSupplierActiveKeys,
      loadingSupplierObj = {},
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
    } = this.props;
    const tableProps = {
      header,
      organizationId,
      form,
      loadingSupplierObj,
      customizeTable,
      viewLadderLevel,
      dataSource: eliSupplierLine,
      pagination: eliSupplierLinePagination,
      onRef: (calKey, node) => {
        this.supplierLineTable[calKey] = node; // 对应的[rfxLineSupplierId]的supplierLineTable
      },
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      supplierLineTableSelectedKeys,
      supplierLineTableSelectedRows,
      changeSupplierLineTableSelection,
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
    };
    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse
            bordered={false}
            activeKey={collapseSupplierActiveKeys}
            onChange={changeSupplierCollapse}
          >
            {headerList &&
              headerList.map((item) => (
                <Panel
                  header={this.renderHeaderInfo(item)}
                  key={item.rfxLineSupplierId}
                  className={styles.arrowStyle}
                  showArrow={false}
                >
                  <SupplierLineTable {...tableProps} rfxLineSupplierId={item.rfxLineSupplierId} />
                </Panel>
              ))}
          </Collapse>
        </Spin>
        <Pagination
          className={styles.pagination}
          {...eliSupplierDetailPagination}
          onChange={(page, pageSize) => onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => onChangePagination(current, size)}
        />
      </React.Fragment>
    );
  }
}
