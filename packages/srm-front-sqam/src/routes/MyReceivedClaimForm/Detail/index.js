import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Form, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
// import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import classNames from 'classnames';
// import uuidv4 from 'uuid/v4';
import { Header, Content } from 'components/Page';
import { queryFileListOrg } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { isUndefined, throttle } from 'lodash';
import PrintProButton from '_components/PrintProButton';
import { SRM_SQAM } from '_utils/config';
import remote from 'hzero-front/lib/utils/remote';

import ClaimResultExc from '@/routes/components/ClaimResultExc';
import OperationRecord from '../../components/OperationRecord/OperationRecord';

import Feedback from './Feedback';
import ComplaintHandle from './ComplaintHandle';
import BasicInfo from './BasicInfo';
import ClaimInfo from './ClaimInfo';
import ClaimProject from './ClaimProject';
import ClaimProjectFilter from './ClaimProjectFilter';

import styles from './index.less';

const prefix = `sqam.common`;
@remote({
  code: 'SQAM_MY_RECEIVED_CLAIM_FORM_DETAIL_CUX',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO',
    'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO',
    'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO_FILTER',
    'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_ITEM',
  ],
})
@formatterCollections({
  code: [
    'sqam.common',
    'hzero.common',
    'entity.business',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
  ],
})
@connect(({ loading = false, myReceivedClaimForm, sqamCommon }) => ({
  sqamCommon,
  myReceivedClaimForm,
  lineLoading: loading.effects['myReceivedClaimForm/fetchClaimProject'],
  detailLoading: loading.effects['myReceivedClaimForm/fetchDetail'],
  printLoading: loading.effects['myReceivedClaimForm/print'],
  operateRecordLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  recallLoading: loading.effects['myReceivedClaimForm/reCallMyReceivedClaim'],
  tenantId: getCurrentOrganizationId(),
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
    const { formHeaderId, supplierTenantId, sourceFlag } = querystring.parse(search.substr(1));
    this.state = {
      formHeaderId,
      sourceFlag,
      supplierTenantId,
      // user: getCurrentUser().realName,
      // // uploadVisible: false,
      // newFlag: isUndefined(props.match.params.id),
      // uuid: uuidv4(),
      collapseKeys: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'claimResultExc'],
      operationRecordVisible: false,
      fileNum: 0,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    dispatch({
      type: 'sqamCommon/init',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'myReceivedClaimForm/updateState',
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
    const { formHeaderId, supplierTenantId } = this.state;
    dispatch({
      type: 'myReceivedClaimForm/fetchDetail',
      payload: {
        tenantId,
        formHeaderId,
        supplierTenantId,
        customizeUnitCode: [
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO',
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO',
          // 'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_ITEM',
        ].join(),
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

  @Bind()
  fetchClaimProject(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { formHeaderId } = this.state;
    let param = {};
    if (!isUndefined(this.formFilter)) {
      param = this.formFilter?.getFieldsValue() || {};
    }
    dispatch({
      type: 'myReceivedClaimForm/fetchClaimProject',
      payload: {
        formHeaderId,
        tenantId,
        page,
        customizeUnitCode: [
          // 'SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO',
          // 'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO',
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_ITEM',
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO_FILTER',
        ].join(),
        ...param,
      },
    });
  }

  // 申诉内容部分-附件查看
  @Bind()
  handleAttachmentView() {}

  // 操作记录
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  // 打印
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'myReceivedClaimForm/print',
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
      myReceivedClaimForm: { detail = {}, claimProjectDetail },
    } = this.props;

    dispatch({
      type: 'myReceivedClaimForm/reCallMyReceivedClaim',
      payload: {
        body: { ...detail, lineDetail: claimProjectDetail },
        customizeUnitCode: [
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.BASIC_INFO',
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_INFO',
          'SQAM.RECEIVED_CLAIM_FORM_DETAIL.CLAIM_ITEM',
        ].join(),
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
      case 'supplier-confirm-query': // 返回供应商确认页面
        routePath = '/sfin/supplier-confirm-query/list';
        break;
      case 'my-received-deduction': // 返回我收到的扣款单
        routePath = '/sfin/my-received-deduction/list';
        break;
      default:
        routePath = '/sqam/my-received-claim-form/list';
        break;
    }
    return routePath;
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
    const { collapseKeys, operationRecordVisible } = this.state;
    const {
      tenantId,
      dispatch,
      form,
      sqamCommon = {},
      printLoading = false,
      lineLoading = false,
      detailLoading = false,
      operateRecordLoading = false,
      recallLoading = false,
      myReceivedClaimForm = {},
      customizeForm,
      customizeFilterForm,
      customizeTable,
      history,
      remote: remoteProps,
    } = this.props;
    const isLoading = lineLoading || printLoading || detailLoading || recallLoading;
    const { detail = {}, claimProjectDetail, linePagiation } = myReceivedClaimForm;
    const { formHeaderId } = this.state;
    const { operationRecordList = [], operationRecordPagination = {} } = sqamCommon;

    const {
      feedbackOpinion, // 反馈意见
      expenseProcessType, // 费用处理方式
      expenseProcessTypeMeaning,
      supplierConfirmUuid,
      // resultRemark,
      // resultAttachmentUuid,
      appealHandleActionCode, // 申诉处理动作
      appealHandleActionMeaning,
      appealHandleOpinion, // 决议说明
      appealContentMeaning, // 申诉处理内容

      // appealContentMeaning, // 申诉内容
      appealOpinion, // 申诉意见

      formNum, // 索赔单号
      statusCode,
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
      purchaseAgentName,

      // supplierAttachmentUuid,
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
      confirmVisibleFlag,
      purchaseAttachmentUuid, // 采购商附件
      appealedFlag, // 索赔状态
      supplierAttachmentUuid, // 供应商申诉附件uuid

      cancelFlag, // 是否取消索赔
      unitIdMeaning,
    } = detail;
    // const claimPorjectDatasource = [];

    const feedBackProps = {
      form,
      expenseProcessType,
      expenseProcessTypeMeaning,
      feedbackOpinion,
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
      appealHandleActionCode, // 申诉处理动作
      appealHandleActionMeaning,
      appealHandleOpinion, // 决议说明
      appealedSum,
      appealedDate,
      appealHandledDate,
      appealContentMeaning,
      supplierAttachmentUuid,
      appealOpinion,
      cancelFlag,
      applyTimes: this.getApplyTimes(appealedSum, appealedCount),
    };

    const basicInfoProps = {
      form,
      formNum, // 索赔单号
      statusCodeMeaning, // 索赔单据状态
      createName, // 创建人
      creationDate, // 创建日期
      companyName, // 公司名字
      ouName, // 业务实体
      invOrganizationName, // 库存组织
      claimTypeName, // 索赔单类型
      purchaseAgentName, // 采购员
      dataSourceCodeMeaning, // 单据来源
      dataSourceNum, // 来源单据编号
      claimDesc, // 索赔说明
      supplierCompanyName, // 供应商名字
      formTitle,
      customizeForm,
      detail,
      unitIdMeaning,
    };
    const claimInfoProps = {
      form,
      supplierCompanyName, // 供应商名字
      totalAmount, // 索赔总额
      amountPrecision,
      currencyName, // 币种
      feedbackDate, // 要求反馈日期
      actualFeedbackDate, // 实际反馈日期
      appealedSum, // 申诉次数
      appealedDate, // 申诉日期
      appealHandledDate, // 申诉处理日期
      supplierCode, // 供应商编码
      dataSourceCodeMeaning, // 索赔来源
      dataSourceNum, // 来源单号
      detail,
      customizeForm,
      history,
      remoteProps,
    };

    const claimProjectProps = {
      form,
      tenantId,
      dispatch,
      lineLoading,
      formHeaderId,
      pagination: linePagiation,
      dataSource: claimProjectDetail,
      onSearch: this.fetchClaimProject,
      detail,
      customizeTable,
    };
    const claimProjectFilterProps = {
      handleSearchLine: this.fetchClaimProject,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };

    const operationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      handleOperationRecordSearch: this.fetchOperationRecord,
      loading: operateRecordLoading,
      visible: operationRecordVisible,
      hideModal: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const uploadProps = {
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
        purchaseAttachmentUuid ? this.state.fileNum : 0
      })`,
      attachmentUUID: purchaseAttachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
      btnProps: {
        icon: 'paper-clip',
      },
    };

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${prefix}.view.myClaimForm.receivedClaim`).d('我收到的索赔单明细')}
          backPath={this.handleBackParentPath()}
        >
          <PermissionButton
            onClick={throttle(() => this.handlePrint(), 1500, { trailing: false })}
            icon="printer"
            type="primary"
            loading={isLoading}
            permissionList={[
              {
                code: `srm.sqam.business.cliam.feedback.receiced.claim.button.print`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.print').d('打印')}
          </PermissionButton>
          <PrintProButton
            buttonText={intl.get('sqam.common.view.button.printNew').d('新打印')}
            buttonProps={{
              icon: 'printer',
              loading: isLoading,
              permissionList: [
                {
                  code: 'srm.sqam.business.cliam.feedback.receiced.claim.button.printnew',
                },
              ],
            }}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/claim-form/list-print-new`}
            method="PUT"
            data={{ claimFormHeaderIdList: [formHeaderId] }}
            successCallBack={this.handleSearch}
          />
          <Button
            icon="clock-circle-o"
            onClick={() =>
              this.handleModalVisible('operationRecordVisible', true, { formHeaderId })
            }
            loading={isLoading}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
          <UploadModal {...uploadProps} />
          {['APPEALED'].includes(statusCode) && (
            <Tooltip
              title={intl
                .get(`${prefix}.title.MyReceivedClaimRecallDescription`)
                .d('针对「已申诉」状态单据，可在采购方申诉处理前进行撤回操作')}
              placement="bottom"
              arrowPointAtCenter
            >
              <PermissionButton
                icon="rollback"
                loading={isLoading}
                onClick={throttle(this.handleRecall, 1500, { trailing: false })}
                permissionList={[
                  {
                    code: `srm.sqam.business.cliam.feedback.receiced.claim.ps.detail.undo`,
                    type: 'button',
                  },
                ]}
              >
                {intl.get('hzero.common.button.recall').d('撤回')}
                <Icon type="question-circle-o" />
              </PermissionButton>
            </Tooltip>
          )}
          {/* 亿咖通埋点 如果改造个性化按钮组需注意 */}
          {remoteProps
            ? remoteProps.process('SQAM_MY_RECEIVED_CLAIM_FORM_DETAIL_CUX_BTNS', [], {
                detail,
                handleSearch: this.handleSearch,
                onSearchLine: this.fetchClaimProject,
                history,
              })
            : []}
        </Header>
        <Content className={classNames(styles['page-content'])}>
          <Spin
            // spinning={newFlag ? false : loading.fetch}
            spinning={detailLoading}
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
              {confirmVisibleFlag && (
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
        <OperationRecord {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
