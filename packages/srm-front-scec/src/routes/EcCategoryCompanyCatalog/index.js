/**
 * ecCategoryCompanyCatalog -电商分类映射公司目录
 * @date: 2019-1-30
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import cacheComponent from 'components/CacheComponent';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import CatalogMapSearch from './CatalogMapSearch';
import CategoryCompanyCatalog from './CategoryCompanyCatalog';

const FormItem = Form.Item;
@formatterCollections({
  code: [
    'scec.ecCategoryCompanyCatalog',
    'scec.ecCategoryPlatformCatalog',
    'scec.ecPlatformCategory',
    'scec.ecCompanyCatalog',
    'scec.common',
    'scec.ecCategoryCatalog',
    'scec.goodsApprove',
    'scec.productDetailsModal',
    'scec.ecCatalog',
  ],
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: 'ec-category-company-catalog' }) // 缓存当前公司
@connect(({ ecCompanyCatalog, ecCategoryCatalog }) => ({
  ecCompanyCatalog,
  ecCategoryCatalog,
}))
export default class EcCategoryCompanyCatalog extends Component {
  category;

  categoryCom;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {
      dispatch,
      ecCategoryCatalog: { activeKey = '1' },
      location: { state = { _back: 1 } },
      form: { getFieldValue },
    } = this.props;
    this.queryMapStatusList();
    if (state && state._back !== -1) {
      dispatch({
        type: 'ecCategoryCompanyCatalog/updateState',
        payload: {
          list: {},
          pagination: false,
          companyList: {},
          comPagination: false,
          activeKey: '1',
        },
      });
      // 获取当前公司值集
      dispatch({
        type: 'ecCompanyCatalog/fetchEcCompany',
      }).then(res => {
        if (res) {
          if (activeKey === '1') {
            this.category.fetchEcData(getFieldValue.companyId);
          } else if (activeKey === '2') {
            this.categoryCom.fetchEcData(getFieldValue.companyId);
          }
        }
      });
      if (this.category) {
        this.category.form.resetFields();
      }
      if (this.categoryCom) {
        this.categoryCom.form.resetFields();
      }
    }
  }

  @Bind()
  handleRef(ref = {}) {
    this.category = ref;
  }

  @Bind()
  handleComRef(ref = {}) {
    this.categoryCom = ref;
  }

  /**
   * 查询-当前公司值集
   */
  @Bind()
  fetchEcCompanyValue() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCompanyCatalog/fetchEcCompany',
    }).then();
  }

  /**
   * 选择公司值集
   */
  @Bind()
  handleOnChange(companyId) {
    if (this.category) {
      this.category.fetchEcData({ companyId });
      this.category.form.resetFields();
    }
    if (this.categoryCom) {
      this.categoryCom.fetchEcData({ companyId });
      this.categoryCom.form.resetFields();
    }
  }

  /**
   * 查询映射值集
   */
  @Bind()
  queryMapStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryCatalog/queryMapStatusList',
    });
  }

  /**
   * tab切换
   */
  tabChange = e => {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCategoryCatalog/updateState',
      payload: {
        activeKey: e,
      },
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      ecCompanyCatalog: { currentCompany = [] },
      ecCategoryCatalog: { mapStatusList = [], activeKey = '1' },
    } = this.props;
    const detailProps = {
      companyId: getFieldValue('companyId'),
      mapStatusList,
      onRef: this.handleRef,
    };
    const detailComProps = {
      companyId: getFieldValue('companyId'),
      mapStatusList,
      onRef: this.handleComRef,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.ecCategoryCompanyCatalog.view.title').d('公司目录映射')}>
          <Form layout="inline">
            <FormItem
              label={intl
                .get('scec.ecCompanyCatalog.model.ecCompanyCatalog.currentCompany')
                .d('当前公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: currentCompany[0] && currentCompany[0].companyId,
              })(
                <Lov
                  allowClear={false}
                  textField="companyName"
                  textValue={currentCompany[0] && currentCompany[0].companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={this.handleOnChange}
                />
              )}
            </FormItem>
          </Form>
        </Header>
        <Content>
          <Tabs
            animated={false}
            defaultActiveKey={activeKey}
            onChange={this.tabChange}
            tabBarStyle={{ marginTop: '-16px' }}
          >
            <Tabs.TabPane
              tab={intl
                .get('scec.ecCategoryCompanyCatalog.view.platformCategorySearch')
                .d('集团映射查询')}
              key="1"
            >
              <CatalogMapSearch {...detailProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get('scec.ecCategoryCompanyCatalog.view.title').d('公司目录映射')}
              key="2"
            >
              <CategoryCompanyCatalog {...detailComProps} />
            </Tabs.TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
