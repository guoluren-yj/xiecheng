/**
 * materiel - 物料定义
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Icon, Modal as C7NModal } from 'choerodon-ui/pro';
import { Button, Form, Modal } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined, isArray, isEmpty, uniqBy, isString, omit } from 'lodash';
import notification from 'utils/notification';
// import qs from 'querystring';
import { Button as PermissionButton } from 'components/Permission';
import { SRM_MDM } from '_utils/config';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import withRemote from 'utils/remote';
import { queryBatchApprovaFlag } from '_utils/utils';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { fetchPermissions } from '@/services/materielApplicationService';
import { revokeWorkFlowByKey } from '@/services/materialCertificationPoolService';
import { getBatchOperationFlag } from '../MaterialCertificationPool/util';
import FilterForm from './FilterForm';
import ChangeList from './ChangeList';
// const formItemLayout = {
//   labelCol: { span: 8 },
//   wrapperCol: { span: 12 },
// };

/**
 * 物料定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} materiel - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SMDM_MATERIELAPPLICATION_LIST.MATERIEL_LIST',
    'SMDM_MATERIELAPPLICATION_LIST.SEARCH',
    'SMDM_MATERIELAPPLICATION_LIST.BTNS',
    'SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.LIST',
    'SMDM_MATERIELAPPLICATION_MATERIEL_MODAL.SERRCH',
  ],
})
@connect(({ materielApplication, loading }) => ({
  materielApplication,
  loading:
    loading.effects['materielApplication/fetchMaterielApplicationList'] ||
    loading.effects['materielApplication/batchSubmit'] ||
    loading.effects['materielApplication/fetchCreateMaterielApplication'] ||
    loading.effects['materielApplication/batchDelete'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create(null)
@withRemote({
  code: 'SMDM_MATERIELAPPLICATION_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: [
    'smdm.materielApplication',
    'smdm.materiel',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'smdm.common',
  ],
})
export default class Materiel extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      // tenantId: getCurrentOrganizationId(),
      // createVisible: false,
      selectedRowKeys: [],
      selectedAllRows: [],
      submitBtnDisabled: true,
      changeVisable: false,
      headerImportFlag: false,
      lineImportFlag: false,
      changeImportFlag: false,
    };
  }

  componentDidMount() {
    this.queryFlagList();
    this.handleInitList();
    const buttonPermissionList = [
      'srm.bg.manager.mdm.item.req.button.headerImport',
      'srm.bg.manager.mdm.item.req.button.lineImport',
      'srm.bg.manager.mdm.item.req.button.changeImport',
    ];
    fetchPermissions(buttonPermissionList).then((res) => {
      if (res && !res.failed) {
        // setPermissonFlag({
        //   mergeBtnFlag: res.find((ele) => ele.code === buttonPermissionList[0])?.approve || false,
        //   splitBtnFlag: res.find((ele) => ele.code === buttonPermissionList[1])?.approve || false,
        //   modifyBtnFlag: res.find((ele) => ele.code === buttonPermissionList[2])?.approve || false,
        // });
        this.setState({
          headerImportFlag:
            res.find((ele) => ele.code === buttonPermissionList[0])?.approve || false,
          lineImportFlag: res.find((ele) => ele.code === buttonPermissionList[1])?.approve || false,
          changeImportFlag:
            res.find((ele) => ele.code === buttonPermissionList[2])?.approve || false,
        });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      materielApplication: { pagination = {}, sorter },
    } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleFetchMaterielApplicaitonList(pagination, undefined, sorter);
    }
  }

  @Bind()
  async handleInitList() {
    const {
      remote,
      materielApplication: { pagination = {}, sorter },
      custLoading,
    } = this.props;
    try {
      if (remote) {
        await remote.event.fireEvent('onBeforeInit', {
          form: this.filterForm,
        });
      }
    } finally {
      if (!custLoading) {
        this.handleFetchMaterielApplicaitonList(pagination, undefined, sorter);
      }
    }
  }

  /**
   * 物料数据查询
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleFetchMaterielApplicaitonList(payload = {}, _, sorter) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const { creationDateFrom, creationDateTo } = filterValues;
    dispatch({
      type: 'materielApplication/fetchMaterielApplicationList',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        sort: sorter,
        ...filterValues,
        itemCodeMultiSelect: Array.from(new Set(filterValues?.itemCodeMultiSelect || []))?.join(
          ','
        ),
        creationDateFrom: creationDateFrom
          ? creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        creationDateTo: creationDateTo ? creationDateTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
        customizeUnitCode:
          'SMDM_MATERIELAPPLICATION_LIST.MATERIEL_LIST,SMDM_MATERIELAPPLICATION_LIST.SEARCH',
      },
    }).then(async () => {
      const {
        materielApplication: { materielApplicaitonList = {} },
      } = this.props;
      const dataSource = materielApplicaitonList?.content || [];
      const workFlowBussinessKeys = dataSource.reduce((acc, cur) => {
        const value = cur.workflowBusinessKey;
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        this.setState({ approvaFlags, operationFlags });
      }
    });
  }

  /**
   * 物料数据提交
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleSubmit() {
    const {
      dispatch,
      organizationId,
      materielApplication: { materielApplicaitonList = {} },
    } = this.props;
    const { selectedRowKeys, selectedAllRows } = this.state;
    const { content = [] } = materielApplicaitonList;
    const currentPageSelected = content.filter((item) =>
      selectedRowKeys.includes(item.itemReqHeaderId)
    );
    // 优先取当前页勾选数据
    const data = uniqBy([...currentPageSelected, ...selectedAllRows], 'itemReqHeaderId').map(
      (item) => {
        const { $form } = item;
        const formData = $form?.getFieldsValue() || {};
        return omit({ ...item, ...formData }, '$form');
      }
    );
    dispatch({
      type: 'materielApplication/batchSubmit',
      payload: {
        organizationId,
        selectedRows: data,
        customizeUnitCode: [
          'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
          'SMDM_MATERIELAPPLICATION_EDIT.BASE',
          'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE',
          'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM',
          'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
          'SMDM_MATERIELAPPLICATION_ORG.EDITFORM',
          'SMDM_MATERIELAPPLICATION_ORG.TABLE',
          'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
          'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM',
          'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
          'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST',
          'SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
        ].join(','),
      },
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (result?.every((item) => item.errorFlag !== 1)) {
          this.setState({
            selectedRowKeys: [],
            selectedAllRows: [],
            submitBtnDisabled: true,
          });
          this.handleFetchMaterielApplicaitonList();
          notification.success();
        } else {
          const errorMsg = result.filter((ele) => ele.errorFlag === 1);
          const message = errorMsg.map((ele) => `${ele?.itemReqHeaderNum}:${ele?.errorMessage}`);
          this.setState({
            selectedRowKeys: [],
            selectedAllRows: [],
            submitBtnDisabled: true,
          });
          this.handleFetchMaterielApplicaitonList();
          notification.error({
            message: message.join(','),
          });
        }
      }
    });
  }

  /**
   * 物料数据提交
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleDelete() {
    const { dispatch, organizationId } = this.props;
    const { selectedAllRows } = this.state;
    const submitReqNumList = selectedAllRows.map((e) => e.itemReqHeaderNum).join(',');
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      content: intl
        .get('smdm.materielApplication.model.materiel.batchDelete', { submitReqNumList })
        .d(`是否确认删除物料申请单【${submitReqNumList}】`),
      onOk: () => {
        dispatch({
          type: 'materielApplication/batchDelete',
          payload: {
            organizationId,
            selectedRows: selectedAllRows,
          },
        }).then((res) => {
          const result = getResponse(res);
          if (result) {
            this.setState({
              selectedRowKeys: [],
              submitBtnDisabled: true,
            });
            this.handleFetchMaterielApplicaitonList();
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'materielApplication/queryFlagList' });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    // this.setState({ form: ref.props.form });
    this.filterForm = ref.props.form;
  }

  /**
   * 物料数据编辑/新增
   * @param {string} itemId - 物料Id
   */
  @Bind()
  handleGoDetail(itemId = '') {
    if (itemId) {
      this.props.history.push(`/smdm/materiel-application/detail/${itemId}`);
    } else {
      this.props.history.push('/smdm/materiel-application/create');
    }
  }

  @Bind()
  handleCreate(selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'materielApplication/fetchCreateMaterielApplication',
      payload: selectedRows[0],
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
          selectedAllRows: [],
          submitBtnDisabled: true,
        });
        const { itemReqHeaderId } = res;
        this.handleGoDetail(itemReqHeaderId);
        this.handleChangeModal();
      }
    });
  }

  @Bind()
  onTableSelectedRowChange(selectedRowKeys, selectedRows) {
    const { selectedAllRows } = this.state;
    const currentsSelectRows = uniqBy(
      [...selectedRows, ...selectedAllRows].filter((e) =>
        selectedRowKeys.includes(e.itemReqHeaderId)
      ),
      'itemReqHeaderId'
    );
    this.setState({
      selectedRowKeys,
      selectedAllRows: currentsSelectRows,
    });

    if (selectedRowKeys.length === 0) {
      this.setState({
        submitBtnDisabled: true,
      });
    }

    // 新建和审批拒绝 可提交

    if (selectedRows.every((item) => item.reqStatus === 'NEW' || item.reqStatus === 'REJECTED')) {
      this.setState({ submitBtnDisabled: false });
    } else {
      this.setState({ submitBtnDisabled: true });
    }
  }

  @Bind()
  handleChangeModal(flag = false) {
    this.setState({
      changeVisable: flag,
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { selectedRowKeys = [] } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { creationDateFrom, creationDateTo } = filterValues || {};
    return {
      ...filterValues,
      itemReqHeaderIds: selectedRowKeys,
      creationDateFrom: creationDateFrom
        ? creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      creationDateTo: creationDateTo ? creationDateTo.format(DEFAULT_DATETIME_FORMAT) : undefined,
      customizeUnitCode:
        'SMDM_MATERIELAPPLICATION_LIST.MATERIEL_LIST,SMDM_MATERIELAPPLICATION_LIST.SEARCH',
    };
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
    return new Promise(async (resolve) => {
      C7NModal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: record.workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (res && !res?.failed) {
            resolve(true);
            notification.success();
            this.handleFetchMaterielApplicaitonList();
          }
          resolve(false);
        },
        afterClose: () => {
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleApprove(record) {
    this.setState({ loading: true });
    return new Promise(async (resolve) => {
      const res = await queryBatchApprovaFlag([record.workflowBusinessKey]);
      this.setState({ loading: false });
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[record.workflowBusinessKey]?.taskId,
          processInstanceId: res[record.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            this.handleFetchMaterielApplicaitonList();
          },
        });
      }
      resolve(true);
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      remote,
      materielApplication: {
        materielApplicaitonList = {},
        pagination = {},
        enumMap = {},
        sorter = {},
      },
      loading,
      // form,
      // handleCreateloading,
      customizeFilterForm,
      customizeTable,
      customizeBtnGroup,
      organizationId,
    } = this.props;
    const {
      submitBtnDisabled,
      selectedRowKeys,
      changeVisable,
      headerImportFlag,
      lineImportFlag,
      changeImportFlag,
      approvaFlags = {},
      operationFlags = {},
    } = this.state;
    const { content = [] } = materielApplicaitonList;
    const filterProps = {
      enumMap,
      customizeFilterForm,
      onSearch: this.handleFetchMaterielApplicaitonList,
      onRef: this.handleBindRef,
      sorter,
    };
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 120,
        dataIndex: 'reqStatusMeaning',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 200,
        fixed: 'right',
        render: (val, record) => {
          const { workflowBusinessKey } = record || {};
          return (
            <span className="action-link">
              {approvaFlags[workflowBusinessKey] && (
                <PermissionButton
                  type="c7n-pro"
                  onClick={() => this.handleApprove(record)}
                  funcType="link"
                  wait={500}
                  loading={this.state.loading}
                >
                  {intl.get('hzero.common.button.approval').d('审批')}
                </PermissionButton>
              )}
              {operationFlags[workflowBusinessKey]?.REVOKE && (
                <PermissionButton
                  type="c7n-pro"
                  onClick={() => this.handleRevoke(record)}
                  funcType="link"
                  wait={500}
                >
                  {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
                </PermissionButton>
              )}
            </span>
          );
        },
      },
      {
        title: intl
          .get('smdm.materielApplication.model.materiel.itemReqHeaderNum')
          .d('物料申请单号'),
        dataIndex: 'itemReqHeaderNum',
        sorter: true,
        width: 200,
        render: (text, record) => (
          <a onClick={() => this.handleGoDetail(record.itemReqHeaderId)}>{text}</a>
        ),
      },
      {
        title: intl.get('smdm.materielApplication.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码'),
        dataIndex: 'originItemCode',
        width: 200,
      },
      {
        title: intl.get('smdm.materielApplication.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
        width: 350,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.version`).d('版本'),
        width: 150,
        dataIndex: 'versionNumber',
        sorter: true,
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.specifications`).d('规格'),
        width: 150,
        dataIndex: 'specifications',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.model`).d('型号'),
        width: 150,
        dataIndex: 'model',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.itemNumber`).d('云平台物料编码'),
        width: 150,
        dataIndex: 'itemNumber',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.categoryNameType`).d('平台分类'),
        width: 100,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.commonName`).d('通用名'),
        width: 200,
        dataIndex: 'commonName',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.primaryUomName`).d('基本计量单位'),
        width: 150,
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.createdName`).d('创建人'),
        width: 100,
        dataIndex: 'createdName',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.creationDate`).d('创建时间'),
        width: 100,
        sorter: true,
        dataIndex: 'creationDate',
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.lastUpdatedName`).d('最后更新人'),
        width: 100,
        dataIndex: 'lastUpdatedName',
      },
      {
        title: intl.get(`smdm.materielApplication.model.materiel.lastUpdateDate`).d('最后更新时间'),
        width: 150,
        sorter: true,
        dataIndex: 'lastUpdateDate',
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get('smdm.common.model.common.sourceCode').d('来源系统'),
        width: 100,
        align: 'center',
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('smdm.common.model.common.approvalMethod').d('审批方式'),
        width: 120,
        align: 'center',
        dataIndex: 'approvalMethodMeaning',
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };

    const changeListProps = {
      customizeTable,
      customizeFilterForm,
      visible: changeVisable,
      onCancel: this.handleChangeModal,
      onOk: this.handleCreate,
      confirmLoading: loading,
    };

    const menu = (
      <Menu>
        {headerImportFlag && (
          <Menu.Item>
            <CommonImport
              prefixPatch="/smdm"
              businessObjectTemplateCode="SMDM_ITEM_REQ_IMPORT"
              buttonText={intl
                .get(`smdm.materielApplication.model.materiel.headerImport`)
                .d('物料新建申请单头信息导入')}
              buttonProps={{
                funcType: 'text',
                // permissionList: [
                //   {
                //     code: `srm.bg.manager.mdm.item.req.button.headerImport`,
                //     type: 'button',
                //   },
                // ],
              }}
            />
          </Menu.Item>
        )}
        {changeImportFlag && (
          <Menu.Item>
            <CommonImport
              prefixPatch="/smdm"
              businessObjectTemplateCode="SMDM_ITEM_REQ_CHANGE_TEMPLATE_CODE"
              buttonText={intl
                .get(`smdm.materielApplication.model.materiel.changeImport`)
                .d('物料变更申请单头信息导入')}
              buttonProps={{
                funcType: 'text',
              }}
            />
          </Menu.Item>
        )}
        {lineImportFlag && (
          <Menu.Item>
            <CommonImport
              prefixPatch="/smdm"
              businessObjectTemplateCode="SMDM_ITEM_REQ_LINE_IMPORT"
              buttonText={intl
                .get(`smdm.materielApplication.model.materiel.lineImport`)
                .d('物料申请单行信息导入')}
              buttonProps={{
                funcType: 'text',
                // permissionList: [
                //   {
                //     code: `srm.bg.manager.mdm.item.req.button.lineImport`,
                //     type: 'button',
                //   },
                // ],
              }}
            />
          </Menu.Item>
        )}
      </Menu>
    );

    const headBtns = [
      <Button data-name="new" icon="plus" type="primary" onClick={() => this.handleGoDetail('')}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
      <Button
        icon="check"
        data-name="submit"
        loading={loading}
        onClick={() => this.handleSubmit()}
        disabled={submitBtnDisabled || selectedRowKeys.length === 0}
      >
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>,
      <Button
        icon="reload"
        data-name="change"
        loading={loading}
        onClick={() => this.handleChangeModal(true)}
      >
        {intl.get('hzero.common.button.change').d('变更')}
      </Button>,
      <PermissionButton
        data-name="delete"
        icon="delete"
        loading={loading}
        disabled={submitBtnDisabled || selectedRowKeys.length === 0}
        onClick={this.handleDelete}
        permissionList={[
          {
            code: `srm.bg.manager.mdm.item.req.button.delete`,
            type: 'button',
          },
        ]}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </PermissionButton>,
      (headerImportFlag || lineImportFlag || changeImportFlag) && (
        <Dropdown data-name="import" overlay={menu} arrow>
          <Button>
            {intl.get('hzero.common.button.import.new').d('(新)导入')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ),
      <ExcelExportPro
        allBody
        method="POST"
        data-name="export"
        templateCode="SMDM_ITEM_REQ_EXPORT"
        buttonText={
          isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
            ? intl.get('hzero.common.button.newExport').d('(新)导出')
            : intl.get(`hzero.common.button.newSelectedExport`).d('(新)勾选导出')
        }
        requestUrl={`${SRM_MDM}/v1/${organizationId}/item-req-headers/export`}
        queryParams={this.handleGetFormValue}
        otherButtonProps={{
          icon: 'unarchive',
          permissionList: [
            {
              code: 'srm.bg.manager.mdm.item.req.button.export',
              type: 'button',
            },
          ],
        }}
      />,
    ];

    const processBtns = remote
      ? remote.process('SMDM_MATERIELAPPLICATION_LIST_CUX_HEADBTNS', headBtns, {
        onQueryList: this.handleFetchMaterielApplicaitonList,
      })
      : headBtns;

    return (
      <React.Fragment>
        <Header
          title={intl.get(`smdm.materielApplication.view.message.title.list`).d('物料申请单')}
        >
          {customizeBtnGroup({ code: 'SMDM_MATERIELAPPLICATION_LIST.BTNS' }, processBtns)}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SMDM_MATERIELAPPLICATION_LIST.MATERIEL_LIST',
            },
            <EditTable
              rowKey="itemReqHeaderId"
              bordered
              loading={loading}
              dataSource={content}
              rowSelection={rowSelection}
              columns={columns}
              pagination={pagination}
              onChange={this.handleFetchMaterielApplicaitonList}
            />
          )}
        </Content>
        {changeVisable && <ChangeList {...changeListProps} />}
      </React.Fragment>
    );
  }
}
