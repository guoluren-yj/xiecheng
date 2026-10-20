/**
 * Details - 问题详情页
 * @date: 2019-6-17
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import querystring from 'querystring';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import { Collapse, Icon, Spin } from 'hzero-ui';
import classnames from 'classnames';
import DetailsForm from './DetailsForm';
import DetailsTable from './DetailsTable';

const { Panel } = Collapse;

@connect(({ bidHall, loading }) => ({
  bidHall,
  formLoading: loading.effects['bidHall/queryIssueHeader'],
  lineLoading: loading.effects['bidHall/queryIssueLine'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: ['questionInformation', 'myQuestion'],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      issueStatus: 'SSRC.ISSUE_STATUS', // 状态
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    this.queryIssueHeader();
    this.queryIssueLine();
  }

  /**
   * 查询问题头数据
   */
  @Bind()
  queryIssueHeader() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidHall/queryIssueHeader',
      payload: {
        organizationId,
        issueHeaderId: params.issueHeaderId,
      },
    });
  }

  /**
   * 查询问题行数据
   */
  @Bind()
  queryIssueLine() {
    const {
      bidHall: { issueLinePagination = {} },
    } = this.props;
    this.fetchIssueLine(issueLinePagination);
  }

  /**
   * 查询问题行数据
   */
  @Bind()
  fetchIssueLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidHall/queryIssueLine',
      payload: {
        page,
        organizationId,
        issueHeaderId: params.issueHeaderId,
      },
    });
  }

  /**
   * collapse 的折叠与展开
   */
  @Bind()
  handleCollapse(collapsed) {
    this.setState({
      collapsed,
    });
  }

  getBackPath() {
    const {
      match: { params = {} },
      bidHall: { issueHeader = {} },
      location: { search = {} },
    } = this.props;
    const {
      quotationEndDateFlag = null,
      createFlag = null,
      isClarificationFlag = null,
    } = querystring.parse(search.substr(1));
    const url = `/ssrc/bid-hall/inter-question/${issueHeader.sourceId}/${params.bidNum}/sourceTitle/${params.companyId}/2?quotationEndDateFlag=${quotationEndDateFlag}&createFlag=${createFlag}&isClarificationFlag=${isClarificationFlag}`;
    return url;
  }

  render() {
    const {
      formLoading,
      lineLoading,
      organizationId,
      bidHall: { code = {}, issueHeader = {}, issueLineList = [], issueLinePagination = {} },
    } = this.props;
    const { collapsed } = this.state;
    const detailsFormProps = {
      issueStatus: code.issueStatus,
      organizationId,
      formLoading,
      issueHeader,
    };
    const detailsTable = {
      organizationId,
      Loading: lineLoading,
      dataSource: issueLineList,
      issueLinePagination,
      onChange: this.fetchIssueLine,
      clarifyType: code.clarifyType,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.question.view.title.questionDetails`).d('问题详情')}
          backPath={this.getBackPath()}
        />
        <Content>
          <Spin
            spinning={formLoading || lineLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapsed}
              onChange={(arr) => this.handleCollapse(arr, 'questionInformation')}
            >
              <Panel
                showArrow={false}
                key="questionInformation"
                header={
                  <React.Fragment>
                    <h3>{intl.get(`ssrc.question.view.title.information`).d('基本信息')}</h3>
                    <a>
                      {collapsed.includes('questionInformation')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                      <Icon type={collapsed.includes('questionInformation') ? 'up' : 'down'} />
                    </a>
                  </React.Fragment>
                }
              >
                <DetailsForm {...detailsFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                key="myQuestion"
                header={
                  <React.Fragment>
                    <h3>{intl.get(`ssrc.question.view.title.myQuestion`).d('我的问题')}</h3>
                    <a>
                      {collapsed.includes('myQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                      <Icon type={collapsed.includes('myQuestion') ? 'up' : 'down'} />
                    </a>
                  </React.Fragment>
                }
              >
                <DetailsTable {...detailsTable} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
