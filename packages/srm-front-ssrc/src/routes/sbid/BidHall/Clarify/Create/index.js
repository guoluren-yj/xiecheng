/**
 * 澄清函预览入口
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import React, { Component, Fragment } from 'react';
import { Button, Form, Spin, Collapse, Modal, Icon } from 'hzero-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
// import TinymceEditor from 'components/TinymceEditor';
import RichTextEditor from 'components/RichTextEditor';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';

import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import { getClarifyHeaderInfo } from '@/services/inquiryHallService';

import querystring from 'querystring';
import BaseInfo from './BaseInfo';
import BaseTable from './BaseTable';

const { Panel } = Collapse;

@formatterCollections({
  code: ['ssrc.clarify', 'ssrc.common', 'ssrc.bidHall'],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  fetchClarifySaveLoading: loading.effects['bidHall/fetchClarifySave'],
  fetchClarifyReleaseLoading: loading.effects['bidHall/fetchClarifyRelease'],
  fetchClarifyScrappedLoading: loading.effects['bidHall/fetchClarifyScrapped'],
  clarificationQuestionLoading: loading.effects['bidHall/fetchClarifyReferIssue'],
  clarificationDetailsLoading: loading.effects['bidHall/fetchClarifyDetail'],
  clarificationDetails: bidHall.clarificationDetails,
  clarificationQuestionList: bidHall.clarificationQuestionList,
  clarificationQuestionPagination: bidHall.clarificationQuestionPagination,
  organizationId: getCurrentOrganizationId(),
  clarificationContext: bidHall.clarificationContext,
}))
@Form.create({ fieldNameProp: null })
export default class ClarifyCreate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'clarifyContent', 'clarifyQuestion'], // 打开的折叠面板key
      selectedkeys: [],
      // selectedRowsAll: [],
      headerInfo: {}, // 简单头查询基本信息
    };
  }

  form;

  componentDidMount() {
    const {
      match: { params },
      clarificationQuestionPagination,
    } = this.props;
    // 快码值集
    this.queryLov();
    if (!isUndefined(params.clarifyId)) {
      this.fetchDetail();
    } else if (isUndefined(params.clarifyId)) {
      this.props.dispatch({
        type: 'bidHall/updateState',
        payload: {
          clarificationContext: '',
        },
      });
      this.fetchHeaderInfo();
    } else if (!isUndefined(params.selectId)) {
      this.setState({
        selectedkeys: params.selectId.split(',').map((item) => Number(item)),
      });
    }
    this.handleClarificationQuestion(clarificationQuestionPagination);
  }

  // 卸载阶段清空数据
  componentWillUnmount() {
    this.props.dispatch({
      type: 'bidHall/updateState',
      payload: {
        clarificationDetails: {},
        selectedkeys: [],
        selectedRowsAll: [],
        clarificationContext: undefined,
        clarificationQuestionList: [],
        clarificationQuestionPagination: {},
      },
    });
  }

  // 查询头信息
  @Bind()
  fetchHeaderInfo() {
    const { match: { params = {} } = {} } = this.props;
    getClarifyHeaderInfo({ sourceHeaderId: params.sourceId, sourceFrom: 'BID' }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          headerInfo: result,
        });
      }
    });
  }

  /**
   * 值集查询
   */
  @Bind()
  queryLov() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 查询详情页面信息
   */
  @Bind()
  fetchDetail() {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    dispatch({
      type: 'bidHall/fetchClarifyDetail',
      payload: {
        organizationId,
        clarifyId: params.clarifyId,
      },
    });
  }

  /**
   * 澄清函引用问题
   */
  @Bind()
  handleClarificationQuestion(page = {}) {
    const { dispatch, match, organizationId } = this.props;
    dispatch({
      type: 'bidHall/fetchClarifyReferIssue',
      payload: {
        page,
        organizationId,
        clarifyId: match.params.clarifyId,
        sourceId: match.params.sourceId,
        sourceType: 'BID',
      },
    }).then((res) => {
      if (res) {
        const list = res.content;
        const questionRows = [];
        const questionRowsAll = [];
        // 根据参数clarifyId判断,不存在则是新建，选中的问题从前一个页面获取，反之根据clarifyId判断
        if (!isUndefined(match.params.clarifyId)) {
          for (const key in list) {
            if (list[key].clarifyId && list[key].clarifyId.toString() === match.params.clarifyId) {
              questionRows.push(list[key].issueLineId);
              questionRowsAll.push(list[key]);
            }
          }
          this.setState({
            selectedkeys: questionRows,
            // selectedRowsAll: questionRowsAll,
          });
        } else if (!isUndefined(match.params.selectId)) {
          const selectList = match.params.selectId.split(',').map((item) => Number(item));
          for (let key = 0; key < selectList.length; key++) {
            for (let row = 0; row < list.length; row++) {
              if (list[row].issueLineId === selectList[key]) {
                questionRowsAll.push(list[key]);
              }
            }
          }
          this.setState({
            selectedkeys: selectList,
            // selectedRowsAll: questionRowsAll,
          });
        }
      }
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
   * 获取子组件参数
   * @param ref = {}
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 保存
   * @return promise
   */
  @Bind()
  fetchSaveBaseInfo() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      match,
      // clarificationContext,
    } = this.props;
    const { selectedkeys, headerInfo } = this.state;
    this.form.validateFields((err, values) => {
      if (!err) {
        if (isEmpty(this.richTextEditor.getContent())) {
          notification.warning({
            message: intl
              .get(`ssrc.clarify.model.bidHall.clarifyMainContentNotBeNull`)
              .d('澄清函正文不能为空'),
          });
        } else {
          dispatch({
            type: 'bidHall/fetchClarifySave',
            payload: {
              ...clarificationDetails,
              ...values,
              organizationId,
              sourceId: match.params.sourceId,
              sourceType: 'BID',
              companyId: headerInfo?.companyId ?? match.params.companyId,
              issueLineIdList: selectedkeys,
              context: this.richTextEditor.getContent(),
            },
          }).then((res) => {
            if (res) {
              notification.success();
              dispatch({
                type: 'bidHall/fetchClarifyDetail',
                payload: {
                  organizationId,
                  clarifyId: res.clarifyId,
                },
              });
            }
          });
        }
      }
    });
  }

  /**
   *  表格默认勾选列
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({
      selectedkeys: selectedRowKeys,
      // selectedRowsAll: selectedRows,
    });
  };

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidHall/updateState',
      payload: {
        clarificationContext: dataSource,
      },
    });
  }

  /**
   * 执行提交
   * @param
   */
  @Bind()
  fetchclarifySubmit() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      match,
      fetchClarifyRelease,
      location: { search = {} },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { createFlag, isClarificationFlag, quotationEndDateFlag } = routerParams;
    const locationSearch = querystring.stringify({
      createFlag,
      isClarificationFlag,
      quotationEndDateFlag,
    });
    const { selectedkeys, headerInfo } = this.state;
    this.form.validateFields((err, values) => {
      if (!err) {
        if (isEmpty(this.richTextEditor.getContent())) {
          notification.warning({
            message: intl
              .get(`ssrc.clarify.model.bidHall.clarifyMainContentNotBeNull`)
              .d('澄清函正文不能为空'),
          });
        } else {
          const onOk = () => {
            dispatch({
              type: 'bidHall/fetchClarifyRelease',
              payload: {
                ...values,
                ...clarificationDetails,
                organizationId,
                sourceId: match.params.sourceId,
                sourceType: 'BID',
                companyId: headerInfo?.companyId ?? match.params.companyId,
                issueLineIdList: selectedkeys,
                context: this.richTextEditor.getContent(),
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.props.history.push({
                  pathname: `/ssrc/bid-hall/inter-question/${match.params.sourceId}/${match.params.bidNum}/sourceTitle/${match.params.companyId}/2`,
                  search: locationSearch,
                });
              }
            });
          };
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
            confirmLoading: fetchClarifyRelease,
            onOk,
          });
        }
      }
    });
  }

  /**
   * 澄清函删除
   */
  @Bind()
  fetchClarifyScrapped() {
    const {
      dispatch,
      clarificationDetails = {},
      organizationId,
      match,
      fetchClarifyScrappedLoading,
      location: { search = {} },
    } = this.props;
    const { createFlag, isClarificationFlag, quotationEndDateFlag } = querystring.parse(
      search.substr(1)
    );
    const locationSearch = querystring.stringify({
      createFlag,
      isClarificationFlag,
      quotationEndDateFlag,
    });
    const onOk = () => {
      dispatch({
        type: 'bidHall/fetchClarifyScrapped',
        payload: {
          organizationId,
          ...clarificationDetails,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.props.history.push({
            pathname: `/ssrc/bid-hall/inter-question/${match.params.sourceId}/${match.params.bidNum}/sourceTitle/${match.params.companyId}/2`,
            search: locationSearch,
          });
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      confirmLoading: fetchClarifyScrappedLoading,
      onOk,
    });
  }

  getBackPath() {
    const {
      match: { params = {} },
      location: { search = {} },
    } = this.props;
    const { createFlag, isClarificationFlag, quotationEndDateFlag } = querystring.parse(
      search.substr(1)
    );
    const url = `/ssrc/bid-hall/inter-question/${params.sourceId}/${params.bidNum}/sourceTitle/${params.companyId}/2?quotationEndDateFlag=${quotationEndDateFlag}&createFlag=${createFlag}&isClarificationFlag=${isClarificationFlag}`;
    return url;
  }

  render() {
    const {
      clarificationDetails,
      organizationId,
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarificationQuestionPagination,
      match,
      fetchClarifySaveLoading,
      fetchClarifyReleaseLoading,
      clarificationContext,
      bidHall: { code = {} },
    } = this.props;
    const { collapseKeys, selectedkeys, headerInfo } = this.state;
    const { context = '' } = clarificationDetails;
    const staticTextProps = {
      docType: 0,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-bid-header',
      privateBucket: true,
      content: context,
      onEditorChange: this.onRichTextEditorChange,
      ...(ChunkUploadProps || {}),
      fileSize: FILE_SIZE,
    };
    // const { getFieldDecorator } = this.props.form;
    const rowSelection = {
      selectedRowKeys: selectedkeys,
      onChange: this.onSelectChange,
    };
    const baseTableProps = {
      match,
      organizationId,
      clarificationQuestionLoading,
      clarificationQuestionList,
      clarifyType: code.clarifyType,
      clarificationQuestionPagination,
      onChange: this.handleClarificationQuestion,
      rowSelection,
    };
    return (
      <React.Fragment>
        <Header
          backPath={this.getBackPath()}
          title={intl.get(`ssrc.clarify.view.message.title.detail.clarifyCreate`).d('澄清函预览')}
        >
          <Button
            icon="check"
            type="primary"
            loading={fetchClarifyReleaseLoading || fetchClarifySaveLoading}
            onClick={this.fetchclarifySubmit}
          >
            {intl.get(`ssrc.clarify.common.button.submit`).d('发布')}
          </Button>
          <Button
            icon="save"
            onClick={this.fetchSaveBaseInfo}
            loading={fetchClarifySaveLoading || fetchClarifyReleaseLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            disabled={!clarificationDetails.clarifyId}
            onClick={this.fetchClarifyScrapped}
          >
            {intl.get(`ssrc.clarify.common.button.scrapped`).d('删除')}
          </Button>
          {/* <Popconfirm
            title={intl.get(`ssrc.clarify.common.warning.tilte.sureToSubmit`).d('你确定发布吗?')}
            okText={intl.get(`ssrc.clarify.common.action.sure`).d('确定')}
            cancelText={intl.get(`ssrc.clarify.common.action.cancel`).d('取消')}
            onConfirm={() => this.fetchclarifySubmit()}
          >
            <Button icon="check" loading={fetchClarifyRelease}>
              {intl.get(`ssrc.clarify.common.button.submit`).d('发布')}
            </Button>
          </Popconfirm>
          <Popconfirm
            title={intl.get(`ssrc.clarify.common.warning.tilte.sureToScrapped`).d('你确定删除吗?')}
            okText={intl.get(`ssrc.clarify.common.action.sure`).d('确定')}
            cancelText={intl.get(`ssrc.clarify.common.action.cancel`).d('取消')}
            onConfirm={() => this.fetchClarifyScrapped()}
          >
            <Button icon="delete" disabled={!clarificationDetails.clarifyId}>
              {intl.get(`ssrc.clarify.common.button.scrapped`).d('删除')}
            </Button>
          </Popconfirm> */}
        </Header>
        <Content>
          <Spin spinning={false} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={(arr) => this.onCollapseChange(arr, 'baseInfo')}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`ssrc.clarify.common.view.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfo"
              >
                <BaseInfo
                  clarificationDetails={clarificationDetails}
                  matchDate={match.params}
                  onRef={this.handleRef}
                  organizationId={organizationId}
                  clarifyStatus={code.clarifyStatus}
                  sourceNum={match.params.bidNum}
                  headerInfo={headerInfo}
                />
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
                <Form>
                  <Form.Item>
                    {/* {getFieldDecorator('context', {
                      initialValue: clarificationContext,
                      // rules: [
                      //   {
                      //     required: true,
                      //     message: intl.get('hzero.common.validation.notNull', {
                      //       name: intl.get(`ssrc.clarify.model.clarify.context`).d('澄清函正文'),
                      //     }),
                      //   },
                      // ],
                    })(
                      <RichTextEditor
                        {...staticTextProps}
                        ref={node => {
                          this.richTextEditor = node;
                        }}
                      />
                    )} */}
                    {clarificationContext !== undefined && (
                      <RichTextEditor
                        {...staticTextProps}
                        ref={(node) => {
                          this.richTextEditor = node;
                        }}
                      />
                    )}
                  </Form.Item>
                </Form>
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
                <BaseTable {...baseTableProps} />
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
