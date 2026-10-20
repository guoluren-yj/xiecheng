import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, FC } from 'react';
import { Icon, TextField, DataSet } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
import { Tree, Tooltip } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import ImgIcon from '@/utils/ImgIcon';

import styles from '../index.less';
import batchToTree from '../util/batchToTree';

const { TreeNode } = Tree;

interface INodeData {
  grade: string;
  type: string;
  name: string;
  id: string | number;
  schemaName: string;
  dataSourceType: string;
  serviceCode: string;
}
interface IIndex {
  leftMenuDs: DataSet;
  rightMenuDs: DataSet;
  tableObj: INodeData | undefined;
  type: string;
  setLoading: (val: boolean) => void;
}
const Index: FC<IIndex> = forwardRef(
  ({ leftMenuDs, rightMenuDs, tableObj, type, setLoading }, ref) => {
    useImperativeHandle(ref, () => ({
      tables: tablesRef.current,
    }));

    const tablesRef = useRef([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

    /**
     * 查询过滤数据
     * @param {} valse 查询参数
     */
    type IFindTreeNodePathByName = (valse: string) => void;
    const findTreeNodePathByName: IFindTreeNodePathByName = async (valse) => {
      if (type !== 'batch') {
        // 单模型不需掉接口查询
        return;
      }
      leftMenuDs.setQueryParameter('name', valse);
      setLoading(true);
      await leftMenuDs.query();
      const eKeys: string[] = [];
      leftMenuDs.toData().forEach((value: any) => {
        // fixme
        // service
        value.children.forEach((ele) => {
          // db
          ele.children.forEach((tableValue) => {
            // name
            if (
              tableValue.name &&
              tableValue.name.includes(name) &&
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
      setLoading(false);
    };

    useEffect(() => {
      findTreeNodePathByName(inputValue);
    }, [inputValue]);

    // 单表建模 table创建默认数据
    useEffect(() => {
      if (!tableObj) {
        // 批量
        findTreeNodePathByName('');
      } else if (tableObj && isEmpty(rightMenuDs.toData())) {
        // 非批量
        leftMenuDs.removeAll();
        const list = batchToTree([tableObj])?.[0];
        leftMenuDs.create(list);
        rightMenuDs.create({
          serviceCode: tableObj.serviceCode,
          schemaName: tableObj.schemaName,
          tableName: tableObj.name,
          id: tableObj.id,
        });

        // 单个生成逻辑模型,让他是否展开
        setExpandedKeys([
          `service&${tableObj.serviceCode}`,
          `db&${tableObj.schemaName}&${tableObj.serviceCode}`,
        ]);
      }
    }, [tableObj]);

    function getTitle(name: string): React.ReactElement {
      const index = name.indexOf(inputValue);
      const beforeStr = name.substr(0, index);
      const afterStr = name.substr(index + inputValue.length);
      const title =
        index > -1 ? (
          <Tooltip title={name}>
            <span className={styles['title-overflow']}>
              {beforeStr}
              <span style={{ color: '#f50' }}>{inputValue}</span>
              {afterStr}
            </span>
          </Tooltip>
        ) : (
          <Tooltip title={name}>
            <span className={styles['title-overflow']}>{name}</span>
          </Tooltip>
        );
      return title;
    }

    const handleTreeCheck = (keys) => {
      setCheckedKeys(keys);
      if (keys.length === 0) {
        tablesRef.current = [];
        return;
      }
      const tables = keys
        .map((key) => key.split('&'))
        .filter(([tId]) => tId !== 'db' && tId !== 'service');
      tablesRef.current = tables;
    };
    return (
      <div className={styles['list-menu']}>
        {type === 'batch' && (
          <div className={styles['c7n-pro-base-table-filter']}>
            <TextField
              value={inputValue}
              style={{ paddingLeft: 10, width: '100%' }}
              onChange={(val) => setInputValue(!isEmpty(val) ? val : '')}
              suffix={<Icon type="search" />}
              placeholder="请输入表名"
              onEnterDown={(e) => findTreeNodePathByName((e.target as any).value.trim())}
            />
          </div>
        )}
        <Tree
          checkable
          checkedKeys={tableObj ? [`service&${tableObj.serviceCode}`] : checkedKeys}
          onCheck={handleTreeCheck}
          expandedKeys={expandedKeys}
          defaultExpandAll
          onExpand={(v) => {
            setExpandedKeys(v as string[]);
          }}
        >
          {leftMenuDs.toData().map((value: any) => (
            <TreeNode
              key={`service&${value.id}`}
              className={styles['tree-node-1']}
              title={
                <div className={styles['tree-node-title']}>
                  <span>{getTitle(value.serviceCode || '')}</span>
                </div>
              }
            >
              {value.children.map((child) => (
                <TreeNode
                  key={`db&${child.id}&${child.serviceCode}`}
                  className={styles['tree-node-2']}
                  title={
                    <div className={styles['tree-node-title']}>
                      <span>
                        {getTitle(`${child.schemaName} （${child.dataSourceType}）` || '')}
                      </span>
                    </div>
                  }
                >
                  {child.children
                    .filter((i) => i.type !== 'REDUNDANT')
                    .map((lastChild) => (
                      <TreeNode
                        key={`${lastChild.id}&${lastChild.name}&${child.serviceCode}&${child.schemaName}（${child.dataSourceType}）`}
                        className={styles['tree-node-3']}
                        title={
                          <div className={styles['tree-node-title']}>
                            {lastChild.type === 'REVERSE' && (
                              <div style={{ width: 12, marginRight: 5 }}>
                                <ImgIcon
                                  name="reverse@2x.png"
                                  size={12}
                                  style={{ marginRight: '5px' }}
                                />
                              </div>
                            )}
                            {lastChild.type === 'POSITIVE' && (
                              <div style={{ width: 12, marginRight: 5 }}>
                                <ImgIcon
                                  name="forward@2x.png"
                                  size={12}
                                  style={{ marginRight: '5px' }}
                                />
                              </div>
                            )}
                            {lastChild.type === 'REDUNDANT' && (
                              <div style={{ width: 12, marginRight: 5 }}>
                                <ImgIcon
                                  name="redundancy-2@2x.png"
                                  size={12}
                                  style={{ marginRight: '5px' }}
                                />
                              </div>
                            )}
                            <Tooltip title={lastChild.name || ''}>
                              {getTitle(lastChild.name || '')}
                            </Tooltip>
                          </div>
                        }
                      />
                    ))}
                </TreeNode>
              ))}
            </TreeNode>
          ))}
        </Tree>
      </div>
    );
  }
);
export default Index;
