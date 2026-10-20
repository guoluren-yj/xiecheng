/**
 * ReqQuery - 专家注册申请查询
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import QueryForm from './QueryForm';
import ApplyTable from '../Components/ApplyTable';
import { getCustomizeUnitCode } from '../utils/utils';

@withCustomize({
  unitCode: [
    getCustomizeUnitCode('regisQueryTableList'), // 注册申请查询-列表页
  ],
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryReqQuery'],
}))
export default class ReqQuery extends PureComponent {
  componentDidMount() {
    const {
      expert: { reqQueryPagination = {} },
    } = this.props;
    const page = reqQueryPagination;
    this.queryReqQuery(page);
    this.queryValueCode();
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'expert/queryValueCode',
      payload: {
        expertTypeList: 'SSRC.EXPERT_TYPE', // 专家类型
        expertCategoryList: 'SSRC.EXPERT_CATEGORY', // 专家类别
        expertReqList: 'SSRC.EXPERT_REQ_STATUS', // 单据状态
      },
    });
    this.handleFilterCode();
  }

  /**
   * 过滤值级，不要新建状态
   */
  @Bind()
  handleFilterCode() {
    const {
      dispatch,
      expert: {
        code: { expertReqList = [] },
      },
    } = this.props;
    const documentsState = expertReqList.filter((item) => {
      return item.value !== 'NEW';
    });
    dispatch({
      type: 'expert/updateState',
      payload: { documentsState },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryReqQuery(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
    };
    dispatch({
      type: 'expert/queryReqQuery',
      payload: {
        page: pageData,
        customizeUnitCode: getCustomizeUnitCode('regisQueryTableList'),
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryExpert(queryData = {}) {
    this.queryReqQuery(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryReqQuery(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      loading,
      expert: {
        reqQueryList = {},
        reqQueryPagination = {},
        code: { expertTypeList = [], expertCategoryList = [] },
        documentsState = [],
      },
      customizeTable,
    } = this.props;
    const formProps = {
      expertTypeList,
      expertCategoryList,
      documentsState,
      onQueryExpert: this.onQueryExpert,
      onRef: this.handleBindRef,
    };
    const applyTable = {
      type: 'reqQuery',
      loading,
      expertList: reqQueryList,
      expertPagination: reqQueryPagination,
      customizeTable,
      customizeUnitCode: getCustomizeUnitCode('regisQueryTableList'),
      onTableChange: this.handleStandardTableChange,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('ssrc.expert.view.message.title.reqQuery').d('专家注册申请查询')} />
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <ApplyTable {...applyTable} />
        </Content>
      </React.Fragment>
    );
  }
}
