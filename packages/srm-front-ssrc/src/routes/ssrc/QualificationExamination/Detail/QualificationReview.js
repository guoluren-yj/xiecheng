import React, { PureComponent } from 'react';
import { Select, Tooltip, Form, Input, Button, Modal } from 'hzero-ui';
import {
  Modal as C7nModal,
  Form as C7nForm,
  TextArea as C7nTextArea,
  DataSet,
} from 'choerodon-ui/pro';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isArray } from 'lodash';
// import { routerRedux } from 'dva/router';
import qs from 'querystring';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { PRIVATE_BUCKET } from '_utils/config';

import { returnDS } from './lineDS';
import RankOperationRecord from './RankOperationRecord';
import styles from './index.less';

const { TextArea } = Input;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

class QualificationReview extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      rankModelVisible: false, // 评分模态框
      controllerModalVisible: false, // 关闭控制
      inquiryModelVisible: false, // 再次询价模块框
      prequalLineStatus: undefined,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  returnDs = new DataSet(returnDS());

  componentDidMount() {
    this.fetchQualificationLine();
  }

  /**
   * 资格预审-行信息
   */
  @Bind()
  fetchQualificationLine(page = {}) {
    const {
      prequalHeaderId,
      dispatch,
      organizationId,
      modelName = 'qualificationExamination',
      remote,
    } = this.props;

    const preParams = {
      organizationId,
      rfxHeaderId: prequalHeaderId,
      page,
      customizeUnitCode: 'SSRC_PREQUAL.QUALIFICATION_REVIEW',
    };

    const queryParams = remote ? remote.process('SSRC_PREQUAL_DETAIL_PROCESS_QUALIFICATIONREVIEW_QUERY_DATA', preParams, {
      that: this,
      page,
    }) : preParams;

    dispatch({
      type: `${modelName}/fetchQualificationLineList`,
      payload: queryParams || {},
    });
  }

  /**
   * 供应商编码跳转360页面
   */
  @Bind()
  handleJumpSuppler(record) {
    // e.preventDefault();
    const { supplierConfigOldUserFlag } = this.props;
    const {
      tenantId,
      companyId,
      supplierCompanyId,
      supplierTenantId: partnerTenantId,
      sourceKey: spfmPartnerCompanyId,
    } = record;
    const params = {
      tenantId,
      companyId,
      partnerCompanyId: supplierCompanyId,
      partnerTenantId,
      spfmPartnerCompanyId,
      supplierCompanyId,
    };
    const supplierTabKey = supplierConfigOldUserFlag
      ? '/sslm/include/supplier-manager/supplier-detail'
      : '/sslm/supplier-detail-new';

    if (window.top !== window) {
      window.parent.postMessage({
        type: 'link',
        data: JSON.stringify({
          pathname: supplierTabKey,
          search: qs.stringify(params),
        }),
      });
    } else {
      openTab({
        key: supplierTabKey,
        path: supplierTabKey,
        title: intl.get('hzero.common.view.message.360QueryDetail').d('供应商360查询'),
        search: qs.stringify(params),
        closable: true,
      });
    }
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
      prequalLineStatus: record.prequalLineStatus,
    });
    dispatch({
      type: `${modelName}/fetchQualificationRankList`,
      payload: {
        page,
        organizationId,
        prequalLineId: record.prequalLineId,
      },
    });
  }

  /**
   * 隐藏评分细项模态框
   */
  @Bind()
  hideRankModel() {
    this.setState({ rankModelVisible: false });
  }

  /**
   * 保存评分细项
   */
  @Bind()
  saveRank() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      qualificationExamination: { qualificationRank = [], qualificationLinePagination = {} },
      dispatch,
      organizationId,
    } = this.props;
    const validateDataSource = getEditTableData(qualificationRank);
    if (!isEmpty(validateDataSource)) {
      dispatch({
        type: `${modelName}/saveQualificationRankList`,
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
              qualificationLine: [],
            },
          });
          // 清空勾选数据
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
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
  @Debounce(1200)
  @Bind()
  saveQualificationLine() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
      attachmentUuid,
      qualificationExamination: {
        qualificationHeader = {},
        qualificationLine = [],
        qualificationLinePagination = {},
      },
    } = this.props;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      const ReStructureLineLine = this.reStructureLine(validateDataSource);

      dispatch({
        type: `${modelName}/saveQualificationExamination`,
        payload: {
          prequalHeaderDTO: {
            ...qualificationHeader,
            attachmentUuid,
          },
          prequalLineDTOList: ReStructureLineLine,
          organizationId,
          customizeUnitCode: 'SSRC_PREQUAL.QUALIFICATION_REVIEW',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchQualificationLine(qualificationLinePagination);
        }
      });
    }
  }

  /**
   * 资格审查-提交资格审查
   */
  @Debounce(1200)
  @Bind()
  submitQualificationLine() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
      attachmentUuid,
      // leaderFlag,
      skipFlag = false,
      // prequalHeaderId,
      qualificationExamination: {
        qualificationHeader = {},
        qualificationLine = [],
        qualificationLinePagination = {},
      },
    } = this.props;
    const validateDataSource = getEditTableData(qualificationLine);
    if (Array.isArray(validateDataSource) && validateDataSource.length !== 0) {
      const ReStructureLineLine = this.reStructureLine(validateDataSource);

      dispatch({
        type: `${modelName}/submitQualificationExamination`,
        payload: {
          prequalHeaderDTO: {
            ...qualificationHeader,
            attachmentUuid,
          },
          prequalLineDTOList: ReStructureLineLine,
          organizationId,
          skipFlag: Number(skipFlag),
          customizeUnitCode: 'SSRC_PREQUAL.QUALIFICATION_REVIEW',
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
          qualificationLine.forEach((item) => item?.$form?.resetFields());
          this.fetchQualificationLine(qualificationLinePagination);
          // if (leaderFlag) {
          // 如果是专家组长，提交资格审查后，需要查询资格审查汇总
          //   dispatch({
          //     type: `${modelName}/fetchQualificationSum`,
          //     payload: {
          //       prequalHeaderId,
          //     },
          //   });
          // }
        }
      });
    }
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

  @Debounce(800)
  @Bind()
  inquiryAgain() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      dispatch,
      organizationId,
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
  @Debounce(800)
  @Bind()
  quotationControll() {
    const { modelName = 'qualificationExamination' } = this.props;
    const {
      organizationId,
      dispatch,
      form,
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
      prequalLineId: record.prequalLineId,
      prequalHeaderId: record.prequalHeaderId,
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
        width: 100,
        render: (val, record) => <a onClick={() => this.handleJumpSuppler(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.applicationRemark`).d('资格预审申请说明'),
        dataIndex: 'applicationRemark',
        width: 200,
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
        title: intl.get(`ssrc.qualiExam.model.qualiExam.lineApprovedAdvice`).d('预审建议结果'),
        dataIndex: 'lineApprovedStatus',
        width: 180,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('approvedStatus', {
                initialValue: val,
                rules: [
                  {
                    required: record.prequalLineStatus !== 'RETURNED',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.qualiExam.model.qualiExam.approved`).d('审批'),
                    }),
                  },
                ],
              })(
                record.prequalLineStatus === 'APPROVED' ||
                  record.prequalLineStatus === 'REFUSED' ||
                  record.prequalLineStatus === 'RETURNED' ? (
                    <span>{record.lineApprovedStatusMeaning}</span>
                ) : (
                  <Select
                    style={{ width: '100%' }}
                    disabled={['0', 0].includes(record.prequalMethodFlag)}
                  >
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
        width: 120,
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
                record.prequalLineStatus === 'APPROVED' ||
                  record.prequalLineStatus === 'REFUSED' ||
                  record.prequalLineStatus === 'RETURNED' ? (
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
        title: intl.get(`ssrc.qualiExam.model.qualiExam.leaderSummaryRes`).d('组长汇总结果'),
        dataIndex: 'leaderSummaryResMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.qualiExam.model.qualiExam.returnDocuments`).d('退回预审文件'),
        dataIndex: 'returnDocuments',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            record.prequalLineStatus === 'RETURNED' ? (
              intl.get(`ssrc.qualiExam.model.qualiExam.returned`).d('已退回')
            ) : record.prequalLineStatus === 'APPROVED' ||
              record.prequalLineStatus === 'REFUSED' ? (
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
          !['APPROVED', 'REFUSED', 'RETURNED'].includes(item.prequalLineStatus)
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
      saveQualificationLoading,
      submitQualificationLoading,
      qualificationExamination: {
        qualificationHeader = {},
        qualificationLine = [],
        qualificationLinePagination = {},
        qualificationRank = [],
        qualificationRankPagination = {},
        code: { detailApprovedStatus = [], approvedStatus = [] },
      },
      customizeTable,
    } = this.props;
    const {
      rankModelVisible,
      inquiryModelVisible,
      controllerModalVisible,
      prequalLineStatus,
      selectedRowKeys,
    } = this.state;
    const operationRecordProps = {
      detailApprovedStatus,
      rankListLoading,
      saveRankLoading,
      saveRank: this.saveRank,
      prequalLineStatus,
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
          {qualificationLine &&
          qualificationLine[0] &&
          qualificationLine[0].enabledSubmitFlag > 0 ? (
            <Button
              onClick={this.saveQualificationLine}
              loading={saveQualificationLoading}
              style={{ marginRight: '8px' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          ) : (
            ''
          )}
          {qualificationLine &&
          qualificationLine[0] &&
          qualificationLine[0].enabledSubmitFlag > 0 ? (
            <Button
              type="primary"
              onClick={this.submitQualificationLine}
              loading={submitQualificationLoading}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          ) : (
            ''
          )}
        </div>
        {customizeTable(
          {
            code: 'SSRC_PREQUAL.QUALIFICATION_REVIEW',
          },
          <EditTable
            bordered
            rowKey="prequalLineId"
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
        )}
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

export default QualificationReview;
