import React, { PureComponent, Fragment } from 'react';
import { Button, Drawer, Modal, Form } from 'hzero-ui';
import { Modal as ChoerodonModal } from 'choerodon-ui/pro';
import { isEmpty, uniqBy, omit } from 'lodash';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import CommonImport from 'components/Import';
import { Button as PerButton } from 'components/Permission';
import { SRM_SSLM } from '_utils/config';
import { saveCategoryList } from '@/services/evaluationTemplateService';
import EditorForm from './Form';
import List from './List';
import Categories from './Categories';
import Suppliers from './Suppliers';
import Items from './Items';
import AutoCategory from './AutoCategory';
import NewCategories from './NewCategories';

// import styles from './index.less';

const defaultTableRowKey = 'evalTplScopeId';
const organizationId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
@connect(({ evaluationTemplate, loading }) => ({
  evaluationTemplate,
  EvaluationAutoCategoryData: evaluationTemplate.EvaluationAutoCategoryData,
  EvaluationAutoCategoryKeys: evaluationTemplate.EvaluationAutoCategoryKeys,
  queryEvaluationAutoCategoryLoading:
    loading.effects['evaluationTemplate/queryEvaluationAutoCategory'],
}))
@formatterCollections({
  code: ['spfm.supplierKpiIndicator', 'sslm.evaluationTemplate', 'sslm.supplierDocManage'],
})
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      evalTplCode: '',
      categoriesDrawerVisible: false,
      supplierModalVisible: false,
      itemsDrawerVisible: false,
      evaluationAutoCategoryVisible: false,
      currentActionRowData: {},
      selectedRows: [],
      listDataSource: [],
      listPagination: {},
    };

    // 方法注册
    [
      'cancel',
      'handleSave',
      'handleFetchEvalTplScopeList',
      'openCategoriesDrawer',
      'onTableRowSelectChange',
      'closeCategoriesDrawer',
      'openSupplierModal',
      'onSupplierModalOk',
      'closeCategoriesDrawer',
      'closeSupplierModal',
      'handleDeleteEvalTplScope',
      'handleFetchEvalTplScopeCategoryList',
      'handleSaveEvalTplScopeCategoryList',
      'handleFetchEvalTplScopeItemList',
      'handleSaveEvalTplScopeItemList',
      'handleDeleteEvalTplScopeItemList',
      'openItemsDrawer',
      'closeItemsDrawer',
      'onTableChange',
      'openAutoCategory',
      'closeAutoCategory',
      'handleAssignGroup',
      'handleCategoryGroup',
      'checkSupplierScope',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  transfer;

  /**
   * 绑定ref
   */
  handleBindRef(ref = {}) {
    this.transfer = ref || {};
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionDataSource = {} } = this.props;
    const { evalTplId } = actionDataSource;
    return visible && evalTplId && evalTplId !== prevProps.actionDataSource.evalTplId;
  }
  // applicationId !== prevProps.applicationId

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchEvalTplScopeList();
      // 打开弹窗通过选择参评供应商范围是否有值，判断按钮是否需要禁用
      this.checkSupplierScope();
    }
  }

  /**
   * handleFetchEvalTplScopeList - 查询模板供应商信息
   * @param {object} params - 查询参数
   */
  handleFetchEvalTplScopeList(params) {
    const { fetchEvalTplScopeList = e => e, actionDataSource = {} } = this.props;
    fetchEvalTplScopeList(actionDataSource.evalTplId, params, res => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          listDataSource: dataSource.map(o => ({ key: o[defaultTableRowKey], ...o })),
          listPagination: pagination,
        });
      }
    });
  }

  /**
   * cancel - 关闭参评物料/品类抽屉
   */
  cancel() {
    const { close = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    this.setState({
      selectedRows: [],
      listDataSource: [],
      listPagination: {},
    });
    resetFields();
    close();
  }

  /**
   * handleSave - 保存头信息
   */
  handleSave(supplierDataSource) {
    const editorForm = this.editorForm || {};
    const { validateFields = e => e } = (editorForm.props || {}).form;
    const { saveEvalTplScope = e => e, actionDataSource = {} } = this.props;
    const { listDataSource = [] } = this.state;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        const { evalDimension, evalDimensionValue, trxLineFlags, stageIds } = values || {};
        const payload = omit(
          {
            ...actionDataSource,
            ...values,
            evalDimensionValue: evalDimension === 'GROUP' ? null : evalDimensionValue,
            kpiEvalTplScopeList: (supplierDataSource || listDataSource).filter(
              o => o._status === 'create'
            ),
            trxLineFlags: trxLineFlags?.join(',') || '',
            stageIds: stageIds?.join(',') || '',
          },
          ['_status']
        );
        saveEvalTplScope(payload, () => {
          if (actionDataSource.activeEvalGranularity === 'SU') {
            this.cancel();
          } else {
            this.handleFetchEvalTplScopeList();
          }
        });
      }
    });
  }

  /**
   * closeFormula - 表格分页
   * @param {object} page - 分页参数
   */
  onTableChange(page) {
    this.handleFetchEvalTplScopeList({ page });
  }

  /**
   * closeFormula - 关闭公式
   */
  closeFormula() {
    this.setState({
      categoriesDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openItemsDrawer - 打开参评物料抽屉
   * @param {object} currentActionRowData - 当前行数据
   */
  openCategoriesDrawer(currentActionRowData) {
    this.setState({
      // categoriesDrawerVisible: true,
      currentActionRowData,
    });
    // 品类c7n弹窗
    ChoerodonModal.open({
      title: intl.get(`spfm.evaluationTemplate.view.title.category`).d('参评品类定义'),
      key: ChoerodonModal.key(),
      drawer: true,
      style: { width: 750 },
      children: (
        <NewCategories
          scopeId={currentActionRowData[defaultTableRowKey]}
          onRef={ds => {
            this.categoriesDs = ds;
          }}
        />
      ),
      onOk: () => {
        const selectedRows = this.categoriesDs.toJSONData();
        const scopeId = currentActionRowData[defaultTableRowKey];
        return new Promise(async resolve => {
          saveCategoryList(scopeId, selectedRows).then(res => {
            if (getResponse(res)) {
              resolve(true);
              notification.success();
            } else {
              resolve(false);
            }
          });
        });
      },
    });
  }

  /**
   * onSupplierModalOk - 打开供应商弹窗
   */
  closeCategoriesDrawer() {
    this.setState({
      categoriesDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openItemsDrawer - 打开参评物料抽屉
   * @param {object} currentActionRowData - 当前行数据
   */
  openItemsDrawer(currentActionRowData) {
    this.setState({
      itemsDrawerVisible: true,
      currentActionRowData,
    });
  }

  /**
   * onSupplierModalOk - 打开供应商弹窗
   */
  closeItemsDrawer() {
    this.setState({
      itemsDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * onSupplierModalOk - 打开供应商弹窗
   */
  onTableRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * onSupplierModalOk - 打开供应商弹窗
   */
  openSupplierModal() {
    this.setState({
      supplierModalVisible: true,
    });
  }

  /**
   * openAutoCategory - 打开分配供应商及品类弹框
   */
  openAutoCategory(evalTplCode) {
    this.setState({
      evaluationAutoCategoryVisible: true,
      evalTplCode,
    });
  }

  /**
   * closeAutoCategory - 打开分配供应商及品类弹框
   */
  closeAutoCategory() {
    this.setState({
      evaluationAutoCategoryVisible: false,
    });
  }

  /**
   * 查询修改分组
   */
  handleCategoryGroup() {
    const { dispatch, actionDataSource } = this.props;
    const { evalTplCode } = this.state;
    dispatch({
      type: 'evaluationTemplate/queryEvaluationAutoCategory',
      payload: {
        templateId: actionDataSource.evalTplId,
        evalDimension: evalTplCode,
      },
    });
  }

  /**
   * 分配分组
   */
  handleAssignGroup() {
    const {
      EvaluationAutoCategoryKeys = [],
      EvaluationAutoCategoryData = [],
      dispatch,
      actionDataSource = {},
    } = this.props;
    const { evalTplCode } = this.state;
    const arr = [];
    for (let i = 0; i < EvaluationAutoCategoryKeys.length; i++) {
      for (let n = 0; n < EvaluationAutoCategoryData.length; n++) {
        if (EvaluationAutoCategoryKeys[i] === EvaluationAutoCategoryData[n].evalDimensionValue) {
          EvaluationAutoCategoryData[n].evalTplId = actionDataSource.evalTplId;
          EvaluationAutoCategoryData[n].evalDimension = evalTplCode;
          EvaluationAutoCategoryData[n].tenantId = organizationId;
          arr.push(EvaluationAutoCategoryData[n]);
        }
      }
    }
    if (isEmpty(arr)) {
      notification.warning({
        message: intl
          .get(`spfm.supplierKpiIndicator.view.message.selectOneGroup`)
          .d('请至少选择一个维度'),
      });
    } else {
      dispatch({
        type: 'evaluationTemplate/addEvaluationDimension',
        payload: arr,
      }).then(res => {
        if (res) {
          this.handleCategoryGroup();
          if (evalTplCode === actionDataSource.evalDimension) {
            notification.success();
          } else if (evalTplCode !== actionDataSource.evalDimension) {
            this.handleSave();
          }
        }
      });
    }
  }

  /**
   * onSupplierModalOk - 添加供应商弹窗确定事件
   */
  onSupplierModalOk() {
    const { selectedRows = [] } = (this.suppliers || {}).state || {};
    const { listDataSource = [], listPagination = {} } = this.state;
    const newListDataSource = uniqBy(
      listDataSource.concat(selectedRows.map(o => ({ key: uuidv4(), ...o, _status: 'create' }))),
      'supplierCompanyId'
    );
    this.setState({
      listDataSource: newListDataSource,
      listPagination: {
        ...listPagination,
        pageSize:
          newListDataSource.length > (listPagination.pageSize || 10)
            ? (listPagination.pageSize || 10) + 1
            : listPagination.pageSize,
      },
      supplierModalVisible: false,
    });
    this.handleSave(newListDataSource);
  }

  /**
   * handleDeleteEvalTplScope - 删除评估模板
   */

  handleDeleteEvalTplScope() {
    const { deleteEvalTplScope = e => e } = this.props;
    const { listDataSource, selectedRows } = this.state;
    const newRows = selectedRows.filter(n => n._status === 'create'); // 获取新建行
    const oldRows = selectedRows.filter(n => n._status !== 'create'); // 获取已有行
    // 只有新建行时
    if (isEmpty(oldRows) && !isEmpty(newRows)) {
      const newListDataSource = listDataSource.filter(
        n => newRows.findIndex(m => m.key === n.key) === -1
      );
      this.setState({ listDataSource: newListDataSource });
    }
    // 勾选项中含有已有行时
    if (!isEmpty(oldRows)) {
      // 判断是否有新建行
      const flag = !isEmpty(listDataSource.filter(n => n._status === 'create'));
      if (flag) {
        Modal.confirm({
          title: intl
            .get(`sslm.evaluationTemplate.view.message.deleteTip`)
            .d('有新建行未保存，继续操作将会丢失，是否继续？'),
          onOk: () => {
            deleteEvalTplScope(oldRows, () => {
              this.handleFetchEvalTplScopeList();
            });
          },
        });
      } else {
        deleteEvalTplScope(oldRows, () => {
          this.handleFetchEvalTplScopeList();
        });
      }
    }
  }

  /**
   * handleFetchEvalTplScopeCategoryList - 查询参评品类
   * @param {object} params - 查询参数
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  handleFetchEvalTplScopeCategoryList(params, cb = e => e) {
    const { fetchEvalTplScopeCategoryList = e => e } = this.props;
    const { currentActionRowData = {} } = this.state;
    fetchEvalTplScopeCategoryList(currentActionRowData[defaultTableRowKey], params, cb);
  }

  /**
   * handleSaveEvalTplScopeCategoryList - 保存参评品类
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  handleSaveEvalTplScopeCategoryList(data, cb = e => e) {
    const { saveEvalTplScopeCategoryList } = this.props;
    const { currentActionRowData = {} } = this.state;
    saveEvalTplScopeCategoryList(currentActionRowData[defaultTableRowKey], data, cb);
  }

  /**
   * handleFetchEvalTplScopeItemList - 查询供应商
   * @param {object} params - 查询参数
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  handleFetchEvalTplScopeItemList(params, cb = e => e) {
    const { fetchEvalTplScopeItemList = e => e } = this.props;
    const { currentActionRowData = {} } = this.state;
    fetchEvalTplScopeItemList(currentActionRowData[defaultTableRowKey], params, cb);
  }

  /**
   * handleSaveEvalTplScopeItemList - 保存供应商
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  handleSaveEvalTplScopeItemList(data, cb = e => e) {
    const { saveEvalTplScopeItemList } = this.props;
    const { currentActionRowData = {} } = this.state;
    saveEvalTplScopeItemList(currentActionRowData[defaultTableRowKey], data, cb);
  }

  /**
   * handleDeleteEvalTplScopeItemList - 删除供应商
   * @param {object} data - 保存数据
   * @param {object} [cb = e => e] - 操作成功回调函数
   */
  handleDeleteEvalTplScopeItemList(data, cb = e => e) {
    const { deleteEvalTplScopeItemList } = this.props;
    const { currentActionRowData = {} } = this.state;
    deleteEvalTplScopeItemList(currentActionRowData[defaultTableRowKey], data, cb);
  }

  /**
   * closeSupplierModal - 关闭添加供应商弹窗
   */
  closeSupplierModal() {
    this.setState({
      supplierModalVisible: false,
    });
  }

  /**
   *  获取仅对考评周期内有接收入库的供应商进行考评（根据值来控制）
   * @author  姚格格
   * @date    2020-06-02 14:55
   */
  handleCheckSupplier = e => {
    const isDisabled = e;
    this.setState({ isDisabled });
  };

  /**
   * 打开弹窗通过选择参评供应商范围是否有值，判断按钮是否需要禁用
   */
  checkSupplierScope() {
    const { actionDataSource = {} } = this.props;
    this.setState({
      isDisabled: !!actionDataSource.trxLineFlag || !!actionDataSource.trxLineFlags,
    });
  }

  render() {
    const {
      visible,
      processing = {},
      status,
      scoreTypeCode = [],
      dataSourceCode = [],
      handleImport = e => e,
      fetchListTree = e => e,
      actionDataSource = [],
      evalDimensionCode = [],
      evalGranularityCode = [],
      evalSortMethodCode = [],
      lifeCycleStageCode = [],
      kpiSupplierScope = [],
      onEvalGranularityChange,
      onEvalSortMethodChange,
      fetchEvalTplScopeSupplierList = e => e,
      queryEvaluationAutoCategoryLoading,
      evaluationTemplateRemote,
      deleteEvalTplScope = e => e,
    } = this.props;
    const {
      listDataSource,
      listPagination = {},
      selectedRows = [],
      categoriesDrawerVisible,
      supplierModalVisible,
      itemsDrawerVisible,
      currentActionRowData,
      evaluationAutoCategoryVisible,
      evalTplCode,
    } = this.state;
    const title = intl
      .get(`sslm.evaluationTemplate.view.button.assignSupplierCategory`)
      .d('分配供应商及品类');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 700,
      zIndex: 100,
    };
    const {
      queryEvalTplScopeListLoading,
      queryEvalTplScopeSupplierListLoading,
      saveEvalTplScopeLoading,
      deleteEvalTplScopeLoading,
      queryEvalTplScopeCategoryListLoading,
      saveEvalTplScopeCategoryListLoading,
      saveEvalTplScopeItemListLoading,
      queryEvalTplScopeItemListLoading,
    } = processing;
    const formProps = {
      dataSource: actionDataSource,
      onRef: node => {
        this.editorForm = node;
      },
      status,
      scoreTypeCode,
      dataSourceCode,
      fetchListTree,
      openFormula: this.openFormula,
      evalDimensionCode,
      evalGranularityCode,
      evalSortMethodCode,
      kpiSupplierScope,
      onEvalGranularityChange,
      onEvalSortMethodChange,
      evaluationTemplateRemote,
      listDataSource,
      deleteEvalTplScope,
      handleFetchEvalTplScopeList: this.handleFetchEvalTplScopeList,
      openAutoCategory: this.openAutoCategory,
      handleCheckSupplier: this.handleCheckSupplier,
    };
    const listProps = {
      openCategoriesDrawer: this.openCategoriesDrawer,
      openItemsDrawer: this.openItemsDrawer,
      dataSource: listDataSource,
      pagination: listPagination,
      rowSelection:
        actionDataSource.evalStatusCode !== 'PUBLISHED'
          ? {
              selectedRowKeys: selectedRows.map(n => n.key),
              onChange: this.onTableRowSelectChange,
            }
          : null,
      loading: queryEvalTplScopeListLoading || saveEvalTplScopeLoading,
      activeEvalGranularity: actionDataSource.activeEvalGranularity,
      defaultTableRowKey,
      onChange: this.onTableChange,
    };

    const categoriesProps = {
      visible: categoriesDrawerVisible,
      close: this.closeCategoriesDrawer,
      actionDataSource: currentActionRowData,
      fetchList: this.handleFetchEvalTplScopeCategoryList,
      defaultScopeIdKey: defaultTableRowKey,
      saveList: this.handleSaveEvalTplScopeCategoryList,
      processing: {
        queryEvalTplScopeCategoryListLoading,
        saveEvalTplScopeCategoryListLoading,
      },
    };
    const AutoCategoryProps = {
      onRef: this.handleBindRef,
      visible: evaluationAutoCategoryVisible,
      evalTplCode,
      templateId: actionDataSource.evalTplId,
      evalStatusCode: actionDataSource.evalStatusCode,
      handleCategoryGroup: this.handleCategoryGroup,
      queryEvaluationAutoCategoryLoading,
    };
    const itemsProps = {
      visible: itemsDrawerVisible,
      close: this.closeItemsDrawer,
      actionDataSource: currentActionRowData,
      fetchList: this.handleFetchEvalTplScopeItemList,
      defaultScopeIdKey: defaultTableRowKey,
      saveList: this.handleSaveEvalTplScopeItemList,
      deleteList: this.handleDeleteEvalTplScopeItemList,
      processing: {
        saveEvalTplScopeItemListLoading,
        queryEvalTplScopeItemListLoading,
      },
    };
    const suppliersProps = {
      onRef: node => {
        this.suppliers = node;
      },
      fetchList: fetchEvalTplScopeSupplierList,
      loading: queryEvalTplScopeSupplierListLoading,
      lifeCycleStageCode,
      evaluationTemplateRemote,
    };
    const { isDisabled } = this.state;

    const evalGranularity =
      this.editorForm && this.editorForm.props.form.getFieldValue('evalGranularity');

    const newImportProps =
      evalGranularity === 'SU+CA'
        ? {
            templateCode: 'SSLM.BATCH_IMPORT_SUP_CATEGORY',
            permissionCode:
              'srm.partner.evaluation-template.evaluation-template.ps.tpl.category.import.model',
          }
        : evalGranularity === 'SU+IT'
        ? {
            templateCode: 'SSLM.BATCH_IMPORT_SUP_ITEM',
            permissionCode:
              'srm.partner.evaluation-template.evaluation-template.ps.tpl.item.import.model',
          }
        : {
            templateCode: 'SSLM.BATCH_IMPORT_SUP',
            permissionCode:
              'srm.partner.evaluation-template.evaluation-template.ps.tpl.sup.import.model',
          };

    const oldImportPermissionCode =
      evalGranularity === 'SU+CA'
        ? 'srm.partner.evaluation-template.evaluation-template.ps.tpl.category.import.old	'
        : evalGranularity === 'SU+IT'
        ? 'srm.partner.evaluation-template.evaluation-template.ps.tpl.item.import.old'
        : 'srm.partner.evaluation-template.evaluation-template.ps.tpl.sup.import.old';

    return (
      <Drawer {...drawerProps}>
        <EditorForm {...formProps} />

        {actionDataSource.evalStatusCode !== 'PUBLISHED' &&
          actionDataSource.evalTplType !== 'BDKPI_EVAL' && (
            <Fragment>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <PerButton
                  style={{ marginRight: 8 }}
                  disabled={isDisabled}
                  onClick={() =>
                    handleImport(
                      this.editorForm && this.editorForm.props.form.getFieldValue('evalGranularity')
                    )
                  }
                  permissionList={[
                    {
                      code: oldImportPermissionCode,
                      type: 'button',
                      meaning: '分配供应商及品类-导入',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.import').d('导入')}
                </PerButton>
                <CommonImport
                  data-name="commonImport"
                  businessObjectTemplateCode={newImportProps.templateCode}
                  buttonText={intl.get('hzero.common.button.newImport').d('(新)导入')}
                  prefixPatch={SRM_SSLM}
                  refreshButton
                  buttonProps={{
                    type: 'h0',
                    style: { marginRight: 8 },
                    disabled: isDisabled,
                    permissionList: [
                      {
                        code: newImportProps.permissionCode,
                        type: 'button',
                        meaning: '分配供应商及品类-导入',
                      },
                    ],
                  }}
                  successCallBack={() => {
                    this.handleFetchEvalTplScopeList();
                  }}
                />
                <Button
                  style={{ marginRight: 8 }}
                  loading={deleteEvalTplScopeLoading}
                  onClick={this.handleDeleteEvalTplScope}
                  disabled={isEmpty(selectedRows) && isDisabled}
                >
                  {intl
                    .get(`spfm.supplierKpiIndicator.view.button.deleteSuppliers`)
                    .d('删除供应商')}
                </Button>
                <Button
                  type="primary"
                  onClick={this.openSupplierModal}
                  disabled={
                    saveEvalTplScopeLoading ||
                    deleteEvalTplScopeLoading ||
                    queryEvalTplScopeListLoading ||
                    isDisabled
                  }
                >
                  {intl.get(`spfm.supplierKpiIndicator.view.button.addSuppliers`).d('添加供应商')}
                </Button>
              </div>
            </Fragment>
          )}
        {actionDataSource.evalTplType !== 'BDKPI_EVAL' && <List {...listProps} />}
        <Categories {...categoriesProps} />
        <Items {...itemsProps} />
        <div style={{ marginBottom: '18px' }} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            onClick={this.cancel}
            disabled={saveEvalTplScopeLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          {actionDataSource.evalStatusCode !== 'PUBLISHED' && (
            <Button
              type="primary"
              loading={deleteEvalTplScopeLoading || saveEvalTplScopeLoading}
              onClick={() => this.handleSave()}
            >
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          )}
        </div>
        <Modal
          title={intl.get(`spfm.supplierKpiIndicator.view.title.addSupplier`).d('添加供应商')}
          visible={supplierModalVisible}
          onOk={this.onSupplierModalOk}
          onCancel={this.closeSupplierModal}
          width={750}
        >
          {supplierModalVisible && <Suppliers {...suppliersProps} />}
        </Modal>
        <Modal
          width={700}
          onCancel={this.closeAutoCategory}
          visible={evaluationAutoCategoryVisible}
          title={intl
            .get(`spfm.supplierKpiIndicator.view.title.view.title.selectGroup`)
            .d('维度选择')}
          onOk={this.handleAssignGroup}
          footer={[
            <Button key="back" onClick={this.closeAutoCategory}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>,
            actionDataSource.evalStatusCode !== 'PUBLISHED' && (
              <Button key="submit" type="primary" onClick={this.handleAssignGroup}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            ),
          ]}
        >
          {evaluationAutoCategoryVisible && <AutoCategory {...AutoCategoryProps} />}
        </Modal>
      </Drawer>
    );
  }
}
