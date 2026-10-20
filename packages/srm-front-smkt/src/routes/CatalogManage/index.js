import React, { Component } from 'react';
import classNames from 'classnames';
import { Button, DataSet, Icon, Spin, Tooltip } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';

//  import CatalogList from './CatalogList';
import c7nModal, { confirm } from '@/utils/c7nModal';
import Detail from './Detail';
import { tableDs } from './ds';
import { fetchSubCatalog, fetchEnableCatalog } from '@/services/catalogManage';
import style from './index.less';

@formatterCollections({
  code: ['smkt.catalogManage', 'smpc.product', 'hzero.common'],
})
export default class CatalogMapping extends Component {
  constructor(props) {
    super(props);
    this.ds = new DataSet(tableDs());
  }

  state = {
    isExpand: false,
  };

  handleLoadData = async ({ record, dataSet }) => {
    const { catalogId } = record.toData();
    if (!record.children && record.get('parentFlag')) {
      record.setState('loading', true);
      const result = getResponse(await fetchSubCatalog({ catalogId }));
      record.setState('loading', false);
      if (result) {
        dataSet.appendData(result);
      }
    }
  };

  refresh = () => {
    this.ds.query(this.ds.currentPage);
    this.setState({
      isExpand: false,
    });
  };

  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin delay={200} size="small" />;
    }
    return (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        style={{ visibility: record.get('parentFlag') === 1 ? 'visible' : 'hidden' }}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  }

  handleExpand = () => {
    const { isExpand } = this.state;

    const loadData = (data = []) => {
      data.forEach(async (r) => {
        const _r = r;
        _r.isExpanded = this.state.isExpand;
        const { catalogId } = r.toData();
        if (!r.children) {
          const result = getResponse(await fetchSubCatalog({ catalogId }));
          if (result) {
            this.ds.appendData(result);
          }
        }
        if (r.children) {
          loadData(r.children);
        }
      });
    };
    this.setState(
      {
        isExpand: !isExpand,
      },
      () => {
        // 加载数据
        loadData(this.ds.records);
      }
    );
  };

  handleEnableFlag = (record) => {
    const { status, catalogId } = record.get(['status', 'catalogId']);
    if (status) {
      confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        content: intl
          .get('smkt.catalogManage.modal.enableFlagConfirm.content')
          .d('禁用目录可导致部分商品下架，是否继续操作？'),
        onOk: () => {
          this.enableFlag(catalogId, status);
        },
      });
    } else {
      this.enableFlag(catalogId, status);
    }
  };

  enableFlag = async (catalogId, enable) => {
    const res = await fetchEnableCatalog(catalogId, enable);
    if (getResponse(res)) {
      notification.success();
      this.refresh();
    }
  };

  openEditModal = (record, subCatalog = false) => {
    c7nModal({
      okText: intl.get('hzero.common.button.save').d('保存'),
      style: { width: 380 },
      title: !record.catalogId
        ? intl.get('smkt.catalogManage.button.createCatalog').d('新建目录')
        : subCatalog
        ? intl.get('smkt.catalogManage.button.createChildCatalog').d('新增子目录')
        : intl.get('smkt.catalogManage.button.editCatalog').d('编辑目录'),
      children: <Detail record={record} refresh={this.refresh} isSubCatalog={subCatalog} />,
    });
  };

  customTag = (value, yesText, noText) => {
    return (
      <Tag
        color={value === 1 ? 'rgba(71,184,129,0.10)' : '#ffeeeb'}
        style={{ color: value === 1 ? 'rgba(71,184,129,1)' : '#f56649' }}
      >
        {value === 1 ? yesText : noText}
      </Tag>
    );
  };

  columns = [
    {
      name: 'status',
      minWidth: 130,
      align: 'left',
      renderer: ({ record }) =>
        this.customTag(
          record.get('status'),
          intl.get('smpc.product.status.enable').d('启用'),
          intl.get('smpc.product.status.disable').d('禁用')
        ),
    },
    {
      name: 'catalogCode',
      // width: 250,
      renderer: ({ value, record }) => (
        <a onClick={() => this.openEditModal(record.toData())}>{value}</a>
      ),
    },
    {
      name: 'catalogName',
    },
    {
      name: 'catalogLevel',
      width: 120,
    },
    {
      name: 'orderSeq',
      width: 120,
    },
    {
      name: 'skuCount',
      width: 120,
    },
    {
      name: 'operation',
      width: 200,
      renderer: ({ record }) => {
        const enabledFlag = record.get('status');
        const hasSkuFlag = record.get('hasSkuFlag');
        return (
          <>
            <Tooltip
              title={
                hasSkuFlag &&
                intl
                  .get('smkt.catalogManage.view.createDisabledInfo')
                  .d('已被商品引用的目录不可新增子目录')
              }
            >
              <Button
                funcType="link"
                color="primary"
                disabled={hasSkuFlag}
                onClick={() => this.openEditModal(record.toData(), true)}
              >
                {intl.get('smkt.catalogManage.button.createChildCatalog').d('新增子目录')}
              </Button>
            </Tooltip>
            <Button funcType="link" color="primary" onClick={() => this.handleEnableFlag(record)}>
              {enabledFlag === 1
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </Button>
          </>
        );
      },
    },
  ];

  render() {
    const { isExpand } = this.state;
    return (
      <React.Fragment>
        <Header title={intl.get('smkt.catalogManage.view.title').d('目录管理')}>
          <Button icon="add" color="primary" onClick={this.openEditModal}>
            {intl.get('smkt.catalogManage.button.createTopCatalog').d('新建目录')}
          </Button>
          <Button
            funcType="flat"
            onClick={this.handleExpand}
            icon={isExpand ? 'baseline-arrow_right' : 'baseline-arrow_drop_down'}
          >
            {!isExpand
              ? intl.get('smpc.product.model.expandAll').d('全部展开')
              : intl.get('smpc.product.model.collapseAll').d('全部收起')}
          </Button>
        </Header>
        <Content>
          <SearchBarTable
            style={{ maxHeight: 'calc(100vh - 310px)' }}
            className={style['catalog-table']}
            dataSet={this.ds}
            columns={this.columns}
            searchCode="SMKT.SALE.CATALOG.SEARCHBAR"
            cacheState
            mode="tree"
            selectionMode="none"
            columnResizable
            expandIcon={this.expandIcon}
            treeLoadData={this.handleLoadData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
