/**
 * ClarificationView - detail - 采购方澄清详情查看
 * @date: 2019-6-18
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Collapse, Icon, Spin } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import querystring from 'querystring';
import classnames from 'classnames';
import { getCurrentOrganizationId } from 'utils/utils';
import ClarifyContent from './clarifyContent';
import ClarificationTable from './clarifyQuestion';
import ClarifyHeaderFrom from './clarifyHeaderFrom';

const { Panel } = Collapse;

@connect(({ bidHall, loading }) => ({
  bidHall,
  detailsLoading: loading.effects['bidHall/fetchClarifyDetail'],
  tableLoading: loading.effects['bidHall/fetchClarifyReferIssue'],
  organizationId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'clarifyContent'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const {
      dispatch,
      bidHall: { clarificationQuestionPagination = {} },
    } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
    this.fetchDetail();
    this.handleClarificationQuestion(clarificationQuestionPagination);
  }

  /**
   * 查询详情页面行信息
   */
  @Bind()
  fetchDetail() {
    const {
      dispatch,
      organizationId,
      location,
      // match: { params },
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    dispatch({
      type: 'bidHall/fetchClarifyDetail',
      payload: {
        organizationId,
        clarifyId: routerParam.clarifyId || '',
      },
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const { dispatch, match, organizationId, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    dispatch({
      type: 'bidHall/fetchClarifyReferIssue',
      payload: {
        page,
        organizationId,
        clarifyId: routerParam.clarifyId || '',
        sourceId: match.params.sourceId,
        sourceType: 'BID',
      },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const {
      match: { params },
      bidHall: {
        code = {},
        clarificationDetails = {},
        clarificationQuestionList = [],
        clarificationQuestionPagination = {},
      },
      detailsLoading,
      tableLoading,
      organizationId,
      location,
    } = this.props;

    const { collapseKeys } = this.state;
    const detailFormProps = {
      organizationId,
      clarifyStatus: code.clarifyStatus,
      clarificationDetails,
    };
    const clarificationTableProps = {
      organizationId,
      Loading: tableLoading,
      fetchClarList: clarificationQuestionList,
      fetchClarListPagination: clarificationQuestionPagination,
      clarifyType: code.clarifyType,
      onChange: this.handleClarificationQuestion,
    };
    const pub = location.pathname.match('pub');
    const routerParam = querystring.parse(location.search.substr(1));
    return (
      <React.Fragment>
        <Header
          backPath={
            !pub
              ? `/ssrc/bid-hall/clarification-view/${params.sourceId}/${params.bidNum}/${params.bidTitle}/${routerParam.companyId}/2`
              : `/pub/ssrc/bid-hall/clarification-view/${params.sourceId}/${params.bidNum}/${params.bidTitle}/${routerParam.companyId}/2`
          }
          title={intl.get(`ssrc.clarify.view.message.title.detail.clarifyDetail`).d('澄清函详情')}
        />
        <Content>
          <Spin
            spinning={detailsLoading || tableLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="baseInfo"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.clarifyHeader`)
                        .d('澄清函基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClarifyHeaderFrom {...detailFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.clarifyContent`)
                        .d('澄清函正文')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyContent')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyContent') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="clarifyContent"
              >
                <ClarifyContent detail={clarificationDetails} />
              </Panel>
              <Panel
                showArrow={false}
                key="clarifyQuestion"
                header={
                  <Fragment>
                    <h3>
                      {intl
                        .get(`ssrc.clarify.view.message.title.detail.lineQuestion`)
                        .d('关联问题')}
                    </h3>
                    <a>
                      {collapseKeys.includes('clarifyQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('clarifyQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClarificationTable {...clarificationTableProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
