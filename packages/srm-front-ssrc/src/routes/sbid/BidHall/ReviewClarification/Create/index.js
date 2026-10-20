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
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Content, Header } from 'components/Page';
import { Button, Collapse, Icon, Modal, Spin } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import CreateForm from './CreateForm';
import CreateTable from './CreateTable';
import styles from './index.less';

const { Panel } = Collapse;

@connect(({ bidHall, loading }) => ({
  bidHall,
  questionInformationHeader: bidHall.questionInformationHeader,
  questionRowsList: bidHall.questionRowsList,
  fetchQuestionRowsLoading: loading.effects['bidHall/fetchQuestionRows'],
  deleteLoading: loading.effects['bidHall/deleteQuestion'],
  submitLoading: loading.effects['bidHall/submitQuestion'],
  saveLoading: loading.effects['bidHall/saveQuestion'],
  questionRowsPagination: bidHall.questionRowsPagination,
}))
@formatterCollections({
  code: ['ssrc.expertScoring', 'ssrc.question', 'ssrc.common'],
})
export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
      showDelBtn: false,
      clarifyNotifyId: null,
    };
  }

  form;

  componentDidMount() {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { clarifyNotifyId } = routerParam;
    if (clarifyNotifyId === undefined) {
      this.handleBidIssueHeader();
    } else {
      dispatch({
        type: 'bidHall/fetchClarifyIssueHeader',
        payload: {
          clarifyNotifyId,
        },
      });
    }
    const { questionRowsPagination = {} } = this.props;
    this.fetchMyQuestion(questionRowsPagination);
  }

  @Bind()
  handleBidIssueHeader() {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParam;
    dispatch({
      type: 'bidHall/fetchBidIssueHeader',
      payload: {
        sourceHeaderId,
        quotationHeaderId,
        sourceFrom,
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidHall/updateState',
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
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { clarifyNotifyId = 0, sourceHeaderId, quotationHeaderId, sourceFrom } = routerParam;
    dispatch({
      type: 'bidHall/fetchQuestionRows',
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
    const { dispatch, questionRowsPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { sourceHeaderId, quotationHeaderId, sourceFrom } = routerParam;
    dispatch({
      type: 'bidHall/saveQuestion',
      payload: params,
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'bidHall/fetchClarifyIssueHeader',
          payload: {
            clarifyNotifyId: res.clarifyNotifyId,
          },
        });

        dispatch({
          type: 'bidHall/fetchQuestionRows',
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
        };
        if (!isEmpty(newList)) {
          this.handleSave(params);
        } else {
          notification.warning({
            message: intl.get(`ssrc.question.view.message.notNllcontent`).d('引用问题至少一个!'),
          });
        }
      }
    });
  }

  @Bind()
  handleSubmit(params) {
    const { clarifyNotifyId } = this.state;
    const { dispatch, history, submitLoading, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '' } = routerParam;
    const onOk = () => {
      dispatch({
        type: 'bidHall/submitQuestion',
        payload: { ...params, clarifyNotifyId: clarifyNotifyId || routerParam.clarifyNotifyId },
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

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
      confirmLoading: submitLoading,
      onOk,
    });
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
        };
        if (!isEmpty(newList)) {
          this.handleSubmit(params);
        } else {
          notification.warning({
            message: intl.get(`ssrc.question.view.message.notNllcontent`).d('引用问题至少一个!'),
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
      questionInformationHeader = {},
      location,
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '' } = routerParam;
    const onOk = () => {
      dispatch({
        type: 'bidHall/deleteNotice',
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
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: deleteLoading,
      onOk,
    });
  }

  render() {
    const { collapseKeys, showDelBtn } = this.state;
    const {
      questionInformationHeader = {},
      saveLoading,
      fetchQuestionRowsLoading,
      submitLoading,
      location,
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { bidNum } = this.state;
    const createFormProps = {
      questionInformationHeader,
      onRef: this.handleBindRef,
      sourceNum: bidNum,
    };
    const createTableProps = {
      routerParam,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.question.view.create.reviewClarificationNotice`).d('评审澄清通知')}
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
                      {intl.get(`ssrc.question.view.message.title.detail.baseInfo`).d('基本信息')}
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
                      {intl.get(`ssrc.question.view.message.title.detail.myquestion`).d('我的问题')}
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
