import React, { createContext, useEffect, useMemo, useCallback, useState, useImperativeHandle } from 'react';

import { Modal, Spin } from 'choerodon-ui/pro';

import { isEmpty } from 'lodash';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

import { createTreeData, renameParamTable, deleteParamTable, getTreeData, saveParamsTable } from '@/services/appManageInterfaceService';

import { ReactComponent as NoneSvg } from '@/assets/icons/none.svg';
import StrLeftDrawing from './StrLeftDrawing';
import StrRightTable from './StrRightTable';
import ParamsCreateModal from './ParamsCreateModal';
import styles from './index.less';

const store = {
  // 存所有结构性组件下保存的数据对象
  dataMap: new Map(),
  getItem: key => store.dataMap.get(key),
  setItem: (key, value) => {
    store.dataMap.set(key, value);
  },
  delete: key => {
    store.dataMap.delete(key);
  },
};
export const Store = createContext({} as any);

const Params: React.FC<any> = ({ id, paramsCreateDs, tableDs, childRef, tenantId, tabKey }) => {
  const typeFlag = useMemo(() => {
    return tabKey === 'response';
  }, [tabKey]);

  const [state, setState] = useState({ spinFlag: false, dataSource: [], defaultSelectId: null });

  // 初始化
  const init = () => {
    if (id) {
      queryTree();
    } else {
      // 新建
      setState(preState => ({
        ...preState,
        dataSource: [],
      }));
    }
  };

  useEffect(() => {
    init();
  }, []);

  // 参数左侧树查询
  const queryTree = useCallback((selectId?: number) => {
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    getTreeData(id, typeFlag).then(res => {
      if (getResponse(res)) {
        const selectValue = selectId || selectId === 0 ? selectId : res.length > 0 ? res[0].id : null;
        // 有主表的情况下查询表格数据
        if (!isEmpty(res)) {
          // tableDs.query();
          handleTreeSelect(selectValue);
        }
        setState(preState => ({
          ...preState,
          dataSource: res,
          defaultSelectId: selectValue,
        }));
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [state.defaultSelectId]);

  // 新建表数据
  const handleCreate = useCallback(async (selectId) => {
    const validate = await paramsCreateDs.validate();
    if (!validate) {
      return false;
    } else if (paramsCreateDs.current) {
      const formValue = paramsCreateDs.current.toJSONData();
      createTreeData({ ...formValue, tenantInterfaceId: id, tenantId }, typeFlag).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({});
          queryTree(selectId);
        }
      });
    }
  }, [paramsCreateDs, tenantId]);

  // 重命名
  const handleRename = useCallback(async (selectId) => {
    const validate = await paramsCreateDs.validate();
    if (!validate) {
      return false;
    } else if (paramsCreateDs.current) {
      const formValue = paramsCreateDs.current.toJSONData();
      renameParamTable({ ...formValue, tenantInterfaceId: id }, typeFlag).then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success({});
          queryTree(selectId);
        }
      });
    }
  }, [paramsCreateDs]);

  // 打开新建弹窗
  const openCreateModal = useCallback((object: any = {}) => {
    // 未保存接口时不可新建主表
    if (!id) {
      return;
    }
    const { type = 'create', domEvent = '', formValue = null, idValue = '' } = object;
    if (domEvent) {
      domEvent.stopPropagation();
    }
    if (paramsCreateDs.current) {
      if (type === 'rename') {
        paramsCreateDs.current.set(formValue);
      } else {
        paramsCreateDs.reset();
        if (type === 'add') {
          // 新建关联关系
          paramsCreateDs.current.set('parentId', idValue);
        } else {
          // 新建主表
          paramsCreateDs.current.set('relationType', 'MAIN');
        }
      }
    }

    Modal.open({
      title: type === 'create' ?
        intl.get('hitf.common.create.primary.table').d('新建主表') :
        type === 'add' ?
          intl.get('hitf.common.create.relation.table').d('新建关联关系') :
          intl.get('hzero.common.button.rename').d('重命名'),
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 380 },
      children: <ParamsCreateModal formDs={paramsCreateDs} type={type} />,
      // className: styles['interface-definition-modal'],
      onOk: type === 'rename' ? () => handleRename(state.defaultSelectId) : () => handleCreate(state.defaultSelectId),
    });
  }, [paramsCreateDs, state.defaultSelectId, tenantId]);

  // 删除关系表
  const handleDeleteTable = useCallback((event, selectedObj) => {
    event.stopPropagation();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      maskClosable: true,
      destroyOnClose: true,
      children: <div>{intl.get('hzero.common.component.excelExport.v.hd.deleteTemplate.confirm').d('确认删除吗')}</div>,
      onOk: () => handleConfirmDelete(selectedObj),
    });
  }, [state.defaultSelectId]);

  const handleConfirmDelete = useCallback((selectedObj) => {
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    deleteParamTable(selectedObj, typeFlag).then(res => {
      const result = getResponse(res);
      if (result) {
        notification.success({});
        const dataValue: any = state.dataSource;
        // 删除后重新加载
        // 若删除的表为当前选中的表，删除后清空右侧表格数据
        queryTree(id === state.defaultSelectId ? dataValue.length > 0 ? dataValue[0].id : null : state.defaultSelectId);
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [state.dataSource, state.defaultSelectId]);

  // 选中其他树节点
  const handleTreeSelect = useCallback((treeId) => {
    const changeData = tableDs.toJSONData();
    if (!isEmpty(changeData) && treeId !== state.defaultSelectId) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        maskClosable: true,
        destroyOnClose: true,
        children: <div>{intl.get('hitf.common.save.to.change.treeNode').d('请确认是否保存后切换数据')}</div>,
        onOk: () => handleChangeAndSave(treeId),
        onCancel: () => changeTreeNode(treeId),
      });
    } else {
      changeTreeNode(treeId);
    }
  }, [tableDs, state.defaultSelectId]);

  const changeTreeNode = useCallback((treeId) => {
    setState(preState => ({
      ...preState,
      defaultSelectId: treeId,
    }));
    tableDs.setQueryParameter('interfaceParamHeaderId', treeId);
    tableDs.query();
  }, [tableDs]);

  // 表格数据保存
  const handleTableSave = useCallback(async () => {
    const validate = await tableDs.validate();
    if (!validate) {
      return;
    }
    const paramsTableData = tableDs.toJSONData();
    if (isEmpty(paramsTableData)) {
      // 表格数据未修改点保存，不进行查询
      notification.success({});
      return;
    }
    paramsTableData.forEach((item) => {
      item.tenantId = tenantId;
      // 新建时候没有传tenantInterfaceId，这里给加一下。
      if (!item.tenantInterfaceId) {
        item.tenantInterfaceId = id;
      }
    });
    // 校验参数维护-反馈是否只有一个响应标识
    if(typeFlag) {
      const isResponseArr: string[] = [];
      tableDs.forEach((item) => {
        if(item.get('isResponse') === '1') {
          isResponseArr.push(item.get('isResponse'));
        }
      });
      if(isResponseArr.length > 1) {
        notification.warning({
          message: intl.get('hitf.common.isResponse.field.only').d('响应字段有且只能有一个'),
        });
        return;
      }
    }
    setState(preState => ({
      ...preState,
      spinFlag: true,
    }));
    saveParamsTable(paramsTableData, typeFlag).then(res => {
      const result = getResponse(res);
      if (result) {
        tableDs.query();
        notification.success({});
      }
    }).finally(() => {
      setState(preState => ({
        ...preState,
        spinFlag: false,
      }));
    });
  }, [tableDs, state.dataSource, tenantId]);

  // 切换树目录时若有新增或修改的值保存再切换
  const handleChangeAndSave = useCallback(async (treeId) => {
    await handleTableSave();
    changeTreeNode(treeId);
  }, [handleTableSave, changeTreeNode]);

  const strLeftDrawingProps = useMemo(() => {
    return {
      openModal: openCreateModal,
      handleDelete: handleDeleteTable,
      dataSource: state.dataSource,
      handleSelect: handleTreeSelect,
      defaultSelectId: state.defaultSelectId,
      typeFlag,
    };
  }, [state.dataSource, state.defaultSelectId, tableDs, tenantId, openCreateModal]);

  const strRightTableProps = useMemo(() => {
    return {
      tableDs,
      defaultSelectId: state.defaultSelectId,
      handleSave: handleTableSave,
      typeFlag,
    };
  }, [state.defaultSelectId, tableDs, handleTableSave]);

  // 暂无主表
  const renderNoData = useMemo(() => {
    const desc = intl.get('hitf.common.create.params.info');
    const [descPre, descBehind] = desc.split('{name}');
    return (
      <div className={styles['params-nodata']}>
        <div className={styles['none-content-svg']}>
          <NoneSvg />
        </div>
        {/* <div className={styles['params-nodata-info']}>{intl.get('hitf.common.no.params').d('暂无数据')}</div> */}
        <div className={styles['params-nodata-tip']}>
          <span>{descPre}</span>
          <span
            className={styles['create-param']}
            style={{ cursor: id ? 'pointer' : 'not-allowed', color: !id ? '#000' : '' }}
            onClick={() => openCreateModal({ type: 'create' })}
          >
            {intl.get('hitf.common.create.table').d('新建主表')}
          </span>
          <span>{descBehind}</span>
        </div>
      </div>
    );
  }, [tenantId]);

  useImperativeHandle(childRef, () => ({
    paramsTree: state.dataSource,
    paramsTreeInit: init,
  }));

  return (
    <Spin spinning={state.spinFlag}>
      {
        !state.dataSource.length ? renderNoData :
          (
            <div className={styles['params-bottom']}>
              <StrLeftDrawing {...strLeftDrawingProps} />
              <StrRightTable {...strRightTableProps} />
            </div>
          )
      }
    </Spin>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(Params));
