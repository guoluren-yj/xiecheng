/**
 * EcCompanyProductQuery\index.js -公司电商商品查询
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import qs from 'querystring';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import FilterList from './FilterList';
import TableList from './TableList';

// const { Option } = Select;

@connect(({ ecCompanyProductQuery, loading }) => ({
  ecCompanyProductQuery,
  previewLoading: loading.effects['ecCompanyProductQuery/fetchGoodsPreview'],
  loading: loading.effects['ecCompanyProductQuery/fetchGoodsList'],
}))
/**
 * 多语言
 */
@formatterCollections({ code: ['scec.ecCompanyProductQuery', 'scec.common, scec.ecProductQuery'] })
@Form.create({ fieldNameProp: null }) // 当前公司form
@cacheComponent({ cacheKey: '/scec/ec-company-product-query/list' })
export default class EcCompanyProductQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      ecPlatformCode: '',
    };
  }

  form;

  componentDidMount() {
    const {
      location: { state = { _back: 1 } },
    } = this.props;
    if (state && state._back !== -1) {
      this.batchCode();
      this.clearData();
      this.form.resetFields();
      this.fetchCurrentCompanyValue();
    }
  }

  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCompanyProductQuery/updateState',
      payload: {
        list: {},
        pagination: false,
        detail: {}, // 商品详情
        currentCompany: [],
      },
    });
  }

  /**
   * 查询-当前公司值集
   */
  @Bind()
  fetchCurrentCompanyValue() {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'ecCompanyProductQuery/fetchCurrentCompanyValue',
      payload: {
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        tenantId: organizationId,
      },
    });
    // .then(res => {
    // if (res) {
    //   this.setState({
    //     companyId: this.props.form.getFieldValue('companyId') || (res[0] || {}).companyId,
    //     companyName: this.props.form.getFieldValue('companyName') || (res[0] || {}).companyName,
    //   });
    // }
    // });
  }

  /**
   * 查询
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { organizationId } = this.state;
    const { dispatch } = this.props;
    const companyId = this.props.form.getFieldValue('companyId') || '';
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecCompanyProductQuery/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        organizationId,
        companyId,
      },
    }).then(
      this.setState({
        ecPlatformCode: fieldValues.ecPlatformCode,
      })
    );
  }

  /**
   * 查询-映射状态值集
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCompanyProductQuery/batchCode',
      payload: 'SCEC.MAPPING_STATUS',
    });
  }

  /**
   * 电商详情
   */
  @Bind
  preview(productId) {
    const { ecPlatformCode } = this.state;
    openTab({
      key: '/scec/commom-goods-preview',
      title: intl.get('scec.common.button.goodsPreview').d('商品预览'),
      search: qs.stringify({
        productId,
        platformCode: ecPlatformCode,
      }),
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref || {}).props.form;
  }

  /**
   * 选择公司值集
   */
  @Bind()
  handleOnChange() {
    this.clearData();
    this.form.resetFields();
  }

  render() {
    const {
      ecCompanyProductQuery: {
        pagination = {},
        list = {},
        enabledFlag = [],
        currentCompany = [],
        detail = {},
      },
      form: { getFieldDecorator, getFieldValue },
      loading,
      previewLoading,
    } = this.props;
    const { newStatus = [] } = this.state;
    const filterList = {
      status: newStatus,
      onRef: this.handleRef,
      enabledFlag,
      onFetchGoods: this.fetchGoodsList,
      companyId: getFieldValue('companyId'),
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
        <Header title={intl.get('scec.goodsDemand.view.goodsDemand.title').d('商品查询')}>
          <Form layout="inline" style={{ display: 'inline-block', lineHeight: '39px' }}>
            <Form.Item
              label={intl
                .get('scec.companyBanner.model.companyBanner.the.current.company')
                .d('当前公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: currentCompany[0] && currentCompany[0].companyId,
              })(
                // <Select style={{ width: '170px' }} onChange={this.handleOnChange}>
                //   {currentCompany.map(item => (
                //     <Option key={item.companyId} value={item.companyId}>
                //       {item.companyName}
                //     </Option>
                //   ))}
                // </Select>
                <Lov
                  allowClear={false}
                  textField="companyName"
                  textValue={currentCompany[0] && currentCompany[0].companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={this.handleOnChange}
                />
              )}
            </Form.Item>
          </Form>
        </Header>
        <Content>
          <FilterList {...filterList} />
          <TableList {...tableList} />
        </Content>
      </Fragment>
    );
  }
}
