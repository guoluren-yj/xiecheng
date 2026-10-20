import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Form, Icon, Modal, Tabs, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva'; 
import uuid from 'uuid/v4';
import classNames from 'classnames';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { queryFileListOrg } from 'services/api';
import querystring from 'querystring';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isUndefined, throttle } from 'lodash';
import { Button as PermissionButton } from 'components/Permission';
import PrintProButton from '_components/PrintProButton';
import { SRM_SQAM } from '_utils/config';
import moment from 'moment';
import remote from 'hzero-front/lib/utils/remote';

import ClaimResultExc from '@/routes/components/ClaimResultExc';
import { fetchFlag } from '@/services/sqamCommonService';
import OperationRecord from '../../RecordComponents/OperationRecord';
import ApproveRecord from '../../RecordComponents/ApproveRecord';

import Feedback from './Feedback';
import ComplaintHandle from './ComplaintHandle';
import BasicInfo from './BasicInfo';
import ClaimInfo from './ClaimInfo';
import ClaimProject from './ClaimProject';
import ClaimProjectFilter from './ClaimProjectFilter';
import AdjustTimeModal from './AdjustTimeModal';

import styles from './index.less';
import Record from '../../components/OperationRecord/OperationRecord';

const prefix = `sqam.common`;
const unitCode = [
  'SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM',
  'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO',
  'SQAM.CLAIM_FORM_DETAIL.CLAIM_INFO',
  'SQAM.CLAIM_FORM_DETAIL.STATEMENT',
];

@remote({
  code: 'SQAM_MY_CLAIM_FORM_DETAIL_CUX',
  name: 'remote',
},{
  events:{
    cuxCancelAfter:()=>{}, // 二开取消的后续逻辑
  }
})
@withCustomize({
  unitCode: [
    ...unitCode,
    'SQAM.CLAIM_FORM_DETAIL.HEAD_BTNS',
    'SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM_FILTER',
  ],
})
@formatterCollections({
  code: [
    'sqam.common',
    'spcm.common',
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
@connect(({ loading = false, myClaimForm, sqamCommon }) => ({
  myClaimForm,
  sqamCommon,
  fetchLoding: loading.effects['myClaimForm/fetchDetail'],
  printLoading: loading.effects['myClaimForm/print'],
  lineTableLoading: loading.effects['myClaimForm/fetchClaimProject'],
  operateRecordLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  loading: loading.effects['sqam/approveHistory'],
  recallLoading: loading.effects['myClaimForm/reCallMyClaim'],
  tenantId: getCurrentOrganizationId(),
  cancelLoading: loading.effects['myClaimForm/myClaimFormCancel'],
  timeLoading: loading.effects['myClaimForm/myClaimAdjustTime'],
}))
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  formFilter = null;

  constructor(props) {
    super(props);
    const {
      history: {
        location: { search },
      },
    } = this.props;
    const { formHeaderId, sourceFlag } = querystring.parse(search.substr(1));
    this.state = {
      formHeaderId,
      sourceFlag,
      collapseKeys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'claimResultExc'],
      operationRecordVisible: false,
      fileNum: 0,
      activeKey: 'option',
      flag: false,
      visible: false,
      timeVisible: false,
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
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myClaimForm/updateState',
      payload: {
        detail: {},
      },
    });
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    const { type, payload } = e.data;
    if (type === '/sqam/my-claim-form/detail' && payload === 'SRM-YONGXIANG') {
      this.handleSearch();
    }
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
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'myClaimForm/fetchDetail',
      payload: {
        tenantId,
        formHeaderId,
        customizeUnitCode:
          'SQAM.CLAIM_FORM_DETAIL.BASIC_INFO,SQAM.CLAIM_FORM_DETAIL.CLAIM_INFO,SQAM.CLAIM_FORM_DETAIL.STATEMENT',
      },
    }).then((res) => {
      if (res) {
        const { purchaseAttachmentUuid } = res;
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
    let param = {};
    if (!isUndefined(this.formFilter)) {
      param = this.formFilter?.getFieldsValue() || {};
    }
    dispatch({
      type: 'myClaimForm/fetchClaimProject',
      payload: {
        formHeaderId,
        tenantId,
        page,
        customizeUnitCode:
          'SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM,SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM_FILTER',
        ...param,
      },
    });
  }

  // 打印
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'myClaimForm/print',
      formHeaderId,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  // 撤回
  @Bind()
  handleRecall() {
    const {
      dispatch,
      myClaimForm: { detail = {}, lineDetail = [] },
    } = this.props;
    dispatch({
      type: 'myClaimForm/reCallMyClaim',
      payload: {
        body: { ...detail, lineDetail },
        customizeUnitCode: unitCode.join(),
      },
    }).then((res) => {
      if (res) {
        notification.success();
        // 重新获取数据
        this.handleSearch();
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

  /**
   * 返回父页面
   */
  handleBackParentPath() {
    let routePath;
    const { sourceFlag } = this.state;
    switch (sourceFlag) {
      case 'supplier-deduction-query': // 返回供应商查询页面
        routePath = '/sfin/supplier-deduction-query/list';
        break;
      case 'supplier-deduction-approval': // 返回供应商审批页面
        routePath = '/sfin/supplier-deduction-approval/list';
        break;
      default:
        routePath = '/sqam/my-claim-form/list';
        break;
    }
    return routePath;
  }

  @Bind()
  tabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  @Bind()
  handleCancel() {
    const { myClaimForm = {}, dispatch,  remote: remoteProps, } = this.props;
    const { detail = {}, lineDetail = [] } = myClaimForm;
    const {formNum} = detail;
    Modal.confirm({
      title: intl.get(`${prefix}.message.claimForm.cancelMsg`,{
        formNum,
      }).d(`确认取消索赔单${formNum}`),
      onOk:()=>{
        dispatch({
          type: 'myClaimForm/myClaimFormCancel',
          payload: {
            body: { ...detail, claimFormLineDTOList: lineDetail },
            customizeUnitCode: unitCode.join(),
          },
        }).then(async(res) => {
          if (res) {
            await remoteProps.event.fireEvent('cuxCancelAfter', {_this:this,res});
            notification.success();
            // 重新获取数据
            this.handleSearch();
          }
        });
      }
    });
  }

  @Bind()
  operateTimeModal() {
    const { timeVisible } = this.state;
    this.setState({ timeVisible: !timeVisible });
  }

  @Bind()
  handleSubmitTime(val, closeFun) {
    const { myClaimForm = {}, dispatch } = this.props;
    const { detail = {} } = myClaimForm;
    const { formHeaderId } = detail;
    if (!formHeaderId) return;
    const feedbackDate = moment(val.feedbackDate).format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'myClaimForm/myClaimAdjustTime',
      payload: { ...detail, ...val, feedbackDate, formHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
        // 关闭弹框
        if (closeFun) closeFun();
      }
    });
  }

  @Bind()
  headerBtnsRender() {
    const { formHeaderId, flag } = this.state;
    const {
      printLoading,
      recallLoading,
      myClaimForm = {},
      tenantId,
      fetchLoding,
      lineTableLoading,
      cancelLoading,
      timeLoading,
      remote: remoteProps,
      history,
    } = this.props;
    const { detail = {} } = myClaimForm;
    const { purchaseAttachmentUuid, statusCode } = detail;
    const isLoading =
      fetchLoding ||
      printLoading ||
      lineTableLoading ||
      recallLoading ||
      cancelLoading ||
      timeLoading;
    const btns = [
      ['CONFIRMED',"FINISHED"].includes(statusCode) && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cance').d('取消'),
        btnComp: PermissionButton,
        btnProps: {
          type: 'primary',
          icon: 'close',
          disabled: !formHeaderId,
          loading: isLoading,
          onClick: throttle(() => this.handleCancel(), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.my.claim.button.cancel`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'print',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnComp: PermissionButton,
        btnProps: {
          icon: 'printer',
          disabled: !formHeaderId,
          loading: isLoading,
          onClick: throttle(() => this.handlePrint(), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.claim.my.claim.button.print`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'newprint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('sqam.common.view.button.printNew').d('新打印'),
          buttonProps: {
            disabled: !formHeaderId,
            permissionList: [
              {
                code: 'srm.sqam.business.claim.my.claim.button.printnew',
                type: 'button',
              },
            ],
            loading: isLoading,
          },
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/claim-form/list-print-new`,
          method: 'PUT',
          data: { claimFormHeaderIdList: [formHeaderId] },
          successCallBack: () => this.handleSearch(),
        },
      },
      {
        name: 'operating',
        child: flag
          ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
          : intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          disabled: !formHeaderId,
          loading: isLoading,
          onClick: () =>
            flag
              ? this.handleModalVisible('visible', true, { formHeaderId })
              : this.handleModalVisible('operationRecordVisible', true, { formHeaderId }),
        },
      },
      {
        name: 'upload',
        btnComp: UploadModal,
        btnProps: {
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
        },
      },
      ['APPROVED', 'COMMUTED', 'REBUTTED'].includes(statusCode) && {
        name: 'recall',
        btnComp: PermissionButton,
        child: (
          <Tooltip
            placement="bottom"
            arrowPointAtCenter
            title={intl
              .get(`${prefix}.title.MyClaimRecallDescription`)
              .d('针对「待确认」「已改判」「已驳回」状态单据，在销售方确认前可进行撤回操作')}
          >
            <div>
              <Icon type="rollback" />
              {intl.get('hzero.common.button.recall').d('撤回')}
              <Icon type="question-circle-o" />
            </div>
          </Tooltip>
        ),
        btnProps: {
          onClick: throttle(this.handleRecall, 1500, { trailing: false }),
          loading: isLoading,
          permissionList: [
            {
              code: 'srm.sqam.business.claim.my.claim.ps.detail.undo',
              type: 'button',
            },
          ],
        },
      },
      ['SUBMITTED', 'APPROVED', 'APPEALED', 'COMMUTED', 'REBUTTED'].includes(statusCode) && {
        name: 'time',
        child: intl.get(`entity.attachment.timeAdjustment`).d('时间调整'),
        // btnComp: PermissionButton,
        btnProps: {
          disabled: !formHeaderId,
          loading: isLoading,
          onClick: throttle(() => this.operateTimeModal(), 1500, { trailing: false }),
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_MY_CLAIM_FORM_DETAIL_CUX_BTNS', btns, {
          detail,
          handleSearch: this.handleSearch,
          onSearchLine: this.fetchClaimProject,
          history,
        })
      : btns;
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.formFilter = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { collapseKeys, operationRecordVisible, timeVisible } = this.state;
    const {
      tenantId,
      dispatch,
      form,
      sqamCommon = {},
      fetchLoding = false,
      lineTableLoading = false,
      operateRecordLoading = false,
      myClaimForm = {},
      match = {},
      loading,
      customizeBtnGroup,
      customizeForm,
      customizeFilterForm,
      customizeTable,
      timeLoading,
      history,
      remote: remoteProps,
    } = this.props;
    const { detail = {}, lineDetail = [], linePagiation = {} } = myClaimForm;
    const { formHeaderId, activeKey, visible } = this.state;

    const {
      feedbackOpinion,
      expenseProcessTypeMeaning, // 费用处理方式
      supplierConfirmUuid,

      appealHandleActionCode, // 申诉处理动作
      appealHandleActionMeaning,
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
      purchaseAgentName, // 采购员

      supplierAttachmentUuid, // 附件查看uuid
      supplierCompanyName, // 供应商名字
      formTitle,
      totalAmount, // 索赔总额
      amountPrecision, // 精度
      currencyName, // 币种
      feedbackDate, // 要求反馈日期
      actualFeedbackDate, // 实际反馈日期
      appealedSum, // 申诉次数
      appealedCount, // 申诉总次数
      appealedDate, // 申诉日期
      appealHandledDate, // 申诉处理日期
      supplierCode, // 供应商编码
      appealContentMeaning, // 申诉内容
      confirmVisibleFlag,
      appealedFlag, // 是否申诉状态
      purchaseAttachmentUuid, // 采购商附件
      cancelFlag, // 是否取消索赔
      unitIdMeaning,
    } = detail;

    const feedBackProps = {
      form,
      feedbackOpinion,
      expenseProcessTypeMeaning,
      supplierConfirmUuid,
    };
    const claimResultExcProps = {
      form,
      editFlag: false,
      // resultRemark,
      // resultAttachmentUuid,
      detail,
    };
    const complaintHandleProps = {
      form,
      detail,
      appealHandleActionCode, // 申诉处理动作
      appealHandleActionMeaning,
      appealHandleOpinion, // 决议说明
      supplierAttachmentUuid,
      appealedSum,
      appealedDate,
      appealHandledDate,
      appealContentMeaning,
      appealOpinion,
      cancelFlag,
      applyTimes: this.getApplyTimes(appealedSum, appealedCount),
      customizeForm,
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
      amountPrecision, // 精度
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
      customizeForm,
      history,
      remoteProps,
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
    const claimProjectFilterProps = {
      handleSearchLine: this.fetchClaimProject,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };
    const {
      operationRecordList = [],
      operationRecordPagination = {},
      approveHistoryList = [],
    } = sqamCommon;
    const OperationRecordProps = {
      visible: operationRecordVisible,
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
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
    };
    const timeProps = {
      onClose: this.operateTimeModal,
      timeVisible,
      basicInfo: detail,
      handleSubmitTime: this.handleSubmitTime,
      timeLoading,
    };
    const notPubType = match.path !== '/pub/sqam/my-claim-form/detail';
    return (
      <React.Fragment>
        {notPubType && (
          <Header
            title={intl.get(`${prefix}.view.title.myClaimSearch`).d('我的索赔单明细')}
            backPath={this.handleBackParentPath()}
          >
            {customizeBtnGroup(
              { code: 'SQAM.CLAIM_FORM_DETAIL.HEAD_BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        )}
        <Content className={classNames(styles['page-content'])}>
          <Spin
            // spinning={newFlag ? false : loading.fetch}
            spinning={fetchLoding}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            {!notPubType && (
              <UploadModal
                {...uploadModalProps}
                btnProps={{ ...uploadModalProps.btnProps, style: { marginBottom: '10px' } }}
              />
            )}
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              {!notPubType && (
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
                <ClaimProjectFilter {...claimProjectFilterProps} />
                <ClaimProject {...claimProjectProps} />
              </Collapse.Panel>
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
              {confirmVisibleFlag && notPubType && (
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
              {statusCode === 'FINISHED' && (
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
                  <ClaimResultExc {...claimResultExcProps} />
                </Collapse.Panel>
              )}
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
        <AdjustTimeModal {...timeProps} />
      </React.Fragment>
    );
  }
}
