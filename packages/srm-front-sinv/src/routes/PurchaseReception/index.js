/**
 * index - 事务接收页面：接收入口
 * @date: 2019-1-28
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz';

import Search from './Search.js';
import List from './List.js';

/**
 * 事务接收入口界面
 *
 * @export
 * @class Reception - 入口界面
 * @extends {Component} - React.Component
 * @reactProps {object} purchaseReception - 数据源
 * @reactProps {boolean} fetchLoading - 获取数据状态
 * @reactProps {function} dispatch - redux dispatch
 * @returns React.element
 */
@withCustomize({
  unitCode: ['SINV.PURCHASE_RECEPTION.FILTER', 'SINV.PURCHASE_RECEPTION.LIST'],
})
@connect(({ loading, purchaseReception }) => ({
  fetchLoading: loading.effects['purchaseReception/fetchList'],
  fetchValueLoading: loading.effects['purchaseReception/fetchValue'],
  purchaseReception,
}))
@formatterCollections({
  code: [
    'sinv.purchaseReception',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
    'spfm.configServer',
    'small.groupGoodsManage',
    'sinv.inventoryInquiry',
  ],
})
export default class Reception extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      recordsURL: [],
      receiveOrderType: 'ASN',
    };
  }

  componentDidMount() {
    this.settingPage();
    // this.handleSearch();
  }

  @Bind()
  settingPage() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseReception/fetchValue',
    }).then(() => {
      this.handleSearch();
    });
  }

  /**
   * 查询表单请求
   * @params {object} page - 分页
   */
  @Bind()
  handleSearch(page = {}) {
    this.delDataSourceList();
    const { dispatch } = this.props;
    const fields = this.searchForm.props.form.getFieldsValue();
    const { receiveOrderType } = fields;
    this.setState({ selectedRows: [] });
    const timeFields = {
      fromExpectedArriveDate: fields.fromExpectedArriveDate
        ? moment(fields.fromExpectedArriveDate).format(DEFAULT_DATETIME_FORMAT)
        : null,
      toExpectedArriveDate: fields.toExpectedArriveDate
        ? moment(fields.toExpectedArriveDate).format(DEFAULT_DATETIME_FORMAT)
        : null,
    };
    dispatch({
      type: 'purchaseReception/fetchList',
      payload: {
        ...fields,
        page,
        ...timeFields,
        customizeUnitCode: 'SINV.PURCHASE_RECEPTION.LIST,SINV.PURCHASE_RECEPTION.FILTER',
      },
    }).then(() => {
      this.setState({ receiveOrderType });
    });
  }

  @Bind()
  delDataSourceList() {
    const {
      // purchaseReception: { dataSource, pagination },
      dispatch,
    } = this.props;
    dispatch({
      type: 'purchaseReception/updateState',
      payload: {
        dataSource: [],
        pagination: {},
      },
    });
  }

  /**
   * 点击接收预览
   * @memberof Reception
   */
  @Bind()
  handleReceptionPreview() {
    const { recordsURL, selectedRows, receiveOrderType } = this.state;
    const { dispatch } = this.props;
    // 校验勾选数据的送货单类型和供应商必须一致
    // const deliveryTypeList = [];
    // const supplierCompanyIdList = [];
    // let errorMsg = '';
    // for (const item of selectedRows) {
    //   deliveryTypeList.push(item.asnTypeCode);
    //   supplierCompanyIdList.push(item.supplierCompanyId);
    // }
    // const deliveryTypeNonuniformFlag = new Set(deliveryTypeList).size > 1;
    // const supplierIdNonuniformFlag = new Set(supplierCompanyIdList).size > 1;
    // if (deliveryTypeNonuniformFlag) {
    //   errorMsg += intl
    //     .get(`sinv.purchaseReception.view.message.notSameType`)
    //     .d('请勾选同一类型送货单进行接收');
    // }
    // if (supplierIdNonuniformFlag) {
    //   const temp = intl
    //     .get(`sinv.purchaseReception.view.message.notSameSupplier`)
    //     .d('请勾选来自同一供应商的送货单进行接收');
    //   errorMsg += errorMsg === '' ? temp : `\n${temp}`;
    // }
    // const validAccessFlag = !deliveryTypeNonuniformFlag && !supplierIdNonuniformFlag;
    // if (!validAccessFlag) {
    //   if (receiveOrderType === 'ASN') {
    //     notification.warning({ message: <pre>{errorMsg}</pre> });
    //   } else {
    //     notification.warning({
    //       message: intl
    //         .get(`sinv.purchaseReception.view.message.order`)
    //         .d('请勾选来自同一供应商的订单进行接收'),
    //     });
    //   }
    // } else {
    //   // send request
    //   let url = '';
    //   recordsURL.forEach(n => {
    //     url = `${url}${n}&`;
    //   });
    //   url = url.substring(0, url.length - 1);
    //   const { supplierName } = selectedRows[0];
    //   dispatch(
    //     routerRedux.push({
    //       pathname: `/sinv/purchase-reception/detail/${url}`,
    //       search: `?supplierName=${supplierName}&receiveOrderType=${receiveOrderType}`,
    //     })
    //   );
    // }
    dispatch({
      type: 'purchaseReception/receivingVerification',
      payload: {
        lineIds: recordsURL,
        receiveOrderType,
      },
    }).then((res) => {
      if (res) {
        let url = '';
        recordsURL.forEach((n) => {
          url = `${url}${n}&`;
        });
        url = url.substring(0, url.length - 1);
        const { supplierName } = selectedRows[0];
        dispatch(
          routerRedux.push({
            pathname: `/sinv/purchase-reception/detail/${url}`,
            search: `?supplierName=${supplierName}&receiveOrderType=${receiveOrderType}`,
          })
        );
      }
    });
  }

  /**
   * 选择行变化
   */
  @Bind()
  onSelectChange(record, selected, selectedRows) {
    const recordsURL = [];
    const { selectedRows: oldSelectedRows, receiveOrderType } = this.state;
    if (receiveOrderType === 'ASN') {
      const oldSelectedAsnLineIds = oldSelectedRows.map((item) => item.asnLineId);
      const filteredSelectedRows = selectedRows.length
        ? selectedRows.reduce((init, curr) => {
            if (selected && !oldSelectedAsnLineIds.includes(curr.asnLineId)) {
              oldSelectedAsnLineIds.push(curr.asnLineId);
              init.push(curr);
            } else if (selected === false) {
              return selectedRows;
            }
            return init;
          }, oldSelectedRows)
        : [];
      filteredSelectedRows.forEach((item) => {
        recordsURL.push(item.asnLineId);
      });
      this.setState({
        recordsURL: [...recordsURL],
        selectedRows: filteredSelectedRows,
      });
    } else {
      const oldSelectedAsnLineIds = oldSelectedRows.map((item) => item.poLineLocationId);
      const filteredSelectedRows = selectedRows.length
        ? selectedRows.reduce((init, curr) => {
            if (selected && !oldSelectedAsnLineIds.includes(curr.poLineLocationId)) {
              oldSelectedAsnLineIds.push(curr.poLineLocationId);
              init.push(curr);
            } else if (selected === false) {
              return selectedRows;
            }
            return init;
          }, oldSelectedRows)
        : [];
      filteredSelectedRows.forEach((item) => {
        recordsURL.push(item.poLineLocationId);
      });
      this.setState({
        recordsURL: [...recordsURL],
        selectedRows: filteredSelectedRows,
      });
    }
  }

  /**
   * 选择行变化
   */
  @Bind()
  onSelectAll(selected, selectedRows) {
    if (selected) {
      this.onSelectChange({}, selected, selectedRows);
    } else {
      this.setState({
        selectedRows,
      });
    }
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const { selectedRows, receiveOrderType } = this.state;
    const {
      purchaseReception: { dataSource, pagination, deliveryType, flagCode },
      fetchLoading,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const searchProps = {
      customizeFilterForm,
      onSearch: this.handleSearch,
      deliveryType,
      flagCode,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    const listProps = {
      customizeTable,
      receiveOrderType,
      loading: fetchLoading,
      tableData: dataSource,
      pagination,
      rowSelection: {
        selectedRowKeys:
          receiveOrderType === 'ASN'
            ? selectedRows.map((n) => n.asnLineId)
            : selectedRows.map((n) => n.poLineLocationId),
        onSelect: this.onSelectChange,
        onSelectAll: this.onSelectAll,
      },
      onChange: this.handleSearch,
    };
    return (
      <Fragment>
        <Header title={intl.get(`sinv.purchaseReception.view.message.title`).d('接收')}>
          <Button
            disabled={!selectedRows.length}
            type="primary"
            onClick={this.handleReceptionPreview}
          >
            <Icons type="main-receive-preview" style={{ marginRight: '8px' }} />
            {intl.get(`sinv.purchaseReception.view.message.receptionPreview`).d('接收预览')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
