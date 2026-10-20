import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import EditorForm from './Form';
import Formula from './Formula';
// import './index.less';

@formatterCollections({
  code: ['spfm.supplierKpiIndicator'],
})
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // formDataSource: {},
      formulaDrawerVisible: false,
      currentActionRowData: {},
    };

    // 方法注册
    [
      'cancel',
      'handleCreate',
      'handleSave',
      'openFormula',
      'closeFormula',
      'handleFetchFormulaList',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  cancel() {
    const { close = e => e } = this.props;
    const editorForm = this.editorForm || {};
    const { resetFields = e => e } = (editorForm.props || {}).form || {};
    resetFields();
    close();
  }

  /**
   * handleCreate - 新建指标
   */
  handleCreate() {
    const editorForm = this.editorForm || {};
    const { actionSourceCode } = editorForm.state || {};
    const { indicators } = editorForm || {};
    const { validateFields = e => e } = (editorForm.props || {}).form || {};
    const { createIndicator = e => e, saveIndicatorRef = e => e, dataSource = {} } = this.props;
    if (actionSourceCode === 'CUSTOM') {
      validateFields((error, values) => {
        if (isEmpty(error)) {
          createIndicator(
            {
              ...dataSource,
              ...values,
              enabledFlag: 1,
              parentIndicatorId: values.parentIndicatorId === -1 ? null : values.parentIndicatorId,
            },
            () => {
              this.cancel();
            }
          );
        }
      });
    } else {
      const { selectedRows = [] } = (indicators || {}).state || {};
      const { parentIndicatorId } = dataSource;
      saveIndicatorRef({ parentIndicatorId, kpiIndicatorList: selectedRows }, () => {
        this.cancel();
      });
    }
  }

  /**
   * handleSave - 保存指标详情
   */
  handleSave() {
    const editorForm = this.editorForm || {};
    const { validateFields = e => e } = (editorForm.props || {}).form || {};
    const { updateIndicator = e => e, dataSource = {} } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        updateIndicator(
          {
            ...dataSource,
            ...values,
            parentIndicatorId: values.parentIndicatorId === -1 ? null : values.parentIndicatorId,
          },
          () => {
            this.cancel();
          }
        );
      }
    });
  }

  /**
   * closeFormula - 关闭公式抽屉
   */
  closeFormula() {
    this.setState({
      formulaDrawerVisible: false,
      currentActionRowData: {},
    });
  }

  /**
   * openFormula - 打开公式抽屉
   * @param {number} currentActionRowData - 当前行数据
   */
  openFormula(currentActionRowData) {
    this.setState({
      formulaDrawerVisible: true,
      currentActionRowData,
    });
  }

  /**
   * handleFetchFormulaList - 查询公式配置列表
   * @param {number} params - 查询参数
   * @param {number} cb - 操作成功回调
   */
  handleFetchFormulaList(params, cb = e => e) {
    const { fetchFormulaList = e => e } = this.props;
    const { currentActionRowData } = this.state;
    fetchFormulaList(currentActionRowData.indicatorId, params, cb);
  }

  render() {
    const {
      visible,
      processing = {},
      dataSource = {},
      status,
      customizeForm,
      custLoading,
      scoreTypeCode = [],
      dataSourceCode = [],
      isVetoSelectList,
      indicatorTypeCode = [],
      fetchListTree = e => e,
    } = this.props;
    const { formulaDrawerVisible, currentActionRowData = {} } = this.state;

    const actionMap = {
      addParentIndicator: intl
        .get('spfm.supplierKpiIndicator.view.title.addIndicator')
        .d('新增指标'),
      addChildIndicator: intl
        .get('spfm.supplierKpiIndicator.view.title.addIndicator')
        .d('新增指标'),
      edit: intl.get('spfm.supplierKpiIndicator.view.title.editIndicator').d('编辑指标'),
    };

    const title = actionMap[status];
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 720,
    };
    const {
      queryIndicatorsListTreeLoading,
      queryFormulaListLoading,
      queryFormulaListOrgLoading,
      updateIndicatorLoading,
      createIndicatorLoading,
      saveIndicatorRefLoading,
    } = processing;
    const formProps = {
      isVetoSelectList,
      indicatorTypeCode,
      dataSource,
      onRef: node => {
        this.editorForm = node;
      },
      processing: { queryIndicatorsListTreeLoading },
      status,
      scoreTypeCode,
      dataSourceCode,
      fetchListTree,
      customizeForm,
      custLoading,
      openFormula: this.openFormula,
    };
    const formulaProps = {
      visible: formulaDrawerVisible,
      close: this.closeFormula,
      fetchFormulaList: this.handleFetchFormulaList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryFormulaListLoading, queryFormulaListOrgLoading },
    };
    return (
      <Drawer {...drawerProps}>
        <EditorForm {...formProps} />
        <Formula {...formulaProps} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '16px 24px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            onClick={this.cancel}
            disabled={createIndicatorLoading || saveIndicatorRefLoading || updateIndicatorLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          {status === 'edit' ? (
            <Button type="primary" loading={updateIndicatorLoading} onClick={this.handleSave}>
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          ) : (
            <Button
              type="primary"
              loading={createIndicatorLoading || saveIndicatorRefLoading}
              onClick={this.handleCreate}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          )}
        </div>
      </Drawer>
    );
  }
}
