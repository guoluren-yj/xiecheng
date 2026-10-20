/**
 * EcPlatformProductQuery\index.js -平台电商商品查询
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import qs from 'querystring';

import { openTab } from 'utils/menuTab';
import { filterNullValueObject } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import TableList from './TableList';

// 解构model
@connect(({ ecPlatformProductQuery, loading }) => ({
  ecPlatformProductQuery, // state
  previewLoading: loading.effects['ecPlatformProductQuery/fetchGoodsPreview'],
  loading: loading.effects['ecPlatformProductQuery/fetchGoodsList'], // 请求loading
}))
/**
 * 多语言
 */
@formatterCollections({
  code: [
    'scec.ecPlatformProductQuery',
    'scec.common',
    'scec.ecCategoryPlatformCatalog',
    'scec.ecProductQuery',
  ],
})
@cacheComponent({ cacheKey: '/scec/ec-platform-product-query/list' })
export default class EcPlatformProductQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: '0',
      companyId: '-1',
    };
  }

  form;

  componentDidMount() {
    const {
      location: { state = { _back: 1 } },
    } = this.props;
    if (state && state._back !== -1) {
      this.clearData();
    }
  }

  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecPlatformProductQuery/updateState',
      payload: {
        list: {},
        pagination: false,
        enabledFlag: [],
        detail: {},
      },
    });
    this.batchCode();
  }

  /**
   * 查询
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch } = this.props;
    const { tenantId, companyId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecPlatformProductQuery/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        tenantId,
        companyId,
      },
    });
  }

  /**
   * 电商详情
   */
  @Bind
  preview(params = {}) {
    const { ecProductId, ecPlatformCode } = params;
    openTab({
      key: `/scec/commom-goods-preview`,
      title: intl.get('scec.common.button.goodsPreview').d('商品预览'),
      search: qs.stringify({
        productId: ecProductId,
        platformCode: ecPlatformCode,
      }),
    });
  }

  /**
   * 查询-映射状态值集
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecPlatformProductQuery/batchCode',
      payload: 'SCEC.MAPPING_STATUS',
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  render() {
    const {
      ecPlatformProductQuery: { pagination = {}, list = {}, enabledFlag = [], detail = {} },
      loading,
      previewLoading,
    } = this.props;
    const { newStatus = [], tenantId, companyId } = this.state;
    const filterList = {
      status: newStatus,
      onRef: this.handleRef,
      enabledFlag,
      tenantId,
      companyId,
      onFetchGoods: this.fetchGoodsList,
    };
    const tableList = {
      list,
      loading: previewLoading || loading,
      pagination,
      onFetchGoods: this.fetchGoodsList,
      preview: this.preview,
      detail,
    };
    return (
      <Fragment>
        <Header title={intl.get('scec.goodsDemand.view.goodsDemand.title').d('商品查询')} />
        <Content>
          <FilterList {...filterList} />
          <TableList {...tableList} />
        </Content>
      </Fragment>
    );
  }
}
