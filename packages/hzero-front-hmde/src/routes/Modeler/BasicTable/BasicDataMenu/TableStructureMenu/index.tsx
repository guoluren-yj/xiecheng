import React, { useContext, useState, useImperativeHandle, useEffect, useRef } from 'react';
import { DataSet, Icon, Dropdown, Menu, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Tooltip, Tree } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import { Size } from 'choerodon-ui/pro/lib/core/enum';
import classNames from 'classnames';

import {
  tableRefresh,
  tableDeleteService,
  serviceRefreshService,
} from '@/services/modelBaseService';
import { useRequestPro } from '@/routes/Modeler/hooks';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import Modal from '@/components/LowcodeModal';
import ImgIcon from '@/utils/ImgIcon';

import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import { TargetType } from '@/globalData/common';

import { TreeNodeProps } from 'choerodon-ui/lib/tree';
import styles from '../../index.less';
import AddTableModel from './AddTableModel';
import UploadFields from './UploadFields'; // 文件上传
import BatchModel from '../../BatchModel';
import { SingleTagDistribute } from '../../../hooks/tags';

const TreeNode = Tree.TreeNode as React.FC<TreeNodeProps & { dataStorage?: any }>;
const { confirm } = Modal;

interface IIndex {
  searchName?: string;
  leftMenuDs: DataSet;
}

export default observer(({ searchName = '', leftMenuDs }: IIndex) => {
  const {
    globalLoading,
    ref: { listMenuRef, baseTableDetailRef, indexTableDetailRef, menuSelectRef, addTableModelRef },
    setDataStore,
    storeData: {
      // tableId,
      tableName,
      // tableType,
      refreshNum,
      viewType,
      _tenantId,
      level,
      selectedTableKey,
    },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const isTenantRole = isTenantRoleLevel();

  const uploadRef: any = useRef();
  const isSubmitOkRef: any = useRef(null);
  const [treeDataList, setTreeDataList] = useState<any>([]); // 树形数据 fixme 确实没有接口 此数据从ds中拿到

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [clickServiceName, setClickServiceName] = useState<string>(); // 当前点击要刷新的服务节点名称
  const [visible, setVisible] = useState<boolean>(false); // 下拉菜单显示
  const [curTreeNode, setCurTreeNode] = useState<string>('');
  const [cur, setCur] = useState<string>('');

  // 同步
  const [, treeRefreshLoading, treRefreshRun] = useRequestPro(serviceRefreshService);
  const [, refreshLoading, refreshRun] = useRequestPro(tableRefresh);
  // 左侧列表重置

  interface IParams {
    name?: string;
    isResetPage?: boolean;
    labelCodeList?: any[];
    tableTypeList?: string[];
  }
  type ILeftMenuDsQuery = (param: IParams) => any; // fixme
  const leftMenuDsQuery: ILeftMenuDsQuery = async (params = {}) => {
    // FIXME:
    const { name, tableTypeList = '' } = params;
    leftMenuDs.setQueryParameter('page', null);
    leftMenuDs.setQueryParameter('size', null);
    if (!isEmpty(tableTypeList)) {
      leftMenuDs.setQueryParameter('tableTypeList', tableTypeList.toString());
    }
    leftMenuDs.setQueryParameter('name', name);
    setDataStore('globalLoading', true, true);
    const data = await leftMenuDs.query();
    setDataStore('globalLoading', false, true);
    const changeData: any = changeResponse(data);
    setTreeDataList(changeData);
    return changeData;
  };
  useImperativeHandle(listMenuRef, () => ({
    leftMenuDsQuery: () => findTreeNodePathByName(''),
  }));
  useImperativeHandle(menuSelectRef, () => ({
    handleExpandedOpenAll, // 展开所有节点
    handleExpandedCloseAll, // 关闭展开的所有节点
    findTreeNodePathByName, // 搜索过滤
    leftMenuDsQuery, // 列表刷新
    handleFilleter,
    onSelect,
  }));
  useEffect(() => {
    // 初始化查询
    if (viewType === 'serviceView') {
      leftMenuDsQuery({}); // fixme
    }
  }, [viewType, _tenantId]);

  function onSelect(keys: string[]) {
    if (keys.length === 0) return;
    const [tId, tCode, tType, dataSourceType, , createTableFlag, editTableFlag] = keys[0].split(
      '&'
    );
    if (tId === 'db' || tId === 'service') return;
    setDataStore('refDataSourceType', dataSourceType);
    setDataStore('tableType', tType);
    setDataStore('tableId', tId);
    setDataStore('tableName', tCode);
    setDataStore('createTableFlag', +createTableFlag);
    setDataStore('editTableFlag', +editTableFlag);
    setDataStore('selectedTableKey', keys[0]);
  }

  type IGetTitle = (name: string, grade: string) => React.ReactElement;
  const getTitle: IGetTitle = (name, grade = '1') => {
    const index: number = name.indexOf(searchName);
    const beforeStr: string = name.substr(0, index);
    const afterStr: string = name.substr(index + searchName.length);
    let _width: string | number = 0;
    switch (grade) {
      case '1':
        _width = '180px';
        break;
      case '2':
        _width = '156px';
        break;
      case '3':
        _width = '140px';
        break;
      default:
        break;
    }
    const title =
      index > -1 ? (
        <Tooltip title={name}>
          <span className={styles['tree-item-title']} style={{ width: _width }}>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchName}</span>
            {afterStr}
          </span>
        </Tooltip>
      ) : (
        <Tooltip title={name}>
          <span className={styles['tree-item-title']} style={{ width: _width }}>
            {name}
          </span>
        </Tooltip>
      );
    return title;
  };

  const handelSynchronization = async (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    value: any
  ) => {
    Modal.warning({
      lowcodeSize: 'small',
      title: (
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.647058823529412)',
            fontWeight: 700,
          }}
        >
          同步警告
        </span>
      ),
      children: (
        <div>
          <p>
            同步将会覆盖原先的信息，<span style={{ color: '#1890FF' }}>您要继续同步吗？</span>
          </p>
        </div>
      ),
      onOk: async () => {
        setClickServiceName(value.serviceCode); // 设置选中
        // 同步
        if (e) {
          e.stopPropagation();
        }
        const res = await (treRefreshRun as any)?.({ query: { serviceCode: value.serviceCode } });
        if (res) {
          notification.success({
            message: '同步成功！',
          } as any);
          await leftMenuDsQuery({});
          const result = (leftMenuDs.toData() || []).find((item: any) => item.name === tableName); // fixme
          if (!result) {
            setDataStore('tableName', null);
            return;
          }
          if (
            baseTableDetailRef &&
            baseTableDetailRef.current &&
            baseTableDetailRef.current.baseTableDetailRefresh
          ) {
            baseTableDetailRef.current.baseTableDetailRefresh();
          }
          if (
            indexTableDetailRef &&
            indexTableDetailRef.current &&
            indexTableDetailRef.current.indexTableDetailRefresh
          ) {
            indexTableDetailRef.current.indexTableDetailRefresh();
          }
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
    });
  };

  /**
   * 删除
   */
  const handelDeleteTable = async (nodeData) => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    const submitOk = (await confirm('您确定要删除吗？', 'small')) === 'ok';
    isSubmitOkRef.current = null;
    if (!submitOk) return;
    const res = await tableDeleteService({ body: nodeData });
    if (res && res.failed) {
      notification.error({
        message: '错误',
        description: res.message,
      });
    } else {
      notification.success({
        message: '删除成功！',
      } as any);
      setDataStore('tableName', null);
      leftMenuDsQuery({});
    }
  };

  /**
   * 单表同步
   */
  const handelTableSynchronization = async (nodeData) => {
    if (!isSubmitOkRef.current) {
      isSubmitOkRef.current = 'opening';
    } else if (isSubmitOkRef.current === 'opening') {
      return;
    }
    Modal.warning({
      lowcodeSize: 'small',
      title: (
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.647058823529412)',
            fontWeight: 700,
          }}
        >
          同步警告
        </span>
      ),
      children: (
        <div>
          <p>
            同步将会覆盖原先的信息，<span style={{ color: '#1890FF' }}>您要继续同步吗？</span>
          </p>
        </div>
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          {okBtn}
        </div>
      ),
    }).then(async (button) => {
      isSubmitOkRef.current = null;
      if (button === 'ok') {
        const res = await (refreshRun as any)?.(nodeData.id);
        if (typeof res === 'object') {
          notification.success({
            message: '同步成功！',
          } as any);
          setDataStore('tableType', nodeData.type);
          setDataStore('tableId', nodeData.id);
          setDataStore('tableName', nodeData.name);
          if (
            baseTableDetailRef &&
            baseTableDetailRef.current &&
            baseTableDetailRef.current.baseTableDetailRefresh
          ) {
            ((baseTableDetailRef || {}).current || {}).baseTableDetailRefresh();
          }
          if (
            indexTableDetailRef &&
            indexTableDetailRef.current &&
            indexTableDetailRef.current.indexTableDetailRefresh
          ) {
            ((indexTableDetailRef || {}).current || {}).indexTableDetailRefresh();
          }
          leftMenuDsQuery({});
        } else {
          notification.error({
            message: '错误',
            description: res.message,
          });
        }
      }
    });
  };

  interface INodeData {
    grade: string;
    type: string;
    name: string;
    id: string | number;
    schemaName: string;
    dataSourceType: string;
    serviceCode: string;
    code: string;
    editTableFlag: number;
    createTableFlag: number;
  }
  type IEditMoreColumn = (nodeData: INodeData) => React.ReactElement;
  const editMoreColumn: IEditMoreColumn = (nodeData) => {
    const isPositive =
      nodeData.type === 'POSITIVE' ||
      nodeData.type === 'REDUNDANT' ||
      nodeData.type === 'REDUNDANT_X'; // 是否正向见表
    const isRedundant = nodeData.type === 'REDUNDANT' || nodeData.type === 'REDUNDANT_X'; // 是否扩展
    const gradeTable = nodeData.grade === 'table';

    return (
      <Menu style={{ zIndex: 998 }}>
        {gradeTable && isPositive && nodeData.editTableFlag && (
          <Menu.Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
              handelDeleteTable(nodeData);
            }}
          >
            {/* <Icon type="delete" /> */}
            <ImgIcon
              name="delete-black.svg"
              size={16}
              style={{ width: 18, marginRight: '0.1rem' }}
            />
            <span>删除</span>
          </Menu.Item>
        )}
        {!isTenantRole && level !== 'tenant' && gradeTable && !isPositive && (
          <Menu.Item
            onClick={
              refreshLoading
                ? () => {}
                : (e) => {
                    if (e && e.domEvent) {
                      e.domEvent.stopPropagation();
                    }
                    handelTableSynchronization(nodeData);
                  }
            }
          >
            {refreshLoading ? (
              <Spin
                size={Size.small}
                className={globalStyles['spin-small']}
                style={{ marginRight: '10px' }}
              />
            ) : (
              <ImgIcon
                name="synchronize.svg"
                size={16}
                style={{ width: 18, marginRight: '0.1rem' }}
              />
            )}
            <span>同步单表</span>
          </Menu.Item>
        )}
        {gradeTable && !isRedundant && (
          <Menu.Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
            }}
          >
            <BatchModel tableObj={nodeData} />
          </Menu.Item>
        )}
        {isTenantRole && viewType === 'labelView' && (
          <Menu.Item
            onClick={(e) => {
              if (e?.domEvent) {
                e.domEvent.stopPropagation();
              }
            }}
          >
            <SingleTagDistribute
              code={nodeData?.code}
              type={TargetType.STRUCTURE_TABLE}
              leftMenuDsQuery={leftMenuDsQuery}
            >
              <ImgIcon name="Tags.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
              <span>分配标签</span>
            </SingleTagDistribute>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const addTableModelProps = {
    setDataStore,
    leftMenuDsQuery,
  };

  const uploadFieldsProps = {
    refreshNum,
    setDataStore,
    leftMenuDsQuery,
    ref: uploadRef,
  };

  /**
   * 正向建表&上传脚本文件
   */
  type IAddTableAndUpload = (props: any) => React.ReactElement; // fixme
  const addTableAndUpload: IAddTableAndUpload = ({ value, child }) => {
    return (
      <Menu>
        {(!isTenantRole && level === 'platform') || child.createTableFlag ? (
          <Menu.Item
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={() => {
              // eslint-disable-next-line no-unused-expressions
              addTableModelRef?.current?.openPositiveModal();
            }}
          >
            <AddTableModel
              {...addTableModelProps}
              serviceCode={value.serviceCode}
              schemaName={child.schemaName}
              dataSourceType={child.dataSourceType}
            />
          </Menu.Item>
        ) : (
          ''
        )}
        {!isTenantRole && level !== 'tenant' && (
          <Menu.Item
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={() => uploadRef?.current?.handleOpenUploadModal()}
          >
            <UploadFields {...uploadFieldsProps} serviceCode={child?.serviceCode} />
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const findTreeNodePathByName = async (valse = '') => {
    const data: any = await leftMenuDsQuery({ name: valse }); // fixme
    const eKeys: string[] = [];
    data.forEach((value) => {
      // service
      value.children.forEach((ele) => {
        // db
        ele.children.forEach((tableValue) => {
          // name
          if (
            tableValue.name &&
            tableValue.name.includes(valse) &&
            !eKeys.includes(`db&${ele.id}&${ele.serviceCode}`) &&
            !eKeys.includes(`service&${value.id}`)
          ) {
            eKeys.push(`db&${ele.id}&${ele.serviceCode}`);
            eKeys.push(`service&${value.id}`);
          }
        });
      });
    });
    setExpandedKeys(eKeys);
  };

  /**
   * 开所有节点
   */
  const handleExpandedOpenAll = () => {
    const eKeys: string[] = [];
    treeDataList.forEach((value) => {
      // service
      value.children.forEach((ele) => {
        if (
          !eKeys.includes(`db&${ele.id}&${ele.serviceCode}`) &&
          !eKeys.includes(`service&${value.id}`)
        ) {
          eKeys.push(`db&${ele.id}&${ele.serviceCode}`);
          eKeys.push(`service&${value.id}`);
        }
      });
    });
    setExpandedKeys(eKeys);
  };

  /**
   * 关闭展开的所有节点
   */
  const handleExpandedCloseAll = () => {
    setExpandedKeys([]);
  };

  type IChangeResponse = (dataList: any) => any[];
  const changeResponse: IChangeResponse = (dataList) => {
    if (Array.isArray(dataList)) {
      const serviceMap = {};
      let content = [...dataList];
      (content || []).forEach((item) => {
        if (serviceMap[item.serviceCode] === undefined) {
          serviceMap[item.serviceCode] = {
            id: item.serviceCode,
            serviceCode: item.serviceCode,
            // createTableFlag: item.createTableFlag,
            // editTableFlag: item.editTableFlag,
            children: [item],
          };
        } else {
          serviceMap[item.serviceCode].children.push(item);
        }
      });
      const dbMap = {};
      Object.keys(serviceMap).forEach((key) => {
        serviceMap[key].children.forEach((ele) => {
          const dbName = `${serviceMap[key].serviceCode}?${ele.schemaName}`;
          if (dbMap[dbName] === undefined) {
            dbMap[dbName] = {
              serviceCode: serviceMap[key].serviceCode,
              id: ele.schemaName,
              schemaName: ele.schemaName,
              dataSourceType: ele.dataSourceType,
              createTableFlag: ele.createTableFlag,
              editTableFlag: ele.editTableFlag,
              children: [ele],
            };
          } else {
            dbMap[dbName].children.push(ele);
          }
        });
        serviceMap[key].children = [];
      });
      Object.keys(serviceMap).forEach((servicekey) => {
        Object.keys(dbMap).forEach((dbkey) => {
          if (dbMap[dbkey].serviceCode === serviceMap[servicekey].serviceCode) {
            serviceMap[servicekey].children.push(dbMap[dbkey]);
          }
        });
      });
      content = Object.keys(serviceMap).map((v) => ({
        dataSourceId: v,
        ...serviceMap[v],
      }));
      return content;
    }
    return [];
  };

  // 根据不同层级 决定正向、反向、扩展标签过滤为前后端过滤
  type IHandleFilleter = (activeButtonList: string[]) => void;
  const handleFilleter: IHandleFilleter = (activeButtonList) => {
    return new Promise((resolve, reject) => {
      leftMenuDsQuery({ tableTypeList: activeButtonList })
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  return (
    <Spin spinning={globalLoading} wrapperClassName={styles['base-list-menu']}>
      <div className={styles['basic-menu-wrapper']}>
        {treeDataList.length === 0 && <div className={styles['tree-empty-hint']}>暂无数据</div>}
        <Tree
          className={styles['tree-menu-wrapper']}
          expandedKeys={expandedKeys}
          selectedKeys={[selectedTableKey]}
          onSelect={onSelect as any}
          onExpand={(v) => {
            setExpandedKeys(v as any);
          }}
        >
          {treeDataList.map((value) => (
            <TreeNode
              key={`service&${value.id}`}
              className={styles['tree-node-1']}
              title={
                <div className={styles['tree-node-title']}>
                  {getTitle(value.serviceCode || '1', '1')}
                  {!isTenantRole &&
                    level !== 'tenant' &&
                    (treeRefreshLoading && clickServiceName === value.serviceCode ? (
                      <span className={styles['tree-node-edit']}>
                        <Spin size={Size.small} className={globalStyles['spin-small']} />
                      </span>
                    ) : (
                      <span
                        onClick={(e) => handelSynchronization(e, value)}
                        className={styles['tree-node-edit']}
                      >
                        <Tooltip placement="top" title="同步服务">
                          <ImgIcon name="synchronize.svg" size={14} />
                        </Tooltip>
                      </span>
                    ))}
                </div>
              }
              icon={
                <Icon
                  style={{ color: '#3F51B5' }}
                  type={expandedKeys.includes(value.serviceCode) ? 'remove' : 'add'}
                />
              }
            >
              {value.children.map((child) => (
                <TreeNode
                  key={`db&${child.id}&${child.serviceCode}`}
                  className={styles['tree-node-2']}
                  title={
                    <div className={styles['tree-node-title']}>
                      {getTitle(`${child.schemaName} （${child.dataSourceType}）` || '', '2')}
                      <span className={styles['tree-node-edit']}>
                        {isTenantRole && level === 'tenant' && !child.createTableFlag ? null : (
                          <Dropdown overlay={addTableAndUpload({ child, value })}>
                            <ImgIcon name="more-options.svg" size={12} />
                          </Dropdown>
                        )}
                      </span>
                    </div>
                  }
                >
                  {child.children.map((lastChild) => {
                    return (
                      <TreeNode
                        key={`${lastChild.id}&${lastChild.name}&${lastChild.type}&${lastChild.dataSourceType}&${lastChild?.code}&${lastChild?.createTableFlag}&${lastChild?.editTableFlag}`}
                        // className={styles['tree-node-3']}
                        dataStorage={{
                          tableInfo: JSON.parse(JSON.stringify(lastChild)),
                        }}
                        className={classNames({
                          [styles['tree-node-3']]: true,
                          [styles.currentNode]:
                            `Cur-${lastChild.id}&${lastChild.name}&${lastChild.type}&${lastChild.dataSourceType}` ===
                            cur,
                        })}
                        title={
                          <div
                            className={styles['tree-node-title']}
                            onMouseEnter={() =>
                              setCurTreeNode(
                                `${lastChild.id}&${lastChild.name}&${lastChild.type}&${lastChild.dataSourceType}`
                              )
                            }
                            onClick={() => {
                              setCur(
                                `Cur-${lastChild.id}&${lastChild.name}&${lastChild.type}&${lastChild.dataSourceType}`
                              );
                            }}
                            // onMouseLeave={() => setCurTreeNode('')}
                          >
                            <span className={styles['table-logo']}>
                              {lastChild.type === 'REVERSE' && (
                                <Tooltip title="反向扫描">
                                  <ImgIcon
                                    name="reverse@2x.png"
                                    size={12}
                                    style={{ marginRight: 5 }}
                                  />
                                </Tooltip>
                              )}
                              {lastChild.type === 'POSITIVE' && (
                                <Tooltip title="正向建表">
                                  <ImgIcon
                                    name="forward@2x.png"
                                    size={12}
                                    style={{ marginRight: 5 }}
                                  />
                                </Tooltip>
                              )}
                              {lastChild.type === 'REDUNDANT' && (
                                <Tooltip title="共享扩展">
                                  <ImgIcon
                                    name="redundancy-2@2x.png"
                                    size={12}
                                    style={{ marginRight: 5 }}
                                  />
                                </Tooltip>
                              )}
                              {lastChild.type === 'REDUNDANT_X' && (
                                <Tooltip title="独享扩展">
                                  <ImgIcon
                                    name="exclusiveImg_active.svg"
                                    size={12}
                                    style={{ marginRight: 5 }}
                                  />
                                </Tooltip>
                              )}
                              {getTitle(lastChild.name || '', '3')}
                            </span>
                            <span className={styles['tree-node-edit']}>
                              {lastChild.type === 'POSITIVE' ||
                              (lastChild.type === 'REDUNDANT' && lastChild.editTableFlag) ||
                              (!(lastChild.type === 'POSITIVE' || lastChild.type === 'REDUNDANT') &&
                                !isTenantRole &&
                                level !== 'tenant') ||
                              !(lastChild.type === 'REDUNDANT') ||
                              (isTenantRole && viewType === 'labelView') ? (
                                <Dropdown
                                  visible={
                                    visible &&
                                    curTreeNode ===
                                      `${lastChild.id}&${lastChild.name}&${lastChild.type}&${lastChild.dataSourceType}`
                                  }
                                  onVisibleChange={(vis) => setVisible(!!vis)}
                                  overlay={editMoreColumn({ ...lastChild, grade: 'table' })}
                                >
                                  <ImgIcon name="more-options.svg" size={14} />
                                </Dropdown>
                              ) : null}
                            </span>
                          </div>
                        }
                      />
                    );
                  })}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </Tree>
      </div>
    </Spin>
  );
});
