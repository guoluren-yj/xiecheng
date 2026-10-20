/**
 * Create - 新建问题
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty, cloneDeep } from 'lodash';
import { Button, Collapse, Icon, Modal, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { getActiveTabKey } from 'utils/menuTab';
import { Header, Content } from 'components/Page';

import CreateForm from './CreateForm';
import CreateTable from './CreateTable';

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierQuotation';

@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  // questionInformationHeader: supplierQuotation.questionInformationHeader,
  // questionRowsList: supplierQuotation.questionRowsList,
  deleteLoading: loading.effects['supplierQuotation/deleteQuestion'],
  submitLoading: loading.effects['supplierQuotation/submitQuestion'],
  saveLoading: loading.effects['supplierQuotation/saveQuestion'],
  // questionRowsPagination: supplierQuotation.questionRowsPagination,
}))
export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
      title: null, // 寻源标题
      quotationHeaderId: null, // 投标头id
      issueHeaderId: null, // 存储头id
      supplierCompanyId: null, // 存储供应商公司id
      rfxHeaderId: null, // 招标头id
    };
    this.activeTabKey = getActiveTabKey();
  }

  form;

  componentDidMount() {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    let headerId;
    if (routerParam.issueHeaderId && routerParam.issueHeaderId !== 'undefined') {
      headerId = routerParam.issueHeaderId;
    }

    this.fetchStatusvalues();

    this.setState({
      title: routerParam.title,
      quotationHeaderId: routerParam.quotationHeaderId,
      issueHeaderId: headerId,
      supplierCompanyId: routerParam.supplierCompanyId,
      rfxHeaderId: routerParam.rfxHeaderId,
    });

    // 新建时没有数据
    if (!headerId) {
      dispatch({
        type: 'supplierQuotation/updateState',
        payload: {
          questionInformationHeader: {},
          questionRowsList: [],
          questionRowsPagination: {},
        },
      });
    } else {
      this.handleQueryHeader(headerId);
      dispatch({
        type: 'supplierQuotation/fetchQuestionRows',
        payload: {
          issueHeaderId: headerId,
        },
      });
    }
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    this.props.dispatch({
      type: 'supplierQuotation/updateState',
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
   * 查询状态值集
   */
  @Bind()
  fetchStatusvalues() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE',
      issueStatus: 'SSRC.ISSUE_STATUS',
    };
    dispatch({
      type: 'supplierQuotation/batchCode',
      payload: {
        lovCodes,
      },
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
   * 查询头信息
   */
  @Bind()
  handleQueryHeader(issueHeaderId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierQuotation/fetchQuestionHeader',
      payload: {
        issueHeaderId,
      },
    });
  }

  /**
   * 查询我的问题
   */
  @Bind()
  fetchMyQuestion(page = {}) {
    const { dispatch } = this.props;
    const { issueHeaderId } = this.state;
    dispatch({
      type: 'supplierQuotation/fetchQuestionRows',
      payload: {
        page,
        issueHeaderId,
      },
    });
  }

  @Bind()
  handleSave(params) {
    const {
      dispatch,
      supplierQuotation: { questionRowsPagination = {} },
    } = this.props;
    dispatch({
      type: 'supplierQuotation/saveQuestion',
      payload: params,
    }).then((res) => {
      if (res) {
        this.handleQueryHeader(res.issueHeaderId);
        dispatch({
          type: 'supplierQuotation/fetchQuestionRows',
          payload: {
            page: questionRowsPagination,
            issueHeaderId: res.issueHeaderId,
          },
        });
        notification.success();
        this.setState({
          issueHeaderId: res.issueHeaderId,
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  @Debounce(500)
  handleSaveQuestion() {
    const {
      supplierQuotation: { questionInformationHeader = {}, questionRowsList = [] },
      location: { search },
    } = this.props;
    const { sourceFrom } = queryString.parse(search);
    const { issueHeaderId, supplierCompanyId, rfxHeaderId } = this.state;
    const newQuestionRowsList = cloneDeep(questionRowsList);
    const newList = newQuestionRowsList.filter(
      (item) => item._status !== 'create' && item._status !== 'update'
    );
    // 获取新建行／修改行
    const newRows = newQuestionRowsList.filter(
      (item) => item._status === 'create' || item._status === 'update'
    );
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const tableValues = getEditTableData(questionRowsList, ['_status', 'issueLineId']);
    const AllQuestionList = newList.concat(tableValues);
    let params;
    if (!issueHeaderId) {
      params = {
        issueHeader: {
          ...formValues,
          sourceId: rfxHeaderId,
          supplierCompanyId,
          sourceType: sourceFrom,
        },
        issueLines:
          sourceFrom === 'RFX'
            ? AllQuestionList
            : AllQuestionList.map((ele) => {
                return {
                  ...ele,
                  clarifyType: '-',
                };
              }),
      };
    } else {
      params = {
        issueHeader: {
          ...formValues,
          sourceId: rfxHeaderId,
          issueHeaderId,
          supplierCompanyId,
          sourceType: sourceFrom,
          _token: questionInformationHeader._token,
        },
        issueLines:
          sourceFrom === 'RFX'
            ? AllQuestionList
            : AllQuestionList.map((ele) => {
                return {
                  ...ele,
                  clarifyType: '-',
                };
              }),
      };
    }

    if (isEmpty(questionRowsList)) {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.notNllQuestionContent`).d('问题不能为空!'),
      });
    } else if (!isEmpty(tableValues) || isEmpty(newRows)) {
      this.handleSave(params);
    } else {
      return null;
    }
  }

  @Bind()
  handleSubmit(params) {
    const {
      dispatch,
      history,
      submitLoading,
      location: { search },
    } = this.props;
    const { sourceFrom } = queryString.parse(search);
    const { supplierCompanyId, quotationHeaderId, title, rfxHeaderId } = this.state;
    const onOk = () => {
      dispatch({
        type: 'supplierQuotation/submitQuestion',
        payload: params,
      }).then((res) => {
        if (res) {
          notification.success();
          const searchData = queryString.stringify({
            title,
            quotationHeaderId,
            supplierCompanyId,
            sourceFrom,
            sourceHeaderId: rfxHeaderId,
            flag: 2,
          });
          history.push(`${this.activeTabKey}/review-clarification?${searchData}`);
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
    const {
      supplierQuotation: { questionInformationHeader = {}, questionRowsList = [] },
      location: { search },
    } = this.props;
    const { sourceFrom } = queryString.parse(search);
    const { issueHeaderId, supplierCompanyId, rfxHeaderId } = this.state;
    const newList = questionRowsList.filter(
      (item) => item._status !== 'create' && item._status !== 'update'
    );
    // 获取新建行／修改行
    const newRows = questionRowsList.filter(
      (item) => item._status === 'create' || item._status === 'update'
    );
    const formValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const tableValues = getEditTableData(questionRowsList, ['_status', 'issueLineId']);
    const AllQuestionList = newList.concat(tableValues);
    let params;
    if (!issueHeaderId) {
      params = {
        issueHeader: {
          ...formValues,
          supplierCompanyId,
          sourceId: rfxHeaderId,
          sourceType: sourceFrom,
        },
        issueLines:
          sourceFrom === 'RFX'
            ? AllQuestionList
            : AllQuestionList.map((ele) => {
                return {
                  ...ele,
                  clarifyType: '-',
                };
              }),
      };
    } else {
      params = {
        issueHeader: {
          ...formValues,
          issueHeaderId,
          supplierCompanyId,
          sourceId: rfxHeaderId,
          sourceType: sourceFrom,
          _token: questionInformationHeader._token,
        },
        issueLines:
          sourceFrom === 'RFX'
            ? AllQuestionList
            : AllQuestionList.map((ele) => {
                return {
                  ...ele,
                  clarifyType: '-',
                };
              }),
      };
    }

    if (isEmpty(questionRowsList)) {
      notification.warning({
        message: intl.get(`${promptCode}.view.message.notNllQuestionContent`).d('问题不能为空!'),
      });
    } else if (!isEmpty(tableValues) || isEmpty(newRows)) {
      this.handleSubmit(params);
    } else {
      return null;
    }
  }

  /**
   * 删除
   */
  @Bind()
  handleDeleteQuestion() {
    const {
      dispatch,
      deleteLoading,
      history,
      location: { search },
    } = this.props;
    const { sourceFrom } = queryString.parse(search);
    const { issueHeaderId, quotationHeaderId, title, supplierCompanyId, rfxHeaderId } = this.state;
    const onOk = () => {
      dispatch({
        type: 'supplierQuotation/deleteQuestion',
        payload: {
          issueHeaderId,
        },
      }).then((res) => {
        if (res) {
          const searchData = queryString.stringify({
            title,
            quotationHeaderId,
            supplierCompanyId,
            sourceFrom,
            sourceHeaderId: rfxHeaderId,
            flag: 2,
          });
          history.push(`${this.activeTabKey}/review-clarification?${searchData}`);
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
    const {
      supplierQuotation: { questionInformationHeader = {} },
      saveLoading,
      location,
    } = this.props;
    const { collapseKeys, quotationHeaderId, title, supplierCompanyId, rfxHeaderId } = this.state;
    const createFormProps = {
      questionInformationHeader,
      onRef: this.handleBindRef,
    };
    const routerParam = queryString.parse(location.search.substr(1));
    const { sourceFrom } = routerParam;
    const searchData = queryString.stringify({
      title,
      quotationHeaderId,
      supplierCompanyId,
      sourceFrom,
      sourceHeaderId: rfxHeaderId,
      flag: 2,
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.questionPreview`).d('新建问题')}
          backPath={`${this.activeTabKey}/review-clarification?${searchData}`}
        >
          <Button type="primary" icon="check" onClick={this.handleSubmitQuestion}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button icon="save" loading={saveLoading} onClick={this.handleSaveQuestion}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {questionInformationHeader.issueStatus === 'NEW' && (
            <Button icon="delete" onClick={this.handleDeleteQuestion}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        </Header>
        <Content>
          <Spin spinning={false} wrapperClassName={classnames('ued-detail-wrapper')}>
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
                      {intl.get(`${promptCode}.view.message.panel.basicInfoHeader`).d('基本信息')}
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
                showArrow={false}
                key="myQuestion"
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.myQuestion`).d('我的问题')}</h3>
                    <a>
                      {collapseKeys.includes('myQuestion')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('myQuestion') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <CreateTable sourceFrom={sourceFrom} fetchMyQuestion={this.fetchMyQuestion} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
