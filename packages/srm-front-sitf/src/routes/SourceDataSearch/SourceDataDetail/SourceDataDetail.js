/**
 * SourceDataDetail - 源数据查询详情
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Form } from 'hzero-ui';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import SourceDataTmpl from './SourceDataTmpl';

/**
 * 源数据查询详情
 * @extends {Component} - React.Component
 * @reactProps {Object} sourceDataSearch | sourceDataSearchOrg - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sitf.sourceDataSearch'],
})
@Form.create({ fieldNameProp: null })
@withRouter
export default class SourceDataDetail extends PureComponent {
  constructor(props) {
    super(props);
    const parentParams = qs.parse(props.history.location.search.substr(1));
    this.state = {
      parentParams,
    };
  }

  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    const { dispatch, modelName = 'sourceDataSearch' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        tabTitle: [],
      },
    });
    this.fetchSourceDataList();
  }

  /**
   * 查询源数据配置
   * @param {Object} value 查询条件
   */
  @Bind()
  fetchSourceDataList(value = {}) {
    const { dispatch, modelName = 'sourceDataSearch' } = this.props;
    const { parentParams } = this.state;
    dispatch({
      type: `${modelName}/fetchConfig`,
      payload: {
        ...value,
        ...parentParams,
      },
    });
  }

  /**
   * 查询源数据列表数据
   * @param {Object} pageData 页面信息
   * @param {String} url 路径
   * @param {String} tableName 表格名称
   */
  @Bind()
  queryData(pageData = {}, url, tableName) {
    const { dispatch, modelName = 'sourceDataSearch' } = this.props;
    const { parentParams } = this.state;
    dispatch({
      type: `${modelName}/fetchData`,
      payload: {
        pageData: {
          page: pageData,
          ...parentParams,
        },
        url,
        tableName,
      },
    });
  }

  render() {
    const { form, match, fetchData, fetchConfig, modelName = 'sourceDataSearch' } = this.props;
    const { [modelName]: sourceDataSearch } = this.props;
    const { config = [] } = sourceDataSearch;
    const sourceDataOptions = {
      form,
      config,
      sourceDataSearch,
      loading: fetchData || fetchConfig,
      queryData: this.queryData,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/detail'));
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.sourceDataSearch.model.sourceDataSearch.dataDetail')
            .d('源数据详情')}
          backPath={`${basePath}/list`}
        />
        <Content>
          <SourceDataTmpl {...sourceDataOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
