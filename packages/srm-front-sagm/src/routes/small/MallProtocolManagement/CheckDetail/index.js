import React from 'react';
import { connect } from 'dva';
import { isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DataSet } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { Button, Spin, Popconfirm, Tabs } from 'hzero-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import { checkPermission } from 'services/api';

// import BaseInfo from './BaseInfo';
import { BaseInfo, Authority } from '@/routes/small/Agreements';
import { openRecordTabs } from '@/utils/drawer/commonDrawer';
import agmHeaderRender from '@/routes/sagm/ProtocolWorkbench/component/Record/agmHeader';
import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import { confirmBefore } from '@/utils/c7nModal';
import TableInfo from './TableInfo';
import { agreementLineDS } from './tableDs';
import ItemProductModal from './itemPropductModal';
import ListTransfer from '../DetailSearch/ListTransfer';
import { protocalUnitCode } from '../../const/uniCode';
import { PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER } from '../../const/permissionCode';

const customizeUnitCode = protocalUnitCode.view;
@formatterCollections({
  code: ['small.mallProtocolManagement', 'small.common', 'sagm.common', 'small.freight'],
})
@connect(({ mallProtocolManagement, loading }) => ({
  mallProtocolManagement,
  addLoading: loading.effects['mallProtocolManagement/lineAddProduct'],
  createLoading: loading.effects['mallProtocolManagement/createProduct'],
  changeLoading: loading.effects['mallProtocolManagement/changeAgreement'],
  fetchDataLoading: loading.effects['mallProtocolManagement/queryAgreement'],
  deleteLoading: loading.effects['mallProtocolManagement/lineDeleteProduct'],
  terminateLoading: loading.effects['mallProtocolManagement/terminateAgreement'],
  fetchExitLoading: loading.effects['mallProtocolManagement/fetchExitProductList'],
  fetchNoExitLoading: loading.effects['mallProtocolManagement/fetchNoExitProductList'],
}))
@withRouter
@withCustomize({ unitCode: ['SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM'] })
export default class HandWork extends React.Component {
  itemProductForm;

  tableDs = new DataSet(agreementLineDS());

  constructor(props) {
    super(props);
    const { state: { tabKey = 'a' } = {} } = props.location;
    this.state = {
      tabKey,
      // companyId: '',
      agreementLine: [],
      agreementStatus: '',
      supplierTenantId: '',
      productVisible: false,
      productModalVisible: false,
      skuApprove: true,
    };

    this.tableDs.setQueryParameter(
      'customizeUnitCode',
      'SMAL.AGREEMENT_MANAGEMENT.IMPORT_MANUAL_NEW,SMAL.AGREEMENT_MANAGEMENT.IMOIRT_PRICE_LIB_NEW'
    );
  }

  @Bind()
  fetchHeader(agreementId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/queryAgreement',
      payload: {
        agreementId,
        customizeUnitCode,
      },
    }).then((res) => {
      if (res) {
        const { uuid = null, agreementStatus } = res.content[0] || {};
        if (agreementStatus === 'NEW') {
          this.props.history.push(
            `/small/mall-protocol-management/handwork?agreementId=${agreementId}`
          );
          return;
        }
        const invalidFlag = agreementStatus !== 'NEW';
        const flag = agreementId && !invalidFlag;
        if (flag && isNull(uuid)) {
          // 第一次上传附件需要获取一个uuid
          this.getAttachmentUUID();
        }
      }
    });
  }

  async componentDidMount() {
    const { agreementId } = this.props.match.params;
    this.fetchHeader(agreementId);
    this.tableDs.setQueryParameter('agreementId', agreementId);
    this.tableDs.query();
    this.fetchBatchCodes();
    const res = await checkPermission([PERMISSION_PROTOCOL_MANAGEMENT_SKU_NUMBER]);
    const isApprove = ((res || [])[0] || {}).approve;
    this.setState({ skuApprove: isApprove });
  }

  @Bind()
  fetchBatchCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/fetchBatchCodes',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/updateState',
      payload: {
        initData: {},
        exitProductList: [],
        noExitProductList: [],
        exitPagination: {},
        noExitPagination: {},
      },
    });
  }

  /**
   * 获取上传附件的UUID
   * @param  {String} tenantId --租户ID
   */
  @Bind()
  getAttachmentUUID() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/getAttachmentUUId',
      payload: {
        tenantId,
      },
    });
  }

  /**
   * 查看操作记录
   */
  @Bind()
  handleShowHistory() {
    const { agreementId } = this.props.match.params;
    const { mallProtocolManagement } = this.props;
    const { initData = {} } = mallProtocolManagement;
    openRecordTabs({
      headerData: {
        agreementId,
        agreementName: initData.agreementName,
        workflowBusinessKey: initData.workflowBusinessKey,
      },
      operateArg: {
        url: `/sagm/v1/${getCurrentOrganizationId()}/agreement-records/${agreementId}`,
        queryParams: {
          agreementId,
        },
        operateRenderer: agmHeaderRender,
      },
    });
  }

  /**
   * 展示商品穿梭框
   */
  @Bind()
  handleShowTransfer(record) {
    this.setState(
      {
        productVisible: true,
        agreementLine: [record],
        // companyId: record.companyId,
        agreementLineId: record.agreementLineId,
        supplierTenantId: record.supplierTenantId,
        agreementStatus: record.agreementStatus,
        isEffective: record.effectiveFlag !== -1,
      },
      () => {
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    );
  }

  @Bind()
  handleCreateProduct(list = []) {
    this.setState(
      {
        agreementLine: list,
        productModalVisible: true,
      },
      () => {
        this.fetchPlatformCategory((list[0] || {}).catalogId);
      }
    );
    this.fetchTemplate();
  }

  @Bind()
  fetchTemplate() {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/fetchTemplate',
    });
  }

  @Bind()
  fetchPlatformCategory(catalogId = '') {
    const { dispatch } = this.props;
    if (!catalogId) return false;
    dispatch({
      type: 'mallProtocolManagement/fetchPlatformCategory',
      payload: {
        page: 0,
        size: 1,
        catalogId,
        enabledFlag: 1,
        tenantId: getCurrentOrganizationId(),
      },
    }).then((res) => {
      if (res && res[0]) {
        const { categoryId, categoryName } = res[0] || {};
        if (this.itemProductForm) {
          this.itemProductForm.setFieldsValue({ cid: categoryId, categoryName });
        }
      }
    });
  }

  /**
   * 创建商品
   */
  @Bind()
  handleProductOK(params = {}) {
    const { dispatch } = this.props;
    const { agreementLine, agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/createProduct',
      payload: {
        cid: params.cid,
        agreementSkuDTO: {
          agreementLineList: agreementLine,
          details: params.details,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState(
          {
            productModalVisible: false,
          },
          () => {
            this.tableDs.query(this.tableDs.currentPage);
            if (agreementLineId) {
              this.fetchExitProductList();
              this.fetchNoExitProductList();
            }
          }
        );
      }
    });
  }

  /**
   * 查询已有服务列表
   */
  @Bind()
  fetchExitProductList(params = {}) {
    const { dispatch } = this.props;
    const { agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetchExitProductList',
      payload: {
        ...params,
        agreementLineId,
      },
    });
  }

  /**
   * 查询未分配服务列表
   */
  @Bind()
  fetchNoExitProductList(params = {}) {
    const { dispatch } = this.props;
    const { agreementLineId, supplierTenantId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/fetchNoExitProductList',
      payload: {
        ...params,
        agreementLineId,
        supplierTenantId,
      },
    });
  }

  /**
   * 添加服务
   */
  @Bind()
  handleAddProduct(rows = []) {
    const { dispatch } = this.props;
    const { agreementLineId } = this.state;
    dispatch({
      type: 'mallProtocolManagement/lineAddProduct',
      payload: {
        agreementLineId,
        agreementDetailsDTOS: rows,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.tableDs.query(this.tableDs.currentPage);
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    });
  }

  /**
   * 删除服务
   */
  @Bind()
  handleRemoveProduct(rows = []) {
    const { dispatch } = this.props;
    dispatch({
      type: 'mallProtocolManagement/lineDeleteProduct',
      payload: {
        agreementDetails: rows,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.tableDs.query(this.tableDs.currentPage);
        this.fetchExitProductList();
        this.fetchNoExitProductList();
      }
    });
  }

  @Bind()
  handleGoodsPreview(record) {
    const {
      mallProtocolManagement: { initData = {} },
    } = this.props;
    this.setState({
      productVisible: false,
    });
    openSkuDetail({
      recordData: record,
      backPath: `/small/mall-protocol-management/check-detail/${initData.agreementId}`,
    });
  }

  @Bind()
  handleGoodsEdit(record) {
    const {
      mallProtocolManagement: { initData = {} },
    } = this.props;
    const { spuId } = record;
    this.setState({
      productVisible: false,
    });
    openSkuEdit({
      spuId,
      backPath: `/small/mall-protocol-management/check-detail/${initData.agreementId}`,
    });
  }

  @Bind()
  handleCloseProduct() {
    this.setState({ productModalVisible: false });
  }

  // 协议变更
  @Bind()
  changeAgreement(paramData) {
    const {
      dispatch,
      mallProtocolManagement: { initData = {} },
    } = this.props;
    dispatch({
      type: 'mallProtocolManagement/changeAgreement',
      payload: [{ agreementId: initData.agreementId, ...paramData }],
    }).then((res) => {
      if (res) {
        notification.success();
        this.props.history.push(
          `/small/mall-protocol-management/handwork?agreementId=${initData.agreementId}`
        );
      }
    });
  }

  // 协议终止
  @Bind()
  terminateAgreement(paramData) {
    const {
      dispatch,
      mallProtocolManagement: { initData = {} },
    } = this.props;
    dispatch({
      type: 'mallProtocolManagement/terminateAgreement',
      payload: [{ ...initData, ...paramData }],
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchHeader(initData.agreementId);
        this.tableDs.query();
      }
    });
  }

  render() {
    const {
      addLoading,
      createLoading,
      changeLoading,
      deleteLoading,
      terminateLoading,
      fetchDataLoading,
      fetchExitLoading,
      fetchNoExitLoading,
      mallProtocolManagement,
      customizeForm,
    } = this.props;
    const {
      initData = {},
      productTemplate = [],
      exitPagination = {},
      exitProductList = [],
      noExitPagination = {},
      noExitProductList = [],
    } = mallProtocolManagement;
    const {
      tabKey,
      isEffective,
      agreementLine,
      productVisible,
      productModalVisible,
      agreementStatus: lineStatus,
      skuApprove,
    } = this.state;
    const { uuid, agreementId, agreementStatus, agreementNumber } = initData;
    const tableInfoProps = {
      initData,
      agreementId,
      skuApprove,
      tableDs: this.tableDs,
      onShowTransfer: this.handleShowTransfer,
      onBatchCreateProduct: this.handleCreateProduct,
    };

    const backPath = `/small/mall-protocol-management/list?tabKey=${tabKey}`;

    const title = intl.get('small.common.view.agreement.detail').d('协议明细');
    const uploadModalProps = {
      btnText: intl.get(`small.common.model.attachment.upload`).d('附件上传'),
      btnProps: {
        icon: 'upload',
      },
      showFilesNumber: false,
      attachmentUUID: uuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'small-protocol-manage',
    };

    // NEW SUBMITTED APPROVED REJECT DISABLED PUBLISHED TERMINATED

    const rightBtns = [
      {
        name: intl.get('small.mallProtocolManagement.model.agreement.change').d('协议变更'),
        disabled: false,
        primary: true,
        loading: changeLoading,
        icon: 'sync',
        show: ['APPROVED', 'REJECT', 'DISABLED', 'PUBLISHED', 'TERMINATED'].includes(
          agreementStatus
        ),
        event: () =>
          confirmBefore({
            title: intl.get('small.mallProtocolManagement.model.agreement.change').d('协议变更'),
            type: 'warning',
            message:
              agreementStatus === 'PUBLISHED'
                ? intl
                    .get('sagm.common.view.confirm.upgradeInfo1')
                    .d('此操作会终止当前协议并生成新版本，请谨慎操作')
                : intl
                    .get('sagm.common.view.confirm.upgradeInfo2')
                    .d('此操作会生成新版本，请谨慎操作'),
            field: {
              reasonName: 'remark',
              reasonLabel: intl.get('sagm.common.view.confirm.upgradeReason').d('变更原因'),
            },
            customizeForm,
            customizeCode: 'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
            customFunc: (paramData) => this.changeAgreement(paramData),
          }),
      },
      {
        name: intl.get('small.mallProtocolManagement.view.agreement.terminate').d('协议终止'),
        disabled: false,
        loading: terminateLoading,
        icon: 'close',
        show: agreementStatus === 'PUBLISHED',
        event: () =>
          confirmBefore({
            title: intl.get('small.mallProtocolManagement.view.agreement.terminate').d('协议终止'),
            message: intl
              .get('sagm.common.view.confirm.terminateInfo')
              .d('此操作会下架该协议内商品，请谨慎操作'),
            field: {
              reasonName: 'remark',
              reasonLabel: intl.get('sagm.common.view.confirm.terminateReason').d('终止原因'),
            },
            customizeForm,
            customizeCode: 'SAGM.WORKBENCH.LINE.UPGRADE_OR_TERMINATE.FORM',
            customFunc: (paramData) => this.terminateAgreement(paramData),
          }),
      },
      {
        show: ['SUBMITTED', 'APPROVED', 'DISABLED', 'PUBLISHED', 'TERMINATED'].includes(
          agreementStatus
        ),
        render: () => (
          <UploadModal
            {...{
              ...uploadModalProps,
              btnProps: {
                type: agreementStatus === 'SUBMITTED' ? 'primary' : '',
                icon: 'paper-clip',
              },
              viewOnly: true,
              btnText: intl.get('small.common.model.fileView').d('附件查看'),
            }}
          />
        ),
      },
      {
        show: ['REJECT'].includes(agreementStatus),
        render: () => <UploadModal {...uploadModalProps} />,
      },
      {
        name: intl.get('hzero.common.button.operating').d('操作记录'),
        show: true,
        event: this.handleShowHistory,
        icon: 'clock-circle-o',
      },
    ];

    const transferProps = {
      rowKey: 'skuId',
      skuApprove,
      columns: [
        {
          title: intl.get('small.common.model.productCode').d('商品编码'),
          dataIndex: 'skuCode',
          width: 150,
        },
        {
          title: intl.get('small.common.model.productName').d('商品名称'),
          dataIndex: 'skuName',
        },
        // {
        //   title: intl.get('small.common.model.uom').d('单位'),
        //   dataIndex: 'uomName',
        //   width: 100,
        // },
        {
          title: intl.get('small.common.model.platformCategory').d('平台分类'),
          dataIndex: 'categoryName',
          width: 150,
        },
        {
          title: intl.get('hzero.common.action').d('操作'),
          dataIndex: 'edit',
          width: 150,
          render: (_, record) => {
            const { purchaseTenantId } = record;
            return (
              <span className="action-link">
                <a onClick={() => this.handleGoodsPreview(record)}>
                  {intl.get('small.common.model.look').d('查看')}
                </a>
                {purchaseTenantId === getCurrentOrganizationId() && skuApprove && (
                  <a onClick={() => this.handleGoodsEdit(record)}>
                    {intl.get('small.common.button.edit').d('编辑')}
                  </a>
                )}
              </span>
            );
          },
        },
      ],
      addLoading,
      isEffective,
      agreementLine,
      deleteLoading,
      productVisible,
      productTemplate,
      exitPagination,
      exitProductList,
      noExitPagination,
      noExitProductList,
      fetchExitLoading,
      fetchNoExitLoading,
      agreementStatus: lineStatus,
      onProductOK: this.handleProductOK,
      onHandleAddProduct: this.handleAddProduct,
      onHandleRemoveProduct: this.handleRemoveProduct,
      onFetchExitProductList: this.fetchExitProductList,
      onFetchNoExitProductList: this.fetchNoExitProductList,
      onCreateProduct: () => this.handleCreateProduct(agreementLine),
      onHandleCloseModal: () => this.setState({ productVisible: false }),
      modalTitle: intl.get('small.common.model.productInfo').d('商品信息'),
    };

    const productModalProps = {
      visible: productModalVisible,
      loading: createLoading,
      onCancel: this.handleCloseProduct,
      onOk: this.handleProductOK,
      productTemplate,
      onRef: (ref) => {
        this.itemProductForm = (ref.props || {}).form;
      },
    };
    return (
      <React.Fragment>
        <Header title={title} backPath={backPath}>
          {rightBtns
            .filter((btn) => btn.show)
            .map((btn) =>
              btn.render ? (
                btn.render()
              ) : btn.popConfirmProps ? (
                <Popconfirm
                  arrowPointAtCenter
                  placement="bottom"
                  onConfirm={btn.event}
                  {...btn.popConfirmProps}
                >
                  <Button
                    type={btn.primary ? 'primary' : ''}
                    disabled={btn.disabled}
                    loading={btn.loading}
                    icon={btn.icon}
                  >
                    {btn.name}
                  </Button>
                </Popconfirm>
              ) : (
                <Button
                  type={btn.primary ? 'primary' : ''}
                  onClick={btn.event}
                  disabled={btn.disabled}
                  loading={btn.loading}
                  icon={btn.icon}
                >
                  {btn.name}
                </Button>
              )
            )}
        </Header>
        <Content>
          <Spin spinning={!!fetchDataLoading} wrapperClassName="ued-detail-wrapper">
            <BaseInfo baseInfo={initData} sourceType="other" />
          </Spin>
          <Tabs animated={false}>
            <Tabs.TabPane tab={intl.get('small.common.view.agreementLine').d('协议行')} key="1">
              <TableInfo {...tableInfoProps} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={intl.get('sagm.common.view.buyPermisson').d('采买权限')} key="3">
              <Authority
                readOnly
                agreementHeaderId={agreementId}
                agreementHeaderNum={agreementNumber}
                viewSkuBackPath={this.props.location.pathname}
                agreementType="PUR_AGREEMENT"
              />
            </Tabs.TabPane>
          </Tabs>
        </Content>
        {productModalVisible && <ItemProductModal {...productModalProps} />}
        <ListTransfer {...transferProps} />
      </React.Fragment>
    );
  }
}
