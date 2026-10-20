/**
 * MappingModal - 批量映射modal
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction } from 'lodash';
import { Form, Modal, Tabs } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

import MaterielList from './MaterielList';
import CategoryList from './CategoryList';

@Form.create({ fieldNameProp: null })
@connect(({ loading, groupMaterielMapping }) => ({
  groupMaterielMapping,
  materielLoading: loading.effects['groupMaterielMapping/fetchMaterielList'],
  categoryLoading: loading.effects['groupMaterielMapping/fetchCategoryList'],
}))
export default class MappingModal extends Component {
  categoryForm; // 物料列表查询表单

  materielForm; // 品类列表查询表单

  constructor(props) {
    super(props);
    this.state = {
      count: 0, // 记录点击物料或品类的次数
      activeKey: '1',
      materielSelectedRow: [],
      categorySelectedRow: [],
    };
  }

  componentDidMount() {
    this.fetchMaterielList();
    this.fetchCategoryList();
  }

  /**
   * 获取物料列表
   * @param {*} page - 分页信息
   */
  @Bind()
  fetchMaterielList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.materielForm)
      ? {}
      : filterNullValueObject(this.materielForm.getFieldsValue());
    dispatch({
      type: 'groupMaterielMapping/fetchMaterielList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 获取品类列表
   */
  @Bind()
  fetchCategoryList() {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.categoryForm)
      ? {}
      : filterNullValueObject(this.categoryForm.getFieldsValue());
    dispatch({
      type: 'groupMaterielMapping/fetchCategoryList',
      payload: { ...filterValues },
    });
  }

  /**
   * 切换tab
   * @param {*} key
   */
  @Bind()
  tabChange(activeKey) {
    this.setState({
      activeKey,
    });
  }

  /**
   * 判断是否同时选择了物料和品类
   * @param {array} selectedRows - 选中行
   */
  @Bind()
  mappingChange() {
    const { count, activeKey, materielSelectedRow, categorySelectedRow } = this.state;
    const { isMapped = false } = this.props;
    const mLength = materielSelectedRow.length;
    const cLength = categorySelectedRow.length;
    if (activeKey === '2' && mLength) {
      return {
        message: intl
          .get('scec.groupMaterielMapping.model.selectedMateriel')
          .d('已选择映射物料，请确认是否更换映射品类？'),
        rowsState: 1,
      };
    } else if (activeKey === '1' && cLength) {
      return {
        message: intl
          .get('scec.groupMaterielMapping.model.selectedMateriel')
          .d('已选择映射品类，请确认是否更换映射物料？'),
        rowsState: 2,
      };
    } else {
      return {
        message:
          isMapped && (cLength === 0 || mLength === 0) && count < 1
            ? intl
                .get('scec.groupMaterielMapping.model.materielMapped')
                .d('部分数据已映射，继续批量映射吗？')
            : '',
        rowsState: -1,
      };
    }
  }

  /**
   * 勾选行前的判断
   * @param {array} selectedRows - 选中行
   */
  @Bind()
  beforeRowSelectChange(selectedRows = [], fn) {
    const { activeKey } = this.state;
    const { message = '', rowsState = -1 } = this.mappingChange();
    let newSate = {};
    if (rowsState === 1) {
      newSate = { materielSelectedRow: [], categorySelectedRow: selectedRows };
    } else if (rowsState === 2) {
      newSate = { materielSelectedRow: selectedRows, categorySelectedRow: [] };
    } else {
      newSate =
        activeKey === '1'
          ? { materielSelectedRow: selectedRows }
          : { categorySelectedRow: selectedRows };
    }
    if (message) {
      Modal.confirm({
        content: message,
        onOk: () => {
          this.rowSelectChange(newSate, fn);
        },
      });
    } else {
      this.rowSelectChange(newSate, fn);
    }
  }

  /**
   * 选中行
   * @param {array} newSate - 新的state
   */
  @Bind()
  rowSelectChange(newSate = { materielSelectedRow: [], categorySelectedRow: [] }, fn) {
    const { count } = this.state;
    this.setState({ ...newSate, count: count + 1 }, () => {
      if (isFunction(fn)) fn();
    });
  }

  /**
   * 确定映射
   * @param {array} record - 行记录
   */
  @Bind()
  handle(record = {}, isSave = true) {
    const { onSave, onCancel } = this.props;
    this.setState(
      { count: 0, activeKey: '1', materielSelectedRow: [], categorySelectedRow: [] },
      () => {
        if (isSave) onSave(record);
        else onCancel();
      }
    );
  }

  render() {
    const { visible, materielLoading, categoryLoading, groupMaterielMapping = {} } = this.props;
    const {
      categoryList = [],
      materielList = [],
      categoryPagination = [],
      materielPagination = [],
    } = groupMaterielMapping;
    const { activeKey, materielSelectedRow, categorySelectedRow } = this.state;
    const materielProps = {
      onSave: this.handle,
      loading: materielLoading,
      dataSource: materielList,
      pagination: materielPagination,
      onSearch: this.fetchMaterielList,
      selectedRow: materielSelectedRow,
      rowSelectChange: this.rowSelectChange,
      beforeRowSelectChange: this.beforeRowSelectChange,
      onRef: ref => {
        this.materielForm = (ref.props || {}).form;
      },
    };
    const categoryProps = {
      onSave: this.handle,
      loading: categoryLoading,
      dataSource: categoryList,
      pagination: categoryPagination,
      onSearch: this.fetchCategoryList,
      selectedRow: categorySelectedRow,
      rowSelectChange: this.rowSelectChange,
      beforeRowSelectChange: this.beforeRowSelectChange,
      onRef: ref => {
        this.categoryForm = (ref.props || {}).form;
      },
    };
    const record = materielSelectedRow.length ? materielSelectedRow[0] : categorySelectedRow[0];
    return (
      <Modal
        visible={visible}
        onOk={() => this.handle(record, true)}
        onCancel={() => this.handle({}, false)}
        destroyOnClose
        width={800}
      >
        <Tabs
          animated={false}
          width={800}
          activeKey={activeKey}
          onChange={this.tabChange}
          tabBarStyle={{ marginTop: '-16px' }}
        >
          <Tabs.TabPane
            tab={intl.get('scec.groupMaterielMapping.model.materielMapping').d('物料编码映射')}
            key="1"
          >
            <MaterielList {...materielProps} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('scec.groupMaterielMapping.model.categoryMapping').d('采购品类映射')}
            key="2"
          >
            <CategoryList {...categoryProps} />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    );
  }
}
