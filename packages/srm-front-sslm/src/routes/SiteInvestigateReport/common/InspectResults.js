/**
 * InspectResults - 考评结果
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { connect } from 'dva';
import intl from 'utils/intl';
import { unionBy, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Form, Row, Col, Input, Spin, Modal, Button, Select, InputNumber } from 'hzero-ui';

import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import Table from 'srm-front-boot/lib/components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import classnames from 'classnames';
import commonStyles from '@/routes/index.less';
import styles from './common.less';

const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;
const { TextArea, Search } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@Form.create({ fieldNameProp: null })
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryResults'],
  queryCopyPersonLoading: loading.effects['siteInvestigateReport/queryCopyPerson'],
  queryBasicLoading: loading.effects['siteInvestigateReport/queryReceivedBasicInfo'],
}))
export default class InspectResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
      scoreResults: {},
      saveSelectedRows: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { evalHeaderId: prevEvalHeaderId } = prevProps;
    const { evalHeaderId } = this.props;
    return evalHeaderId !== prevEvalHeaderId;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.queryResults();
    }
  }

  componentDidMount() {
    const { onRef = e => e } = this.props;
    onRef(this);
    this.queryResults();
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 查询抄送人
   */
  @Bind()
  queryCopyPerson(page = {}) {
    const { dispatch, form: { getFieldsValue = e => e } = {} } = this.props;
    const formValue = getFieldsValue();
    const { loginName, userName } = formValue;
    dispatch({
      type: 'siteInvestigateReport/queryCopyPerson',
      payload: {
        page,
        tenantId,
        lovCode: 'SPUC.ACCEPT_USER',
        loginName,
        userName,
      },
    });
  }

  // 校验数据
  @Bind()
  checkData() {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    let resultsValues = null;
    return new Promise((resolve, reject) => {
      validateFieldsAndScroll({ force: true }, (err, fieldsValue) => {
        if (err) {
          reject();
        } else {
          resultsValues = fieldsValue;
          resolve(resultsValues);
        }
      });
    });
  }

  /**
   * 重置抄送人
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 抄送人弹框
   */
  @Bind()
  handleModal(keyword = '') {
    const { modalVisible, saveSelectedRows = [], selectedRows = [] } = this.state;
    this.setState({ modalVisible: !modalVisible });
    if (!modalVisible) {
      this.queryCopyPerson();
    }
    if (keyword === 'cancel') {
      this.setState({
        selectedRows: saveSelectedRows,
        selectedRowKeys: saveSelectedRows.map(n => n.userId),
      });
    } else if (keyword === 'ok') {
      this.setState({ saveSelectedRows: selectedRows });
    }
  }

  /**
   * 最终结果查询
   */
  @Bind()
  queryResults() {
    const { dispatch, evalHeaderId, entrance = '', customizeUnitCode = '' } = this.props;
    const type =
      entrance === 'receive'
        ? 'siteInvestigateReport/queryReceivedBasicInfo'
        : 'siteInvestigateReport/queryResults';
    dispatch({
      type,
      payload: { evalHeaderId, customizeUnitCode },
    }).then(res => {
      if (res) {
        this.setState({
          scoreResults: res,
          selectedRows: res.userNames,
          selectedRowKeys: (res.userNames || []).map(n => n.userId),
          saveSelectedRows: res.userNames || [],
        });
      }
    });
  }

  @Bind()
  getRemoteRender(param = {}) {
    const { isEdit } = param;
    const { scoreResults = {} } = this.state;
    const { siteReportRemote, form } = this.props;
    const remoteProps = {
      form,
      isEdit,
      dataSource: scoreResults,
    };
    // 获取埋点组件，此处用remote.render和个性化不兼容，所以用remote.process
    const rowDom = siteReportRemote ? (
      siteReportRemote.process(
        'SSLM_SITE_INVESTIGATE_REPORT_INSPECT_RESULT_PROCESS',
        <></>,
        remoteProps
      )
    ) : (
      <></>
    );
    return rowDom;
  }

  render() {
    const {
      entrance = '',
      form: { getFieldDecorator = e => e } = {},
      siteInvestigateReport: { copyPersonList, copyPersonPagination },
      queryLoading,
      queryBasicLoading,
      queryCopyPersonLoading,
      evalType = '',
      evalStatus = '',
      isView = false,
      isPub = false,
      customizeForm,
      custLoading,
      customizeCode = '',
      resultsList = [],
      headerForm: { getFieldValue = e => e } = {},
    } = this.props;
    const { modalVisible, selectedRowKeys, selectedRows, scoreResults } = this.state;
    const needFeedbackFlag = getFieldValue('needFeedbackFlag'); // “需要供应商反馈信息”字段
    // 评分方式为线下评分+状态是已反馈+勾选了需要供应商反馈,"考察结果"页签可编辑,综合意见必填
    const isEdit =
      (['NEW', 'FINAL_COLLECTED', 'REJECTED', 'NEW_APPROVALED'].includes(evalStatus) ||
        (evalType === 'OFFLINE' && evalStatus === 'FEEDBACK' && needFeedbackFlag)) &&
      !isView &&
      !isPub;

    const columns = [
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.account').d('账户'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.userName').d('用户名'),
        dataIndex: 'userName',
        width: 120,
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.handleRowSelectChange,
    };

    const spinning = entrance === 'receive' ? queryBasicLoading : queryLoading;

    const FormContent = (
      <Form
        className="ued-edit-form form-wrap"
        style={{ padding: '0 12px' }}
        custLoading={custLoading}
      >
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.finalScore').d('最终得分')}
            >
              {isEdit && evalType === 'OFFLINE'
                ? getFieldDecorator('finalScore', {
                    initialValue: scoreResults.finalScore,
                  })(<InputNumber />)
                : getFieldDecorator('finalScore', {
                    initialValue: scoreResults.finalScore,
                  })(<InputNumber disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.level').d('等级')}
            >
              {isEdit && evalType === 'OFFLINE'
                ? getFieldDecorator('grade', {
                    initialValue: scoreResults.grade,
                  })(<Input />)
                : getFieldDecorator('grade', {
                    initialValue: scoreResults.grade,
                  })(<span>{scoreResults.grade}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.results').d('考察结果')}
            >
              {isEdit
                ? getFieldDecorator('resultsFlag', {
                    initialValue: scoreResults.resultsFlag,
                    rules: [
                      {
                        required:
                          !(evalType === 'OFFLINE' && needFeedbackFlag && evalStatus === 'NEW') ||
                          (evalType === 'OFFLINE' && needFeedbackFlag && evalStatus === 'FEEDBACK'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.results')
                            .d('考察结果'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {resultsList.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : getFieldDecorator('resultsFlag', {
                    initialValue: scoreResults.resultsFlag,
                  })(<span>{scoreResults.resultsFlagMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(commonStyles['custom-row-16'], 'writable-row')}>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.compositeOpinion')
                .d('综合意见')}
            >
              {isEdit
                ? getFieldDecorator('opinion', {
                    rules: [
                      {
                        required:
                          !(evalType === 'OFFLINE' && needFeedbackFlag && evalStatus === 'NEW') ||
                          (evalType === 'OFFLINE' && needFeedbackFlag && evalStatus === 'FEEDBACK'),
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.compositeOpinion')
                            .d('综合意见'),
                        }),
                      },
                    ],
                    initialValue: scoreResults.opinion,
                  })(<TextArea style={{ resize: 'none' }} />)
                : getFieldDecorator('opinion', {
                    initialValue: scoreResults.opinion,
                  })(<span>{scoreResults.opinion}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(commonStyles['custom-row-16'], 'writable-row')}>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.copyTo').d('抄送（知会）')}
            >
              {isEdit
                ? getFieldDecorator('informUserIds', {
                    initialValue: unionBy(selectedRows, 'userId')
                      .map(n => n.userName)
                      .join('，'),
                  })(<Search placeholder="" onSearch={() => this.handleModal()} />)
                : getFieldDecorator('informUserIds', {
                    initialValue: scoreResults.informUserIds,
                  })(
                    <span>
                      {scoreResults.userNames &&
                        scoreResults.userNames.map(n => n.userName).join('，')}
                    </span>
                  )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.resultAttachment')
                .d('评审结果附件')}
            >
              {getFieldDecorator('resultLinkUuid', {
                initialValue: scoreResults.resultLinkUuid,
              })(
                <Upload
                  viewOnly={!isEdit}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sslm-site-investigate"
                  filePreview
                  attachmentUUID={scoreResults.resultLinkUuid}
                  modalClassName={isPub ? styles['pub-attachment'] : ''}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        {this.getRemoteRender({ isEdit })}
      </Form>
    );

    return (
      <Spin spinning={spinning}>
        {isFunction(customizeForm)
          ? customizeForm(
              {
                code: customizeCode, // 必传，和unitCode一一对应
                form: this.props.form, // 无论个性化单元是否只读，均必传
                dataSource: scoreResults, // 必传，从后端接口获取到的数据
                readOnly: !isEdit,
              },
              FormContent
            )
          : FormContent}
        {modalVisible && (
          <Modal
            width={720}
            title={intl.get('sslm.siteInvestigateReport.view.message.cc').d('抄送人')}
            visible={modalVisible}
            onOk={() => this.handleModal('ok')}
            onCancel={() => this.handleModal('cancel')}
          >
            <Form>
              <Row gutter={24} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Row style={{ display: 'flex', alignItems: 'center' }}>
                    <Col span={8}>
                      {intl.get('sslm.siteInvestigateReport.modal.mange.account').d('账户')}:
                    </Col>
                    <Col span={16}>{getFieldDecorator('loginName')(<Input trim />)}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Row style={{ display: 'flex', alignItems: 'center' }}>
                    <Col span={8}>
                      {intl.get('sslm.siteInvestigateReport.modal.mange.userName').d('用户名')}:
                    </Col>
                    <Col span={16}>{getFieldDecorator('userName')(<Input trim />)}</Col>
                  </Row>
                </Col>
                <Col span={8}>
                  <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.queryCopyPerson}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Col>
              </Row>
            </Form>
            <Spin spinning={queryCopyPersonLoading}>
              <Table
                bordered
                rowKey="userId"
                columns={columns}
                rowSelection={rowSelection}
                dataSource={copyPersonList}
                onChange={this.queryCopyPerson}
                pagination={copyPersonPagination}
              />
            </Spin>
          </Modal>
        )}
      </Spin>
    );
  }
}
