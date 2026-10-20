/**
 * ProductShelves -电商商品上下架
 * @date: 2019-12-25
 * @author lx<xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';

import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import TableList from './TableList';

@connect(({ productShelves, loading }) => ({
  productShelves,
  loading: loading.effects['productShelves/fetchShelvesList'],
  shelveLoading: loading.effects['productShelves/batchPutaway'],
}))
@formatterCollections({ code: ['scec.productShelves', 'scec.common'] })
export default class ProductShelves extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.findShelvesList();
  }

  /**
   * 查询商品
   * @param {object} params  查询参数
   */
  @Bind()
  findShelvesList(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'productShelves/fetchShelvesList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
      },
    });
    this.setState({
      selectedRows: [],
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  /**
   * 批量上架
   * @param {object} e 当前执行环境
   */
  @Bind()
  handBatchSheleve(params = {}) {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const param = [{ ...params }];
    dispatch({
      type: 'productShelves/batchPutaway',
      payload: isEmpty(params) ? selectedRows : param,
    }).then(res => {
      if (res) {
        this.findShelvesList();
        notification.success();
      }
    });
  }

  /**
   * 预览
   */
  @Bind()
  handlePreview(record) {
    const { dispatch } = this.props;
    const { ecClientId = '' } = record;
    dispatch({
      type: 'productShelves/fetchCompanyId',
      payload: { ecClientId },
    }).then(res => {
      if (res) {
        openTab({
          key: '/scec/commom-goods-preview',
          path: '/scec/commom-goods-preview',
          title: '商品预览',
          search: queryString.stringify({
            companyId: res,
            productId: record.ecProductId,
            platformCode: record.ecPlatForm,
          }),
        });
      }
    });
  }

  /**
   * 数据勾选
   */
  @Bind()
  handlerRowSelect(_, selectedRows) {
    const select = selectedRows[0] && selectedRows[0].tntShelfFlag;
    this.setState({
      selectedRows: selectedRows.filter(item => item.tntShelfFlag === select),
    });
  }

  render() {
    const { selectedRows } = this.state;
    const select = selectedRows[0] && selectedRows[0].tntShelfFlag;
    const {
      loading,
      shelveLoading,
      productShelves: { list = {}, pagination = {} },
    } = this.props;
    const filterList = {
      onRef: this.handleRef,
      onFetchGoods: this.findShelvesList,
    };
    const tableList = {
      list,
      select,
      loading,
      pagination,
      selectedRows,
      handlePreview: this.handlePreview,
      onFetchGoods: this.findShelvesList,
      handlerRowSelect: this.handlerRowSelect,
      handBatchSheleve: this.handBatchSheleve,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.productShelves.view.productShelves.title').d('电商商品上下架')}
        >
          <Button
            loading={select !== undefined && !select && shelveLoading}
            disabled={select !== 0}
            onClick={() => {
              this.handBatchSheleve();
            }}
          >
            {intl.get('scec.goodsShare.view.button.batch').d('上架')}
          </Button>
          <Button
            loading={select !== undefined && select && shelveLoading}
            disabled={select !== 1}
            onClick={() => {
              this.handBatchSheleve();
            }}
          >
            {intl.get('scec.goodsShare.view.button.batch').d('下架')}
          </Button>
        </Header>
        <Content>
          <FilterList {...filterList} />
          <TableList {...tableList} />
        </Content>
      </React.Fragment>
    );
  }
}
