/**
 * ClarificationView - 采购方澄清查看
 * @date: 2019-6-18
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';
import { isUndefined } from 'lodash';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import querystring from 'querystring';

import FilterForm from './FilterForm';
import TableList from './TableList';

@formatterCollections({
  code: ['ssrc.bidHall'],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  clarifyViewList: bidHall.clarifyViewList,
  clarifyViewLoading: loading.effects['bidHall/fetchClarifyViewDataList'],
  organizationId: getCurrentOrganizationId(),
}))
export default class ClarificationView extends React.Component {
  form;

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      match: { params },
      bidHall: { clarifyViewPagination = {} },
    } = this.props;
    if (params.flag === '1') {
      if (!isUndefined(this.form)) {
        this.form.resetFields();
      }
    }
    const lovCodes = {
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 状态
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    this.handleSearch(clarifyViewPagination);
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId, match } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      ...fieldValues,
      submittedDateFrom: fieldValues.submittedDateFrom
        ? fieldValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: fieldValues.submittedDateTo
        ? fieldValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'bidHall/fetchClarifyViewDataList',
      payload: {
        page,
        ...values,
        organizationId,
        sourceType: 'BID',
        sourceId: match.params.sourceId,
      },
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
   * 跳转澄清函详情
   */
  @Bind()
  jumpClarification(record) {
    const { match, history, location } = this.props;
    const pub = location.pathname.match('pub');
    const search = querystring.stringify({
      companyId: match.params.companyId,
      clarifyId: record.clarifyId,
    });
    history.push({
      pathname: !pub
        ? `/ssrc/bid-hall/clarification-view/detail/${match.params.sourceId}/${match.params.bidNum}/${match.params.bidTitle}`
        : `/pub/ssrc/bid-hall/clarification-view/detail/${match.params.sourceId}/${match.params.bidNum}/${match.params.bidTitle}`,
      search,
    });
  }

  /**
   *  退回至父页面
   */
  @Bind()
  renderParent() {
    const { match, location } = this.props;
    const pub = location.pathname.match('pub');
    return !pub
      ? `/ssrc/bid-hall/bid-detail/${match.params.sourceId}`
      : `/pub/ssrc/bid-hall/bid-detail/${match.params.sourceId}`;
  }

  render() {
    const {
      match,
      clarifyViewLoading,
      clarifyViewList = [],
      bidHall: { code = {}, clarifyViewPagination = {} },
    } = this.props;
    const formProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      clarifyViewPagination,
      clarifyStatus: code.clarifyStatus,
      dataSource: clarifyViewList,
      loading: clarifyViewLoading,
      onChange: this.handleSearch,
      onClarification: this.jumpClarification,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.bidHall.view.title.clarificationView`).d('澄清函查看')}
          // backPath={`/ssrc/bid-hall/bid-detail/${match.params.sourceId}`}
          backPath={this.renderParent()}
        />
        <Content>
          <div style={{ marginBottom: 16, marginTop: 16, fontSize: 16 }}>
            <span>
              {intl.get(`ssrc.bidHall.view.title.bidNum`).d('寻源编号')} {match.params.bidNum}
            </span>
            <span>
              {intl.get(`ssrc.bidHall.view.title.bidTitle`).d('寻源标题')} {match.params.bidTitle}
            </span>
          </div>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
      </React.Fragment>
    );
  }
}
