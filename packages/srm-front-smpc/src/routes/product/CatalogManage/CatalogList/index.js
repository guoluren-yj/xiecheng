/**
 * 品牌管理
 * @date: 2020-12-03
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { Modal, Icon, Spin, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import FilterBarTable from '_components/FilterBarTable';
import { isEmpty } from 'lodash';

import { enabledRenderer } from '@/routes/product/utilsApi/renderer';
import styles from '../index.less';

import {
  setEnable,
  setDisable,
  batchSetEnable,
  batchSetDisable,
  fetchSubCatalog,
  deleteCatalog,
  fetchIsSecondUrlApi,
} from '../api';

export default class CatalogList extends Component {
  createModal;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.ds = props.ds;
    this.ds.setQueryParameter('customizeUnitCode', 'SMPC.CATALOG_MANAGE.LIST');
    this.ds.query(this.ds.currentPage);
    this.state = {
      closedTipFlag: true,
    };
  }

  componentDidMount() {
    this.fetchIsSecondUrl();
  }

  @Bind()
  fetchIsSecondUrl() {
    const url =
      window.$$env.NODE_ENV === 'production'
        ? window.location.origin
        : 'https://dev.isrm.going-link.com';
    fetchIsSecondUrlApi(url).then((res) => {
      if (!isEmpty(res)) {
        // 二级域名有效
        this.setState({ closedTipFlag: false });
      }
    });
  }

  @Bind()
  expandAll() {
    if (this.tableRef) {
      this.ds.setState('customExpanded', true);
      return this.tableRef.tableStore.expandAll();
    }
  }

  @Bind()
  collapseAll() {
    if (this.tableRef) {
      this.ds.setState('customExpanded', false);
      return this.tableRef.tableStore.collapseAll();
    }
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMPC.CATALOG_IMPORT',
      title: 'srm.common.view.catalogImport',
      search: qs.stringify({
        action: 'srm.common.view.catalogImport',
        backPath: '/s2-mall/product/catalog-manage',
      }),
    });
  }

  // 禁用弹窗提示
  openConfirm = (confirm = () => {}) => {
    Modal.confirm({
      title: intl.get('smpc.product.view.delModal.title').d('提示'),
      children: intl
        .get('smpc.catalog.view.disableCatalogMessage')
        .d('目录禁用会导致该目录下上架商品自动下架，是否继续操作？'),
      onOk: confirm,
    });
  };

  // 启用禁用成功后回调
  enbaleOrDisableSuccess = () => {
    notification.success();
    this.ds.query(this.ds.currentPage, undefined, false);
  };

  /**
   * 单个启用、禁用
   */
  @Bind()
  async handleEnable(line) {
    const { catalogId, enabledFlag } = line;
    const api = enabledFlag === 1 ? setEnable : setDisable;
    const confirm = async () => {
      const params = { catalogs: [line], catalogId };
      const res = getResponse(await api(params));
      if (res) this.enbaleOrDisableSuccess();
    };
    if (enabledFlag === 1) {
      confirm();
    } else {
      this.openConfirm(confirm);
    }
  }

  /**
   * 批量启用、禁用
   */
  @Bind()
  async handleBatchEnable(dataSet, enabledFlag = 0) {
    const catalogIds = dataSet.selected
      .filter((r) => r.get('enabledFlag') === Number(!enabledFlag))
      .map((m) => m.get('catalogId'));
    const api = enabledFlag === 1 ? batchSetEnable : batchSetDisable;
    const confirm = async () => {
      const res = getResponse(await api(catalogIds));
      if (res) this.enbaleOrDisableSuccess();
    };
    if (enabledFlag === 1) {
      confirm();
    } else {
      this.openConfirm(confirm);
    }
  }

  // 图标渲染由于接口返回字段不足， 目前有bug, 无子目录仍然有展开icon（后续是否优化？）
  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });

    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin delay={200} size="small" />;
    }

    return record.get('level') < 3 && record.get('childFlag') ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span className={classString} style={{ width: 20 }} />
    );
  }

  // 子节点展开事件
  // 受icon bug 影响， 点击展开便会查询子目录（即使真实并无子目录）
  handleLoadData = async ({ record, dataSet }) => {
    const { catalogId, level } = record.toData();
    if (!record.children && level < 3) {
      record.setState('loading', true);
      const result = getResponse(await fetchSubCatalog({ catalogId }));
      record.setState('loading', false);
      if (result) {
        dataSet.appendData(result);
        dataSet.forEach((r) => Object.assign(r, { status: 'sync' }));
      }
    }
  };

  /**
   * 删除目录
   */
  @Bind
  handleDeleteCatalog(catalogId) {
    Modal.confirm({
      title: intl.get('smpc.product.view.delModal.title').d('提示'),
      children: intl
        .get('smpc.catalog.modal.message.delConfirm')
        .d('该目录信息删除后不可恢复，是否继续操作？'),
      onOk: async () => {
        this.ds.status = 'loading';
        const res = getResponse(await deleteCatalog(catalogId));
        this.ds.status = 'ready';
        if (res) {
          notification.success();
          this.ds.query(1, undefined, true);
        }
      },
    });
  }

  @Bind()
  renderOption({ record }) {
    const { onOpenCatalogModal } = this.props;
    const { level, catalogId, enabledFlag, deletableFlag } = record.get([
      'level',
      'catalogId',
      'enabledFlag',
      'deletableFlag',
    ]);
    return (
      <div className="action-link-btns">
        {!(level === 3 || enabledFlag === 0) && (
          <Button funcType="link" onClick={() => onOpenCatalogModal(level + 1, null, catalogId)}>
            {intl.get('smpc.catalogManage.button.createNextCatalog').d('新建下级目录')}
          </Button>
        )}
        <Button
          funcType="link"
          onClick={() =>
            this.handleEnable({ ...record.toData(), enabledFlag: enabledFlag === 1 ? 0 : 1 })
          }
        >
          {enabledFlag === 1
            ? intl.get('hzero.common.status.disable').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用')}
        </Button>
        {!!deletableFlag && (
          <Button funcType="link" onClick={() => this.handleDeleteCatalog(catalogId)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        )}
      </div>
    );
  }

  @Bind()
  getColumns() {
    const { onOpenCatalogModal } = this.props;
    return [
      {
        name: 'enabledFlag',
        width: 100,
        align: 'left',
        renderer: enabledRenderer,
      },
      {
        name: 'operation',
        width: 160,
        lock: 'right',
        renderer: this.renderOption,
      },
      {
        name: 'catalogCode',
        width: 250,
        renderer: ({ value, record }) => (
          <a onClick={() => onOpenCatalogModal(record.get('level'), record)}>{value}</a>
        ),
      },
      {
        name: 'catalogName',
      },
      {
        name: 'level',
        width: 90,
      },
      {
        name: 'orderSeq',
        width: 100,
        // editor: (record) => record.get('level') > 1,
      },
      {
        name: 'sourceFromMeaning',
        width: 100,
      },
      {
        name: 'skuCount',
        width: 100,
      },
      {
        name: 'shelfSkuCount',
        width: 120,
      },
    ];
  }

  render() {
    const { customizeTable } = this.props;
    const columns = this.getColumns();
    return (
      <>
        {!this.state.closedTipFlag && (
          <Alert
            className={styles['catalog-head-tip']}
            message={intl
              .get('smpc.catalogManage.view.headTip')
              .d('若对一级目录有其他排版需求，可至【商城装修-全局配置-商品目录】中进行配置')}
            type="info"
            iconType="help"
            showIcon
            closable
            onClose={() => {
              this.setState({ closedTipFlag: true });
            }}
          />
        )}
        {customizeTable(
          { code: 'SMPC.CATALOG_MANAGE.LIST' },
          <FilterBarTable
            className="catalog-manage-table"
            mode="tree"
            dataSet={this.ds}
            columns={columns}
            queryFieldsLimit={3}
            columnResizable
            tableRef={(ref) => {
              this.tableRef = ref;
            }}
            expandIcon={this.expandIcon}
            treeLoadData={this.handleLoadData}
            style={{
              maxHeight: this.state.closedTipFlag ? 'calc(100vh - 190px)' : 'calc(100vh - 226px)',
            }}
            filterBarConfig={{
              expandable: false,
            }}
          />
        )}
      </>
    );
  }
}
