/**
 * Categoryref -目录映射物料
 * @date: 2019-2-20
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Table, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty, isNull } from 'lodash';
import queryString from 'querystring';

import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { SRM_SCEC } from '_utils/config';
import notification from 'utils/notification';

import Lov from 'components/Lov';
import ExcelExport from 'components/ExcelExport';

import FilterForm from './FilterForm';
import MappingModal from '../MappingModal';

const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();
const modelPrompt = 'scec.ecMaterielMapping.model';
@Form.create({ fieldNameProp: null })
@connect(({ loading, ecMaterielMapping }) => ({
  ecMaterielMapping,
  loading: loading.effects['ecMaterielMapping/fetchCatalogRefs'],
  saveLoading: loading.effects['ecMaterielMapping/setCatalogRefsMap'],
  deleteLoading: loading.effects['ecMaterielMapping/deleteCatalogRefsMap'],
  modalMaterielLoading: loading.effects['ecMaterielMapping/fetchMaterielCode'],
  modalCategoryLoading: loading.effects['ecMaterielMapping/fetchCategoryCode'],
}))
export default class Categoryref extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      catalogList: [], // table中改变了物品品类Lov的行list
      categoryItemLov: {}, // table中选择了的物料品类lov
      dataSource: [],
      visible: false,
    };
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params = {}, val) {
    const {
      dispatch,
      ecMaterielMapping: { catalogPagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({
      dataSource: [],
    });
    dispatch({
      type: 'ecMaterielMapping/fetchCatalogRefs',
      payload: {
        page: isEmpty(params) ? catalogPagination : params,
        ...filterValues,
      },
    }).then(() => {
      const {
        ecMaterielMapping: { catalogRefsList = {} },
      } = this.props;
      if (val === undefined) {
        this.setState({
          selectedRows: [],
        });
      }
      this.setState({
        catalogList: [],
        categoryItemLov: {},
        dataSource: catalogRefsList.content,
      });
    });
  }

  @Bind()
  toggleModal() {
    this.setState(
      {
        visible: !this.state.visible,
      },
      () => {
        if (this.state.visible) {
          const { dispatch } = this.props;
          dispatch({
            type: 'ecMaterielMapping/fetchMaterielCode',
            payload: {
              invOrganizationId: this.form.getFieldValue('invOrganizationId'),
            },
          });
          dispatch({
            type: 'ecMaterielMapping/fetchCategoryCode',
          });
        }
      }
    );
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { catalogList } = this.state;
    this.handleSetMap(catalogList);
  }

  /**
   * 映射接口
   */
  @Bind()
  handleSetMap(params = []) {
    const { dispatch } = this.props;
    const mapParams = params.map(n => {
      const { categoryItemId, catalogId, companyId, invOrganizationId, itemId, categoryId } = n;
      return { categoryItemId, catalogId, companyId, invOrganizationId, itemId, categoryId };
    });
    dispatch({
      type: 'ecMaterielMapping/setCatalogRefsMap',
      payload: mapParams,
    }).then(res => {
      if (res) {
        this.setState({
          visible: false,
        });
        this.fetchEcData();
      }
    });
  }

  /**
   * 勾选行
   */
  @Bind()
  onTableSelectedRowChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 需要保存的目录代码list
   * @param {*} _
   * @param {*} lovRecord - lov选中的record
   * @param {*} record - table的record
   * @param {*} type - 物料映射/品类映射
   */
  @Bind()
  setCatalogList(_, lovRecord, record, type) {
    const { catalogList = [], categoryItemLov = {} } = this.state;
    const newRecord = record;
    const newCategoryItemLov = categoryItemLov;
    const catalogkeys = catalogList.map(n => {
      return n.catalogConfigId;
    });
    // 物料映射
    if (type === 'item') {
      newRecord.itemId = lovRecord.partnerItemId;
      newRecord.itemName = lovRecord.itemName;
      newCategoryItemLov[`itemId#${record.catalogConfigId}`] = lovRecord.partnerItemId;
    } else {
      newRecord.categoryId = lovRecord.categoryId;
      newRecord.categoryName = lovRecord.categoryName;
      newCategoryItemLov[`categoryCode#${record.catalogConfigId}`] = lovRecord.categoryCode;
    }
    let list = catalogList;
    if (catalogkeys.indexOf(record.catalogConfigId) >= 0) {
      list = catalogList.map(n => {
        const m = {
          ...n,
        };
        if (m.catalogConfigId === record.catalogConfigId) {
          Object.assign(m, newRecord);
        }
        return m;
      });
    } else {
      list.push(newRecord);
    }
  }

  /**
   * 集团引用
   */
  @Bind()
  fetchReference() {
    const { selectedRows = [] } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'ecMaterielMapping/fetchReference',
      payload: {
        selectedRows,
        type: 'category',
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchEcData();
      }
    });
  }

  /**
   * 删除映射关系
   */
  @Bind()
  handleDeleteMaps() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mapParams = selectedRows.map(n => {
      const { categoryItemId, catalogId, companyId, invOrganizationId, itemId } = n;
      return { categoryItemId, catalogId, companyId, invOrganizationId, itemId };
    });
    Modal.confirm({
      title: intl
        .get('scec.ecMaterielMapping.view.warning.materielMapsTitleDelete')
        .d('是否删除映射？'),
      onOk: () => {
        dispatch({
          type: 'ecMaterielMapping/deleteCatalogRefsMap',
          payload: mapParams,
        }).then(res => {
          if (res) {
            this.fetchEcData();
          }
        });
      },
    });
  }

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: `/hiam/sub-account-org/data-import/CTGY_ITEM_REF`,
      title: intl.get('hzero.common.button.import').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
    });
  }

  render() {
    const {
      ecMaterielMapping: { catalogPagination = {} },
      form: { getFieldDecorator },
      mapStatusList = [],
      loading,
      saveLoading,
      deleteLoading,
      modalMaterielLoading,
      modalCategoryLoading,
    } = this.props;
    const {
      dataSource = [],
      selectedRows = [],
      catalogList = [],
      categoryItemLov = {},
      visible,
    } = this.state;
    const columns = [
      {
        title: intl.get('scec.ecMaterielMapping.view.ecMaterielMapping.companyName').d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('scec.ecPlatformCategory.model.catalogCode').d('目录编码'),
        width: 100,
        dataIndex: 'catalogCode',
      },
      {
        title: intl.get('scec.common.model.catalogName').d('目录名称'),
        width: 100,
        dataIndex: 'catalogName',
      },
      {
        title: intl.get('scec.ecPlatformCategory.model.catalogLevel').d('目录层级'),
        width: 100,
        dataIndex: 'catalogLevel',
      },
      {
        title: intl.get(`${modelPrompt}.parentCatalogName`).d('上级目录名称'),
        width: 150,
        dataIndex: 'parentCatalogName',
      },
      {
        title: intl.get('scec.common.model.organizaiton').d('库存组织'),
        width: 150,
        dataIndex: 'organizationName',
      },
      {
        title: intl.get(`${modelPrompt}.itemId`).d('物料编码'),
        width: 150,
        dataIndex: 'itemId',
        render: (text, record) => {
          return (
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator(`itemId#${record.catalogConfigId}`, {
                initialValue: record.itemId,
              })(
                <Lov
                  allowClear={false}
                  textValue={record.itemCode}
                  code="SCEC.CUSTOMER_ITEM"
                  queryParams={{ invOrganizationId: this.form.getFieldValue('invOrganizationId') }}
                  disabled={
                    !isNull(record.categoryCode) ||
                    !isUndefined(categoryItemLov[`categoryCode#${record.catalogConfigId}`])
                  }
                  onChange={(_, params) => this.setCatalogList(_, params, record, 'item')}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`${modelPrompt}.itemName`).d('物料名称'),
        width: 100,
        dataIndex: 'itemName',
        render: (_, record) => <span>{record.itemName}</span>,
      },
      {
        title: intl.get(`${modelPrompt}.categoryCode`).d('品类编码'),
        width: 150,
        dataIndex: 'categoryCode',
        render: (text, record) => {
          return (
            <FormItem style={{ margin: 0 }}>
              {getFieldDecorator(`categoryCode#${record.catalogConfigId}`, {
                initialValue: record.categoryCode,
              })(
                <Lov
                  allowClear={false}
                  textValue={record.categoryCode}
                  code="SCEC.TREE_ITEM_CATEGORY"
                  disabled={
                    !isNull(record.itemId) ||
                    !isUndefined(categoryItemLov[`itemId#${record.catalogConfigId}`])
                  }
                  onChange={(_, params) => this.setCatalogList(_, params, record, 'category')}
                />
              )}
            </FormItem>
          );
        },
      },
      {
        title: intl.get(`${modelPrompt}.categoryName`).d('品类名称'),
        width: 100,
        dataIndex: 'categoryName',
        render: (_, record) => <span>{record.categoryName}</span>,
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
      mapStatusList,
    };
    const modalProps = {
      visible,
      selectedRows,
      modalMaterielLoading,
      modalCategoryLoading,
      invOrganizationId: this.form && this.form.getFieldValue('invOrganizationId'),
      toggleModal: this.toggleModal,
      handleSetMap: this.handleSetMap,
    };
    const tableProps = {
      className: 'editable-table',
      rowKey: 'catalogConfigId',
      columns,
      loading: loading || saveLoading || deleteLoading,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.catalogConfigId),
        onChange: this.onTableSelectedRowChange,
      },
      onChange: page => {
        this.fetchEcData(page, 'isPage');
      },
      scroll: { x: 1331 },
      bordered: true,
      pagination: catalogPagination,
      dataSource,
    };
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    return (
      <div className="matermap-tab-body">
        <div className="table-list-search">
          <FilterForm {...filterList} />
        </div>
        <div className="table-operation">
          <Button disabled={selectedRows.length <= 0} onClick={this.handleDeleteMaps}>
            {intl.get('scec.ecMaterielMapping.button.delete').d('删除映射')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_SCEC}/v1/${organizationId}/category-item-refs-export`}
            queryParams={filterValues}
            otherButtonProps={{ icon: '' }}
          />
          <Button onClick={this.handleImport}>
            {intl.get('hzero.common.button.import').d('批量导入')}
          </Button>
          <Button disabled={catalogList.length <= 0} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.toggleModal} disabled={selectedRows.length <= 0}>
            {intl.get('scec.ecCategoryPlatformCatalog.button.batchMapping').d('批量映射')}
          </Button>
          <Button
            type="primary"
            disabled={
              selectedRows.length <= 0 ||
              !selectedRows.every(item => item.itemCode || item.categoryCode)
            }
            onClick={() => {
              this.fetchReference();
            }}
          >
            {intl.get('scec.ecCategoryPlatformCatalog.button.reference').d('集团引用')}
          </Button>
        </div>
        <Table {...tableProps} />
        <MappingModal {...modalProps} />
      </div>
    );
  }
}
