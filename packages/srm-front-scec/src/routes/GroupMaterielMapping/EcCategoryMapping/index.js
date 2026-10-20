/**
 * category 电商分类映射物料
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { Form, Modal, Button } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { openTab } from 'utils/menuTab';
import { SRM_SCEC } from '_utils/config';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { getEditTableData, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import MappingModal from '../MappingModal';

const FormItem = Form.Item;
const organizationId = getCurrentOrganizationId(); // 租户ID

@Form.create({ fieldNameProp: null })
@connect(({ loading, groupMaterielMapping }) => ({
  groupMaterielMapping,
  loading: loading.effects['groupMaterielMapping/fetchEcCategoryMappingList'],
  saveLoading: loading.effects['groupMaterielMapping/setEcCategoryMap'],
  deleteLoading: loading.effects['groupMaterielMapping/delEcCategoryMap'],
}))
export default class CategoryMapping extends PureComponent {
  filterForm; // 查询表单form

  state = {
    editRow: [], // 当前编辑行
    isSave: false, // 是否需要保存
    visible: false, // 批量映射弹框开关标识
    selectedRows: [], // 选中行
  };

  componentDidMount() {
    this.fetchList();
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/SCEC.EC_GROUP_CATEGORY_ITEM`,
      search: queryString.stringify({
        title: 'scec.common.button.import',
        action: intl.get('scec.common.button.import').d('批量导入'),
      }),
    });
  }

  /**
   * 展示批量映射Modal
   */
  @Bind()
  openModal() {
    this.setState(
      {
        visible: true,
      },
      () => {}
    );
  }

  /**
   * 关闭批量映射Modal
   */
  @Bind()
  closeModal() {
    this.setState({ visible: false });
  }

  /**
   * 查询公司目录映射前的判断
   * @param {object} page 分页信息
   */
  @Bind()
  beforeFetchList(page = {}) {
    if (this.state.selectedRows.length) {
      Modal.confirm({
        content: intl
          .get('scec.groupMaterielMapping.view.confirm.goFlag')
          .d('当前有选中列，继续操作将丢失'),
        onOk: () => {
          this.setState(
            {
              selectedRows: [],
            },
            () => {
              this.fetchList(page);
            }
          );
        },
      });
    } else this.fetchList(page);
  }

  /**
   * 查询列表
   * @param {*} page - 分页信息
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = this.filterForm
      ? filterNullValueObject(this.filterForm.getFieldsValue())
      : {};
    dispatch({
      type: 'groupMaterielMapping/fetchEcCategoryMappingList',
      payload: {
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 勾选行
   * @param {array} selectedRows - 选中行
   */
  @Bind()
  changeSelectedRows(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 批量映射
   */
  @Bind()
  batchSetMaps(lovRecord = {}) {
    const {
      itemId = null,
      itemCode = null,
      itemName = null,
      categoryId = null,
      categoryCode = null,
      categoryName = null,
    } = lovRecord;
    const list = this.state.selectedRows.map(n => {
      n.$form.setFieldsValue({ itemId, categoryId });
      return {
        ...n,
        itemId,
        itemCode,
        itemName,
        categoryId,
        categoryCode,
        categoryName,
      };
    });
    this.setMaps(list);
  }

  /**
   * 单条映射
   * @param {*} record 当前列表选中行
   * @param {*} lovRecord lov选中行
   * @param {*} type - 映射类别（物料==true，品类==false）
   */
  @Bind()
  singleSetMap(record = {}, lovRecord = {}, type = true) {
    const {
      dispatch,
      groupMaterielMapping: { ecCategoryMapList = [] },
    } = this.props;
    const { ecCategoryId } = record;
    const { itemId, itemCode, itemName, categoryId, categoryCode, categoryName } = lovRecord;
    const param = type
      ? { itemId, itemCode, itemName }
      : { categoryId, categoryCode, categoryName };
    const editRow = { ...record, ...param };
    this.setState({ editRow, isSave: true }, () => {
      const dataSource = ecCategoryMapList.map(item => {
        return item.ecCategoryId === ecCategoryId ? editRow : item;
      });
      dispatch({
        type: 'groupMaterielMapping/updateState',
        payload: { ecCategoryMapList: dataSource },
      });
    });
  }

  /**
   * 映射
   * @param {*} params - 批量映射数据
   * @param {*} isBatch - 是否为批量映射，默认否
   */
  @Bind()
  setMaps(params = []) {
    const { editRow } = this.state;
    const ecCategoryMapList = params.length ? params : [editRow];
    if (params.length) this.setState({ visible: false });
    if (ecCategoryMapList.length) {
      const {
        dispatch,
        groupMaterielMapping: { ecCategoryMapPagination = {} },
      } = this.props;
      dispatch({
        type: 'groupMaterielMapping/setEcCategoryMap',
        payload: getEditTableData(ecCategoryMapList),
      }).then(res => {
        if (res) {
          notification.info({
            message: intl
              .get('scec.groupMaterielMapping.model.waiting')
              .d(
                '变更平台分类映射关系后，商城选买页面需要等待2-10分钟加载更新的内容，请您耐心等待'
              ),
          });
          this.setState(
            {
              editRow: [],
              isSave: false,
              selectedRows: [],
            },
            () => this.fetchList(ecCategoryMapPagination)
          );
        }
      });
    }
  }

  /**
   * 删除映射
   * @param {*} params - 映射数据
   * @param {*} isBatch - 是否为批量映射，默认否
   */
  @Bind()
  delMaps() {
    const { selectedRows = [] } = this.state;
    const {
      dispatch,
      groupMaterielMapping: { ecCategoryMapPagination = {} },
    } = this.props;
    dispatch({
      type: 'groupMaterielMapping/delEcCategoryMap',
      payload: getEditTableData(selectedRows),
    }).then(() => {
      this.setState(
        {
          selectedRows: [],
        },
        () => {
          this.fetchList(ecCategoryMapPagination);
        }
      );
    });
  }

  /**
   * 获取列
   */
  @Bind()
  getColumns() {
    return [
      {
        title: intl.get('scec.groupMaterielMapping.model.ecPlatformName').d('商品来源'),
        width: 100,
        dataIndex: 'ecPlatformName',
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.ecCatNum').d('分类编码'),
        width: 100,
        dataIndex: 'ecCatNum',
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.ecCategoryName').d('分类名称'),
        dataIndex: 'ecCategoryName',
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.ecCatClass').d('分类层级'),
        width: 100,
        dataIndex: 'ecCatClass',
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.itemCode').d('物料编码'),
        width: 140,
        dataIndex: 'itemId',
        render: (val, record) => {
          const { _status, $form, itemCode } = record;
          return ['update'].includes(_status) ? (
            <FormItem style={{ margin: 0 }}>
              {$form.getFieldDecorator('itemId', {
                initialValue: val,
              })(
                <Lov
                  textValue={itemCode}
                  code="SCEC.CUSTOMER_ITEM"
                  queryParams={{}}
                  disabled={$form.getFieldValue('categoryId')}
                  onChange={(_, lovRecord) => this.singleSetMap(record, lovRecord, true)}
                />
              )}
            </FormItem>
          ) : null;
        },
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.itemName').d('物料名称'),
        width: 120,
        dataIndex: 'itemName',
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.categoryCode').d('品类编码'),
        width: 120,
        dataIndex: 'categoryId',
        render: (val, record) => {
          const { _status, $form, categoryCode } = record;
          return ['update'].includes(_status) ? (
            <FormItem style={{ margin: 0 }}>
              {$form.getFieldDecorator('categoryId', {
                initialValue: val,
              })(
                <Lov
                  textValue={categoryCode}
                  code="SCEC.TREE_ITEM_CATEGORY"
                  disabled={$form.getFieldValue('itemId')}
                  onChange={(_, lovRecord) => this.singleSetMap(record, lovRecord, false)}
                />
              )}
            </FormItem>
          ) : null;
        },
      },
      {
        title: intl.get('scec.groupMaterielMapping.model.categoryName').d('品类名称'),
        width: 120,
        dataIndex: 'categoryName',
      },
    ];
  }

  render() {
    const {
      loading,
      mapStatusList = [],
      productSourceList = [],
      groupMaterielMapping = {},
    } = this.props;
    const { ecCategoryMapList = [], ecCategoryMapPagination = {} } = groupMaterielMapping;
    const { visible, isSave, selectedRows = [] } = this.state;
    const filterList = {
      mapStatusList,
      productSourceList,
      onSearch: this.fetchList,
      onRef: ref => {
        this.filterForm = (ref.props || {}).form;
      },
    };
    const columns = this.getColumns();
    const tableProps = {
      columns,
      loading,
      bordered: true,
      rowKey: 'ecCategoryId',
      onChange: this.fetchList,
      dataSource: ecCategoryMapList,
      pagination: ecCategoryMapPagination,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.ecCategoryId),
        onChange: this.changeSelectedRows,
      },
    };
    const modalProps = {
      visible,
      onSave: this.batchSetMaps,
      onCancel: this.closeModal,
      isMapped: selectedRows.filter(n => n.itemId || n.categoryId).length > 0, // 判断批量数据中是否有已映射
    };
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    return (
      <div className="matermap-tab-body">
        <div className="table-list-search">
          <FilterForm {...filterList} />
        </div>
        <div className="table-operation">
          <Button
            onClick={this.delMaps}
            disabled={selectedRows.filter(p => p.itemId || p.categoryId).length <= 0}
          >
            {intl.get('scec.ecMaterielMapping.button.delete').d('删除映射')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_SCEC}/v1/${organizationId}/group-ec-category-item-refs-export`}
            queryParams={filterValues}
            otherButtonProps={{ icon: '' }}
          />
          <Button onClick={this.handleImport}>
            {intl.get('hzero.common.button.import').d('批量导入')}
          </Button>
          <Button disabled={!isSave} onClick={this.setMaps}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button type="primary" disabled={selectedRows.length <= 0} onClick={this.openModal}>
            {intl.get('scec.ecCategoryPlatformCatalog.button.batchMapping').d('批量映射')}
          </Button>
        </div>
        <EditTable {...tableProps} />
        <MappingModal {...modalProps} />
      </div>
    );
  }
}
