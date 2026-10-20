/**
 * EcProductQuery\index.js -集团电商商品查询
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import qs from 'querystring';

import { filterNullValueObject, getUserOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
// import cacheComponent from 'components/CacheComponent';
import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import TableList from './TableList';

@connect(({ ecProductQuery, loading }) => ({
  ecProductQuery, // state
  loading: loading.effects['ecProductQuery/fetchGoodsList'], // 请求loading
  previewLoading: loading.effects['ecProductQuery/fetchGoodsPreview'],
}))
/**
 * 多语言
 */
@formatterCollections({
  code: [
    'scec.ecProductQuery',
    'scec.common',
    'scec.goodsDemand',
    'scec.ecCategoryPlatformCatalog',
    'scec.ecCategoryCatalog',
    'scec.customBar',
  ],
})
export default class EcProductQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getUserOrganizationId(),
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

  /**
   * 清空数据
   */
  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecProductQuery/updateState',
      payload: {
        list: {},
        pagination: false,
        detail: {},
        enabledFlag: [],
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
    const { companyId, organizationId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecProductQuery/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        organizationId,
        companyId,
      },
    });
  }

  /**
   * 查询-映射状态值集
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecProductQuery/batchCode',
      payload: 'SCEC.MAPPING_STATUS',
    });
  }

  /**
   * 电商详情
   */
  @Bind
  preview(params) {
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

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  render() {
    const {
      ecProductQuery: { pagination = {}, list = {}, enabledFlag = [], detail = {} },
      loading,
      previewLoading,
    } = this.props;
    const { newStatus = [] } = this.state;
    const filterList = {
      status: newStatus,
      onRef: this.handleRef,
      enabledFlag,
      onFetchGoods: this.fetchGoodsList,
    };
    const tableList = {
      list,
      loading: loading || previewLoading,
      pagination,
      detail,
      preview: this.preview,
      onFetchGoods: this.fetchGoodsList,
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
