import React, { PureComponent } from 'react';
import { Select, Tooltip, Form, Input, Button, Modal, Checkbox } from 'hzero-ui';
import {
  Modal as C7nModal,
  Form as C7nForm,
  TextArea as C7nTextArea,
  DataSet,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, isFunction } from 'lodash';

import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { returnDS } from './lineDS';
import RankOperationRecord from './RankOperationRecord';
import styles from './index.less';

const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

export default class QualificationReview extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      rankModelVisible: false, // 评分模态框
      controllerModalVisible: false, // 关闭控制
      inquiryModelVisible: false, // 再次询价模块框
      prequalGroupSupplierLineStatus: undefined,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  returnDs = new DataSet(returnDS());

  componentDidMount() {
    this.fetchQualificationLine();
  }

  /**
   * 资格预审-行信息 - 分标段
   */
  @Bind()
  fetchQualificationLine(page = {}) {
    const {
      prequalGroupHeaderId,
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
      remote,
    } = this.props;
    console.log(remote, 111);

    let data = {
      organizationId,
      prequalGroupHeaderId,
      page,
    };

    data = remote
      ? remote.process(
          'SSRC_PREQUAL_DETAIL_SECTION_PROCESS_FETCHQUALIFICATIONLINEREVIEW_DATA',
          data,
          {
            page,
            that: this,
          }
        )
      : data;

    // 查看资格审查行信息
    dispatch({
      type: `${modelName}/fetchQualificationSectionLineList`,
      payload: data || {},
    });
  }

  /**
   * 打开评分细项模态框
   */
  @Bind()
  goRankDetail(record) {
    this.setState({
      rankModelVisible: true,
    });
    const { dispatch, organizationId, modelName = 'qualificationExamination' } = this.props;
    const page = {};
    this.setState({
      prequalGroupSupplierLineStatus: record.prequalGroupSupplierLineStatus,
    });
    dispatch({
      type: `${modelName}/fetchQualificationSectionRankList`,
      payload: {
        page,
        organizationId,
        prequalGroupSupplierLineId: record.prequalGroupSupplierLineId,
      },
    });
  }

  /**
   * 隐藏评分细项模态框
   */
  @Bind()
  hideRankModel() {
    const { dispatch, modelName = 'qualificationExamination' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        qualificationRank: [],
      },
    });
    this.setState({ rankModelVisible: false });
  }

  /**
   * 保存评分细项
   */
  @Bind()
  saveRank() {
    const {
      qualificationExamination: { qualificationRank = [], qualificationLinePagination = {} },
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
    } = this.props;
    const validateDataSource = getEditTableData(qualificationRank);
    if (!isEmpty(validateDataSource)) {
      dispatch({
        type: `${modelName}/saveQualificationSectionRankList`,
        payload: {
          validateDataSource,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          // 评分细项
          this.hideRankModel();
          dispatch({
            type: `${modelName}/updateState`,
            payload: {
              qualificationRank: [],
            },
          });
          this.fetchQualificationLine(qualificationLinePagination);
        }
      });
    }
  }

  // 重新构造行数据
  reStructureLine(line = []) {
    if (isEmpty(line)) {
      return [];
    }

    const newData = line.map((item) => {
      const { approvedStatus = null } = item || {};
      return { ...item, lineApprovedStatus: approvedStatus };
    });

    return newData;
  }

  /**
   * 资格审查-保存资格审查
   */
  @Bind()
  async saveQualificationLine() {
    const {
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
      qualificationExamination: { qualificationLine = [], qualificationLinePagination = {} },
    } = this.props;
    if (isEmpty(qualificationLine)) return true;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      const ReStructureLineLine = this.reStructureLine(validateDataSource);

      return dispatch({
        type: `${modelName}/saveQualificationSectionExamination`,
        payload: {
          prequalGroupSupplierLines: ReStructureLineLine,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchQualificationLine(qualificationLinePagination);
        }
        return true;
      });
    } else {
      return false;
    }
  }

  /**
   * `下次不再显示info-modal`, 点击确认
   */
  @Bind()
  handleTipsModalOk(cb, params) {
    if (this.modalInfo) {
      // 用户记忆
      this.modalInfo.destroy();
      // eslint-disable-next-line no-unused-expressions
      isFunction(cb) && cb(params);
    }
  }

  /**
   * 资格审查-提交资格审查
   */
  @Bind()
  submitQualificationLine() {
    const {
      // prequalGroupHeaderId,
      qualificationExamination: { qualificationLine = [] },
      hideTipsFlag,
      prequalCheckedKeyList = [],
    } = this.props;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      const ReStructureLineLine = this.reStructureLine(validateDataSource);

      if (prequalCheckedKeyList?.length === 1 && !hideTipsFlag) {
        this.modalInfo = Modal.info({
          title: intl.get(`ssrc.supplierQuotation.view.title.tips`).d('提示'),
          content: (
            <div>
              <span>
                {intl
                  .get(`ssrc.supplierQuotation.view.message.submitCurrentGroupPrequalMsg`)
                  .d(
                    '是否确认仅提交当前分组的资格预审信息？若需要批量提交所有分组，请先点击选择分组按钮，勾选分组后一起提交'
                  )}
              </span>
              <Checkbox onChange={this.handleChangeHideTips}>
                <span>
                  {intl
                    .get(`ssrc.supplierQuotation.view.message.neverShowAgainTips`)
                    .d('下次不再提示')}
                </span>
              </Checkbox>
            </div>
          ),
          onOk: () => this.handleTipsModalOk(this.submitAfterValidation, ReStructureLineLine),
        });
      } else {
        this.submitAfterValidation(ReStructureLineLine);
      }
    }
  }

  // 校验成功后
  @Bind()
  submitAfterValidation(validateDataSource = []) {
    const {
      dispatch,
      organizationId,
      // leaderFlag,
      skipFlag = false,
      modelName = 'qualificationExamination',
      // prequalGroupHeaderId,
      qualificationExamination: { qualificationLinePagination = {} },
      prequalGroupHeaderId,
      prequalCheckedKeyList = [],
    } = this.props;
    dispatch({
      type: `${modelName}/submitQualificationExamination`,
      payload: {
        prequalGroupHeaderIds: isEmpty(prequalCheckedKeyList)
          ? [prequalGroupHeaderId]
          : prequalCheckedKeyList,
        prequalGroupSupplierLines: validateDataSource,
        organizationId,
        skipFlag: Number(skipFlag),
      },
    }).then((res) => {
      // 为0时进行操作
      // if (res === 0) {
      //   this.setState({ inquiryModelVisible: true });
      // }
      // 为1时进行操作
      // if (res === 1) {
      //   notification.success();
      //   this.props.dispatch(
      //     routerRedux.push({
      //       pathname: `/ssrc/qualification-examination/list`,
      //     })
      //   );
      // }
      if (res) {
        notification.success();
        this.fetchQualificationLine(qualificationLinePagination);
        // if (leaderFlag) {
        // 如果是专家组长，提交资格审查后，需要查询资格审查汇总
        //   dispatch({
        //     type: `${modelName}/fetchQualificationSum`,
        //     payload: {
        //       prequalGroupHeaderId,
        //     },
        //   });
        // }
      }
    });
  }

  /**
   * hideInquiryModel-隐藏再次询价
   */
  @Bind()
  hideInquiryModel() {
    this.setState({ inquiryModelVisible: false });
  }

  /**
   * hideControllModal-隐藏关闭
   */
  @Bind()
  hideControllModal() {
    this.setState({ controllerModalVisible: false });
  }

  /**
   * hideControllModal-隐藏关闭
   */
  @Bind()
  openControllModal() {
    this.setState({ controllerModalVisible: true });
  }

  @Bind()
  inquiryAgain() {
    const {
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
      qualificationExamination: { qualificationHeader = {} },
    } = this.props;
    Modal.confirm({
      title: intl.get(`ssrc.qualiExam.view.message.confirm.inquiryAgain`).d('确认是否再次询价'),
      onOk: () => {
        Modal.confirm({
          title: (
            <React.Fragment>
              <span>
                {intl.get(`ssrc.qualiExam.view.message.confirm.inquirySheet`).d(`询价单`)}
              </span>
              <span>
                {qualificationHeader.rfxNum}-{qualificationHeader.rfxTitle}
              </span>
              <span>
                {intl
                  .get(`ssrc.qualiExam.view.message.confirm.pleaseWait`)
                  .d(`状态已变为再次询价，请等待创建人维护并发布询价单`)}
              </span>
            </React.Fragment>
          ),
          onOk: () => {
            dispatch({
              type: `${modelName}/inquiryAgain`,
              payload: {
                organizationId,
                rfxHeaderId: qualificationHeader.rfxHeaderId,
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.props.history.push({
                  pathname: `/ssrc/qualification-examination/list`,
                });
              }
            });
          },
          onCancel: () => {},
        });
      },
      onCancel: () => {},
    });
  }

  /**
   *  关闭
   */
  @Bind()
  quotationControll() {
    const {
      organizationId,
      dispatch,
      form,
      modelName = 'qualificationExamination',
      qualificationExamination: { qualificationHeader = {} },
    } = this.props;
    const { getFieldValue, validateFields } = form;
    const remark = getFieldValue('closeReason');
    if (qualificationHeader.sourceCategory === 'BID') {
      validateFields((err) => {
        if (!err) {
          dispatch({
            type: `${modelName}/closeBid`,
            payload: {
              organizationId,
              bidHeaderId: parseInt(qualificationHeader.rfxHeaderId, 10),
              remark,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.props.history.push({
                pathname: `/ssrc/qualification-examination/list`,
              });
            }
          });
          this.setState({ controllerModalVisible: false });
        }
      });
    } else {
      validateFields((err) => {
        if (!err) {
          dispatch({
            type: `${modelName}/close`,
            payload: {
              organizationId,
              rfxHeaderIds: [parseInt(qualificationHeader.rfxHeaderId, 10)],
              remark,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.props.history.push({
                pathname: `/ssrc/qualification-examination/list`,
              });
            }
          });
          this.setState({ controllerModalVisible: false });
        }
      });
    }
  }

  /**
   * renderInquiry
   * 渲染再次询价确定框
   */
  @Bind()
  renderInquiry(qualificationHeader) {
    let content = (
      <span>
        <span>{intl.get(`ssrc.qualiExam.view.message.rfq`).d('寻源单')}</span>
        <span>
          {qualificationHeader.rfxNum} - {qualificationHeader.rfxTitle}
        </span>
        <span>
          {intl
            .get(`ssrc.qualiExam.view.message.closeInquiry`)
            .d('所有供应商预审审批不通过，请选择关闭此寻源单据或者再次询价')}
        </span>
      </span>
    );
    if (qualificationHeader.sourceCategory === 'BID') {
      content = (
        <span>
          <span>
            <span>{intl.get(`ssrc.qualiExam.view.message.bid`).d('招标书')}</span>
            <span>
              {qualificationHeader.rfxNum} - {qualificationHeader.rfxTitle}
            </span>
            <span>
              {intl
                .get(`ssrc.qualiExam.view.message.view.message.closeBid`)
                .d('所有供应商预审审批不通过，请选择关闭此招标书')}
            </span>
          </span>
        </span>
      );
    } else {
      content = (
        <span>
          <span>
            <span>{intl.get(`ssrc.qualiExam.view.message.rfq`).d('寻源单')}</span>
            <span>
              {qualificationHeader.rfxNum} - {qualificationHeader.rfxTitle}
            </span>
            <span>
              {intl
                .get(`ssrc.qualiExam.view.message.closeInquirys`)
                .d('所有供应商预审审批不通过，请选择关闭此寻源单据或者再次询价')}
            </span>
          </span>
        </span>
      );
    }

    return content;
  }

  /**
   * 退回操作弹框
   */
  @Bind()
  showReturn(record) {
    const {
      qualificationExamination: { qualificationLinePagination = {} },
    } = this.props;

    const postParams = {
      supplierCompanyId: record.supplierCompanyId,
      prequalGroupSupplierLineId: record.prequalGroupSupplierLineId,
      prequalGroupHeaderId: record.prequalGroupHeaderId,
    };
    this.returnDs.setQueryParameter('postParams', postParams);

    C7nModal.open({
      key: C7nModal.key(),
      title: intl.get('ssrc.qualiExam.model.qualiExam.returnRemark').d('退回说明'),
      style: {
        width: 520,
      },
      children: (
        <C7nForm dataSet={this.returnDs}>
          <C7nTextArea resize="vertical" name="returnRemark" />
        </C7nForm>
      ),
      onOk: async () => {
        if (await this.returnDs.validate()) {
          const res = await this.returnDs.submit();
          this.fetchQualificationLine(qualificationLinePagination);
          return res;
        } else {
          return false;
        }
      },
      onCancel: () => true,
      afterClose: () => this.returnDs.reset(),
    });
  }

  /**
   * renderChildren
   * 渲染开启 关闭 暂停确定框
   */
  @Bind()
  renderClose() {
    const { getFieldDecorator } = this.props.form;
    const content = (
      <Form.Item
        label={intl.get(`ssrc.qualiExam.model.qualiExam.closeReason`).d('关闭理由')}
        {...formLayout}
        className={styles.explainStyle}
      >
        {getFieldDecorator('closeReason', {
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`ssrc.qualiExam.model.qualiExam.closeReason`).d('关闭理由'),
              }),
            },
          ],
        })(<TextArea style={{ marginTop: '10px' }} autosize={{ minRows: 3, maxRows: 6 }} />)}
      </Form.Item>
    );
    return content;
  }

  renderColumns() {
    const {
      qualificationExamination: {
        code: { approvedStatus = [] },
        qualificationHeader,
      },
      organizationId,
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.applicationRemark`).d('资格预审申请说明'),
        dataIndex: 'applicationRemark',
        width: 180,
        render: (val) => (
          <Tooltip title={val} placement="topLeft">
            {val}
          </Tooltip>
        ),
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.viewFile`).d('附件查看'),
        dataIndex: 'validAttachmentUuid',
        width: 150,
        render: (val) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-prequal"
            attachmentUUID={val}
            tenantId={organizationId}
            icon="download"
            viewOnly
            filePreview
          />
        ),
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.scoringDetail`).d('评分细项'),
        dataIndex: 'rfxTitle',
        width: 120,
        render: (val, record) =>
          record.enableScoreFlag === 1 ? (
            <a onClick={() => this.goRankDetail(record)}>
              {`${intl.get(`ssrc.qualiExam.model.qualiExam.scoringDetail`).d('评分细项')}`}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.totalScore`).d('总分'),
        dataIndex: 'totalScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.lineApproved`).d('预审结果'),
        dataIndex: 'lineApprovedStatus',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('approvedStatus', {
                initialValue: val,
                rules: [
                  {
                    required: record.prequalGroupSupplierLineStatus !== 'RETURNED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.qualiExam.model.qualiExam.approved`).d('审批'),
                    }),
                  },
                ],
              })(
                record.prequalGroupSupplierLineStatus === 'APPROVED' ||
                  record.prequalGroupSupplierLineStatus === 'REFUSED' ||
                  record.prequalGroupSupplierLineStatus === 'RETURNED' ? (
                    <span>{record.lineApprovedStatusMeaning}</span>
                ) : (
                  <Select style={{ width: '100%' }}>
                    {approvedStatus.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'approvedRemark',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('approvedRemark', {
                initialValue: val,
                rules: [
                  {
                    max: 500,
                    message: intl.get('hzero.common.validation.max', {
                      max: 500,
                    }),
                  },
                ],
              })(
                record.prequalGroupSupplierLineStatus === 'APPROVED' ||
                  record.prequalGroupSupplierLineStatus === 'REFUSED' ||
                  record.prequalGroupSupplierLineStatus === 'RETURNED' ? (
                    <span>
                      <Tooltip title={val}>{val}</Tooltip>
                    </span>
                ) : (
                  <Input />
                )
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.returnDocuments`).d('退回预审文件'),
        dataIndex: 'returnDocuments',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            record.prequalGroupSupplierLineStatus === 'RETURNED' ? (
              intl.get(`ssrc.qualiExam.model.qualiExam.returned`).d('已退回')
            ) : record.prequalGroupSupplierLineStatus === 'APPROVED' ||
              record.prequalGroupSupplierLineStatus === 'REFUSED' ? (
              ''
            ) : (
              <a onClick={() => this.showReturn(record)}>
                {intl.get(`ssrc.qualiExam.model.qualiExam.return`).d('退回')}
              </a>
            )
          ) : (
            val
          ),
      },
    ];
    if (!qualificationHeader.enableScoreFlag) {
      columns.splice(4, 2);
    }
    return columns;
  }

  /**
   * 批量修改预审结果
   */
  @Bind()
  handleBatchChangeApproved(value) {
    const { selectedRows = [], selectedRowKeys = [] } = this.state;
    if (isArray(selectedRowKeys) && selectedRowKeys[0]) {
      selectedRows.forEach((item) => {
        if (
          item &&
          item.$form &&
          !['APPROVED', 'REFUSED', 'RETURNED'].includes(item.prequalGroupSupplierLineStatus)
        ) {
          const form = item.$form;
          form.setFieldsValue({
            approvedStatus: value,
          });
        }
      });
    }
  }

  /**
   * 修改勾选行
   * @param {Array} selectedRowKeys - 勾选行集合
   */
  @Bind()
  handleChangeSelectedRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render() {
    const {
      rankListLoading,
      saveRankLoading,
      fetchQualificationLoading,
      qualificationExamination: {
        qualificationHeader = {},
        qualificationLine = [],
        qualificationLinePagination = {},
        qualificationRank = [],
        qualificationRankPagination = {},
        code: { detailApprovedStatus = [], approvedStatus = [] },
      },
    } = this.props;
    const {
      rankModelVisible,
      inquiryModelVisible,
      controllerModalVisible,
      prequalGroupSupplierLineStatus,
      selectedRowKeys,
    } = this.state;
    const operationRecordProps = {
      detailApprovedStatus,
      rankListLoading,
      saveRankLoading,
      saveRank: this.saveRank,
      prequalGroupSupplierLineStatus,
      visible: rankModelVisible,
      hideModal: this.hideRankModel,
      pagination: qualificationRankPagination,
      dataSource: qualificationRank,
    };
    const inquiryModelProps = {
      visible: inquiryModelVisible,
      title: intl.get(`ssrc.qualiExam.view.message.button.rfxAgain`).d('再次询价'),
      width: '420px',
      // okText: '再次询价',
      // cancelText: '关闭询价单',
      onOk: () => {
        this.inquiryAgain();
      },
      onCancel: () => {
        this.hideInquiryModel();
      },
    };
    const controllModalProps = {
      visible: controllerModalVisible,
      title: intl.get(`ssrc.qualiExam.view.message.button.close`).d('关闭'),
      width: '420px',
      onOk: () => {
        this.quotationControll();
      },
      onCancel: () => {
        this.hideControllModal();
      },
    };

    return (
      <React.Fragment>
        <div style={{ textAlign: 'right', marginBottom: '8px' }}>
          {qualificationLine && qualificationLine[0] && qualificationLine[0].enabledSubmitFlag > 0 && (
            <React.Fragment>
              <span style={{ marginRight: '8px' }}>
                {intl.get(`ssrc.qualiExam.model.qualiExam.lineApproved`).d('预审结果')}:{' '}
              </span>
              <Select
                allowClear
                style={{ width: '140px', marginRight: '8px' }}
                onChange={this.handleBatchChangeApproved}
              >
                {approvedStatus &&
                  approvedStatus.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            </React.Fragment>
          )}
        </div>
        <EditTable
          bordered
          rowKey="prequalGroupSupplierLineId"
          loading={fetchQualificationLoading}
          columns={this.renderColumns()}
          onChange={this.fetchQualificationLine}
          dataSource={qualificationLine}
          pagination={qualificationLinePagination}
          rowSelection={{
            selectedRowKeys,
            onChange: this.handleChangeSelectedRows,
          }}
        />
        <RankOperationRecord {...operationRecordProps} />
        {controllerModalVisible && <Modal {...controllModalProps}>{this.renderClose()}</Modal>}
        {inquiryModelVisible && qualificationHeader.sourceCategory !== 'BID' && (
          <Modal
            footer={[
              <Button key="back" onClick={this.inquiryAgain}>
                {intl.get(`ssrc.qualiExam.view.message.button.rfxAgain`).d('再次询价')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={fetchQualificationLoading}
                onClick={this.openControllModal}
              >
                {intl.get(`ssrc.qualiExam.view.message.button.closeRfx`).d('关闭询价单')}
              </Button>,
            ]}
            {...inquiryModelProps}
          >
            {this.renderInquiry(qualificationHeader)}
          </Modal>
        )}
        {inquiryModelVisible && qualificationHeader.sourceCategory === 'BID' && (
          <Modal
            footer={[
              <Button
                key="submit"
                type="primary"
                loading={fetchQualificationLoading}
                onClick={this.openControllModal}
              >
                {intl.get(`ssrc.qualiExam.view.message.button.closeBid`).d('关闭招标书')}
              </Button>,
            ]}
            {...inquiryModelProps}
          >
            {this.renderInquiry(qualificationHeader)}
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
