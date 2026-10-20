import React, { useState, useEffect } from 'react';
import { Tree, Spin } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

const treeStore = {};

// 树形组件交互
function TreePro({
  api,
  all,
  idField,
  textField,
  compose,
  readOnly,
  disabled,
  initNodes,
  onChange = (e) => e,
  storeName = 'default_tree',
}) {
  const [loading, setLoading] = useState(false);
  const [checkedKeys, setCheckKeys] = useState([]);

  const { [storeName]: initTree } = treeStore;
  const treeData = initTree || [];
  const [data] = getArrayByTree({
    treeData: [
      {
        ...all,
        children: treeData,
      },
    ],
    compose,
    readOnly,
    key: idField,
    titleField: textField,
  });

  useEffect(() => {
    if (treeData.length < 1) {
      fetchTree();
    }
  }, []);

  useEffect(() => {
    const initialKeys = getCheckedAllKeys(treeData, initNodes, idField);
    setCheckKeys(initialKeys || []);
  }, [loading]);

  async function fetchTree() {
    setLoading(true);
    const res = getResponse(await api()) || [];
    treeStore[storeName] = res;
    setLoading(false);
  }

  const handleCheckChange = (keys, { checkedNodes }) => {
    setCheckKeys(keys);
    onChange(checkedNodes);
  };

  return (
    <Spin spinning={loading}>
      <Tree
        checkable
        disabled={disabled}
        treeData={data}
        defaultExpandedKeys={['ALL']}
        checkedKeys={checkedKeys}
        onCheck={handleCheckChange}
      />
    </Spin>
  );
}

function getArrayByTree({
  treeData = [],
  key,
  parentKey,
  titleField,
  compose = { composeKey: '', composeFields: [] },
  readOnly,
  lastSelectOnly = false,
}) {
  const flatArr = [];
  const a = (list) =>
    list.forEach((item) => {
      const n = item;
      const { children, ...flatOther } = item;
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
      n.key = item[key];
      n.value = item[key];
      n.parentKey = item[parentKey];
      n.isLeaf = !isHasChild;
      n.disableCheckbox = readOnly ? true : lastSelectOnly ? isHasChild : false;
      flatArr.push(flatOther);
      if (isHasChild) {
        a(children);
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

// 右侧树
export default function openTree({
  name,
  title,
  allText,
  allField,
  idField,
  textField,
  record,
  parentField,
  readOnly,
  compose = {},
  api = (e) => e,
}) {
  let checkedNodes = record.get(name) || [];
  const all = {
    [idField]: 'ALL',
    [textField]: allText,
  };
  const children = (
    <TreePro
      api={api}
      all={all}
      idField={idField}
      textField={textField}
      compose={compose}
      readOnly={readOnly}
      onChange={(k) => {
        checkedNodes = k;
      }}
      storeName={`${name}_tree`}
      initNodes={checkedNodes}
    />
  );
  const okFn = () => {
    const isAll = checkedNodes.find((s) => s[idField] === 'ALL');
    if (isAll) {
      record.set(name, [isAll]);
      record.set(allField, 1);
      return true;
    }
    const delData = [];
    checkedNodes.forEach((f) => {
      // 如果该节点的父节点也存在，则删除该节点
      if (checkedNodes.some((s) => s[idField] === f[parentField])) {
        delData.push(f);
      }
    });
    const checkData = checkedNodes.filter((f) => !delData.some((s) => s[idField] === f[idField]));
    record.set(name, checkData);
    record.set(allField, 0);
  };
  Modal.open({
    title,
    ...modalProps,
    style: { width: 380 },
    onOk: okFn,
    afterClose: () => {
      checkedNodes = [];
    },
    children,
    footer: readOnly ? null : undefined,
  });
}
