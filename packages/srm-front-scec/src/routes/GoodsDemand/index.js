/**
 * GoodsDemand -商品查询
 * @date: 2019-2-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty, isArray } from 'lodash';

import intl from 'utils/intl';
import { SRM_SCEC } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getUserOrganizationId,
  getCurrentOrganizationId,
} from 'utils/utils';

import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import TableList from './TableList';

@connect(({ goodsDemand, loading }) => ({
  goodsDemand,
  loading: loading.effects['goodsDemand/fetchGoodsList'],
}))
@formatterCollections({ code: ['scec.goodsDemand', 'scec.common'] })
export default class GoodsDemand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  form;

  componentDidMount() {
    this.fetchGoodsList();
    this.batchCode();
  }

  /**
   * 更改状态的显示值级
   */
  @Bind()
  exchangeSourceType(params = []) {
    let changeParams = [];
    if (isArray(params) && params.length > 0) {
      changeParams = params.filter(item => {
        return item.value !== 'EDIT';
      });
    }
    return changeParams;
  }

  /**
   * 批量查询值级
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      status: 'SCEC.PRODUCT_OPERATION', // 状态
      sourceType: 'SCEC.PRODUCT_SOURCE', // 数据来源
    };
    dispatch({
      type: 'goodsDemand/batchCode',
      payload: lovCodes,
    }).then(() => {
      const {
        goodsDemand: { code = {} },
      } = this.props;
      const newStatus = this.exchangeSourceType(code.status);
      this.setState({
        newStatus,
      });
    });
  }

  /**
   * 查询已上架或未上架商品
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'goodsDemand/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        supplierTenantId: organizationId,
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  render() {
    const {
      goodsDemand: {
        pagination = {},
        list = {},
        code: { sourceType = [] },
      },
      loading,
    } = this.props;
    const { newStatus = [], tenantId, organizationId } = this.state;
    const filterList = {
      status: newStatus,
      sourceType,
      onRef: this.handleRef,
      onFetchGoods: this.fetchGoodsList,
    };
    const tableList = {
      list,
      loading,
      pagination,
      onFetchGoods: this.fetchGoodsList,
    };
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    return (
      <React.Fragment>
        <Header title={intl.get('scec.goodsDemand.view.goodsDemand.title').d('商品查询')}>
          <ExcelExport
            requestUrl={`${SRM_SCEC}/v1/${tenantId}/export-products`}
            queryParams={{
              ...filterValues,
              supplierTenantId: organizationId,
            }}
          />
        </Header>
        <Content>
          <FilterList {...filterList} />
          <TableList {...tableList} />
        </Content>
      </React.Fragment>
    );
  }
}
