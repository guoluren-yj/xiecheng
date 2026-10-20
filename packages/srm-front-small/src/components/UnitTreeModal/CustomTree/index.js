import React, { useRef, useState, useEffect } from 'react';
import { Tree, Spin, Icon, Alert } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';

import styles from './index.less';

const treeStore = {};

// 树形组件交互
export default function CustomTree({
  api,
  all,
  idField,
  textField,
  parentField,
  compose,
  readOnly,
  disabled,
  initNodes,
  whole = true,
  placeholder,
  disableData = [],
  onChange = (e) => e,
  childField = 'children',
  storeName = 'default_tree',
  siggle, // 只搜索一级的
  expands: defaultExpands,
  alertProps,
}) {
  const treeRef = useRef();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedKeys, setCheckKeys] = useState([]);
  const [expands, setExpands] = useState({
    expandedKeys: defaultExpands,
    autoExpandParent: true,
    firstInit: true,
  });
  const [filterData, setFilterData] = useState({
    currentId: '',
    filterIds: [],
  });

  const { expandedKeys, autoExpandParent, firstInit } = expands;
  const { currentId, filterIds } = filterData;

  const { [storeName]: initTree } = treeStore;
  const treeData = initTree || [];
  const _treeData = whole ? [{ ...all, [childField]: treeData }] : treeData;

  const [data, flatData] = getArrayByTree({
    treeData: _treeData,
    compose,
    readOnly,
    childField,
    key: idField,
    parentKey: parentField,
    titleField: textField,
  });

  useEffect(() => {
    if (treeData.length < 1) {
      fetchTree();
    }
  }, []);

  useEffect(() => {
    const initialKeys = getCheckedAllKeys(treeData, initNodes, idField);
    setCheckKeys((initialKeys || []).map((m) => String(m)));
  }, [loading]);

  async function fetchTree() {
    setLoading(true);
    const res = getResponse(await api()) || [];
    treeStore[storeName] = siggle ? res?.map((r) => ({ ...r, children: null })) : res;
    setLoading(false);
  }

  useEffect(() => {
    if (treeStore[storeName] && firstInit && readOnly) {
      const newExpandKeys = [...expandedKeys];
      const getKey = (allData, parent) => {
        allData.forEach((key) => {
          if (parent) {
            if (allData.map((a) => a[idField]).some((a) => newExpandKeys.some((b) => b === a))) {
              newExpandKeys.push(parent[idField]);
            }
          }
          if (key[childField]) {
            getKey(key[childField] || [], key);
          }
        });
      };
      getKey(treeStore[storeName] || []);
      setExpands({ expandedKeys: newExpandKeys, autoExpandParent: true });
    }
  }, [expandedKeys, treeStore[storeName]]);

  const handleCheckChange = (keys, { checkedNodes }) => {
    setCheckKeys(keys);
    onChange(checkedNodes.map((m) => m.dataRef || m));
  };

  const handleSearchChange = (val) => {
    const dataList = [];
    // 获取树所有行数据
    const generateList = (_data, position = 0) => {
      for (let i = 0; i < _data.length; i++) {
        const { children, ...other } = _data[i];
        dataList.push({ ...other, position: position + i });
        if (children) {
          generateList(children, position + i + 1);
        }
      }
    };
    generateList(treeData);
    if (dataList.length === 0) return;
    let _location;
    const expandParentKeys = [];
    // 向上递归获取所有要展开的节点
    const deepGetAllParentKeys = (parentKey) => {
      // 是否存在该父级节点
      const findParent = flatData.find((f) => String(f[idField]) === parentKey);
      const isExpand = expandParentKeys.includes(parentKey);
      // 是否已经存在该展开节点
      if (!isExpand) expandParentKeys.push(parentKey);
      // 如果该节点还未展开，并且存在向上的父节点
      if (!isExpand && findParent && findParent[parentField]) {
        deepGetAllParentKeys(String(findParent[parentField]));
      }
    };
    const _expandedKeys = dataList
      .map((item) => {
        if (val && item.title?.indexOf?.(val) > -1) {
          if (!_location) _location = String(item[idField]);
          if (item[parentField]) deepGetAllParentKeys(String(item[parentField]));
          return String(item[idField]);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);

    setValue(val);
    setFilterData({ currentId: _location, filterIds: _expandedKeys });
    setExpands({ expandedKeys: [...expandParentKeys, ..._expandedKeys], autoExpandParent: true });
    if (val && _location) {
      handleLocation(_location, _expandedKeys);
    }
    if (!val) {
      const { [idField]: topLocation } = treeData[0] || {};
      handleLocation(topLocation ? String(topLocation) : '', []);
    }
  };

  function handleLocation(locationId, locationIds) {
    setFilterData({ currentId: locationId, filterIds: locationIds || filterIds });
    if (treeRef.current) {
      treeRef.current.scrollTo({ key: locationId });
    }
  }

  let currentIndex = filterIds.findIndex((f) => f === currentId);
  currentIndex = currentIndex > -1 ? currentIndex + 1 : 0;

  const _expandedKeys = ['ALL', ...(expandedKeys || [])];

  return (
    <Spin spinning={loading} wrapperClassName={styles['custom-tree-container']}>
      {alertProps && <Alert {...alertProps} />}
      <div className="custom-tree-form">
        <TextField
          clearButton
          value={value}
          style={{ width: '92%', marginRight: 8 }}
          valueChangeAction="input"
          placeholder={placeholder}
          prefix={<Icon type="search" />}
          suffix={value ? `${currentIndex}/${filterIds.length}` : undefined}
          onChange={handleSearchChange}
        />
        <span className="custom-tree-arrow">
          <Icon
            type="expand_less"
            className={currentIndex > 1 ? 'has-pointer' : 'arrow-disible'}
            onClick={() => {
              if (currentIndex > 1) {
                handleLocation(filterIds[currentIndex - 2]);
              }
            }}
          />
          <Icon
            type="expand_more"
            className={currentIndex < filterIds.length ? 'has-pointer' : 'arrow-disible'}
            onClick={() => {
              if (currentIndex < filterIds.length) {
                handleLocation(filterIds[currentIndex]);
              }
            }}
          />
        </span>
      </div>
      <Tree
        showLine={{
          showLeafIcon: false,
        }}
        showIcon={false}
        checkable
        disabled={disabled}
        // treeData={data}
        checkedKeys={checkedKeys}
        onCheck={handleCheckChange}
        ref={(node) => {
          if (node) {
            treeRef.current = node.tree;
          }
        }}
        expandedKeys={_expandedKeys}
        autoExpandParent={autoExpandParent}
        onExpand={(keys) => setExpands({ expandedKeys: keys, autoExpandParent: false })}
        defaultEexpandedKeys={_expandedKeys}
        // height='calc(100vh - 1.68rem - 56px)'
        // style={{ maxHeight: 'calc(100vh - 1.68rem - 56px)', overflowY: 'auto' }}
      >
        {renderTreeNodes(data, { val: value, idField, disableData })}
      </Tree>
    </Spin>
  );
}

function getChildDisabled(node, idField, disableData = []) {
  let disabled = false;
  const deepChildDisable = (childs) => {
    childs.forEach((f) => {
      if (disableData.some((s) => s[idField] === f[idField])) {
        disabled = true;
        return true;
      }
      if (f.children && f.children.length > 0) {
        deepChildDisable(f.children);
      }
    });
  };
  if (node.children && node.children.length > 0) {
    deepChildDisable(node.children);
  }
  return disabled;
}

/**
 * 加载子节点
 * @param {Array} data - 树节点
 */
function renderTreeNodes(treeData, props = {}) {
  const { val, idField, disabled, disableData = [] } = props;
  const value = val || '';
  return treeData.map((item) => {
    const index = item.title?.indexOf(value);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + value.length);
    const _disabled = disabled || disableData.some((s) => s[idField] === item[idField]);
    const childDisable = getChildDisabled(item, idField, disableData);
    const nodeDisabled = _disabled || childDisable;
    const title =
      index > -1 ? (
        <span>
          {beforeStr}
          <span className='primary-color'>{value}</span>
          {afterStr}
        </span>
      ) : (
        <span>{item.title}</span>
      );
    if (item.children) {
      const childProps = {
        ...props,
        disabled: _disabled,
      };
      return (
        <Tree.TreeNode
          disabled={item.disableCheckbox || nodeDisabled}
          title={title}
          key={item.key}
          dataRef={item}
        >
          {renderTreeNodes(item.children, { ...childProps })}
        </Tree.TreeNode>
      );
    }
    return (
      <Tree.TreeNode
        title={title}
        key={item.key}
        dataRef={item}
        disabled={item.disableCheckbox || nodeDisabled}
      />
    );
  });
}

function getArrayByTree({
  treeData = [],
  key,
  parentKey,
  childField,
  titleField,
  compose = { composeKey: '', composeFields: [] },
  readOnly,
  lastSelectOnly = false,
}) {
  const flatArr = [];
  const a = (list) =>
    list.forEach((item) => {
      const n = item;
      const { [childField]: children, ...flatOther } = item;
      const isHasChild = children && children.length > 0;
      if (compose && compose.composeKey && compose.composeFields.length) {
        let composeVal = '';
        compose.composeFields.forEach((field) => {
          if (n[field]) {
            if (composeVal) {
              composeVal = `${composeVal}-${n[field]}`;
            } else {
              composeVal = n[field];
            }
          }
        });
        n.title = composeVal;
        n[compose.composeKey] = composeVal;
      } else {
        n.title = n[titleField];
      }
      n.key = String(item[key]);
      n.value = String(item[key]);
      n.parentKey = String(item[parentKey]);
      n.children = children;
      n.isLeaf = !isHasChild;
      n.disableCheckbox = readOnly ? true : lastSelectOnly ? isHasChild : false;
      flatArr.push(flatOther);
      if (isHasChild) {
        a(children, String(item[key]));
      }
    });
  a(treeData);
  return [treeData, flatArr];
}

function getCheckedAllKeys(data, nodes, idField) {
  const allKeys = [];

  if (nodes.some((s) => s[idField] === 'ALL')) {
    return ['ALL'];
  }

  const deepGetAllKeys = (_data) => {
    _data.forEach((f) => {
      allKeys.push(f[idField]);
      if (f.children) {
        deepGetAllKeys(f.children);
      }
    });
  };

  const deepGetChilds = (_data) => {
    _data.forEach((f) => {
      if (nodes.some((s) => s[idField] === f[idField])) {
        allKeys.push(f[idField]);
        if (f.children) {
          deepGetAllKeys(f.children);
        }
      } else {
        deepGetChilds(f.children || []);
      }
    });
  };

  deepGetChilds(data);

  return allKeys;
}
