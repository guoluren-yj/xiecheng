/**
 * Approve - 专家注册申请审批
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
    getCustomizeUnitCode('regisApprovalTableList'), // 注册申请审批-列表页
  ],
})
@connect(({ expert, loading }) => ({
  expert,
  loading: loading.effects['expert/queryApprove'],
}))
export default class Approve extends PureComponent {
  componentDidMount() {
    const {
      expert: { expertPagination = {} },
    } = this.props;
    const page = expertPagination;
    this.queryApprove(page);
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
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  queryApprove(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
    };
    dispatch({
      type: 'expert/queryApprove',
      payload: {
        page: pageData,
        customizeUnitCode: getCustomizeUnitCode('regisApprovalTableList'),
        ...searchData,
      },
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryExpert(queryData = {}) {
    this.queryApprove(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.queryApprove(pagination);
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
        approveList = {},
        approvePagination = {},
        code: { expertTypeList = [], expertCategoryList = [], expertReqList = [] },
      },
      customizeTable,
    } = this.props;
    const formProps = {
      expertTypeList,
      expertCategoryList,
      expertReqList,
      onQueryExpert: this.onQueryExpert,
      onRef: this.handleBindRef,
    };
    const applyTable = {
      type: 'approve',
      loading,
      expertList: approveList,
      expertPagination: approvePagination,
      customizeTable,
      customizeUnitCode: getCustomizeUnitCode('regisApprovalTableList'),
      onTableChange: this.handleStandardTableChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.expert.view.message.title.regApprove').d('专家注册申请审批')}
        />
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
