/**
 * index - 弹性域汇总查询页面-新建模型
 * @date: 2019-4-25
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { createPagination, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { queryFlexRuleDetail, deleteFlexRuleDetails } from '@/services/flexRuleService';
import { queryFlexRuleDetails, getFormItemsLayout, saveFlexRuleDetails } from '../utils';
import List from './List';
import Detail from './Detail';
import Editor from './Editor';
// import styles from './index.less';

const defaultListPrimaryKey = 'ruleDetailId';

/**
 *
 *
 * @export
 * @class FlexFields
 * @extends {PureComponent}
 */
export default class FlexFieldsConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      visible: false,
      detailDrawerVisible: false,
      queryListLoading: undefined,
      saveLoading: undefined,
      deleteLoading: undefined,
      editableRowKey: null,
      progressRows: [],
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible } = this.props;
    return visible && visible !== prevProps.visible;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(params = {}) {
    const { flexRuleCode, permissionLevelKey } = this.props;
    this.setState({
      queryListLoading: true,
    });
    queryFlexRuleDetails(permissionLevelKey, { ...params, ruleCode: flexRuleCode }).then(res => {
      if (res) {
        const response = getResponse(res);
        this.setState({
          dataSource: (response || {}).content || [],
          pagination: createPagination(response || {}),
          queryListLoading: false,
        });
      }
    });
  }

  /**
   * fetchDetail - 查询明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetail() {
    const { currentEditingRowData = {} } = this.state;
    const { ruleDetailId } = currentEditingRowData;
    return queryFlexRuleDetail(ruleDetailId);
  }

  @Bind()
  deleteRows(record) {
    this.setState({
      deleteLoading: true,
    });
    deleteFlexRuleDetails([record]).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        this.setState({
          deleteLoading: false,
        });

        this.fetchList();
        notification.success();
      }
    });
  }

  @Bind()
  save(data, cb = () => {}) {
    const { permissionLevelKey, flexRuleCode } = this.props;
    this.setState({
      saveLoading: true,
    });
    saveFlexRuleDetails(flexRuleCode, permissionLevelKey, data).then(res => {
      this.setState({
        saveLoading: false,
      });
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
        this.fetchList();
        notification.success();
      }
    });
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  @Bind()
  cancel() {
    const { cancel = () => {} } = this.props;
    cancel();
    this.setState({
      dataSource: [],
    });
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  @Bind()
  open() {
    // const { close = e => e } = this.props;
    this.setState({
      visible: true,
    });
  }

  @Bind()
  editDetail(activeRowData = {}) {
    this.setState({
      detailDrawerVisible: true,
      activeRowData,
    });
  }

  @Bind()
  closeDetail() {
    this.setState({
      detailDrawerVisible: false,
      activeRowData: {},
    });
  }

  @Bind()
  onTableChange(page) {
    this.fetchList({ page });
  }

  @Bind()
  openEditor() {
    this.setState({
      editorDrawerVisible: true,
      currentEditingRowData: { enabledFlag: 1 },
    });
  }

  @Bind()
  editEditor(currentEditingRowData = {}) {
    this.setState({
      editorDrawerVisible: true,
      currentEditingRowData,
    });
  }

  @Bind()
  closeEditor() {
    this.setState({
      editorDrawerVisible: false,
      currentEditingRowData: {},
    });
  }

  @Bind()
  getSourceFormSchema(fieldName) {
    const { componentObject = {} } = this.props;
    const { layout } = getFormItemsLayout(componentObject);

    const item = (layout.find(o => o.fieldName === fieldName) || {}).node || {};
    return ((((item.props || {}).children || {}).props || {}).children || {}).props;
  }

  render() {
    const { flexRuleCode, formSchema = {}, code = {}, visible } = this.props;
    const {
      dataSource = [],
      pagination = [],
      detailDrawerVisible,
      activeRowData,
      queryListLoading,
      progressRows = [],
      deleteLoading,
      currentEditingRowData = {},
      editorDrawerVisible,
      saveLoading,
    } = this.state;
    const title = intl.get(`hpfm.flexFields.view.title.flexFieldsRule`).d('规则项定义');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 750,
    };

    const listProps = {
      dataSource,
      pagination,
      loading: queryListLoading,
      primaryKey: defaultListPrimaryKey,
      editDetail: this.editDetail,
      onChange: this.onTableChange,
      edit: this.editEditor,
      add: this.openEditor,
      deleteLoading,
      progressRows,
      deleteRows: this.deleteRows,
    };
    const detailProps = {
      flexFieldsDetail: activeRowData,
      visible: detailDrawerVisible,
      detailPrimaryKey: defaultListPrimaryKey,
      close: this.closeDetail,
      flexRuleCode,
      code,
      formSchema,
      getSourceFormSchema: this.getSourceFormSchema,
      // create: this.create,
      // update: this.update,
      // fetchDetail: this.fetchDetail,
    };

    const editorProps = {
      currentEditingRowData,
      visible: editorDrawerVisible,
      primaryKey: defaultListPrimaryKey,
      close: this.closeEditor,
      save: this.save,
      flexRuleCode,
      fetchDetail: this.fetchDetail,
      saveLoading,
    };
    return (
      <Fragment>
        <Drawer {...drawerProps}>
          <List {...listProps} />
          <Detail {...detailProps} />
          <Editor {...editorProps} />
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
            <Button onClick={this.cancel} style={{ marginRight: 8 }}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </div>
        </Drawer>
      </Fragment>
    );
  }
}
