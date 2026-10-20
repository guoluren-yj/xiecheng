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

import FilterForm from './FilterForm';
import TableList from './TableList';

@formatterCollections({
  code: ['ssrc.bidTask', 'ssrc.common'],
})
@connect(({ bidTask, loading }) => ({
  bidTask,
  clarifyViewLoading: loading.effects['bidTask/fetchClarifyViewDataList'],
  organizationId: getCurrentOrganizationId(),
}))
export default class BidTaskClarificationView extends React.Component {
  form;

  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      match: { params },
      bidTask: { clarifyViewPagination = {} },
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
      type: 'bidTask/batchCode',
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
      type: 'bidTask/fetchClarifyViewDataList',
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
    const { match } = this.props;
    this.props.history.push({
      pathname: `/ssrc/bid-task/clarification-view/detail/${match.params.sourceId}/${match.params.bidNum}/${match.params.bidTitle}/${match.params.companyId}/${record.clarifyId}`,
    });
  }

  /**
   *  退回至父页面
   */
  @Bind()
  renderParent() {
    const { match } = this.props;
    return `/ssrc/bid-task/bid-detail/${match.params.sourceId}`;
  }

  render() {
    const {
      match,
      clarifyViewLoading,
      bidTask: { code = {}, clarifyViewList = [], clarifyViewPagination = {} },
    } = this.props;
    const formProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      clarifyViewPagination,
      clarifyStatus: code.clarifyStatus,
      dataSource: clarifyViewList && clarifyViewList,
      loading: clarifyViewLoading,
      onChange: this.handleSearch,
      onClarification: this.jumpClarification,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.bidTask.view.title.clarificationView`).d('澄清函查看')}
          // backPath={`/ssrc/bid-task/bid-detail/${match.params.sourceId}`}
          backPath={this.renderParent()}
        />
        <Content>
          <div style={{ marginBottom: 16, fontSize: 14 }}>
            <span>
              {intl.get(`ssrc.bidTask.view.title.bidNum`).d('寻源编号')}:{match.params.bidNum}
            </span>
            <span>
              {intl.get(`ssrc.bidTask.view.title.bidTitle`).d('寻源标题')}:{match.params.bidTitle}
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
