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
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button, Collapse, Icon, Modal, Spin } from 'hzero-ui';
import CreateForm from './CreateForm';
import CreateTable from './CreateTable';
import InquiryCreateTable from './CreateTableEntry/InquiryIndex';
import BidCreateTable from './CreateTableEntry/BidIndex';
import styles from './index.less';

const { Panel } = Collapse;
class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
      showDelBtn: false,
      clarifyNotifyId: null,
      quotationHeaderId: '',
    };
  }

  form;

  getSnapshotBeforeUpdate(prevProps = {}) {
    const prevRouterParam = queryString.parse(prevProps.location.search.substr(1));
    const { clarifyNotifyId: oldId = null } = prevRouterParam || {};

    const routerParam = queryString.parse(this.props.location.search.substr(1));
    const { clarifyNotifyId } = routerParam || {};

    return clarifyNotifyId && oldId && clarifyNotifyId !== oldId;
  }

  componentDidUpdate(...rest) {
    if (rest[2]) {
      this.fetchPage();
    }
  }

  componentDidMount() {
    this.fetchPage();
  }

  fetchPage = () => {
    const { dispatch, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { clarifyNotifyId, quotationHeaderId } = routerParam;
    if (clarifyNotifyId !== undefined) {
      dispatch({
        type: `${modelName}/fetchClarifyIssueHeader`,
        payload: {
          clarifyNotifyId,
        },
      });
      this.setState({
        clarifyNotifyId,
        quotationHeaderId,
      });
    }
    const { questionRowsPagination = {} } = this.props;
    if (quotationHeaderId) {
      this.fetchMyQuestion(questionRowsPagination);
    }
  };

  @Bind()
  handleLovChange(value, record) {
    const { questionRowsPagination = {} } = this.props;
    this.setState(
      {
        quotationHeaderId: record.quotationHeaderId,
      },
      () => {
        this.fetchMyQuestion(questionRowsPagination);
        this.handleBidIssueHeader();
      }
    );
  }

  @Bind()
  handleBidIssueHeader() {
    const { dispatch, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const {
      sourceFrom,
      sourceHeaderId,
      clarifyNotifyType = '',
      issueFrom = 'LEADER',
    } = routerParam;
    const { quotationHeaderId } = this.state;
    dispatch({
      type: `${modelName}/fetchBidIssueHeader`,
      payload: {
        sourceHeaderId,
        clarifyNotifyType,
        issueFrom,
        quotationHeaderId: quotationHeaderId || 0,
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
    const {
      clarifyNotifyId = 0,
      sourceHeaderId,
      sourceFrom,
      clarifyNotifyType = '',
      issueFrom = 'LEADER',
      quotationHeaderId,
    } = routerParam;
    const { quotationHeaderId: headerId, clarifyNotifyId: id } = this.state;
    dispatch({
      type: `${modelName}/fetchQuestionRows`,
      payload: {
        page,
        clarifyNotifyId: id || clarifyNotifyId,
        sourceHeaderId,
        clarifyNotifyType,
        quotationHeaderId: quotationHeaderId || headerId,
        sourceFrom,
        issueFrom,
      },
    });
  }

  @Bind()
  handleSave(params) {
    const { dispatch, questionRowsPagination, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const {
      sourceHeaderId,
      quotationHeaderId = 0,
      sourceFrom,
      issueFrom,
      clarifyNotifyType,
    } = routerParam;
    const { quotationHeaderId: header } = this.state;
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
            quotationHeaderId: quotationHeaderId || header,
            sourceFrom,
            issueFrom,
            clarifyNotifyType,
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
  handleSaveQuestion() {
    const { questionRowsList = [], questionInformationHeader = {}, location } = this.props;
    const { quotationHeaderId } = this.state;
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
          quotationHeaderId: routerParam.quotationHeaderId || quotationHeaderId,
          sourceFrom: routerParam.sourceFrom,
          clarifyNotifyType: routerParam.clarifyNotifyType,
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
    const { clarifyNotifyId } = this.state;
    const { dispatch, history, submitLoading, location, modelName = 'inquiryHall' } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '' } = routerParam;
    const onOk = () => {
      dispatch({
        type: `${modelName}/submitQuestion`,
        payload: { ...params, clarifyNotifyId },
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
  handleSubmitQuestion() {
    const { questionRowsList = [], questionInformationHeader = {}, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { quotationHeaderId: header } = this.state;
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
          quotationHeaderId: routerParam.quotationHeaderId || header,
          sourceFrom: routerParam.sourceFrom,
          clarifyNotifyType: routerParam.clarifyNotifyType,
          issueFrom: routerParam.issueFrom,
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
      questionInformationHeader = {},
      location,
      modelName = 'inquiryHall',
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { backPath = '', clarifyNotifyType = '', issueFrom = '' } = routerParam;
    const onOk = () => {
      dispatch({
        type: `${modelName}/deleteNotice`,
        payload: {
          issueFrom,
          clarifyNotifyType,
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

  renderCreateTable(createTableProps) {
    const { modelName = 'inquiryHall' } = this.props;
    switch (modelName) {
      case 'inquiryHall':
        return <CreateTable {...createTableProps} fetchMyQuestion={this.fetchMyQuestion} />;
      case 'inquiryHallNew':
        return <InquiryCreateTable {...createTableProps} fetchMyQuestion={this.fetchMyQuestion} />;
      case 'inquiryHallBid':
        return <BidCreateTable {...createTableProps} fetchMyQuestion={this.fetchMyQuestion} />;
      default:
        return <CreateTable {...createTableProps} fetchMyQuestion={this.fetchMyQuestion} />;
    }
  }

  // @protect [网易]
  getCreateForm(createFormProps) {
    return <CreateForm {...createFormProps} />;
  }

  render() {
    const { collapseKeys, showDelBtn, bidNum, quotationHeaderId } = this.state;
    const {
      questionInformationHeader = {},
      saveLoading,
      fetchQuestionRowsLoading,
      submitLoading,
      location,
      modelName = 'inquiryHall',
    } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const createFormProps = {
      rfHeaderId: routerParam.sourceHeaderId,
      questionInformationHeader,
      onRef: this.handleBindRef,
      sourceNum: bidNum,
      sourceFrom: routerParam.sourceFrom,
      onLovChange: this.handleLovChange,
    };
    const createTableProps = {
      routerParam,
      quotationHeaderId,
      modelName,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`ssrc.inquiryHall.view.message.title.sourcing.problem.notice`)
            .d('问题澄清通知')}
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
            spinning={routerParam.quotationHeaderId ? fetchQuestionRowsLoading : false}
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
                {this.getCreateForm(createFormProps)}
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
                {this.renderCreateTable(createTableProps)}
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
    formatterCollections({ code: ['ssrc.inquiryHall'] }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      modelName: 'inquiryHall',
      questionInformationHeader: inquiryHall.questionInformationHeader,
      questionRowsList: inquiryHall.questionRowsList,
      fetchQuestionRowsLoading: loading.effects['inquiryHall/fetchQuestionRows'],
      deleteLoading: loading.effects['inquiryHall/deleteQuestion'],
      submitLoading: loading.effects['inquiryHall/submitQuestion'],
      saveLoading: loading.effects['inquiryHall/saveQuestion'],
      questionRowsPagination: inquiryHall.questionRowsPagination,
    }))
  )(Comp);

export default HOCComponent(Create);
export { HOCComponent, Create };
