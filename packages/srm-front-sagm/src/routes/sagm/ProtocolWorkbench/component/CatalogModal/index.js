/**
 * CatalogModal -分配目录
 *
 * @date: 2020-06-22
 * @author GM <ming.gao03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button, Checkbox } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse, createPagination } from 'utils/utils';

import { fetchCatalog } from '@/services/mallProtocolManagementService.js';
import FormList from './CatalogForm';

export default class CatalogModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: [],
      pagination: {},
      expandedRowKeys: [],
      selectedRowKeys: [],
      isExpandedChange: false,
      checkedCatalog: {}, // 选中的目录
    };
    const { modal } = props;
    modal.handleOk(() => this.handleOk());
  }

  componentDidMount() {
    this.fetchCatalog();
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  async fetchCatalog(page = {}, isClearExpanded = true) {
    const { isExpandedChange, expandedRowKeys: keys } = this.state;
    const { getFieldsValue } = this.form || {};
    const queryParams = this.form ? getFieldsValue() : {};
    if (isClearExpanded) {
      this.setState({ expandedRowKeys: [] });
    }
    this.setState({ loading: true });
    const res = getResponse(
      await fetchCatalog({
        page,
        ...queryParams,
        enabledFlag: 1,
        fullQueryFlag: 1,
      })
    );
    this.setState({ loading: false });
    if (res) {
      const addField = (menu = []) => {
        return menu.map((item) => {
          if (item.subMenus && item.subMenus.length > 0) {
            return { ...item, selected: 0, subMenus: addField(item.subMenus) };
          } else return { ...item, selected: 0 };
        });
      };
      const content = res.content || [];
      const dataSource = addField(content);
      const pagination = createPagination(res);
      const selectedRowKeys = [];
      const allCatalog = [];
      const expandedRowKeys = isExpandedChange ? keys : [];
      const getSelectedRowKeys = (menus) => {
        menus.forEach((menu) => {
          allCatalog.push(menu);
          if (menu.invisibleFlag === 1) {
            selectedRowKeys.push(menu.catalogId);
          }
          if (menu.subCatalogs) {
            getSelectedRowKeys(menu.subCatalogs);
          }
        });
      };

      const getExpandedRowKeys = (menus) => {
        menus.forEach((menu) => {
          if (
            menu.catalogName.includes(queryParams.catalogName) &&
            menu.parentCatalogId &&
            menu.parentCatalogId !== -1
          ) {
            expandedRowKeys.push(menu.parentCatalogId);
            const getParentCatalog = (parentCatalogId) => {
              const parentCatalog = this.getCatalogById(allCatalog, parentCatalogId);
              if (parentCatalog && parentCatalog.parentCatalogId !== -1) {
                expandedRowKeys.push(parentCatalog.parentCatalogId);
                getParentCatalog(parentCatalog.parentCatalogId);
              }
            };
            getParentCatalog(menu.parentCatalogId);
          }
          if (menu.subCatalogs) {
            getExpandedRowKeys(menu.subCatalogs);
          }
        });
      };
      getSelectedRowKeys(content);
      if (queryParams.catalogName && !isExpandedChange) getExpandedRowKeys(content);
      this.setState({ dataSource, pagination, selectedRowKeys, expandedRowKeys });
    }
  }

  @Bind()
  handlePageChange(page = {}) {
    this.setState({ checkedCatalog: {} }, () => {
      this.fetchCatalog(page);
    });
  }

  @Bind()
  expandChange() {
    this.setState({ isExpandedChange: true });
  }

  @Bind()
  handleToggleStatus(isAllExpand) {
    const { dataSource } = this.state;
    const { expandedRowKeys } = this.state;
    const allExpandRowKeys = [...expandedRowKeys];
    const getAllExpandedRowKeys = (current) => {
      current.forEach((item) => {
        if (item.subCatalogs && !allExpandRowKeys.includes(item.catalogId)) {
          allExpandRowKeys.push(item.catalogId);
          getAllExpandedRowKeys(item.subCatalogs);
        }
      });
    };
    if (isAllExpand) {
      getAllExpandedRowKeys(dataSource);
    }
    this.setState({ expandedRowKeys: isAllExpand ? allExpandRowKeys : [] });
  }

  @Bind()
  handleCheck(checked, record = {}) {
    this.setState({ checkedCatalog: checked ? record : {} });
  }

  @Bind()
  getCatalogById(catalogs = [], catalogId) {
    const logs = catalogs || [];
    return logs.find((catalog) => catalog.catalogId === catalogId);
  }

  @Bind()
  getSelectStatus = (levelList, record = {}) => {
    const { selectedRowKeys } = this.state;
    let isCheck = true;
    let isIndeterminate = false;
    const getSubStatus = (list) => {
      list.forEach((i) => {
        if (!selectedRowKeys.includes(i.catalogId)) isCheck = false;
        else isIndeterminate = true;
        if (i.subCatalogs) {
          getSubStatus(i.subCatalogs);
        }
      });
    };
    if (levelList) {
      getSubStatus(levelList);
    } else {
      isCheck = selectedRowKeys.includes(record.catalogId);
    }
    return { isCheck, isIndeterminate: isCheck ? false : isIndeterminate };
  };

  @Bind()
  handleOk() {
    const { onSave = (e) => e } = this.props;
    const { catalogId, catalogName } = this.state.checkedCatalog;
    onSave({ catalogId, catalogName });
  }

  render() {
    const { loading, expandedRowKeys, checkedCatalog, dataSource, pagination } = this.state;
    const { catalogId } = checkedCatalog;
    const filterList = {
      onSearch: this.fetchCatalog,
      onRef: this.handleRef,
    };
    // 获取当前节点勾选状态

    const columns = [
      {
        title: intl.get('small.common.model.catalog.name').d('目录名称'),
        dataIndex: 'catalogName',
      },
      {
        title: intl.get('small.common.model.catalogLevel').d('目录层级'),
        dataIndex: 'level',
        width: 90,
      },
      {
        dataIndex: 'invisibleFlag',
        render: (_, record) =>
          record.level !== 3 ? (
            ''
          ) : (
            <Checkbox
              onChange={(e) => this.handleCheck(e.target.checked, record)}
              checked={catalogId === record.catalogId}
              disabled={catalogId && catalogId !== record.catalogId}
              indeterminate={this.getSelectStatus(record.subCatalogs, record).isIndeterminate}
            />
          ),
        width: 80,
      },
    ];
    const tableProps = {
      columns,
      loading,
      dataSource,
      pagination,
      expandedRowKeys,
      childrenColumnName: 'subCatalogs',
      bordered: true,
      uncontrolled: true,
      rowKey: 'catalogId',
      onChange: this.handlePageChange,
      onExpand: this.expandChange,
    };
    return (
      <>
        <div className="table-list-search">
          <FormList {...filterList} />
        </div>
        <div className="table-operator">
          <Button onClick={() => this.handleToggleStatus(false)}>
            {intl.get('small.groupCategoryMaintenance.button.all.collect').d('全部收起')}
          </Button>
          <Button onClick={() => this.handleToggleStatus(true)}>
            {intl.get('small.groupCategoryMaintenance.button.all.up').d('全部展开')}
          </Button>
        </div>
        <Table className="small-table-all-space" {...tableProps} />
      </>
    );
  }
}
