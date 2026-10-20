import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import EditorForm from './Form';
import Formula from './Formula';
import Options from './Options';
// import styles from './index.less';

@formatterCollections({ code: ['spfm.supplierKpiIndicator'] })
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // formDataSource: {},
      formulaDrawerVisible: false,
      OptionsDrawerVisible: false,
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
      'handleFetchOptionsList',
      'optionsConfig',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  editorForm;

  /**
   * cancel - 关闭指标详情抽屉
   */
  cancel() {
    const { close = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    resetFields();
    close();
  }

  /**
   * handleCreate - 新建指标
   */
  handleCreate() {
    const editorForm = this.editorForm || {};
    const { indicators } = editorForm || {};

    const { validateFields = e => e } = (editorForm.props || {}).form;
    const { saveIndicatorRef = e => e, evalTplId } = this.props;

    const { selectedRows = [] } = (indicators || {}).state || {};
    validateFields((error, values) => {
      if (isEmpty(error)) {
        saveIndicatorRef(
          {
            evalTplId,
            parentId: values.parentIndicatorId,
            ...omit(values, ['parentIndicatorId']),
            refKpiIndicatorList: selectedRows,
          },
          () => {
            this.cancel();
          }
        );
      }
    });
  }

  /**
   * handleSave - 保存指标详情
   */
  handleSave() {
    const editorForm = this.editorForm || {};
    const { validateFields = e => e } = (editorForm.props || {}).form;
    const { updateIndicator = e => e, dataSource = {}, evalTplId } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        updateIndicator(
          { evalTplId, ...dataSource, ...values, parentId: values.parentIndicatorId },
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
   * optionsConfig - 打开选项配置抽屉
   * @param {number} currentActionRowData - 当前行数据
   */
  optionsConfig(currentActionRowData) {
    this.setState({
      OptionsDrawerVisible: true,
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

  /**
   * handleFetchOptionsList - 查询选项配置列表
   * @param {number} params - 查询参数
   * @param {number} cb - 操作成功回调
   */
  handleFetchOptionsList(params, cb = e => e) {
    const { fetchOptionsList = e => e } = this.props;
    const { currentActionRowData } = this.state;
    fetchOptionsList(currentActionRowData.indicatorId, params, cb);
  }

  @Bind
  onEditorFormRef(ref = {}) {
    this.editorForm = ref;
  }

  render() {
    const {
      visible,
      processing = {},
      dataSource = {},
      status,
      scoreTypeCode = [],
      dataSourceCode = [],
      fetchListTree = e => e,
      evalTplId,
      assignRecord,
      customizeTable,
      custLoading,
    } = this.props;
    const { formulaDrawerVisible, OptionsDrawerVisible, currentActionRowData = {} } = this.state;

    const actionMap = {
      addParentIndicator: intl
        .get(`spfm.supplierKpiIndicator.view.title.addIndicator`)
        .d('新增指标'),
      addChildIndicator: intl
        .get(`spfm.supplierKpiIndicator.view.title.addIndicator`)
        .d('新增指标'),
      edit: intl.get(`spfm.supplierKpiIndicator.view.title.editIndicator`).d('编辑指标'),
      view: intl.get(`spfm.supplierKpiIndicator.view.title.viewIndicator`).d('查看指标详情'),
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
      width: 800,
    };
    const {
      queryIndicatorsListTreeRefLoading,
      queryFormulaListLoading,
      queryFormulaListOrgLoading,
      updateIndicatorLoading,
      createIndicatorLoading,
      saveIndicatorRefLoading,
      queryOptionsListLoading,
      queryOptionsListOrgLoading,
    } = processing;
    const formProps = {
      assignRecord,
      dataSource,
      customizeTable,
      custLoading,
      onRef: this.onEditorFormRef,
      processing: { queryIndicatorsListTreeRefLoading },
      status,
      scoreTypeCode,
      dataSourceCode,
      fetchListTree,
      evalTplId,
      openFormula: this.openFormula,
      optionsConfig: this.optionsConfig,
    };
    const formulaProps = {
      visible: formulaDrawerVisible,
      close: this.closeFormula,
      fetchFormulaList: this.handleFetchFormulaList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryFormulaListLoading, queryFormulaListOrgLoading },
    };

    const optionsProps = {
      visible: OptionsDrawerVisible,
      close: () => {
        this.setState({
          OptionsDrawerVisible: false,
          currentActionRowData: {},
        });
      },
      fetchOptionsList: this.handleFetchOptionsList,
      indicatorRowDataSource: currentActionRowData,
      processing: { queryOptionsListLoading, queryOptionsListOrgLoading },
    };
    return (
      <Drawer {...drawerProps}>
        <EditorForm {...formProps} />
        <Formula {...formulaProps} />
        <Options {...optionsProps} />
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
