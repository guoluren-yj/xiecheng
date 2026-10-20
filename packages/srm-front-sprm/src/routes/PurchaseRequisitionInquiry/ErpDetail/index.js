/**
 * ErpDetail - 需求明细(ERP)
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Button, Collapse, Icon, Spin, Form } from 'hzero-ui';
import { connect } from 'dva';

import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import { createPagination, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SPRM } from '_utils/config';
// import UploadModal from 'components/Upload/index';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { fetchUomControl } from '@/services/purchaseRequisitionCreationService';
import HeadInfo from './HeadInfo';
import LineInfo from './LineInfo';
import BillDetailModal from '../BillDetailModal';
import styles from './index.less';
import OperationRecord from '../../components/OperationRecord/OperationRecord';

const { Panel } = Collapse;
const titlePrompt = 'sprm.purchaseRequisitionInquiry.view.title';
const buttonPrompt = 'sprm.purchaseRequisitionInquiry.view.button';

@withCustomize({
  unitCode: [
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ERP',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEARDER_ERP',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.ERP_PANEL',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ purchaseRequisitionInquiry, loading = {} }) => ({
  purchaseRequisitionInquiry,
  detailLoading: loading.effects['purchaseRequisitionInquiry/erpDetail'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionInquiry/fetchOperationRecordList'],
  fetchErpLinesLoading: loading.effects['purchaseRequisitionInquiry/fetchErpLines'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqInquiry',
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
    code: 'SPRM_PURCHASE_REQUISITION_ERP_APPROVE_REMOTE',
    name: 'remote',
  },
  {
    process: {
      cuxHandleColumns: undefined,
    },
  }
)
export default class ErpDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const prHeaderId = params.id || params.prHeaderId;
    this.state = {
      prHeaderId,
      prLineId: null,
      displayLineNum: '',
      headerInfo: {}, // 请求头数据
      erpLines: [], // 行数据
      priceList: [],
      erpLinesPage: {},
      doubleUintFlag: 0,
      operationRecordList: [],
      operationRecordPagination: {},
      billDetailModalVisible: false,
      operationRecordModalVisible: false,
      collapseKeys: ['orderHeaderInfo', 'purchaseLineInfo'], // 打开的折叠面板key
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

  initPage = () => {
    const { dispatch } = this.props;
    this.handleSearch();
    this.handleSearchList();
    dispatch({ type: 'purchaseRequisitionInquiry/fetchDLov' });
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

  componentDidMount() {
    this.initPage();
    this.getDoubleUnitSetting();
  }

  @Bind()
  openPriceCompare() {
    const { prHeaderId, priceList } = this.state;
    const detailUrl = `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`;
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
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id, prHeaderId } = match.params;
    if (!isUndefined(id || prHeaderId)) {
      dispatch({
        type: `purchaseRequisitionInquiry/erpDetail`,
        payload: {
          tenantId,
          page,
          prHeaderId: id || prHeaderId,
          customizeCode: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.HEARDER_ERP',
        },
      }).then((res) => {
        this.setState({ headerInfo: res });
      });
    }
  }

  /**
   * 查询 - 行
   */
  @Bind()
  handleSearchList(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: `purchaseRequisitionInquiry/fetchErpLines`,
      payload: {
        page,
        prHeaderId,
        customizeUnitCode: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ERP',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          erpLines: res.content?.map((n) => ({ ...n, _status: 'update' })),
          erpLinesPage: createPagination(res),
        });
      }
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
        displayLineNum,
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
        this.handleSearchList();
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
      displayLineNum: record.displayLineNum,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 打印功能
   */
  @Bind()
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
   * 获取 Panel 的 Header 信息
   * @param {*} title - Title
   * @param {boolean} [isExpand=false] - 是否展开
   */
  @Bind()
  getPanelHeader(title, isExpand = false) {
    return (
      <Fragment>
        <Icon type={isExpand ? 'minus' : 'plus'} />
        <h3>{title}</h3>
      </Fragment>
    );
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
   * openBillDetailModal - 打开执行单据详情弹窗
   */
  @Bind()
  openBillDetailModal(record) {
    this.setState({
      billDetailModalVisible: true,
      prLineId: record.prLineId,
    });
  }

  render() {
    const {
      doubleUintFlag,
      prLineId,
      prHeaderId,
      collapseKeys,
      erpLines = [],
      priceList = [],
      headerInfo = {},
      erpLinesPage = {},
      operationRecordList,
      billDetailModalVisible,
      operationRecordPagination,
      operationRecordModalVisible,
      fetchOperationRecordListLoading,
    } = this.state;
    const {
      detailLoading,
      fetchErpLinesLoading,
      purchaseRequisitionInquiry: { erpEditStatusList },
      customizeTable,
      form,
      customizeForm,
      customizeCollapse,
      location: { search = '' },
      remote,
    } = this.props;
    const searchProps = {
      headerInfo,
      form,
      loading: detailLoading,
      customizeForm,
    };
    const LineInfoProps = {
      dataSource: erpLines,
      erpEditStatusList,
      doubleUintFlag,
      pagination: erpLinesPage,
      loading: fetchErpLinesLoading,
      onChange: this.handleSearchList,
      onView: this.openBillDetailModal,
      hideModal: this.openOperationRecord,
      customizeTable,
      remote,
    };
    const operationRecordProps = {
      prHeaderId,
      record: { prHeaderId, prSourcePlatform: 'ERP' },
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      pagination: operationRecordPagination,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const { syncStatus } = headerInfo;
    const viewAttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      btnText: intl.get('hzero.common.upload.view').d('查看附件'),
      attachmentUUID: headerInfo.attachmentUuid,
      viewOnly: true,
      showFilesNumber: true,
      icon: 'paper-clip',
    };
    const billDetailModalProps = {
      prLineId,
      pubPathFlag: true,
      visible: billDetailModalVisible,
      onClose: this.handleModalVisible,
      customizeTable,
    };
    const backViodPageFlag = search.includes('backVoidPage');
    const docLinkFlag = search.includes('docLinkFlag');
    return (
      <Fragment>
        <Header
          title={intl.get(`${titlePrompt}.ErpRequirementDetail`).d('ERP需求明细')}
          backPath={
            backViodPageFlag || docLinkFlag ? null : '/sprm/purchase-requisition-inquiry/list'
          }
        >
          {priceList.length > 0 && !docLinkFlag && (
            <Button onClick={() => this.openPriceCompare()}>
              {intl.get(`sprm.purchaseRequisitionInquiry.model.priceList`).d('比价单')}
            </Button>
          )}
          <Button
            type="primary"
            icon="clock-circle-o"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <Button>
            <UploadModal {...viewAttachmentsProps} />
          </Button>
          {!docLinkFlag && (
            <Button icon="sync" onClick={this.reImportERP} disabled={syncStatus !== 'SYNC_FAILURE'}>
              {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
            </Button>
          )}
          {!docLinkFlag && (
            <Button
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
            >
              {intl.get(`hzero.common.button.print`).d('打印')}
            </Button>
          )}
          {!docLinkFlag && (
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
          )}
        </Header>
        <Content>
          <Spin
            spinning={fetchErpLinesLoading || detailLoading || false}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            {customizeCollapse(
              {
                code: 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.ERP_PANEL',
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={collapseKeys}
                onChange={this.onCollapseChange}
              >
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.orderHeaderInfo`).d('采购申请头信息')}</h3>
                      <a>
                        {collapseKeys.includes('orderHeaderInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="orderHeaderInfo"
                >
                  <HeadInfo {...searchProps} />
                </Panel>
                <Panel
                  className={styles.line}
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息')}</h3>
                      <a>
                        {collapseKeys.includes('purchaseLineInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('purchaseLineInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="purchaseLineInfo"
                >
                  <LineInfo {...LineInfoProps} />
                </Panel>
              </Collapse>
            )}
          </Spin>
        </Content>
        <OperationRecord {...operationRecordProps} />
        {billDetailModalVisible && <BillDetailModal {...billDetailModalProps} />}
      </Fragment>
    );
  }
}
