/**
 * NotErpDetail - 需求明细(非ERP)
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Collapse, Spin, Icon } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isArray } from 'lodash';
import moment from 'moment';
import { PRIVATE_BUCKET, SRM_SPRM } from '_utils/config';
import { Button as PermissionButton } from 'components/Permission';
import cuxRemote from 'hzero-front/lib/utils/remote';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  createPagination,
  getCurrentOrganizationId,
  getResponse,
  getEditTableData,
} from 'utils/utils';

import UploadModal from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import { fetchPermissions, fetchUomControl } from '@/services/purchaseRequisitionCreationService';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import HeadInfo from './HeadInfo';
import ReceiveInfo from './ReceiveInfo';
import InvoiceInfo from './InvoiceInfo';
import LineInfo from './LineInfo';
import BillDetailModal from '../BillDetailModal';
import styles from './index.less';

const { Panel } = Collapse;

const titlePrompt = 'sprm.purchaseRequisitionInquiry.view.title';
const buttonPrompt = 'sprm.purchaseRequisitionInquiry.view.button';

@withCustomize({
  unitCode: [
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ECOMMERCE',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER', // 单据来源为 SRM-需求查询明细页-头
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.SRM_LINE', // 单据来源为 SRM-需求查询明细页-行
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_CATALOGUE',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.DELIVERYINFO',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.PANEL',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER_BTN',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.EXECUTIONBILL',
  ],
})
@connect(({ purchaseRequisitionInquiry, loading }) => ({
  purchaseRequisitionInquiry,
  fetchingHeader: loading.effects['purchaseRequisitionInquiry/fetchNotErpDetail'],
  fetchingLines: loading.effects['purchaseRequisitionInquiry/fetchNotErpLines'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionInquiry/fetchOperationRecordList'],
  callBackLoading: loading.effects['purchaseRequisitionInquiry/fetchWithdraw'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqInquiry',
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseReqCreation',
    'sprm.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.business',
    'entity.attachment',
  ],
})
@cuxRemote(
  {
    code: 'SPRM_PURCHASE_REQUISITION_APPROVE_REMOTE',
    name: 'remote',
  },
  {
    process: {
      handleOnRow: undefined,
      handleWorkFlowCheck: undefined,
    },
  }
)
export default class NotErpDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {}, path = '' },
      location: { search = '' },
    } = this.props;
    const prHeaderId = params.id || params.prHeaderId;
    if (prHeaderId) {
      this.setState({
        prHeaderId,
      });
    }
    let backPath = '';
    const backViodPageFlag = search.includes('backVoidPage') || search.includes('docLinkFlag');
    switch (true) {
      case path.includes('/sodr/purchase-order-maintain/quote-purchase-requisition/detail'):
        backPath = '/sodr/purchase-order-maintain/quote-purchase-requisition/list';
        break;
      case path.includes('/pub/sprm/purchase-requisition-inquiry/not-erp-detail'):
        backPath = null;
        break;
      case path.includes('sprm/purchase-platform/noerp-detail'):
        backPath = '/sprm/purchase-platform/list';
        break;
      case backViodPageFlag:
        backPath = null;
        break;
      default:
        backPath = '/sprm/purchase-requisition-inquiry/list';
        break;
    }
    this.state = {
      prHeaderId,
      backPath,
      // prSourcePlatformMeaning,
      // prSourcePlatformCode,
      priceList: [],
      prLineId: null,
      operationRecordList: [],
      operationRecordPagination: {},
      permissonFlag: { externalAttachmentUuid: false },
      billDetailModalVisible: false,
      operationRecordModalVisible: false,
      collapseKeys: ['orderHeaderInfo', 'purchaseLineInfo'], // 扩展的Panel key, 'deliveryInformationHeader', 'billingInformation'
      curRecord: {},
      doubleUintFlag: 0, // 业务规则定义双单位配置
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const {
      match: { params: prevParams },
    } = prevProps;
    const {
      match: { params = {} },
    } = this.props || {};
    const prevId = prevParams.id || prevParams.prHeaderId || null;
    const { id = null, prHeaderId = null } = params || {};
    return prevId !== (id || prHeaderId);
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  initPage = () => {
    this.handleSearch();
    this.fetchCheckPermissions();
    // 查询比价单
    this.props
      .dispatch({
        type: 'purchaseRequisitionInquiry/fetchPriceList',
        payload: this.state.prHeaderId,
      })
      .then((res) => {
        if (res) {
          this.setState({
            priceList: res,
          });
        }
      });
  };

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          doubleUintFlag: result.SPRM,
        });
      }
    });
  }

  @Bind()
  handleSubmit(result) {
    const {
      purchaseRequisitionInquiry: { notErpDetailSource = {}, notErpLines = [] },
      remote,
      location,
    } = this.props;
    const { handleWorkFlowCheck } = remote?.props?.process || {};
    return new Promise(async (resolve, reject) => {
      const prLineListTem = getEditTableData(notErpLines);
      const prLineList = prLineListTem?.map((item) => ({
        ...item,
        supplierList: !isArray(item.supplierList)
          ? item.newSupplierList
          : item.supplierList?.map((ele) => ({
              ...ele,
            })),
        neededDate: item.neededDate
          ? moment(item.neededDate).format(DEFAULT_DATETIME_FORMAT)
          : null,
      }));
      const dateInfo = { ...notErpDetailSource, prLineList };
      const approveFlag = await handleWorkFlowCheck({
        result,
        dateInfo,
        location,
        customizeUnitCode: `SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER,SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.SRM_LINE`,
      });
      if (approveFlag) {
        resolve();
      } else {
        reject();
      }
    });
  }

  componentDidMount() {
    this.handleSearch();
    this.fetchCheckPermissions();
    this.getDoubleUnitSetting();
    const { onLoad, remote, onFormLoaded = (e) => e } = this.props;
    console.log(this.props);
    const { handleWorkFlowCheck } = remote?.props?.process || {};
    if (onLoad) {
      onLoad({
        submit: handleWorkFlowCheck ? this.handleSubmit : undefined,
      });
      onFormLoaded(true);
    }
    // 查询比价单
    this.handleGetPriceList();
  }

  @Bind()
  async handleGetPriceList() {
    const { dispatch } = this.props || {};
    const res = await dispatch({
      type: 'purchaseRequisitionInquiry/fetchPriceList',
      payload: this.state.prHeaderId,
    });
    if (res) {
      this.setState({
        priceList: res,
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.match.params.id !== this.props.match.params.id) {
      this.setState(
        {
          prHeaderId: nextProps.match.params.id,
        },
        () => {
          this.handleSearch();
          // 查询比价单
          this.props
            .dispatch({
              type: 'purchaseRequisitionInquiry/fetchPriceList',
              payload: nextProps.match.params.id,
            })
            .then((res) => {
              if (res) {
                this.setState({
                  priceList: res,
                });
              }
            });
        }
      );
    }
    return true;
  }

  @Bind()
  openPriceCompare() {
    const { prHeaderId, priceList } = this.state;
    const detailUrl = `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    const router = {
      pathname: `/sprm/purchase-requisition-inquiry/price-list`,
      state: {
        detailUrl,
        priceList,
      },
    };
    this.props.history.push(router);
  }

  /**
   * 查询详情页数据
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId, match, code: workflowFormCode } = this.props;
    const pubPathFlag = !match.path.includes('/pub/sprm/purchase-requisition-inquiry');
    const { id, prHeaderId } = match.params;
    console.log(this.props);
    const isNewAndPub =
      match.path.includes('/sprm/purchase-platform/noerp-detail') ||
      match.path.includes('/pub/sprm/purchase-requisition-inquiry/not-erp-detail');
    console.log(workflowFormCode);
    if (!isUndefined(id || prHeaderId)) {
      dispatch({
        type: `purchaseRequisitionInquiry/fetchNotErpDetail`,
        payload: {
          tenantId,
          workflowFormCode,
          workFlowFlag: pubPathFlag ? null : '1',
          prHeaderId: id || prHeaderId,
        },
      }).then((res) => {
        if (res) {
          const { prSourcePlatform, approvalPendingStatus } = res;
          dispatch({
            type: `purchaseRequisitionInquiry/fetchNotErpLines`,
            payload: {
              approvalPendingStatus: isNewAndPub ? approvalPendingStatus : '',
              tenantId,
              prHeaderId: id || prHeaderId,
              workFlowFlag: pubPathFlag ? null : '1',
              page,
              prSourcePlatformCode: prSourcePlatform,
            },
          });
        }
      });
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * reImportERP - 采购申请同步到ERP
   */
  @Bind()
  @Throttle(500)
  reImportERP() {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    const data = prHeaderId;
    dispatch({
      type: 'purchaseRequisitionInquiry/reImportERP',
      data,
    }).then((result) => {
      if (result) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 打印功能
   */
  @Bind()
  @Throttle(500)
  handlePrint() {
    const { prHeaderId } = this.state;
    const { dispatch } = this.props;
    const printFlag = checkPrintWindow();

    dispatch({
      type: 'purchaseRequisitionInquiry/print',
      payload: {
        prHeaderId,
        responseType: printFlag ? 'blob' : 'json',
        headers: printFlag ? {} : { 's-print-using-preview': '1' },
      },
    }).then(async (res) => {
      if (res) {
        if (printFlag) {
          if (res && res.type && res.type.includes('application/json')) {
            const reader = new FileReader();
            reader.readAsText(res, 'utf-8');
            reader.onload = () => {
              const readers = reader.result;
              const parseObj = JSON.parse(readers);
              notification.error({ message: parseObj.message });
            };
          } else if (res) {
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow) printWindow.print();
          }
        }
        if (!printFlag) {
          if (getResponse(res)) {
            // 添加如下代码
            const { fileUrl, bucketName, fileToken } = res;
            const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
            window.open(url);
          }
        }
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({ collapseKeys });
  }

  /**
   * getPanelHeader - 获取 Panel 的 Header 信息
   * @param {*} title - Title
   * @param {boolean} [isExpand=false] - 是否展开
   */
  @Bind()
  getPanelHeader(title, isExpand = false) {
    return (
      <Fragment>
        <h3>{title}</h3>
        <a>
          {isExpand
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
        </a>
        <Icon type={isExpand ? 'up' : 'down'} />
      </Fragment>
    );
  }

  /**
   * openBillDetailModal - 打开执行单据详情弹窗
   */

  @Bind()
  openBillDetailModal(record) {
    this.setState({
      billDetailModalVisible: true,
      prLineId: record.prLineId,
      curRecord: record,
    });
  }

  @Bind()
  @Throttle(500)
  hanleCallBack() {
    const {
      dispatch,
      purchaseRequisitionInquiry: { notErpDetailSource = {} },
    } = this.props;
    const isNew = this.props.location.pathname.includes(
      'sprm/purchase-requisition-inquiry/not-erp-detail'
    );
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchWithdraw',
      payload: notErpDetailSource,
    }).then((result) => {
      if (result) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: isNew
              ? `/sprm/purchase-requisition-inquiry/list`
              : '/sprm/purchase-platform/list',
          })
        );
      }
    });
  }

  @Bind()
  async fetchCheckPermissions() {
    const buttonPermissionList = ['hzero.srm.requirement.prm.pr-inquiry.ps.external-attachment'];
    await fetchPermissions(buttonPermissionList).then((res) => {
      if (res && res[0]) {
        const permissonFlag = {};
        permissonFlag.externalAttachmentUuid = res[0].approve || false;
        this.setState({ permissonFlag });
      }
    });
  }

  render() {
    const {
      purchaseRequisitionInquiry: { notErpDetailSource = {}, notErpLines, notErpLinesPage } = {},
      fetchingHeader,
      fetchingLines,
      fetchOperationRecordListLoading,
      callBackLoading,
      match: { path = '' },
      dispatch,
      customizeTable,
      customizeForm,
      customizeCollapse,
      customizeBtnGroup,
      location: { search = '' },
      remote,
    } = this.props;
    const { doubleUintFlag = 0 } = this.state;
    const pubPathFlag = !path.includes('/pub/sprm/purchase-requisition-inquiry');
    const listTableProps = {
      path,
      onChange: this.handleSearch,
      prSourcePlatform: notErpDetailSource.prSourcePlatform,
      dataSource: notErpLines,
      pagination: notErpLinesPage,
      dispatch,
      customizeTable,
      doubleUintFlag,
      onView: this.openBillDetailModal,
      remote,
      headerInfo: notErpDetailSource,
    };
    const { syncStatus, prSourcePlatform: prSourcePlatformCode } = notErpDetailSource;
    const {
      prLineId,
      operationRecordList,
      billDetailModalVisible,
      operationRecordPagination,
      operationRecordModalVisible,
      collapseKeys,
      priceList,
      prHeaderId,
      backPath,
      permissonFlag = {},
      curRecord = {},
    } = this.state;
    // const isNew = path.includes('/sprm/purchase-platform/noerp-detail');
    const operationRecordProps = {
      record: { prSourcePlatform: prSourcePlatformCode, prHeaderId },
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      name: 'attachment',
      bucketDirectory: 'sprm-pr',
      btnText: intl.get('entity.attachment.view').d('附件查看'),
      attachmentUUID: notErpDetailSource.attachmentUuid,
      viewOnly: true,
      showFilesNumber: true,
      btnProps: {
        icon: 'paper-clip',
        type: 'primary',
      },
    };
    const billDetailModalProps = {
      prLineId,
      pubPathFlag: true,
      currentRecord: curRecord,
      visible: billDetailModalVisible,
      onClose: this.handleModalVisible,
      customizeTable,
    };
    const { prSourcePlatform, prStatusCode } = notErpDetailSource;
    const printBtn = (
      <PermissionButton
        // style={{ marginRight: 8 }}
        icon="printer"
        onClick={this.handlePrint}
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-inquiry-details.ps.print_button`,
            type: 'button',
            meaning: '打印按钮权限',
          },
        ]}
        data-name="print"
      >
        {intl.get(`hzero.common.button.print`).d('打印')}
      </PermissionButton>
    );
    const newPrint = (
      <PrintProButton
        icon="printer"
        buttonProps={{
          color: 'primary',
          icon: 'print',
          permissionList: [
            {
              code: 'hzero.srm.requirement.prm.pr-inquiry.button.new-print',
              type: 'button',
              meaning: '采购申请查询详情-新打印按钮',
            },
          ],
        }}
        data-name="printNew"
        requestUrl={`${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-requests/${prHeaderId}/print-token`}
        method="GET"
        buttonText={intl.get('hzero.common.button.print.new').d('打印-新')}
      />
    );
    const withdrawBtn = (
      <PermissionButton
        onClick={this.hanleCallBack}
        loading={callBackLoading}
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-inquiry.ps.hzero.srm.requirement.prm.pr-inquiry-details.ps.wthdraw_button`,
            type: 'button',
            meaning: '撤回按钮权限',
          },
        ]}
        data-name="withdraw"
      >
        {intl.get(`hzero.common.button.callBack`).d('撤回')}
      </PermissionButton>
    );

    const externalModalProps = {
      btnText: intl.get(`sprm.common.btn.externalAttachmentUuid`).d('外部附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      name: 'externalAttachment',
      showFilesNumber: true,
      attachmentUUID: notErpDetailSource.externalAttachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      viewOnly: true,
    };

    const docLinkFlag = search.includes('docLinkFlag');
    return (
      <React.Fragment>
        {prSourcePlatformCode === 'BPM' ? (
          <Header
            title={intl.get(`${titlePrompt}.BPMrequirementDetail`).d('BPM需求明细')}
            backPath={backPath}
          >
            {customizeBtnGroup({ code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER_BTN' }, [
              <UploadModal {...uploadProps} />,
              permissonFlag.externalAttachmentUuid && <UploadModal {...externalModalProps} />,
              priceList.length > 0 && !docLinkFlag && (
                <Button onClick={() => this.openPriceCompare()} data-name="priceList">
                  {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
                </Button>
              ),
              <Button
                icon="clock-circle-o"
                data-name="history"
                onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>,
              !docLinkFlag && (
                <Button
                  icon="sync"
                  onClick={this.reImportERP}
                  data-name="syncAgian"
                  disabled={syncStatus !== 'SYNC_FAILURE'}
                >
                  {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
                </Button>
              ),
              !docLinkFlag && printBtn,
              !docLinkFlag && newPrint,
            ])}
          </Header>
        ) : prSourcePlatformCode === 'E-COMMERCE' ||
          notErpDetailSource.prSourcePlatform === 'E-COMMERCE' ? (
            <Header
              title={intl.get(`${titlePrompt}.ErequirementDetail`).d('电商商城需求明细')}
              backPath={backPath}
            >
              {customizeBtnGroup({ code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER_BTN' }, [
                <UploadModal {...uploadProps} />,
              (permissonFlag.externalAttachmentUuid || !pubPathFlag) && (
                <UploadModal {...externalModalProps} />
              ),
              priceList.length > 0 && !docLinkFlag && (
                <Button onClick={() => this.openPriceCompare()} data-name="priceList">
                  {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
                </Button>
              ),
                <Button
                  icon="clock-circle-o"
                  data-name="history"
                  onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
                >
                  {intl.get('hzero.common.button.operating').d('操作记录')}
                </Button>,
              pubPathFlag && !docLinkFlag && (
                <Button
                  icon="sync"
                  data-name="syncAgian"
                  onClick={this.reImportERP}
                  disabled={syncStatus !== 'SYNC_FAILURE'}
                >
                  {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
                </Button>
              ),
              !docLinkFlag && printBtn,
              !docLinkFlag && newPrint,
              !docLinkFlag && prStatusCode === 'WORKFLOW_APPROVAL' && pubPathFlag && withdrawBtn,
            ])}
            </Header>
        ) : prSourcePlatformCode === 'CATALOGUE' ||
          notErpDetailSource.prSourcePlatform === 'CATALOGUE' ? (
            <Header
              title={intl.get(`${titlePrompt}.DrequirementDetail`).d('目录化需求明细')}
              backPath={backPath}
            >
              {customizeBtnGroup({ code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER_BTN' }, [
                <UploadModal {...uploadProps} />,
              permissonFlag.externalAttachmentUuid && <UploadModal {...externalModalProps} />,
              !docLinkFlag && priceList.length > 0 && (
                <Button onClick={() => this.openPriceCompare()} data-name="priceList">
                  {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
                </Button>
              ),
                <Button
                  icon="clock-circle-o"
                  data-name="history"
                  onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
                >
                  {intl.get('hzero.common.button.operating').d('操作记录')}
                </Button>,
              !docLinkFlag && pubPathFlag && (
                <Button
                  icon="sync"
                  data-name="syncAgian"
                  onClick={this.reImportERP}
                  disabled={syncStatus !== 'SYNC_FAILURE'}
                >
                  {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
                </Button>
              ),
              !docLinkFlag && printBtn,
              !docLinkFlag && newPrint,
              !docLinkFlag && prStatusCode === 'WORKFLOW_APPROVAL' && pubPathFlag && withdrawBtn,
            ])}
            </Header>
        ) : (
          <Header
            title={intl.get(`${titlePrompt}.SRMrequirementDetail`).d('SRM需求明细')}
            backPath={backPath}
          >
            {customizeBtnGroup({ code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEADER_BTN' }, [
              <UploadModal {...uploadProps} />,
              permissonFlag.externalAttachmentUuid && <UploadModal {...externalModalProps} />,
              !docLinkFlag && priceList.length > 0 && (
                <Button onClick={() => this.openPriceCompare()} data-name="priceList">
                  {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
                </Button>
              ),
              <Button
                icon="clock-circle-o"
                data-name="history"
                onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
              >
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>,
              !docLinkFlag && pubPathFlag && (
                <Button
                  icon="sync"
                  onClick={this.reImportERP}
                  data-name="syncAgian"
                  disabled={syncStatus !== 'SYNC_FAILURE'}
                >
                  {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
                </Button>
              ),
              !docLinkFlag && printBtn,
              !docLinkFlag && newPrint,
              !docLinkFlag && prStatusCode === 'WORKFLOW_APPROVAL' && pubPathFlag && withdrawBtn,
            ])}
          </Header>
        )}
        <Content>
          <Spin
            spinning={fetchingHeader || fetchingLines || false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            {customizeCollapse(
              {
                code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.PANEL',
              },
              <Collapse defaultActiveKey={collapseKeys} onChange={this.onCollapseChange}>
                <Panel
                  header={this.getPanelHeader(
                    intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息'),
                    collapseKeys.includes('orderHeaderInfo')
                  )}
                  showArrow={false}
                  key="orderHeaderInfo"
                >
                  <HeadInfo
                    dataSource={notErpDetailSource}
                    dataSourceLoading={isUndefined(fetchingHeader) ? true : fetchingHeader}
                    customizeForm={customizeForm}
                    pubPathFlag={pubPathFlag}
                  />
                </Panel>
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    header={this.getPanelHeader(
                      intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息'),
                      collapseKeys.includes('deliveryInformationHeader')
                    )}
                    showArrow={false}
                    key="deliveryInformationHeader"
                  >
                    <ReceiveInfo dataSource={notErpDetailSource} customizeForm={customizeForm} />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    header={this.getPanelHeader(
                      intl.get(`${titlePrompt}.billingInfo`).d('开票信息'),
                      collapseKeys.includes('billingInformation')
                    )}
                    showArrow={false}
                    key="billingInformation"
                  >
                    <InvoiceInfo dataSource={notErpDetailSource} />
                  </Panel>
                )}
                <Panel
                  header={this.getPanelHeader(
                    intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息'),
                    collapseKeys.includes('purchaseLineInfo')
                  )}
                  showArrow={false}
                  key="purchaseLineInfo"
                  className={styles.line}
                >
                  <LineInfo {...listTableProps} />
                </Panel>
              </Collapse>
            )}
            <OperationRecord {...operationRecordProps} />
            {billDetailModalVisible && <BillDetailModal {...billDetailModalProps} />}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
