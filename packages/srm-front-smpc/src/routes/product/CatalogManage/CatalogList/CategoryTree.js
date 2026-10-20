import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Spin, Tree } from 'choerodon-ui';
import { Icon, Tooltip, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { fetchTree, addCategoryToDirectory } from '../api';
import styles from '../index.less';

const dataStore = {
  allList: undefined,
  flatAllList: [],
  allCheckedNodes: [],
  filterList: undefined,
  flatFilterList: [],
  filterCheckedNodes: [],
};

const updateDataStore = (nextStore = {}) => {
  Object.keys(nextStore).forEach((key) => {
    dataStore[key] = nextStore[key];
  });
};

const getCheckedNodes = (list) => {
  const keys = [];
  const flatList = [];

  const deepGetKeys = (data) => {
    data.forEach((d) => {
      const node = d;
      const { childs, ...others } = node;
      flatList.push(others);
      if (!childs && node.createCatalogFlag) {
        keys.push(others);
      }
      if (childs) {
        deepGetKeys(childs);
      }
    });
  };
  deepGetKeys(list);
  return [keys, flatList];
};

export default class CategoryTree extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { allList, allCheckedNodes } = dataStore;
    const initTreeList = allList && allList.length > 0 ? this.getTreeList(dataStore.allList) : [];
    this.state = {
      hasSkuFlag: false,
      treeList: initTreeList,
      checkedNodes: allCheckedNodes,
      expandedKeys: [],
      searchValue: '',
      // searchCountA: 0,
      // searchCountB: 0,
      autoExpandParent: true,
      allLoading: false,
      filterLoading: false,
      confirmLoading: false,
      // inputing: true, // 是否正在输入中
      // 输入结果定位
      currentId: '',
      filterIds: [],
    };
  }

  componentDidMount() {
    if (!dataStore.allList) {
      this.fetchTreeList('all');
    }
    if (!dataStore.filterList) {
      this.fetchTreeList('filter');
    }
    const { modal } = this.props;
    modal.handleOk(this.handleSave);
    modal.update({
      okProps: { loading: this.state.confirmLoading },
    });
  }

  getTreeList(list) {
    return [
      {
        level: 0,
        categoryId: 'all',
        categoryName: intl.get('smpc.catalogManage.view.allCategory').d('全部分类'),
        childs: list,
      },
    ];
  }

  // 请求数据
  @Bind
  async fetchTreeList(type) {
    const { hasSkuFlag } = this.state;
    if (type === 'all') {
      this.setState({ allLoading: true });
      const allList = getResponse(await fetchTree({ hasSkuFlag: false }));
      this.setState({ allLoading: false });
      if (allList) {
        const treeList = this.getTreeList(allList);
        const [allCheckedNodes, flatAllList] = getCheckedNodes(allList);
        if (!hasSkuFlag) {
          this.setState({
            treeList,
            checkedNodes: allCheckedNodes,
          });
        }
        updateDataStore({
          allList,
          flatAllList,
          allCheckedNodes,
        });
      }
    } else {
      this.setState({ filterLoading: true });
      const filterList = getResponse(await fetchTree({ hasSkuFlag: true }));
      this.setState({ filterLoading: false });
      if (filterList) {
        const treeList = this.getTreeList(filterList);
        const [filterCheckedNodes, flatFilterList] = getCheckedNodes(filterList);
        if (hasSkuFlag) {
          this.setState({
            treeList,
            checkedNodes: filterCheckedNodes,
          });
        }
        updateDataStore({
          filterList,
          flatFilterList,
          filterCheckedNodes,
        });
      }
    }
  }

  @Bind()
  renderText(record) {
    const { formDs } = this.props;
    const { categoryName } = (formDs && formDs.toData()[0]) || {};
    return record.get('createCatalogFlag') ? (
      <Tooltip
        placement="leftBottom"
        title={intl.get('smpc.catalogManage.view.noCancelCategory').d('已映射目录无法取消')}
      >
        {this.handleTitle(record, categoryName)}
      </Tooltip>
    ) : (
      this.handleTitle(record, categoryName)
    );
  }

  /**
   * 加载子节点
   * @param {Array} data - 树节点
   */
  @Bind()
  renderTreeNodes(data) {
    const { searchValue } = this.state;
    return data.map((item) => {
      const index = searchValue ? item.categoryName.indexOf(searchValue) : -1; // 'aa'.indexOf('') = 0
      let beforeStr = '';
      let afterStr = '';
      if (searchValue) {
        beforeStr = item.categoryName.substr(0, index);
        afterStr = item.categoryName.substr(index + searchValue.length);
      }
      const className = index > -1 ? 'search-result-node' : '';
      const title =
        index > -1 ? (
          <span data-name={item.categoryName} className={className}>
            {beforeStr}
            <span>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span data-name={item.categoryName}>{item.categoryName}</span>
        );
      if (item.childs) {
        return (
          <Tree.TreeNode
            // className={className}
            selectable={false}
            title={title}
            key={item.categoryId}
            dataRef={item}
          >
            {this.renderTreeNodes(item.childs)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode
          // className={className}
          title={title}
          key={item.categoryId}
          dataRef={item}
          selectable={false}
        />
      );
    });
  }

  /**
   * 选中事件
   */
  @Bind()
  onCheck(keys, e) {
    const { hasSkuFlag } = this.state;
    const { allCheckedNodes, filterCheckedNodes } = dataStore;
    const fixNodes = hasSkuFlag ? filterCheckedNodes : allCheckedNodes;

    this.setState({
      checkedNodes: [...e.checkedNodes.map((p) => p.dataRef), ...fixNodes],
    });

    if (!e.checked && e.node.dataRef.createCatalogFlag) {
      notification.warning({
        message: intl.get('smpc.catalogManage.view.noCancelCategory').d('已映射目录无法取消'),
      });
    }
  }

  @Bind()
  onSearchChange(value) {
    const { treeList, hasSkuFlag } = this.state;
    const dataList = [];
    // 获取树所有行数据
    const generateList = (data, position = 0) => {
      for (let i = 0; i < data.length; i++) {
        const { categoryId, categoryName, childs } = data[i];
        dataList.push({ categoryId, title: categoryId, categoryName, position: position + i });
        if (childs) {
          generateList(childs, position + i + 1);
        }
      }
    };
    generateList(treeList);
    if (dataList.length === 0) return;
    // let searchCount = 0;
    let _location;
    const expandedKeys = dataList
      .map((item) => {
        if (value && item.categoryName.indexOf(value) > -1) {
          // searchCount++;
          if (!_location) _location = String(item.categoryId);
          return String(item.categoryId);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState(
      {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
        // inputing: false,
        // [hasSkuFlag ? 'searchCountB' : 'searchCountA']: searchCount,
        [hasSkuFlag ? 'locationB' : 'locationA']: _location || 'all',
        currentId: _location,
        filterIds: expandedKeys,
      },
      () => {
        // const container = document.querySelector('#scroll-container');
        // const node = document.querySelector('.search-result-node');
        if (value && _location) {
          // this.handleScrollTo(container, _location * 32);
          this.treeRef.scrollTo({ key: _location });
        }
        if (!value) {
          this.treeRef.scrollTo({ key: 'all' });
        }
      }
    );
  }

  handleScrollTo = (element, scrollTo) => {
    const dom = element;
    if (element.scrollTo) {
      dom.scrollTo({ top: scrollTo, behavior: 'smooth' });
    } else {
      dom.scrollTop = scrollTo;
    }
  };

  handleLocation(locationId, locationIds) {
    this.setState({
      currentId: locationId,
      filterIds: locationIds || this.state.filterIds,
    });
    if (this.treeRef) {
      this.treeRef.scrollTo({ key: locationId });
    }
  }

  handleSave = async () => {
    const { checkedNodes, hasSkuFlag } = this.state;
    const { flatAllList, flatFilterList } = dataStore;
    const flatList = hasSkuFlag ? flatFilterList : flatAllList;
    const categories = checkedNodes.filter((f) => !f.createCatalogFlag && f.categoryId !== 'all');
    const otherParents = [];
    const getIsParent = (data, category) =>
      data.some((s) => s.categoryId === category.parentCategoryId);

    const deepGetParents = (category) => {
      if (
        category.parentCategoryId &&
        !getIsParent(categories, category) &&
        !getIsParent(otherParents, category)
      ) {
        const parentCategory = flatList.find((f) => f.categoryId === category.parentCategoryId);
        if (parentCategory) {
          otherParents.push(parentCategory);
          deepGetParents(parentCategory);
        }
      }
    };
    categories.forEach((f) => {
      deepGetParents(f);
    });
    const bodyData = [...categories, ...otherParents];
    if (bodyData.length > 0) {
      this.setState({ confirmLoading: true });
      const result = getResponse(await addCategoryToDirectory(bodyData));
      this.setState({ confirmLoading: false });
      if (result) {
        notification.success();
        this.fetchTreeList(hasSkuFlag ? 'filter' : 'all');
        return true;
      }
      return false;
    }
  };

  render() {
    const {
      checkedNodes,
      treeList = [],
      expandedKeys,
      autoExpandParent,
      searchValue,
      // searchCountA,
      // searchCountB,
      hasSkuFlag,
      allLoading,
      filterLoading,
      // inputing,
      filterIds,
      currentId,
      // locationA,
      // locationB,
    } = this.state;
    const loading = hasSkuFlag ? filterLoading : allLoading;
    // const searchCount = hasSkuFlag ? searchCountB : searchCountA;
    const checkedKeys = checkedNodes.map((m) => String(m.categoryId));
    // const wrapper = document.querySelector('.c7n-pro-modal-body');

    let currentIndex = filterIds.findIndex((f) => f === currentId);
    currentIndex = currentIndex > -1 ? currentIndex + 1 : 0;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* <div>
          <Form labelWidth={180}>
              <Switch
                label={intl
                  .get('smpc.catalogManage.model.quoteCategory')
                  .d('是否引用现有商品分类生成目录')}
                onChange={(checked) => {
                  const { allList, allCheckedNodes, filterList, filterCheckedNodes } = dataStore;
                  if (checked) {
                    this.setState({
                      hasSkuFlag: checked,
                      treeList:
                        filterList && filterList.length > 0 ? this.getTreeList(filterList) : [],
                      checkedNodes: filterCheckedNodes,
                    });
                    this.treeRef.scrollTo({ key: locationB });
                  } else {
                    this.setState({
                      hasSkuFlag: checked,
                      treeList: allList && allList.length > 0 ? this.getTreeList(allList) : [],
                      checkedNodes: allCheckedNodes,
                    });
                    this.treeRef.scrollTo({ key: locationA });
                  }
                }}
              />
            </Form>
        </div> */}
        <div className={styles['custom-tree-form']}>
          <TextField
            className="custom-tree-input"
            enterButton
            clearButton
            valueChangeAction="input"
            wait={200}
            trim="both"
            value={searchValue}
            prefix={<Icon type="search" />}
            suffix={searchValue ? `${currentIndex}/${filterIds.length}` : undefined}
            placeholder={intl.get('smpc.catalogManage.view.searchCategoryTree').d('请输入分类名称')}
            onEnterDown={(e) => this.onSearchChange(e.target.value)}
            onChange={(value) => this.setState({ searchValue: value })}
            onBlur={(e) => this.onSearchChange(e.target.value)}
          />
          <span className="custom-tree-arrow">
            <Icon
              type="expand_less"
              className={currentIndex > 1 ? 'has-pointer' : 'arrow-disible'}
              onClick={() => {
                if (currentIndex > 1) {
                  this.handleLocation(filterIds[currentIndex - 2]);
                }
              }}
            />
            <Icon
              type="expand_more"
              className={currentIndex < filterIds.length ? 'has-pointer' : 'arrow-disible'}
              onClick={() => {
                if (currentIndex < filterIds.length) {
                  this.handleLocation(filterIds[currentIndex]);
                }
              }}
            />
          </span>
        </div>
        {/* <div style={{ marginTop: 16 }}>
          {searchValue &&
            !inputing &&
            intl
              .getHTML('smpc.catalogManage.view.searchCategoryRes', {
                count: searchCount,
              })
              .d(
                <span>
                  当前搜索下有
                  <span style={{ color: 'red', fontWeight: 600 }}>{searchCount}</span>
                  条结果
                </span>
              )}
        </div> */}
        <div className={styles['tree-container']}>
          <Spin spinning={loading}>
            <Tree
              ref={(node) => {
                if (node) {
                  this.treeRef = node.tree;
                }
              }}
              checkable
              showLine={{ showLeafIcon: false }}
              showIcon
              // 三级分类显示icon
              icon={(props) => {
                if (props.data.dataRef.childs?.length > 0) {
                  return '';
                }
                return <Icon type="menu" />;
              }}
              onExpand={(keys) => this.setState({ expandedKeys: keys, autoExpandParent: false })}
              expandedKeys={expandedKeys.length > 0 ? expandedKeys : ['all']}
              defaultExpandedKeys={['all']}
              onCheck={this.onCheck}
              checkedKeys={checkedKeys}
              autoExpandParent={autoExpandParent}
            >
              {this.renderTreeNodes(treeList)}
            </Tree>
          </Spin>
        </div>
      </div>
    );
  }
}
