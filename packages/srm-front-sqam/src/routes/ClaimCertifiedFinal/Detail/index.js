import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Form, Icon, Modal, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import uuid from 'uuid/v4'; 
import classNames from 'classnames';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import querystring from 'querystring';
import remotes from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, filterNullValueObject, getEditTableData } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { queryFileListOrg } from 'services/api';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { throttle } from 'lodash';

// import notification from 'utils/notification';

import ClaimResultExc from '@/routes/components/ClaimResultExc';
import { fetchFlag } from '@/services/sqamCommonService';
import OperationRecord from '../../RecordComponents/OperationRecord';
import ApproveRecord from '../../RecordComponents/ApproveRecord';

import Feedback from './Feedback';
import ComplaintHandle from './ComplaintHandle';
import BasicInfo from './BasicInfo';
import ClaimInfo from './ClaimInfo';
import ClaimProject from './ClaimProject';
import Record from '../../components/OperationRecord/OperationRecord';
 
import styles from './index.less';

const prefix = `sqam.common`;

@withCustomize({
  unitCode: [
    'SQAM.CLAIM_CERTIFIED_DETAIL.RESULT',
    'SQAM.CLAIM_CERTIFIED_DETAIL.CLIAM_ITEM',
    'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO',
  ],
})
@formatterCollections({
  code: [
    'sqam.common',
    'hzero.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.attachment',
    'entity.roles',
    'entity.business',
  ],
})
@connect(({ loading = false, claimCertifiedFinal, sqamCommon }) => ({
  claimCertifiedFinal,
  sqamCommon,
  fetchLoding: loading.effects['claimCertifiedFinal/fetchDetail'],
  printLoading: loading.effects['claimCertifiedFinal/print'],
  lineTableLoading: loading.effects['claimCertifiedFinal/fetchClaimProject'],
  saveLoading: loading.effects['claimCertifiedFinal/saveResultExc'],
  submitLoading: loading.effects['claimCertifiedFinal/submitResultExc'],
  operateRecordLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  loading: loading.effects['sqam/approveHistory'],
  tenantId: getCurrentOrganizationId(),
}))
@remotes({
  code:"SQAM_CLAIM_CERTIFIED_FINAL_DETAIL",
  name:"remote"
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      history: {
        location: { search },
      },
    } = this.props;
    const { formHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      formHeaderId,
      collapseKeys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'claimResultExc'],
      operationRecordVisible: false,
      title: intl.get(`${prefix}.view.title.claimResultExcute`).d('索赔结果执行'),
      fileNum: 0,
      activeKey: 'option',
      visible: false,
      flag: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    this.handleSearch();
    dispatch({
      type: 'sqamCommon/init',
    });
    this.fetchFlag(formHeaderId);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimCertifiedFinal/updateState',
      payload: {
        detail: {},
      },
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'claimCertifiedFinal/fetchDetail',
      payload: {
        tenantId,
        formHeaderId,
        customizeUnitCode:
          'SQAM.CLAIM_CERTIFIED_DETAIL.RESULT,SQAM.CLAIM_FORM_DETAIL.BASIC_INFO,SQAM.CLAIM_FORM_DETAIL.CLAIM_INFO,SQAM.CLAIM_FORM_DETAIL.STATEMENT',
      },
    }).then((res) => {
      if (res) {
        const { formNum = '', supplierCompanyName = '', purchaseAttachmentUuid } = res;
        this.setState({
          title: `${supplierCompanyName}${formNum}${intl
            .get(`${prefix}.view.title.claimResultExcute`)
            .d('索赔结果执行')}`,
        });
        queryFileListOrg({
          attachmentUUID: purchaseAttachmentUuid || uuid(),
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
        }).then((res1) => {
          if (res1) {
            this.setState({
              fileNum: res1.length,
            });
          }
        });
      }
    });
  }

  @Bind()
  fetchFlag(formHeaderId) {
    fetchFlag(formHeaderId).then((res) => {
      if (res) {
        this.setState({
          flag: true,
        });
      } else {
        this.setState({
          flag: false,
        });
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

  // 操作记录
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  @Bind()
  fetchClaimProject(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'claimCertifiedFinal/fetchClaimProject',
      payload: {
        formHeaderId,
        tenantId,
        page,
        customizeUnitCode: 'SQAM.CLAIM_CERTIFIED_DETAIL.CLIAM_ITEM',
      },
    });
  }

  // 打印
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'claimCertifiedFinal/print',
      formHeaderId,
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        printWindow.print();
      }
    });
  }

  // 操作记录查询
  @Bind()
  fetchOperationRecord(page = {}, values) {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    const searchValues = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/fetchOperationRecord',
      payload: {
        page,
        ...searchValues,
        formHeaderId,
      },
    });
  }

  // 操作记录查询
  @Bind()
  fetchApproveRecord(page = {}, values) {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    const searchValues = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/approveHistory',
      payload: {
        page,
        ...searchValues,
        formHeaderId,
      },
    });
  }

  // 计算申诉次数
  @Bind()
  getApplyTimes(appealedSum = 0, appealedCount = 0) {
    return [false, null, undefined, '', 0, NaN].includes(appealedCount)
      ? appealedSum
      : `${appealedSum}/${appealedCount}`;
  }

  @Bind()
  getResultNode(node) {
    this.resultNode = node;
  }

  @Bind()
  handleSave() {
    const {
      form,
      claimCertifiedFinal: { lineDetail = [], linePagiation = {} },
    } = this.props;

    const lineData = getEditTableData(lineDetail, ['_status']);
    this.resultNode.getNodevalue((err, values) => {
      if (!err) {
        form.validateFields((errs,formValues)=>{
          if(!errs){
            const { dispatch } = this.props;
        const { formHeaderId } = this.state;
        if (lineDetail.length > 0 && lineData.length === 0) return;
          dispatch({
            type: 'claimCertifiedFinal/saveResultExc',
            payload: {
              formHeaderId,
              claimFormLineDTOList: lineData,
              ...formValues,
              ...values,
              customizeUnitCode:
                'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO,SQAM.CLAIM_CERTIFIED_DETAIL.RESULT,SQAM.CLAIM_CERTIFIED_DETAIL.CLIAM_ITEM',
            },
          }).then((res) => {
            if (res) {
              this.handleSearch();
              this.fetchClaimProject(linePagiation);
              notification.success();
            }
          });
          }
        });
      }
    });
  }

  @Bind()
  handleSubmit() {
    const {
      claimCertifiedFinal: { lineDetail = [] },
    } = this.props;
    const lineData = getEditTableData(lineDetail, ['_status']);
    this.resultNode.getNodevalue((err, values) => {
      if (!err) {
        const { dispatch, history } = this.props;
        if (lineDetail.length > 0 && lineData.length === 0) return;
        const { formHeaderId } = this.state;
        dispatch({
          type: 'claimCertifiedFinal/submitResultExc',
          payload: {
            formHeaderId,
            claimFormLineDTOList: lineData,
            ...values,
            customizeUnitCode:
              'SQAM.CLAIM_CERTIFIED_DETAIL.RESULT,SQAM.CLAIM_CERTIFIED_DETAIL.CLIAM_ITEM',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push('/sqam/claim-certified-final/list');
          }
        });
      }
    });
  }

  @Bind()
  tabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { collapseKeys, operationRecordVisible, flag } = this.state;
    const {
      remote,
      tenantId,
      dispatch,
      form,
      sqamCommon,
      fetchLoding = false,
      lineTableLoading = false,
      operateRecordLoading = false,
      saveLoading = false,
      submitLoading = false,
      claimCertifiedFinal: { detail = {}, lineDetail = [], linePagiation = {} },
      loading,
      customizeForm,
      customizeTable,
      history,
      custConfig,
    } = this.props;
    const { formHeaderId, activeKey, visible } = this.state;
    const isLoading = fetchLoding || lineTableLoading || saveLoading || submitLoading;

    const {
      feedbackOpinion,
      expenseProcessTypeMeaning, // 费用处理方式

      appealHandleActionCode, // 申诉处理动作
      appealHandleActionMeaning, // 申诉处理动作
      appealHandleOpinion, // 决议说明

      // appealContentMeaning, // 申诉内容
      appealOpinion, // 申诉意见
      // expenseProcessType, // 付款方式

      formNum, // 索赔单号
      statusCode, // 索赔单据状态
      statusCodeMeaning, // 索赔单据状态
      createName, // 创建人
      creationDate, // 创建日期
      companyName, // 公司名字
      ouName, // 业务实体
      invOrganizationName, // 库存组织
      claimTypeName, // 索赔单类型
      dataSourceCodeMeaning, // 单据来源
      dataSourceNum, // 来源单据编号
      claimDesc, // 索赔说明
      supplierConfirmUuid,
      supplierAttachmentUuid, // 附件查看uuid
      supplierCompanyName, // 供应商名字
      formTitle,
      totalAmount, // 索赔总额
      amountPrecision,
      currencyName, // 币种
      feedbackDate, // 要求反馈日期
      actualFeedbackDate, // 实际反馈日期
      appealedSum, // 申诉次数
      appealedCount, // 申诉总次数
      appealedDate, // 申诉日期
      appealHandledDate, // 申诉处理日期
      supplierCode, // 供应商编码
      appealContentMeaning, // 申诉内容
      // resultAttachmentUuid,
      appealedFlag, // 是否申诉状态
      purchaseAttachmentUuid, // 采购商附件
      cancelFlag, // 是否取消索赔
      // resultRemark,
      purchaseAgentName, // 采购员
      unitIdMeaning,
    } = detail;

    const feedBackProps = {
      form,
      feedbackOpinion,
      expenseProcessTypeMeaning,
      supplierConfirmUuid,
    };
    const editFlag = statusCode === 'CONFIRMED';
    const claimResultExcProps = {
      // form,
      // resultAttachmentUuid,
      editFlag,
      // resultRemark,
      getResultNode: this.getResultNode,
      customizeForm,
      detail,
    };
    const complaintHandleProps = {
      form,
      detail,
      appealHandleActionCode, // 申诉处理动作
      appealHandleOpinion, // 决议说明
      supplierAttachmentUuid,
      appealedSum,
      appealedDate,
      appealHandledDate,
      appealContentMeaning,
      appealOpinion,
      cancelFlag,
      applyTimes: this.getApplyTimes(appealedSum, appealedCount),
      appealHandleActionMeaning,
    };
    const basicInfoProps = {
      form,
      detail,
      formNum, // 索赔单号
      statusCodeMeaning, // 索赔单据状态
      createName, // 创建人
      creationDate, // 创建日期
      companyName, // 公司名字
      ouName, // 业务实体
      invOrganizationName, // 库存组织
      claimTypeName, // 索赔单类型
      dataSourceCodeMeaning, // 单据来源
      dataSourceNum, // 来源单据编号
      claimDesc, // 索赔说明
      supplierCompanyName,
      formTitle,
      purchaseAgentName,
      customizeForm,
      unitIdMeaning,
    };
    const claimInfoProps = {
      form,
      detail,
      supplierCompanyName, // 供应商名字
      totalAmount, // 索赔总额
      currencyName, // 币种
      feedbackDate, // 要求反馈日期
      actualFeedbackDate, // 实际反馈日期
      appealedSum, // 申诉次数
      appealedDate, // 申诉日期
      appealHandledDate, // 申诉处理日期
      supplierCode, // 供应商编码
      dataSourceCodeMeaning,
      dataSourceNum,
      expenseProcessTypeMeaning,
      amountPrecision, // 精度
      customizeForm,
      history,
    };

    const claimProjectProps = {
      form,
      detail,
      tenantId,
      dispatch,
      pagination: linePagiation,
      formHeaderId,
      loading: lineTableLoading,
      onSearch: this.fetchClaimProject,
      dataSource: lineDetail,
      customizeTable,
    };
    const {
      operationRecordList = [],
      operationRecordPagination = {},
      approveHistoryList = [],
    } = sqamCommon;
    const OperationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      handleOperationRecordSearch: this.fetchOperationRecord,
      onCancel: () => this.handleModalVisible('visible', false),
      loading: operateRecordLoading,
      isExport: true,
      formHeaderId,
    };
    const ApproveRecordProps = {
      dataSource: approveHistoryList,
      loading,
      handleOperationRecordSearch: this.fetchApproveRecord,
    };
    const RecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: operateRecordLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.handleModalVisible('operationRecordVisible', false),
      visible: operationRecordVisible,
      isExport: true,
      formHeaderId,
    };
    const modalProps = {
      visible,
      width: 1100,
      footer: null,
      onCancel: () => this.handleModalVisible('visible', false),
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      // title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };

    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
        purchaseAttachmentUuid ? this.state.fileNum : 0
      })`,
      btnProps: {
        icon: 'paper-clip',
        loading: isLoading,
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };
    const excuteFlag = remote.process("SQAM_CLAIM_CERTIFIED_FINAL_DETAIL_HEADER_BTN_EXECUTE_FLAG",true,{_this:this});
    return (
      <React.Fragment>
        <Header title={this.state.title} backPath="/sqam/claim-certified-final/list">
          {editFlag && (
            <React.Fragment>
              <Button
                type="primary"
                onClick={throttle(this.handleSave, 1500, { trailing: false })}
                icon="save"
                loading={isLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              {excuteFlag && (
                <Button
                onClick={throttle(this.handleSubmit, 1500, { trailing: false })}
                icon="check"
                loading={isLoading}
              >
                {intl.get(`${prefix}.model.excute`).d('已执行')}
              </Button>
              )}
            </React.Fragment>
          )}

          <Button
            icon="clock-circle-o"
            onClick={() =>
              flag
                ? this.handleModalVisible('visible', true, { formHeaderId })
                : this.handleModalVisible('operationRecordVisible', true, { formHeaderId })
            }
            loading={isLoading}
          >
            {flag
              ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
              : intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <UploadModal {...uploadModalProps} />
          {remote.process("SQAM_CLAIM_CERTIFIED_FINAL_DETAIL_HEADER_BTNS",null,{_this:this})}
        </Header>
        <Content className={classNames(styles['page-content'])}>
          <Spin
            // spinning={newFlag ? false : loading.fetch}
            spinning={fetchLoding}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.model.claimResultExc`).d('索赔结果执行')}</h3>
                    <a>
                      {collapseKeys.includes('B')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('claimResultExc') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="claimResultExc"
              >
                {!isLoading && Object.keys(custConfig).length > 0 && (
                  <ClaimResultExc {...claimResultExcProps} />
                )}
              </Collapse.Panel>
              {statusCode === 'CONFIRMED' && (
                <Collapse.Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>{intl.get(`${prefix}.model.feedbackOpinion`).d('反馈意见')}</h3>
                      <a>
                        {collapseKeys.includes('B')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('B') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="B"
                >
                  <Feedback {...feedBackProps} />
                </Collapse.Panel>
              )}
              {Number(appealedFlag) === 1 && (
                <Collapse.Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>{intl.get(`${prefix}.view.panel.complaintHandle`).d('申诉处理')}</h3>
                      <a>
                        {collapseKeys.includes('C')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('C') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="C"
                >
                  <ComplaintHandle {...complaintHandleProps} />
                </Collapse.Panel>
              )}
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.view.panel.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('E')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('E') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="E"
              >
                <BasicInfo {...basicInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.view.panel.claimInfo`).d('索赔信息')}</h3>
                    <a>
                      {collapseKeys.includes('F')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('F') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="F"
              >
                <ClaimInfo {...claimInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                header={
                  <Fragment>
                    <h3>{intl.get(`${prefix}.view.panel.claimItem`).d('索赔项目')}</h3>
                    <a>
                      {collapseKeys.includes('G')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('G') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="G"
              >
                <ClaimProject {...claimProjectProps} />
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Content>
        <Modal {...modalProps}>
          <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
            <Tabs.TabPane
              tab={intl.get('hzero.common.button.operating').d('操作记录')}
              key="option"
            >
              <OperationRecord {...OperationRecordProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sqam.common.model.qualityRectification.approvalRecord`).d('审批记录')}
              key="approve"
            >
              <ApproveRecord {...ApproveRecordProps} />
            </Tabs.TabPane>
          </Tabs>
        </Modal>
        <Record {...RecordProps} />
      </React.Fragment>
    );
  }
}
