/**
 * EcProductRef -商品(电商)映射物料
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
  loading: loading.effects['ecMaterielMapping/fetchEcProductCatalogRefs'],
  saveLoading: loading.effects['ecMaterielMapping/setEcProductCatalogRefsMap'],
  deleteLoading: loading.effects['ecMaterielMapping/deleteEcProductCatalogRefsMap'],
  modalMaterielLoading: loading.effects['ecMaterielMapping/fetchMaterielCode'],
  modalCategoryLoading: loading.effects['ecMaterielMapping/fetchCategoryCode'],
}))
export default class EcProductRef extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      catalogList: [],
      categoryItemLov: {},
      dataSource: [],
      visible: false,
    };
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  // 单元格onCell函数
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params = {}, val) {
    const {
      dispatch,
      ecMaterielMapping: { ecProductCatalogPagination = {} },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.setState({
      dataSource: [],
    });
    dispatch({
      type: 'ecMaterielMapping/fetchEcProductCatalogRefs',
      payload: {
        page: isEmpty(params) ? ecProductCatalogPagination : params,
        ...filterValues,
      },
    }).then(() => {
      const {
        ecMaterielMapping: { ecProductCatalogList = {} },
      } = this.props;
      if (val === undefined) {
        this.setState({
          selectedRows: [],
        });
      }
      this.setState({
        catalogList: [],
        categoryItemLov: {},
        dataSource: ecProductCatalogList.content,
      });
    });
  }

  /**
   * 商品来源值集查询
   */
  @Bind()
  fetchEcPlatform(companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecMaterielMapping/queryEcPlatformList',
      payload: { companyId },
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
        type: 'ecProduct',
      },
    }).then(res => {
      if (res) {
        this.fetchEcData();
      }
    });
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
  handleSetMap(params) {
    const { dispatch } = this.props;
    const mapParams = params.map(n => {
      const { ecProductId, ecProductItemId, companyId, invOrganizationId, itemId, categoryId } = n;
      return { ecProductId, ecProductItemId, companyId, invOrganizationId, itemId, categoryId };
    });
    dispatch({
      type: 'ecMaterielMapping/setEcProductCatalogRefsMap',
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
      return n.ecProductId;
    });
    // 物料映射
    if (type === 'item') {
      newRecord.itemId = lovRecord.partnerItemId;
      newRecord.itemName = lovRecord.itemName;
      newCategoryItemLov[`itemId#${record.ecProductId}`] = lovRecord.partnerItemId;
    } else {
      newRecord.categoryId = lovRecord.categoryId;
      newRecord.categoryName = lovRecord.categoryName;
      newCategoryItemLov[`categoryCode#${record.ecProductId}`] = lovRecord.categoryCode;
    }
    let list = catalogList;
    if (catalogkeys.indexOf(record.ecProductId) >= 0) {
      list = catalogList.map(n => {
        const m = {
          ...n,
        };
        if (m.ecProductId === record.ecProductId) {
          Object.assign(m, newRecord);
        }
        return m;
      });
    } else {
      list.push(newRecord);
    }
  }

  /**
   * 删除映射关系
   */
  @Bind()
  handleDeleteMaps() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const mapParams = selectedRows.map(n => {
      const { ecProductId, ecProductItemId, companyId, invOrganizationId, itemId } = n;
      return { ecProductId, ecProductItemId, companyId, invOrganizationId, itemId };
    });
    Modal.confirm({
      title: intl
        .get('scec.ecMaterielMapping.view.warning.materielMapsTitleDelete')
        .d('是否删除映射？'),
      onOk: () => {
        dispatch({
          type: 'ecMaterielMapping/deleteEcProductCatalogRefsMap',
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
      key: `/hiam/sub-account-org/data-import/EC_PRDT_ITEM_REF`,
      title: intl.get('hzero.common.button.import').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.button.import').d('批量导入'),
      }),
    });
  }

  render() {
    const {
      ecMaterielMapping: { ecProductCatalogPagination = {}, ecPlatformList = [] },
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
        title: intl.get(`${modelPrompt}.companyName`).d('公司名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${modelPrompt}.ecPlatformName`).d('商品来源'),
        width: 100,
        dataIndex: 'ecPlatformName',
      },
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        width: 100,
        dataIndex: 'ecProductNum',
      },
      {
        title: intl.get('scec.common.model.productName').d('商品名称'),
        width: 150,
        dataIndex: 'ecProductName',
        onCell: this.onCell,
      },
      {
        title: intl.get(`${modelPrompt}.productCategory`).d('商品分类'),
        width: 100,
        dataIndex: 'ecCategoryName',
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
              {getFieldDecorator(`itemId#${record.ecProductId}`, {
                initialValue: record.itemId,
              })(
                <Lov
                  allowClear={false}
                  textValue={record.itemCode}
                  code="SCEC.CUSTOMER_ITEM"
                  queryParams={{ invOrganizationId: this.form.getFieldValue('invOrganizationId') }}
                  disabled={
                    !isNull(record.categoryCode) ||
                    !isUndefined(categoryItemLov[`categoryCode#${record.ecProductId}`])
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
              {getFieldDecorator(`categoryCode#${record.ecProductId}`, {
                initialValue: record.categoryCode,
              })(
                <Lov
                  allowClear={false}
                  textValue={record.categoryCode}
                  code="SCEC.TREE_ITEM_CATEGORY"
                  disabled={
                    !isNull(record.itemId) ||
                    !isUndefined(categoryItemLov[`itemId#${record.ecProductId}`])
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
      onFetchEcPlatform: this.fetchEcPlatform,
      onFetchData: this.fetchEcData,
      mapStatusList,
      ecPlatformList,
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
      rowKey: 'ecProductId',
      columns,
      loading: loading || saveLoading || deleteLoading,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n.ecProductId),
        onChange: this.onTableSelectedRowChange,
      },
      onChange: page => {
        this.fetchEcData(page, 'isPage');
      },
      scroll: { x: 1361 },
      bordered: true,
      pagination: ecProductCatalogPagination,
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
            requestUrl={`${SRM_SCEC}/v1/${organizationId}/ec-product-item-refs-export`}
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
