/**
 * GoodsManage -商品上下架管理
 * @date: 2019-2-7
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import { filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';

import querystring from 'querystring';
import FilterList from './FilterList';
import SheleveTableList from './SheleveTableList';
import UnshelveTableList from './UnshelveTableList';

const { TabPane } = Tabs;

@connect(({ goodsManage, loading }) => ({
  goodsManage,
  loading: loading.effects['goodsManage/fetchGoodsList'],
  unSheleveLoading: loading.effects['goodsManage/batchUnShelve'],
  getSettingLoading: loading.effects['goodsManage/getSettings'],
  sheleveLoading: loading.effects['goodsManage/batchPutaway'],
}))
@formatterCollections({ code: ['scec.goodsManage', 'scec.common'] })
export default class GoodsManage extends Component {
  form;

  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.history.location.search.substr(1));
    this.state = {
      tabStatus: routerParam.tabStatus ? routerParam.tabStatus : 'a', // 默认为待上架商品
    };
  }

  componentDidMount() {
    const { tabStatus } = this.state;
    this.batchCode();
    this.radioChange(tabStatus);
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
      type: 'goodsManage/batchCode',
      payload: lovCodes,
    });
  }

  @Bind()
  handleSetting() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'goodsManage/getSettings',
    });
  }

  /**
   * 查询未上架商品
   * @param {object} params  查询参数
   */
  @Bind()
  fetchGoodsList(params = {}) {
    const { dispatch } = this.props;
    const { tabStatus } = this.state;
    const form = this.notform;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const status = tabStatus === 'a' ? 4 : 3;
    dispatch({
      type: 'goodsManage/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        status,
        ...fieldValues,
      },
    });
  }

  /**
   * 查询已上架商品
   * @param {object} params  查询参数
   */
  @Bind()
  fetchOtherGoodsList(params = {}) {
    const { dispatch } = this.props;
    const { tabStatus } = this.state;
    const form = this.alreadyform;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const status = tabStatus === 'a' ? 4 : 3;
    dispatch({
      type: 'goodsManage/fetchGoodsList',
      payload: {
        page: isEmpty(params) ? {} : params,
        status,
        ...fieldValues,
      },
    });
  }

  /**
   * 上下架切换
   * @param {object} e 当前环境
   */
  @Bind()
  radioChange(key) {
    const { tabStatus } = this.state;
    this.setState(
      {
        tabStatus: key,
      },
      () => {
        if (tabStatus === 'a') {
          this.notform.resetFields();
          this.fetchGoodsList();
        } else {
          this.alreadyform.resetFields();
          this.fetchOtherGoodsList();
        }
      }
    );
  }

  @Bind()
  handleRef(ref = {}) {
    const { tabStatus } = this.state;
    if (tabStatus === 'a') {
      this.notform = (ref || {}).props.form;
    } else {
      this.alreadyform = (ref || {}).props.form;
    }
  }

  /**
   * 批量下架
   * @param {object} e 当前执行环境
   */
  @Bind()
  handBatchUnsheleve(params = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsManage/batchUnShelve',
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchOtherGoodsList();
      }
    });
  }

  /**
   * 批量上架
   * @param {object} e 当前执行环境
   */
  @Bind()
  handBatchSheleve(params = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'goodsManage/batchPutaway',
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchGoodsList();
      }
    });
  }

  render() {
    const {
      goodsManage: {
        pagination = {},
        list = {},
        code: { status = [], sourceType = [] },
      },
      loading,
      unSheleveLoading,
      sheleveLoading,
      getSettingLoading,
    } = this.props;
    const { tabStatus } = this.state;
    const filterList = {
      status,
      sourceType,
      tabStatus,
      onRef: this.handleRef,
      onFetchGoods: this.fetchGoodsList,
    };
    const alreadyFilterList = {
      status,
      sourceType,
      tabStatus,
      onRef: this.handleRef,
      onFetchGoods: this.fetchOtherGoodsList,
    };
    const tableList = {
      list,
      loading,
      pagination,
      tabStatus,
      onFetchGoods: this.fetchGoodsList,
    };
    const alreadyTableList = {
      list,
      loading,
      pagination,
      tabStatus,
      getSettingLoading,
      getSetting: this.handleSetting,
      onFetchGoods: this.fetchOtherGoodsList,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.goodsManage.view.goodsManage.title').d('商品上下架管理')} />
        <Content>
          <Tabs
            defaultActiveKey={tabStatus}
            onChange={this.radioChange}
            animated={false}
            tabBarStyle={{ marginTop: '-16px' }}
          >
            <TabPane
              tab={intl.get('scec.goodsManage.view.goodsManage.sheleve').d('待上架')}
              key="a"
            >
              <FilterList {...filterList} />
              <UnshelveTableList
                sheleveLoading={sheleveLoading}
                onHandBatchSheleve={this.handBatchSheleve}
                {...tableList}
              />
            </TabPane>
            <TabPane
              tab={intl.get('scec.goodsManage.view.goodsManage.unSheleve').d('已上架')}
              key="b"
            >
              <FilterList {...alreadyFilterList} />
              <SheleveTableList
                unSheleveLoading={unSheleveLoading}
                onHandBatchUnsheleve={this.handBatchUnsheleve}
                {...alreadyTableList}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
