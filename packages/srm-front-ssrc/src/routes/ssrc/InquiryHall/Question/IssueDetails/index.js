/**
 * IssueDetails - 问题详情页
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Collapse, Icon, Spin } from 'hzero-ui';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { compose } from 'lodash';

import intl from 'utils/intl';
import { getActiveTabKey, openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { INQUIRY, BID } from '@/utils/globalVariable';

import DetailsForm from './DetailsForm';
import DetailsTable from './DetailsTable';

const { Panel } = Collapse;

class IssueDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: ['questionInformation', 'myQuestion'],
    };
    this.bidFlag = props.sourceKey === BID; //  招标标识
  }

  routerActiveTabKey = getActiveTabKey().includes('/pub')
    ? getActiveTabKey().split('/').slice(0, 4).join('/')
    : getActiveTabKey().split('/').slice(0, 3).join('/');

  componentDidMount() {
    const { dispatch, modelName = 'inquiryHall' } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      issueStatus: 'SSRC.ISSUE_STATUS', // 状态
    };
    dispatch({
      type: `${modelName}/batchCode`,
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
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/queryIssueHeader`,
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
    const { modelName = 'inquiryHall' } = this.props;
    const {
      [modelName]: { issueLinePagination = {} },
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
      modelName = 'inquiryHall',
    } = this.props;
    dispatch({
      type: `${modelName}/queryIssueLine`,
      payload: {
        page,
        organizationId,
        issueHeaderId: params.issueHeaderId,
        customizeUnitCode: `SSRC.${
          this.bidFlag ? BID : INQUIRY
        }_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE`,
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

  @Bind()
  getBackPath() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      location: { search = {} },
      match: { params },
      [modelName]: { issueHeader = {} },
    } = this.props;
    const {
      createFlag = '',
      sourceCategory,
      isReadOnly,
      externalBackPath = '',
    } = querystring.parse(search.substr(1));
    const back = `${this.routerActiveTabKey}/inter-question/${issueHeader.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2?createFlag=${createFlag}&sourceCategory=${sourceCategory}&isReadOnly=${isReadOnly}&externalBackPath=${externalBackPath}`;
    return back;
  }

  @Bind()
  goBack() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      location: { search = {} },
      match: { params },
      [modelName]: { issueHeader = {} },
    } = this.props;
    const {
      current,
      createFlag = '',
      sourceCategory,
      isReadOnly,
      externalBackPath = '',
    } = querystring.parse(search.substr(1));
    const searchProps = querystring.stringify({
      createFlag,
      current,
      sourceCategory,
      isReadOnly,
      externalBackPath,
    });
    openTab(
      {
        key: `${this.routerActiveTabKey}/inter-question/${issueHeader.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2`,
        path: `${this.routerActiveTabKey}/inter-question/${issueHeader.sourceId}/${params.rfxNum}/sourceTitle/${params.companyId}/2`,
        // title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑'),
        title: 'srm.common.tab.title.ssrc.questionAnswer',
        closable: true,
        search: searchProps,
      },
      {
        closeCurrent: true,
      }
    );
  }

  getCuxPanels = () => {
    const { issueDetailsRemote } = this.props;

    let cuxPanels = '';

    cuxPanels = issueDetailsRemote
      ? issueDetailsRemote.process(
          'SSRC_INQUIRY_HALL_QUESTION_ISSUE_DETAILS_PROCESS_PAGEBOTTOM_CUXPANELS',
          cuxPanels,
          {
            that: this,
          }
        )
      : cuxPanels;

    return cuxPanels;
  };

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      formLoading,
      lineLoading,
      organizationId,
      [modelName]: {
        code: { issueStatus = [], clarifyType = [] },
        issueHeader = {},
        issueLineList = [],
        issueLinePagination = {},
      },
      location: { search },
      customizeTable,
      issueDetailsRemote,
    } = this.props;
    const { collapsed } = this.state;
    const { sourceCategory } = querystring.parse(search.substr(1));
    const detailsFormProps = {
      issueStatus,
      organizationId,
      formLoading,
      issueHeader,
      issueDetailsRemote,
    };
    const detailsTable = {
      organizationId,
      issueDetailsRemote,
      Loading: lineLoading,
      dataSource: issueLineList,
      issueLinePagination,
      onChange: this.fetchIssueLine,
      clarifyType,
      sourceCategory,
      customizeTable,
      bidFlag: this.bidFlag,
    };
    // 二开传入参数
    const renderProps = {
      issueHeader,
      organizationId,
      bidFlag: this.bidFlag,
      customizeUnitCode: `SSRC.${
        this.bidFlag ? BID : INQUIRY
      }_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE`,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.question.view.title.questionDetails`).d('问题详情')}
          backPath={this.getBackPath()}
          customBack={getActiveTabKey().indexOf('clarification-letter') > -1 ? this.goBack : null}
        >
          {issueDetailsRemote ? (
            issueDetailsRemote.render(
              'SSRC_INQUIRY_HALL_QUESTION_ISSUE_DETAILS_RENDER_EXPORT_BUTTON',
              <></>,
              renderProps
            )
          ) : (
            <></>
          )}
        </Header>
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
              {this.getCuxPanels()}
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    withCustomize({
      unitCode: ['SSRC.INQUIRY_HALL.NEW_CLARIFY.QUESTION_DETAILS_TABLE'],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.question'],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      modelName: 'inquiryHall',
      formLoading: loading.effects['inquiryHall/queryIssueHeader'],
      lineLoading: loading.effects['inquiryHall/queryIssueLine'],
      organizationId: getCurrentOrganizationId(),
    }))
  )(Com);
};

export default Hooc(IssueDetails);
export { IssueDetails, Hooc };
