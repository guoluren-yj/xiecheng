import React, { Component } from 'react';
import { Collapse, Pagination, Spin, Form, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import ItemLineTable from './ItemLineTable';

const { Panel } = Collapse;

@connect(({ inquiryHall }) => ({
  inquiryHall,
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
      updateState: false,
    };
    this.itemLineTable = {};
  }

  /**
   * 物品明细-分页改变
   */
  @Bind()
  changePagination(page = {}, rfxLineItemId) {
    const {
      dispatch,
      fetchItemLineTableList = () => {},
      inquiryHall: { eliItemLine = [], eliItemLinePagination = {} },
      cacheItemLineTableMap,
      itemLineTableSelectedKeys,
      setCacheDetailLineTableData,
      remote,
      bidFlag,
      header,
    } = this.props;
    const { updateState } = this.state;

    const commonHandlePageinationChange = () => {
      if (isFunction(setCacheDetailLineTableData)) {
        const sourceEliItemLine = eliItemLine.filter(item => item?.rfxLineItemId === rfxLineItemId);
        // 缓存数据
        setCacheDetailLineTableData({
          key: rfxLineItemId,
          pageData: sourceEliItemLine,
          selectKeys: itemLineTableSelectedKeys,
          cacheLineTableMap: cacheItemLineTableMap,
        });
      }
  
      // 改变分页，先把对应得rfxLineItemId得数据清空，再重新查询
      const newItemQuoteLine = eliItemLine.filter((item) => item.rfxLineItemId !== rfxLineItemId);
      delete eliItemLinePagination[rfxLineItemId];
      dispatch({
        type: 'inquiryHall/updateState',
        payload: { eliItemLine: newItemQuoteLine, eliItemLinePagination },
      });
      this.setState({ updateState: true }, () => {
        fetchItemLineTableList(page, rfxLineItemId, updateState);
      });
    };

    const eventProps = {
      page,
      rfxLineItemId,
      that: this,
      bidFlag,
      commonHandlePageinationChange,
      tableFlag: 1,
      table: "item",
      fetchItemLineTableList,
      itemLineTableSelectedKeys,
      header,
    };

    if (remote?.event) {
      remote.event.fireEvent('remoteItemTableListPaginationChange', eventProps);
    } else {
      commonHandlePageinationChange();
    }
  }

  /**
   * 物品明细-表格内容改变
   * 选择非供应商推荐的时候，清空选用
   */
  @Bind()
  changeTableData(value, rfxLineItemId) {
    const {
      dispatch,
      inquiryHall: { itemLineChange = false, eliItemLine = [] },
    } = this.props;
    // eslint-disable-next-line
    const newDataSource = eliItemLine.filter((r) => r.rfxLineItemId == rfxLineItemId);
    if (!itemLineChange) {
      dispatch({
        type: 'inquiryHall/updateState',
        payload: {
          itemLineChange: true,
        },
      });
    }
  }

  renderHeaderInfo(item) {
    const { clickCollapseItemChange = () => {}, expandItem } = this.props;
    return (
      <div className={styles.itemList} onClick={(e) => clickCollapseItemChange(e, item)}>
        <div className={styles.itemListHeaderInfo}>
          <div className={styles.itemListHeader}>
            <div className={styles.itemListHeaderTop}>
              <span className={styles.itemListNum}>
                {item.itemCode ? `${item.itemCode}-${item.itemName}` : item.itemName}
              </span>
              <span className={styles.itemListNumRight}>
                <Icon
                  className={styles.arrowIcon}
                  type={!expandItem[`${item.rfxLineItemId}`] ? 'down' : 'up'}
                />
              </span>
              <span className={styles.tagstyle}>
                {intl.get('ssrc.inquiryHall.view.message.rfxQuantity').d('最低报价金额:')}
                <span className={styles.rfxQuantity}>{item.minPrice}</span>
              </span>
            </div>
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
        eliItemLine = [], // 淘汰物料行
        eliItemLinePagination = {},
        eliItemDetailPagination = {},
      },
      onChangePagination,
      form,
      allottedQuantityChange,
      changeCurrentPaneActiveSelected = () => {},
      currentPaneActiveSelected = {},
      itemLineTableSelectedRows = [],
      itemLineTableSelectedKeys = [],
      changeItemLineTableSelection = () => {},
      changeItemCollapse = () => {},
      collapseItemLineActiveKeys,
      loadingItemObj,
      priceTypeCode,
      doubleUnitFlag,
      remote,
      bidFlag,
      header,
    } = this.props;
    const tableProps = {
      remote,
      bidFlag,
      checkWay,
      organizationId,
      form,
      onRef: (callKey, node) => {
        this.itemLineTable[callKey] = node;
      },
      allottedQuantityChange,
      dataSource: eliItemLine,
      pagination: eliItemLinePagination,
      onChange: this.changePagination,
      onChangeTableData: this.changeTableData,
      changeCurrentPaneActiveSelected,
      currentPaneActiveSelected,
      itemLineTableSelectedRows,
      itemLineTableSelectedKeys,
      changeItemLineTableSelection,
      loadingItemObj,
      priceTypeCode,
      doubleUnitFlag,
      header,
    };

    return (
      <React.Fragment>
        <Spin spinning={loading}>
          <Collapse
            bordered={false}
            activeKey={collapseItemLineActiveKeys}
            onChange={changeItemCollapse}
          >
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
          {...eliItemDetailPagination}
          onChange={(page, pageSize) => onChangePagination(page, pageSize)}
          onShowSizeChange={(current, size) => onChangePagination(current, size)}
        />
      </React.Fragment>
    );
  }
}
