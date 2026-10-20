import React, { useState } from 'react';
import { Tree } from 'choerodon-ui';
import { Lov, Modal } from 'choerodon-ui/pro';

// 树形组件交互
function TreePro({ initialKeys, treeData, onChange = (e) => e }) {
  const [checkedKeys, setCheckKeys] = useState(initialKeys || []);

  const handleCheckChange = (keys, { checkedNodes }) => {
    setCheckKeys(keys);
    onChange(checkedNodes);
  };

  return (
    <Tree checkable treeData={treeData} checkedKeys={checkedKeys} onCheck={handleCheckChange} />
  );
}

function getArrayByTree({ treeData = [], key, parentKey, title, lastSelectOnly = false }) {
  const flatArr = [];
  const a = (list) =>
    list.forEach((item) => {
      const n = item;
      const { children, ...flatOther } = item;
      const isHasChild = children && children.length > 0;
      n.title = item[title];
      n.key = item[key];
      n.value = item[key];
      n.parentKey = item[parentKey];
      n.isLeaf = !isHasChild;
      n.disableCheckbox = lastSelectOnly ? isHasChild : false;
      flatArr.push(flatOther);
      if (isHasChild) {
        a(children);
      }
    });
  a(treeData);
  return [treeData, flatArr];
}

export default function ProLov(props) {
  const {
    name,
    record,
    title,
    idField,
    textField,
    parentField,
    treeData,
    modalWidth = 360,
  } = props;

  function handleShowTree() {
    let checkedNodes = record.get(name) || [];
    const checkedKeys = checkedNodes.map((m) => m[idField]);
    const [_treeData] = getArrayByTree({ treeData, key: idField, title: textField });
    const children = (
      <TreePro
        initialKeys={checkedKeys}
        treeData={_treeData}
        onChange={(k) => {
          checkedNodes = k;
        }}
      />
    );
    Modal.open({
      title,
      mask: true,
      drawer: true,
      movable: false,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      style: { width: modalWidth },
      onOk: () => handleTreeOK(checkedNodes),
      afterClose: () => {
        checkedNodes = [];
      },
      children,
    });
  }

  // 树形选中
  function handleTreeOK(checkedNodes = []) {
    const isAll = checkedNodes.find((s) => s[idField] === 'ALL');
    if (isAll) {
      record.set(name, [isAll]);
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
  }

  return <Lov onClick={handleShowTree} />;
}
