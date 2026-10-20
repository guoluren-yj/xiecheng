/*
 * OrderDefineListModal - 价格屏蔽定义列表
 * @date: 2018/09/18 16:11:56
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Tabs, Form } from 'hzero-ui';
import lodash from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  addItemToPagination,
  filterNullValueObject,
  getEditTableData,
} from 'utils/utils';

import InnerControl from './InnerControl';
import OuterControl from './OuterControl';

const { TabPane } = Tabs;

@Form.create({ fieldNameProp: null })
@connect(({ loading, configServer }) => ({
  configServer,
  loading: loading.effects['configServer/init'],
  loadingOuterLines: loading.effects['configServer/searchLines'],
  loadingOuterHeader: loading.effects['configServer/searchHeader'],
  loadingOrg: loading.effects['configServer/searchInnerShieldOrg'],
  lodingCategory: loading.effects['configServer/searchInnerShieldCategory'],
  loadingInnerList: loading.effects['configServer/searchInnerList'],
  savingInner: loading.effects['configServer/saveInnerShieldInner'],
  savingOuter: loading.effects['configServer/saveOuterPriceShieldHeader'],
  deletingInner: loading.effects['configServer/deleteInnerLines'],
  deletingOuter: loading.effects['configServer/deleteLines'],
  loadingSite: loading.effects['configServer/fetchInvestigateListSite'],
}))
export default class OrderDefineListModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'inner',
      tenantId: getCurrentOrganizationId(),
      shieldId: undefined,
      documentCategory: props.documentCategory,
      rightTableType: 'org', // 内部控制右侧表格类型 org:分配组织 category：分配品类
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询内部控制列表
  @Bind()
  handleSearch() {
    const { activeKey } = this.state;
    if (activeKey === 'inner') {
      this.handleSearchInner();
    } else {
      this.handleSearchOuter();
    }
  }

  // 查询内部屏蔽组织
  @Bind()
  handleSearchShieldOrg({ organizationId, shieldId }) {
    const { dispatch } = this.props;
    this.setState({
      shieldId,
      rightTableType: 'org',
    });
    dispatch({
      type: 'configServer/searchInnerShieldOrg',
      payload: {
        organizationId,
        shieldId,
      },
    });
  }

  // 查询内部屏蔽品类
  @Bind()
  handleSearchShieldCategory({ organizationId, shieldId }) {
    const { dispatch } = this.props;
    this.setState({
      shieldId,
      rightTableType: 'category',
    });
    dispatch({
      type: 'configServer/searchInnerShieldCategory',
      payload: {
        organizationId,
        shieldId,
      },
    });
  }

  /**
   * 查询内部控制列表
   * @param {Object} page = {} 查询字段
   */
  @Bind()
  handleSearchInner(page = {}) {
    const { documentCategory, tenantId, shieldId, rightTableType } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/searchInnerList',
      payload: {
        documentCategory,
        page,
      },
    }).then((res) => {
      if (res) {
        const data = res.content;
        if (lodash.isArray(data) && data.length > 0) {
          const newShieldId = data.some((item) => item.shieldId === shieldId)
            ? shieldId
            : data[0].shieldId;
          dispatch({
            type: 'configServer/updateState',
            payload: { leftCurrentRow: newShieldId },
          });
          (rightTableType === 'org'
            ? this.handleSearchShieldOrg
            : this.handleSearchShieldCategory)({ organizationId: tenantId, shieldId: newShieldId });
        }
      }
    });
  }

  /**
   * 查询外部控制:先查头再查行
   */
  @Bind()
  handleSearchOuter() {
    this.handleSearchOuterHeader().then((res) => {
      if (res) {
        this.handleLinesSearch({}, { shieldId: res.shieldId });
      }
    });
  }

  /**
   * 根据当前的key来查询对应的列表
   * @param {String} activeKey innerControlList
   */
  @Bind()
  handleTabsChange(activeKey) {
    // const { configServer: { outerControlList } } = this.props;
    this.setState({
      activeKey,
    });
    if (activeKey === 'inner') {
      this.handleSearchInner();
    }
  }

  /**
   * 关闭价格屏蔽列表弹窗
   */
  @Bind()
  hidePriceDefineModal() {
    const { onHidePriceDefine, documentCategory } = this.props;
    if (onHidePriceDefine) {
      onHidePriceDefine('priceShieldVisible', false, { documentCategory });
    }
  }

  /**
   *获得子元素
   *
   * @param {*} record 行记录
   * @returns
   * @memberof ScoreCategory
   */
  @Bind()
  getAllChilds(record) {
    let arr = [];
    const findChilds = (r) => {
      if (r.children) {
        arr = lodash.unionWith(arr, r.children);
        r.children.forEach((child) => {
          findChilds(child);
        });
      }
    };
    findChilds(record);
    return arr;
  }

  /**
   * isNew则保存接口，并且从innerControlMap中取对应的树
   * 根据修改的主键和表单值拼出innerList并从map中比较取出cancelList,newChooseList
   * @param {*} values
   */
  @Bind()
  handleSaveInner(values) {
    const { tenantId, shieldId, documentCategory } = this.state;
    const {
      configServer: { innerControlList, historyData, checkedData },
      dispatch,
    } = this.props;
    const unChangeData = lodash.intersectionBy(historyData, checkedData, 'id');
    const newChooseList = lodash.xorBy(checkedData, unChangeData, 'id');
    const cancelList = lodash.xorBy(historyData, unChangeData, 'id');
    const newInnerControlList = innerControlList.map((innerControlItem) => {
      if (innerControlItem.isNew) {
        return {
          tenantId,
          roleId: values[innerControlItem.shieldId].roleName,
          detailedControlFlag: innerControlItem.detailedControlFlag,
          cancelList: [],
          newChooseList: [],
          documentCategory,
        };
      } else if (!innerControlItem.detailedControlFlag) {
        return {
          ...innerControlItem,
          cancelList: [],
          newChooseList: [],
          documentCategory,
        };
      } else if (innerControlItem.shieldId === shieldId) {
        return {
          ...innerControlItem,
          newChooseList,
          cancelList,
          documentCategory,
        };
      } else {
        return {
          ...innerControlItem,
          cancelList: [],
          newChooseList: [],
          documentCategory,
        };
      }
    });
    dispatch({
      type: 'configServer/saveInnerShieldInner',
      payload: {
        newInnerControlList,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchInner();
      }
    });
  }

  /**
   *查询当前行下所有子元素
   *
   * @param {*} record 行数据
   * @param {*} selected 选中/取消标记
   * @param {*} selectedRows 已经选中行
   * @memberof ScoreCategory
   */
  @Bind()
  selectChildren(record, selected, selectedRows) {
    const getAllChilds = this.getAllChilds(record);
    // const { shieldId } = this.state;
    const checkedData = selected
      ? lodash.unionWith(selectedRows, getAllChilds)
      : lodash.differenceBy(selectedRows, getAllChilds, 'id');
    const { dispatch } = this.props;
    // const unChangeData = lodash.intersectionBy(historyData, checkedData, 'id');
    // const newChooseList = lodash.xorBy(checkedData, unChangeData, 'id');
    // const cancelList = lodash.xorBy(historyData, unChangeData, 'id');
    // const newInnerControlList = innerControlList.map(item => {
    //   if (item.shieldId === shieldId) {
    //     return {
    //       ...item,
    //       newChooseList,
    //       cancelList,
    //     };
    //   }
    //   return item;
    // });
    dispatch({
      type: 'configServer/updateState',
      payload: {
        checkedData,
        // innerControlList: newInnerControlList,
      },
    });
  }

  /**
   * 选中行主键改变
   * @param {Array} newSelectedRowKeys
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys, key) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: { [key]: newSelectedRowKeys },
    });
  }

  /**
   * 新建内部控制
   */
  @Bind()
  onHandleCreateInner() {
    const {
      dispatch,
      configServer: { innerControlList, innerControlListPagination },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        innerControlList: [
          { shieldId: uuid(), isNew: true, detailedControlFlag: 0 },
          ...innerControlList,
        ],
        innerControlListPagination: addItemToPagination(
          innerControlList.length,
          innerControlListPagination
        ),
      },
    });
  }

  /**
   * 新建外部控制
   */
  @Bind()
  handleCreateOuter() {
    const {
      dispatch,
      configServer: { outerControlList, outerControlListPagination },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        outerControlList: [{ rowNumberId: uuid(), _status: 'create' }, ...outerControlList],
        outerControlListPagination: addItemToPagination(
          outerControlList.length,
          outerControlListPagination
        ),
      },
    });
  }

  /**
   * 删除内部控制
   */
  @Bind()
  handleDeleteInner() {
    const {
      configServer: { innerControlList, selectedRowKeysInner, leftCurrentRow },
      dispatch,
    } = this.props;
    const that = this;
    if (selectedRowKeysInner.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.shield.message.title.content`).d('确定删除吗？'),
        onOk() {
          const innerPriceShieldDtoList = [];
          const newInnerControlList = [];
          innerControlList.forEach((item) => {
            // if (!selectedRowKeysInner.includes(item.shieldId)) {
            //   newInnerControlList.push(item);
            // } else if (item._status !== 'create') {
            //   innerPriceShieldDtoList.push(lodash.omit(item, ['$form']));
            // }
            if (!item.isNew && selectedRowKeysInner.indexOf(item.shieldId) >= 0) {
              innerPriceShieldDtoList.push(item);
            }
            if (!(item.isNew && selectedRowKeysInner.indexOf(item.shieldId) >= 0)) {
              newInnerControlList.push(item);
            }
          });
          if (innerPriceShieldDtoList.length > 0) {
            dispatch({
              type: 'configServer/deleteInnerLines',
              payload: innerPriceShieldDtoList,
            }).then(() => {
              dispatch({
                type: 'configServer/updateState',
                payload: {
                  innerControlList: newInnerControlList,
                  selectedRowKeysInner: [],
                },
              });
              notification.success();
              that.handleSearch();
              if (selectedRowKeysInner.indexOf(leftCurrentRow) >= 0) {
                dispatch({
                  type: 'configServer/updateState',
                  payload: {
                    organizationList: [],
                  },
                });
              }
            });
          }
          dispatch({
            type: 'configServer/updateState',
            payload: {
              innerControlList: newInnerControlList,
              selectedRowKeysInner: [],
            },
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 删除外部控制
   */
  @Bind()
  handleDeleteOuter() {
    const {
      configServer: { outerControlList, selectedRowKeysOuter },
      dispatch,
    } = this.props;
    const that = this;
    if (selectedRowKeysOuter.length > 0) {
      Modal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        content: intl.get(`spfm.configServer.view.shield.message.title.content`).d('确定删除吗？'),
        onOk() {
          const outerPriceShieldSupList = [];
          const newOuterControlList = [];
          outerControlList.forEach((item) => {
            if (!selectedRowKeysOuter.includes(item.rowNumberId)) {
              newOuterControlList.push(item);
            } else if (item._status !== 'create') {
              outerPriceShieldSupList.push(lodash.omit(item, ['$form']));
            }
            // if (item._status !== 'create' && selectedRowKeysOuter.includes(item.shieldSupId)) {
            //   outerPriceShieldSupList.push(item);
            // }
            // if (!(item._status === 'create' && selectedRowKeysOuter.includes(item.shieldSupId))) {
            //   newOuterControlList.push(item);
            // }
          });
          if (outerPriceShieldSupList.length > 0) {
            dispatch({
              type: 'configServer/deleteLines',
              payload: outerPriceShieldSupList,
            }).then(() => {
              dispatch({
                type: 'configServer/updateState',
                payload: {
                  outerControlList: newOuterControlList,
                  selectedRowKeysOuter: [],
                },
              });
              notification.success();
              that.handleSearch();
            });
          }
          dispatch({
            type: 'configServer/updateState',
            payload: {
              outerControlList: newOuterControlList,
              selectedRowKeysOuter: [],
            },
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 外部控制头保存
   * @param {Boolean} includeAllFlag
   */
  @Bind()
  handleHeaderSave(includeAllFlag) {
    const {
      configServer: { outerControlList },
    } = this.props;
    const newList = outerControlList.filter((item) => item._status !== 'create');
    return this.handleSaveOuter(includeAllFlag, newList);
  }

  /**
   * 外部控制行保存
   * @param {Boolean} includeAllFlag
   */
  @Bind()
  handleLinesSave(includeAllFlag) {
    const {
      configServer: { outerControlList },
    } = this.props;
    const { tenantId, documentCategory } = this.state;
    const newOuterControlList = getEditTableData(outerControlList, ['rowNumberId', '_status']);
    if (lodash.isArray(newOuterControlList) && !lodash.isEmpty(newOuterControlList)) {
      this.handleSaveOuter(
        includeAllFlag,
        newOuterControlList.map((item) => ({ ...item, tenantId, documentCategory }))
      ).then((res) => {
        if (res) {
          notification.success();
          this.handleSearchOuter();
        }
      });
    }
    // const newOuterControlList = outerControlList.map(outerControlItem => {
    //   if (outerControlItem._stats === 'create') {
    //     return {
    //       ...outerControlItem.$form.getFieldsValue(),
    //       tenantId,
    //       documentCategory,
    //     };
    //   }
    //   return outerControlItem;
    // });
    // this.handleSaveOuter(includeAllFlag, newOuterControlList).then(res => {
    //   if (res) {
    //     notification.success();
    //     this.handleSearchOuter();
    //   }
    // });
  }

  /**
   * 保存外部控制头行
   * @param {Boolean} includeAllFlag
   * @param {Array} outerControlList
   */
  @Bind()
  handleSaveOuter(includeAllFlag, outerControlList) {
    const { documentCategory } = this.state;
    const {
      dispatch,
      configServer: { outerControlHeader },
    } = this.props;
    const { shieldId, objectVersionNumber } = outerControlHeader;
    return dispatch({
      type: 'configServer/saveOuterPriceShieldHeader',
      payload: {
        includeAllFlag,
        documentCategory,
        shieldId,
        objectVersionNumber,
        tenantId: getCurrentOrganizationId(),
        outerPriceShieldSupList: outerControlList,
      },
    });
  }

  /**
   * 查询外部控制头
   */
  @Bind()
  handleSearchOuterHeader() {
    const { documentCategory } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'configServer/searchHeader',
      payload: {
        documentCategory,
      },
    });
  }

  /**
   * 外部控制行查询
   * @param {Object} fields
   */
  @Bind()
  handleLinesSearch(page = {}, fields = {}) {
    const {
      dispatch,
      configServer: { outerControlHeader },
    } = this.props;
    const shieldId = fields.shieldId || outerControlHeader.shieldId;
    const filterValues = lodash.isUndefined(this.outerForm)
      ? {}
      : filterNullValueObject(
          this.outerForm.getFieldsValue([
            'companyName',
            'companyNum',
            'srmCompanyName',
            'srmCompanyNum',
          ])
        );
    if (outerControlHeader.shieldId) {
      dispatch({
        type: 'configServer/searchLines',
        payload: {
          ...filterValues,
          page,
          shieldId,
        },
      });
    }
  }

  /**
   * 列改变时修改状态树的数据
   * @param {String} dataIndex
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  onHandleChangeColumn(dataIndex, value, record) {
    const rowKey = 'shieldId';
    const {
      configServer: {
        innerControlList,
        organizationList,
        leftCurrentRow,
        checkedData,
        historyData,
      },
      dispatch,
    } = this.props;
    const newInnerControlList = innerControlList.map((item) => {
      if (item[rowKey] === record[rowKey]) {
        return {
          ...record,
          [dataIndex]: value,
        };
      }
      return item;
    });
    const detailedCancelFLag = value === 0 && record.shieldId === leftCurrentRow;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        innerControlList: newInnerControlList,
        organizationList: detailedCancelFLag ? [] : organizationList,
        checkedData: detailedCancelFLag ? [] : checkedData,
        historyData: detailedCancelFLag ? [] : historyData,
      },
    });
    if (value === 1 && !record.isNew) {
      dispatch({
        type: 'configServer/updateState',
        payload: {
          leftCurrentRow: record.shieldId,
        },
      });
      this.setState({ shieldId: record.shieldId });
      // , () => {
      //   if (this.innerForm) {
      //     this.innerForm.handleSave();
      //   }
      // });
    }
  }

  /**
   * 改变组织的选中行
   * @param {Array} rows
   */
  @Bind()
  handleOrgSelectRows(_, rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        checkedData: rows,
      },
    });
  }

  /**
   * 改变分类的选中行
   * @param {Array} rows
   */
  @Bind()
  handleCategorySelectRows(_, rows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        categorySelectRows: rows,
      },
    });
  }

  render() {
    const {
      priceShieldVisible,
      configServer: {
        organizationList,
        innerControlListPagination,
        outerControlListPagination,
        innerControlList,
        outerControlList,
        selectedRowKeysInner,
        selectedRowKeysOuter,
        checkedData,
        categorySelectRows,
        leftCurrentRow,
      },
      dispatch,
      loadingOuterLines,
      loadingOrg,
      lodingCategory,
      loadingInnerList,
      savingInner,
      deletingInner,
      savingOuter,
      deletingOuter,
      loadingOuterHeader,
    } = this.props;
    const { activeKey, shieldId, rightTableType } = this.state;
    // const filterProps = {
    //   form,
    //   onFilterChange: this.handleSearch,
    //   investigateTypes, // 调查表类型
    //   resetState: this.onResetState,
    // };
    const innerListProps = {
      shieldId,
      dispatch,
      leftCurrentRow,
      innerControlListPagination,
      innerControlList,
      organizationList,
      loadingInnerList,
      savingInner,
      deletingInner,
      activeKey,
      loading: loadingOrg,
      lodingCategory,
      handleSearchInner: this.handleSearchInner,
      editLine: this.editLine,
      handleCreate: this.onHandleCreateInner,
      handleDeleteInner: this.handleDeleteInner,
      handleChangeColumn: this.onHandleChangeColumn,
      handleSave: this.handleSaveInner,
      searchShieldOrg: this.handleSearchShieldOrg,
      searchShieldCategory: this.handleSearchShieldCategory,
      innerRowSelection: {
        selectedRowKeys: selectedRowKeysInner,
        onChange: (newSelectedRowKeys) =>
          this.handleRowSelectChange(newSelectedRowKeys, 'selectedRowKeysInner'),
        onCleanSelectedKeys: () => this.handleRowSelectChange([], 'selectedRowKeysInner'),
        getCheckboxProps: (record) => ({
          disabled: record.disabled,
        }),
      },
      orgRowSelection: {
        onSelect: this.selectChildren,
        selectedRowKeys: checkedData.map((n) => n.id),
        onChange: this.handleOrgSelectRows,
        onCleanSelectedKeys: () => this.handleRowSelectChange([], 'selectedRowKeysOrg'),
        getCheckboxProps: (record) => ({
          disabled: record.disabled,
        }),
      },
      categoryRowSelection: {
        selectedRowKeys: categorySelectRows.map((n) => n.categoryId),
        onChange: this.handleCategorySelectRows,
      },
      onRef: (ref) => {
        this.innerForm = ref;
      },
      rightTableType,
      categorySelectRows,
    };
    const listPropsOuter = {
      outerControlListPagination,
      savingOuter,
      deletingOuter,
      activeKey,
      dataSource: outerControlList,
      loading: loadingOuterLines || loadingOuterHeader,
      editLine: this.editLine,
      handleCreate: this.handleCreateOuter,
      handleDeleteOuter: this.handleDeleteOuter,
      headerSave: this.handleHeaderSave,
      handleSaveLines: this.handleLinesSave,
      handleSearchHeader: this.handleSearchOuterHeader,
      headerSearch: this.handleSearchOuter,
      linesSearch: this.handleLinesSearch,
      rowSelection: {
        selectedRowKeys: selectedRowKeysOuter,
        onChange: (newSelectedRowKeys) =>
          this.handleRowSelectChange(newSelectedRowKeys, 'selectedRowKeysOuter'),
        onCleanSelectedKeys: () => this.handleRowSelectChange([], 'selectedRowKeysOuter'),
        getCheckboxProps: (record) => ({
          disabled: record.disabled,
        }),
      },
      onRef: (node) => {
        this.outerForm = node.props.form;
      },
    };
    return (
      <Modal
        // title={intl.get(`spfm.configServer.view.shield.message.modal.orderDefine`).d('价格屏蔽定义列表')}
        // confirmLoading={savingSite}
        visible={priceShieldVisible}
        onCancel={this.hidePriceDefineModal}
        width={1400}
        footer={null}
      >
        <Tabs
          defaultActiveKey={activeKey}
          onChange={this.handleTabsChange}
          animated={false}
          style={{ marginTop: '-18px' }}
        >
          <TabPane
            tab={intl.get(`spfm.configServer.view.shield.message.title.inner`).d('内部控制')}
            key="inner"
          >
            <InnerControl {...innerListProps} />
          </TabPane>
          <TabPane
            tab={intl.get(`spfm.configServer.view.shield.message.title.outer`).d('外部控制')}
            key="outer"
          >
            <OuterControl {...listPropsOuter} />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
