/**
 * BusinessApvMethod - 企业(业务)审批方式
 * @date: 2018-7-30
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 企业(业务)审批方式
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} businessApvMethod - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ businessApvMethod, loading }) => ({
  businessApvMethod,
  loading: loading.effects['businessApvMethod/fetchBusinessData'],
  saveLoading: loading.effects['businessApvMethod/updateBusinessData'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['spfm.businessApvMethod'] })
export default class BusinessApvMethod extends Component {
  form;

  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   * @param {?string} fields.templateCode - 消息模板编码
   * @param {?string} fields.templateName - 消息模板名称
   * @param {?object} fields.page - 分页参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'businessApvMethod/fetchBusinessData',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
    this.setState({ dataSourceMap: {} });
  }

  /**
   * 修改审批方式
   * @param {string} value - 审批方式
   * @param {number} index - 操作对象
   */
  @Bind()
  handleChangeMethod(value, index) {
    const { list = [], methodList = [] } = this.props.businessApvMethod;
    const methodMeaning = methodList.find(item => item.value === value).meaning;
    const target = {
      ...list[index],
      methodMeaning,
      methodCode: value,
    };
    this.setState({
      dataSourceMap: {
        ...this.state.dataSourceMap,
        [index]: target,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handeUpdateData() {
    const {
      dispatch,
      tenantId,
      businessApvMethod: { pagination = {} },
    } = this.props;
    const { dataSourceMap } = this.state;

    if (Object.keys(dataSourceMap).length === 0) {
      notification.warning({
        message: intl.get('spfm.businessApvMethod.view.message.noChange').d('审批方式未进行变更'),
      });
      return;
    }
    dispatch({
      type: 'businessApvMethod/updateBusinessData',
      payload: {
        tenantId,
        data: Object.values(dataSourceMap),
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saveLoading,
      businessApvMethod: { list = [], pagination = {}, methodList = [] },
    } = this.props;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      methodList,
      pagination,
      loading,
      dataSource: list.map(n => ({ ...n, _status: 'update' })),
      onChange: this.handleSearch,
      onChangeMethod: this.handleChangeMethod,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.businessApvMethod.view.message.title').d('集团审批方式')}>
          <Button
            type="primary"
            icon="save"
            onClick={this.handeUpdateData}
            loading={saveLoading || loading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
