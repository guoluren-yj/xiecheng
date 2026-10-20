import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, Tree, Menu, Dropdown, Spin, Modal, TextField } from 'choerodon-ui/pro';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import classnames from 'classnames';
import interfaceDefinition from '@/models/interfaceDefinition';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { getTreeValue, addApiCategory, renameApiCategory, deleteApiCategory } from '@/services/interfaceDefinitionService';

import ApiForm from './ApiForm';
import styles from './index.less';

interface LeftTreeProps {
  treeDs: DataSet,
  tableDs: DataSet,
}

function nodeRenderer(record, openModal, handleSelect, handleDelete) {
  const { interfaceCategoryCode, interfaceCategoryName, applicationTypeCode, interfaceCount, id, objectVersionNumber, _token } = record.get(['interfaceCategoryCode', 'interfaceCategoryName', 'applicationTypeCode', 'interfaceCount', 'id', 'objectVersionNumber', '_token']);

  const menu = (
    <Menu>
      <Menu.Item
        key="rename"
        onClick={({ domEvent }) => openModal('rename', domEvent, { id, objectVersionNumber, interfaceCategoryName, applicationTypeCode, interfaceCategoryCode, _token })}
      >
        <span>
          {intl.get('hzero.common.button.rename').d('重命名')}
        </span>
      </Menu.Item>
      <Menu.Item
        key="delete"
        onClick={({ domEvent }) => handleDelete(domEvent, id)}
      >
        <span>
          {intl.get('hzero.common.btn.delete').d('删除')}
        </span>
      </Menu.Item>
    </Menu>
  );
  return (
    <span className={styles['node-title']} onClick={() => handleSelect(id, interfaceCategoryCode)}>
      <span className={styles['node-title-text']}>{interfaceCategoryCode}&nbsp;&nbsp;{interfaceCategoryName}&nbsp;&nbsp;{interfaceCount}</span>
      <span className={styles['node-title-dropdown']}>
        <Dropdown overlay={menu} trigger={[Action.hover]}>
          <Icon type="more_vert" />
        </Dropdown>
      </span>
    </span>
  );
};

const LeftTree: React.FC<LeftTreeProps> = ({ treeDs, tableDs }) => {
  const [state, setState] = useState({
    optionsArr: [],
    selectValue: '',
    treeNodeArr: [],
    spinFlag: false,
    selectedId: interfaceDefinition.selectedId || 'all',
    selectedCode: interfaceDefinition.selectedCode || 'all',
  });

  const formRef = useRef();

  useEffect(() => {
    handleLoad();
  }, []);

  const handleLoad = useCallback(() => {
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));

    // 查询树目录值，给树目录和检索树目录set值
    getTreeValue().then(res => {
      const result = getResponse(res);
      setState(preState => ({
        ...preState,
        treeNodeArr: result || [],
      }));
      treeDs.loadData(result || []);
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [treeDs]);

  // 树目录选中
  const handleSelect = useCallback((id, code) => {
    interfaceDefinition.setSelectedCode(code);
    interfaceDefinition.setSelectedId(id);
    setState(preState => ({
      ...preState,
      selectedId: id,
      selectedCode: code,
    }));
    tableDs.setQueryParameter('interfaceCategory', code === 'all' ? null : code);
    tableDs.query();
  }, []);

  const formDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'interfaceCategoryName',
            type: FieldType.intl,
            label: intl.get('hitf.common.api.category.name').d('类别名称'),
            required: true,
          },
          {
            name: 'interfaceCategoryCode',
            type: FieldType.string,
            label: intl.get('hitf.common.api.category.code').d('类别编码'),
            required: true,
          },
          {
            name: 'applicationTypeCode',
            type: FieldType.string,
            label: intl.get('hitf.application.type').d('应用类型'),
            required: true,
            lookupCode: 'HITF.OPEN.APPLICATION_TYPE',
          },
        ],
      })
    , []);

  const handleChange = useCallback((value) => {
    if (value) {
      const filterTreeNode = state.treeNodeArr.filter((item: any) => item.interfaceCategoryCode.includes(value) || item.interfaceCategoryName.includes(value));
      treeDs.loadData(filterTreeNode || []);
    } else {
      treeDs.loadData(state.treeNodeArr);
    }
    // 筛选后默认选中全部节点
    handleSelect('all', 'all');
  }, [treeDs, state.treeNodeArr]);

  // 删除API类别
  const handleDelete = useCallback((event, id) => {
    event.stopPropagation();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      maskClosable: true,
      destroyOnClose: true,
      children: <div>{intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗')}</div>,
      onOk: () => handleConfirmDelete(id),
    });
  }, [state.selectedId]);

  const handleConfirmDelete = useCallback((id) => {
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    deleteApiCategory(id).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
        handleLoad();
        if (state.selectedId === id) {
          // 删除的节点为选中的节点
          handleSelect('all', 'all');
        }
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [treeDs, state.selectedId]);

  // 重命名/新增API类别保存
  const handleSave = useCallback(async(obj) => {
    const childRef: any = formRef.current;
    if (childRef.flag) {
      // 新增-若编码重复则不保存
      return false;
    }
    const validResult = await formDs.validate();
    if(!validResult) {
      return false;
    }
    if (formDs.current) {
      const { interfaceCategoryName, interfaceCategoryCode, applicationTypeCode, _tls } = formDs.current.toData();
      if (!interfaceCategoryName) {
        return false;
      } else if (!obj && interfaceCategoryCode) {
        setState(preState => ({
          ...preState,
          spinFlag: true,
        }));
        // 新增
        addApiCategory(interfaceCategoryName, interfaceCategoryCode, applicationTypeCode, _tls).then(res => {
          const result = getResponse(res);
          if (result) {
            notification.success({});
            handleLoad();
          }
        }).finally(() => {
          setState(preState => ({
            ...preState,
            spinFlag: false,
          }));
        });
      } else if (obj) {
        setState(preState => ({
          ...preState,
          spinFlag: true,
        }));
        // 重命名
        const { id, objectVersionNumber } = obj;
        renameApiCategory(id, interfaceCategoryName, objectVersionNumber, applicationTypeCode, _tls).then(res => {
          const result = getResponse(res);
          if (result) {
            notification.success({});
            handleLoad();
          }
        }).finally(() => {
          setState(preState => ({
            ...preState,
            spinFlag: false,
          }));
        });
      } else {
        return false;
      }
    }
  }, [formDs, treeDs]);

  // 新建/重命名弹窗
  const openModal = useCallback((type, event, obj?: Object) => {
    event.stopPropagation();
    Modal.open({
      title: type === 'add' ?
        intl.get('hitf.common.create.api.category').d('新建API类别') :
        intl.get('hzero.common.button.rename').d('重命名'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      children: <ApiForm formDs={formDs} treeDs={treeDs} obj={obj} childRef={formRef} />,
      onOk: () => handleSave(obj),
      afterClose: () => {
        formDs.reset();
      },
    });
  }, [formDs, treeDs]);

  return (
    <Spin spinning={state.spinFlag}>
      <div className={styles['left-tree']}>
        <div className={styles['left-tree-header']}>
          {intl.get('hitf.common.api.type').d('API类别')}
        </div>
        <div className={styles['left-tree-select']}>
          <TextField
            clearButton
            prefix={<Icon type="search" />}
            onChange={handleChange}
            style={{ width: '100%' }}
            placeholder={
              intl
                .get('hitf.common.api.filter.codeAndName')
                .d('请输入类别编码、类别名称查询')
            }
          />
        </div>
        <div
          className={classnames(
              styles['left-tree-all'],
              state.selectedId === 'all' ? styles['left-tree-all-select'] : null,
            )}
          onClick={() => handleSelect('all', 'all')}
        >
          <span>{intl.get('hitf.common.interface.tree.all').d('All 全部')}</span>
          <Icon type="add" onClick={(e) => openModal('add', e)} />
        </div>
        <Tree
          dataSet={treeDs}
          renderer={({ record }) =>
              nodeRenderer(record, openModal, handleSelect, handleDelete)
            }
          selectedKeys={[state.selectedId]}
        />
      </div>
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common'],
})(LeftTree));
