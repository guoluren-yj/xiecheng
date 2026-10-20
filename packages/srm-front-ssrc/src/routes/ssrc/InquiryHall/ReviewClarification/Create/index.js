/**
 * Create - 新建
 * @date: 2019-8-15
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { isEmpty, compose } from 'lodash';
import classnames from 'classnames';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import notification from 'utils/notification';
import remotes from 'hzero-front/lib/utils/remote';
import { getEditTableData, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button, Collapse, Icon, Modal, Spin } from 'hzero-ui';

import { fetchHeaderInfo } from '@/services/inquiryHallService';
import { fetchInquiryHeaderDetail } from '@/services/bidHallService';
import { rfFetchHeader } from '@/services/expertScoringService';

import CreateForm from './CreateForm';
import CreateTable from './CreateTable';
import styles from './index.less';

const { Panel } = Collapse;

@remotes(
  {
    code: 'SSRC_REVIEW_CLARIFICATION_CREATE',
    name: 'remote',
  },
  {
    events: {
      // 发布提交
      doSubmit(props) {
        const { doSubmit } = props || {};
        doSubmit();
      },
    },
  }
)
class Create extends React.Component {
  constructor(props) {
    super(props);
    const routerParam = queryString.parse(props.location.search.substr(1));
    const { quotationHeaderId, clarifyNotifyId } = routerParam;
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
      showDelBtn: false,
      clarifyNotifyId: null,
      quotationHeaderId,
      clarifyNotify: clarifyNotifyId,
      routerParams: routerParam,
      rfxTitle: '', // 询价/招标/征询单标题
    };
  }

  form;

  static getDerivedStateFromProps(nextProps, preState) {
    const routerParam = queryString.parse(nextProps.location.search.substr(1));
    const { clarifyNotifyId, quotationHeaderId } = routerParam || {};
    if (
      clarifyNotifyId !== preState.clarifyNotify ||
      quotationHeaderId !== preState.quotationHeaderId
    ) {
      return {
        quotationHeaderId,
        clarifyNotify: clarifyNotifyId,
      };
    }
    return null;
  }

  // getSnapshotBeforeUpdate(prevProps = {}) {
  //   const prevRouterParam = queryString.parse(prevProps.location.search.substr(1));
  //   const { clarifyNotifyId: oldId = null, quotationHeaderId: oldHeaderId = null } =
  //     prevRouterParam || {};

  //   const routerParam = queryString.parse(this.props.location.search.substr(1));
  //   const { clarifyNotifyId, quotationHeaderId } = routerParam || {};

  //   return (
  //     (clarifyNotifyId && oldId && clarifyNotifyId !== oldId) ||
  //     (quotationHeaderId && oldHeaderId && quotationHeaderId !== oldHeaderId)
  //   );
  // }

  componentDidUpdate(_, preState) {
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { clarifyNotifyId, quotationHeaderId } = routerParam || {};
    if (quotationHeaderId || clarifyNotifyId) {
      if (
        clarifyNotifyId !== preState.clarifyNotify ||
        quotationHeaderId !== preState.quotationHeaderId
      ) {
        this.fetchPage();
        this.fetchHeaderInfo();
      }
    }
  }

  componentDidMount() {
    this.fetchPage();
    this.fetchHeaderInfo();
  }

  /**
   * 查询 询价/招标/征询 头信息
   */
  @Bind()
  fetchHeaderInfo() {
    const {
      routerParams: { sourceHeaderId, sourceFrom },
    } = this.state;
    if (!sourceHeaderId) return;
    const organizationId = getCurrentOrganizationId();

    // RFP/RFI 暂不需要
    if (sourceFrom === 'RFP' || sourceFrom === 'RFI') {
      rfFetchHeader({
        organizationId,
        rfHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            rfxTitle: res.rfTitle,
          });
        }
      });
    } else if (sourceFrom === 'RFX') {
      fetchHeaderInfo({
        organizationId,
        rfxHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            rfxTitle: res.rfxTitle,
          });
        }
      });
    } else {
      fetchInquiryHeaderDetail({
        organizationId,
        bidHeaderId: sourceHeaderId,
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            rfxTitle: res.bidTitle,
          });
        }
      });
    }
  }

  fetchPage = () => {
    const { dispatch, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { clarifyNotifyId } = routerParam;
    if (clarifyNotifyId === undefined) {
      this.handleBidIssueHeader();
    } else {
      dispatch({
        type: `${modelName}/fetchClarifyIssueHeader`,
        payload: {
          clarifyNotifyId,
        },
      });
      this.setState({
        clarifyNotifyId,
      });
    }
    const { questionRowsPagination = {} } = this.props;
    this.fetchMyQuestion(questionRowsPagination);
  };

  @Bind()
  handleBidIssueHeader() {
    const { dispatch, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParam;
    dispatch({
      type: `${modelName}/fetchBidIssueHeader`,
      payload: {
        sourceHeaderId,
        quotationHeaderId,
        sourceFrom,
      },
    });
  }

  componentWillUnmount() {
    const { modelName = 'inquiryHall' } = this.props;
    this.props.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        questionInformationHeader: {},
        questionRowsList: [],
        questionRowsPagination: {},
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

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询我的问题
   */
  @Bind()
  fetchMyQuestion(page = {}) {
    const { dispatch, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { clarifyNotifyId = 0, sourceHeaderId, quotationHeaderId, sourceFrom } = routerParam;
    dispatch({
      type: `${modelName}/fetchQuestionRows`,
      payload: {
        page,
        clarifyNotifyId,
        sourceHeaderId,
        quotationHeaderId,
        sourceFrom,
        issueFrom: 'LEADER',
      },
    });
  }

  @Bind()
  handleSave(params) {
    const { dispatch, questionRowsPagination, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { sourceHeaderId, quotationHeaderId, sourceFrom } = routerParam;
    dispatch({
      type: `${modelName}/saveQuestion`,
      payload: params,
    }).then((res) => {
      if (res) {
        dispatch({
          type: `${modelName}/fetchClarifyIssueHeader`,
          payload: {
            clarifyNotifyId: res.clarifyNotifyId,
          },
        });

        dispatch({
          type: `${modelName}/fetchQuestionRows`,
          payload: {
            page: questionRowsPagination,
            clarifyNotifyId: res.clarifyNotifyId,
            sourceHeaderId,
            quotationHeaderId,
            sourceFrom,
            issueFrom: 'LEADER',
          },
        });
        this.setState({
          showDelBtn: true,
          clarifyNotifyId: res.clarifyNotifyId,
        });
        notification.success();
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  @Debounce(500)
  handleSaveQuestion() {
    const { questionRowsList = [], questionInformationHeader = {}, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const newQuestionRowsList = getEditTableData(questionRowsList, ['clarifyIssueId'], {
      force: true,
    });
    const newList = newQuestionRowsList.filter((item) => item.referenceFlag === 1);
    this.form.validateFields((err, values) => {
      const { replyEndDate } = values;
      if (!err) {
        const params = {
          ...questionInformationHeader,
          ...values,
          replyEndDate: replyEndDate.format(DEFAULT_DATETIME_FORMAT),
          clarifyIssues: newQuestionRowsList,
          sourceHeaderId: routerParam.sourceHeaderId,
          quotationHeaderId: routerParam.quotationHeaderId,
          sourceFrom: routerParam.sourceFrom,
          companyName: questionInformationHeader.companyName,
          clarifyNotifyType: !questionInformationHeader.clarifyNotifyId
            ? 'REVIEW'
            : questionInformationHeader.clarifyNotifyType,
        };
        if (!isEmpty(newList)) {
          this.handleSave(params);
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.notNllcontent`)
              .d('引用问题至少一个!'),
          });
        }
      }
    });
  }

  @Bind()
  handleSubmit(params) {
    const {
      dispatch,
      history,
      submitLoading,
      location,
      modelName = 'inquiryHall',
      remote,
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '' } = routerParam;
    const { clarifyNotifyId } = this.state;
    const onOk = (others = {}) => {
      dispatch({
        type: `${modelName}/submitQuestion`,
        payload: { ...params, clarifyNotifyId, ...others },
      }).then((res) => {
        if (res) {
          notification.success();
          history.push({
            pathname: backPath.split('?')[0],
            search: backPath.split('?')[1],
          });
        }
      });
    };

    const doSubmit = (payload) =>
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
        confirmLoading: submitLoading,
        onOk: () => onOk(payload),
      });

    if (remote && remote.event) {
      remote.event.fireEvent('doSubmit', {
        doSubmit,
        data: {
          ...params,
          clarifyNotifyId,
        },
      });
    } else {
      doSubmit();
    }
  }

  /**
   * 提交
   */
  @Bind()
  @Debounce(500)
  handleSubmitQuestion() {
    const { questionRowsList = [], questionInformationHeader = {}, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const newQuestionRowsList = getEditTableData(questionRowsList, ['clarifyIssueId'], {
      force: true,
    });
    const newList = newQuestionRowsList.filter((item) => item.referenceFlag === 1);
    this.form.validateFields((err, values) => {
      const { replyEndDate } = values;
      if (!err) {
        const params = {
          ...questionInformationHeader,
          ...values,
          replyEndDate: replyEndDate.format(DEFAULT_DATETIME_FORMAT),
          clarifyIssues: newQuestionRowsList,
          clarifyNotifyId: routerParam.clarifyNotifyId,
          sourceHeaderId: routerParam.sourceHeaderId,
          quotationHeaderId: routerParam.quotationHeaderId,
          sourceFrom: routerParam.sourceFrom,
          companyName: questionInformationHeader.companyName,
          clarifyNotifyNum: questionInformationHeader.clarifyNotifyNum,
          clarifyNotifyType: !questionInformationHeader.clarifyNotifyId
            ? 'REVIEW'
            : questionInformationHeader.clarifyNotifyType,
        };
        if (!isEmpty(newList)) {
          this.handleSubmit(params);
        } else {
          notification.warning({
            message: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.notNllcontent`)
              .d('引用问题至少一个!'),
          });
        }
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDeleteNotice() {
    const {
      dispatch,
      deleteLoading,
      history,
      location,
      questionInformationHeader = {},
      modelName = 'inquiryHall',
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '' } = routerParam;
    const onOk = () => {
      dispatch({
        type: `${modelName}/deleteNotice`,
        payload: {
          questionInformationHeader,
        },
      }).then((res) => {
        if (res) {
          history.push({
            pathname: backPath.split('?')[0],
            search: backPath.split('?')[1],
          });
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.removeData').d('确定删除数据'),
      confirmLoading: deleteLoading,
      onOk,
    });
  }

  render() {
    const {
      dispatch,
      inquiryHall,
      questionInformationHeader = {},
      saveLoading,
      fetchQuestionRowsLoading,
      submitLoading,
      customizeForm,
      location,
      modelName = 'inquiryHall',
      loading,
      questionRowsList,
      deleteRowsLoading,
      saveQuestRowLineLoading,
      questionRowsPagination,
    } = this.props;
    const { collapseKeys, showDelBtn } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    // const { rfxTitle } = routerParam;
    const { bidNum, rfxTitle } = this.state;
    const createFormProps = {
      questionInformationHeader,
      onRef: this.handleBindRef,
      sourceNum: bidNum,
      customizeForm,
      rfxTitle,
    };
    const createTableProps = {
      dispatch,
      routerParam,
      modelName,
      inquiryHall,
      loading,
      questionRowsList,
      deleteRowsLoading,
      saveQuestRowLineLoading,
      questionRowsPagination,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.inquiryHall.view.message.title.reviewClarotice`).d('评审澄清通知')}
          backPath={routerParam.backPath}
        >
          <Button
            type="primary"
            icon="check"
            loading={submitLoading}
            onClick={this.handleSubmitQuestion}
          >
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button icon="save" loading={saveLoading} onClick={this.handleSaveQuestion}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {(routerParam.clarifyNotifyId || showDelBtn) && (
            <Button icon="delete" loading={saveLoading} onClick={this.handleDeleteNotice}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        </Header>
        <Content>
          <Spin
            spinning={fetchQuestionRowsLoading}
            wrapperClassName={classnames('ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              defaultActiveKey={['questionInformation', 'myQuestion']}
              onChange={this.onCollapseChange}
            >
              <Panel
                showArrow={false}
                key="questionInformation"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.baseInfos`).d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('questionInformation')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('questionInformation') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <CreateForm {...createFormProps} />
              </Panel>
              <Panel
                className={styles.questionPanel}
                showArrow={false}
                key="myQuestion"
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`ssrc.inquiryHall.view.message.panel.myQuestion`).d('我的问题')}
                    </h3>
                    <a>
                      {collapseKeys.includes('myQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('myQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <CreateTable {...createTableProps} fetchMyQuestion={this.fetchMyQuestion} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) =>
  compose(
    formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] }),
    withCustomize({
      unitCode: [`SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.REVIEW_NEW_BASICS`],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      questionInformationHeader: inquiryHall.questionInformationHeader,
      questionRowsList: inquiryHall.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHall/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHall/deleteQuestion'],
      submitLoading: loading.effects['inquiryHall/submitQuestion'],
      saveLoading: loading.effects['inquiryHall/saveQuestion'],
      questionRowsPagination: inquiryHall.questionRowsPagination,
      code: inquiryHall.code,
      loading: loading.effects['inquiryHall/fetchQuestionRows'],
      deleteRowsLoading: loading.effects['inquiryHall/deleteQuestionRows'],
      saveQuestRowLineLoading: loading.effects['inquiryHall/saveQuestRowLine'],
    }))
  )(Comp);

export default HOCComponent(Create);

export { HOCComponent, Create };
