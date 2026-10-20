/**
 * Create - 新建问题
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Fragment } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { isUndefined, isEmpty, cloneDeep } from 'lodash';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { filterNullValueObject, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import classnames from 'classnames';
import { Header, Content } from 'components/Page';
import { Button, Collapse, Icon, Modal, Spin } from 'hzero-ui';
import CreateForm from './CreateForm';
import CreateTable from './CreateTable';

const { Panel } = Collapse;

const promptCode = 'ssrc.supplierBid';

@connect(({ supplierBid, loading }) => ({
  supplierBid,
  code: supplierBid.code,
  questionInformationHeader: supplierBid.questionInformationHeader,
  questionRowsList: supplierBid.questionRowsList,
  deleteLoading: loading.effects['supplierBid/deleteQuestion'],
  submitLoading: loading.effects['supplierBid/submitQuestion'],
  saveLoading: loading.effects['supplierBid/saveQuestion'],
  questionRowsPagination: supplierBid.questionRowsPagination,
}))
export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['questionInformation', 'myQuestion'], // 打开的折叠面板key
      bidNum: null, // 寻源编号
      quotationHeaderId: null, // 投标头id
      issueHeaderId: null, // 存储头id
      supplierCompanyId: null, // 存储供应商公司id
      bidHeaderId: null, // 招标头id
    };
  }

  form;

  componentDidMount() {
    const { dispatch, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const headerId = parseInt(routerParam.issueHeaderId, 10);

    this.fetchStatusvalues();

    this.setState({
      bidNum: routerParam.bidNum,
      quotationHeaderId: routerParam.quotationHeaderId,
      issueHeaderId: headerId,
      supplierCompanyId: routerParam.supplierCompanyId,
      bidHeaderId: routerParam.bidHeaderId,
    });

    // 新建时没有数据
    if (!headerId) {
      dispatch({
        type: 'supplierBid/updateState',
        payload: {
          questionInformationHeader: [],
          questionRowsList: [],
          questionRowsPagination: {},
        },
      });
    } else {
      this.handleQueryHeader(headerId);
      dispatch({
        type: 'supplierBid/fetchQuestionRows',
        payload: {
          issueHeaderId: headerId,
        },
      });
    }
  }

  // // 卸载阶段清空数据
  // componentWillUnmount() {
  //   this.props.dispatch({
  //     type: 'supplierBid/updateState',
  //     payload: {
  //       questionInformationHeader: [],
  //       questionRowsList: [],
  //       questionRowsPagination: {},
  //     },
  //   });
  // }

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
      type: 'supplierBid/batchCode',
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
      type: 'supplierBid/fetchQuestionHeader',
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
      type: 'supplierBid/fetchQuestionRows',
      payload: {
        page,
        issueHeaderId,
      },
    });
  }

  @Bind()
  handleSave(params) {
    const { dispatch, questionRowsPagination } = this.props;
    dispatch({
      type: 'supplierBid/saveQuestion',
      payload: params,
    }).then((res) => {
      if (res) {
        this.handleQueryHeader(res.issueHeaderId);
        dispatch({
          type: 'supplierBid/fetchQuestionRows',
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
    const { questionRowsList = [], questionInformationHeader } = this.props;
    const { issueHeaderId, supplierCompanyId, bidHeaderId } = this.state;
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
          sourceId: bidHeaderId,
          supplierCompanyId,
          sourceType: 'BID',
        },
        issueLines: AllQuestionList,
      };
    } else {
      params = {
        issueHeader: {
          ...formValues,
          sourceId: bidHeaderId,
          issueHeaderId,
          supplierCompanyId,
          sourceType: 'BID',
          _token: questionInformationHeader._token,
        },
        issueLines: AllQuestionList,
      };
    }

    if (isEmpty(questionRowsList)) {
      notification.warning({
        message: intl
          .get(`${promptCode}.model.supplierBid.notNllQuestionContent`)
          .d('问题不能为空!'),
      });
    } else if (!isEmpty(tableValues) || isEmpty(newRows)) {
      this.handleSave(params);
    } else {
      return null;
    }
  }

  @Bind()
  handleSubmit(params) {
    const { dispatch, history, submitLoading, location } = this.props;
    const { supplierCompanyId, quotationHeaderId, bidHeaderId } = this.state;
    const routerParam = queryString.parse(location?.search.substr(1));
    const { tenantId } = routerParam || {};
    const searchData = queryString.stringify({
      quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      flag: 2,
      tenantId,
    });
    const onOk = () => {
      dispatch({
        type: 'supplierBid/submitQuestion',
        payload: params,
      }).then((res) => {
        if (res) {
          notification.success();
          history.push(`/ssrc/supplier-bid-hall/question-list/${bidHeaderId}?${searchData}`);
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
    const { questionRowsList = [], questionInformationHeader } = this.props;
    const { issueHeaderId, supplierCompanyId, bidHeaderId } = this.state;
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
          sourceId: bidHeaderId,
          sourceType: 'BID',
        },
        issueLines: AllQuestionList,
      };
    } else {
      params = {
        issueHeader: {
          ...formValues,
          issueHeaderId,
          supplierCompanyId,
          sourceId: bidHeaderId,
          sourceType: 'BID',
          _token: questionInformationHeader._token,
        },
        issueLines: AllQuestionList,
      };
    }

    if (isEmpty(questionRowsList)) {
      notification.warning({
        message: intl
          .get(`${promptCode}.model.supplierBid.notNllQuestionContent`)
          .d('问题不能为空!'),
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
    const { dispatch, deleteLoading, history, location } = this.props;
    const { issueHeaderId, quotationHeaderId, supplierCompanyId, bidHeaderId } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const { tenantId, bidNum } = routerParam || {};

    const onOk = () => {
      dispatch({
        type: 'supplierBid/deleteQuestion',
        payload: {
          issueHeaderId,
        },
      }).then((res) => {
        if (res) {
          const searchData = queryString.stringify({
            quotationHeaderId,
            supplierCompanyId,
            bidHeaderId,
            flag: 2,
            bidNum,
            tenantId,
          });
          history.push(`/ssrc/supplier-bid-hall/question-list/${bidHeaderId}?${searchData}`);
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
    const { collapseKeys } = this.state;
    const {
      questionInformationHeader = {},
      saveLoading,
      code: { issueStatus = [] },
      location,
    } = this.props;
    const { quotationHeaderId, bidNum, supplierCompanyId, bidHeaderId } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const { tenantId } = routerParam || {};

    const createFormProps = {
      issueStatus,
      questionInformationHeader,
      onRef: this.handleBindRef,
      sourceNum: bidNum,
    };
    const searchData = queryString.stringify({
      bidNum,
      quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      flag: 2,
      tenantId,
    });
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.questionPreview`).d('新建问题')}
          backPath={`/ssrc/supplier-bid-hall/question-list/${bidHeaderId}?${searchData}`}
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
                <CreateTable fetchMyQuestion={this.fetchMyQuestion} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
