import React, { useContext, useEffect, useState } from 'react';
import { Collapse, Tooltip } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Button } from 'choerodon-ui/pro';
import Modal from '@/components/LowcodeModal';
import notification from 'utils/notification';
import ImgIcon from '@/utils/ImgIcon';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import { fetchApiDisableStatus, updateApiDisableStatus } from '@/services/modelDataSourceService';
import { mapTree } from '@/utils/treeUtils';
import Request from './RequestCom';

import styles from './index.less';

const { Panel } = Collapse;

enum ApiCodeType {
  page = 'page',
  query = 'query',
  list = 'list',
  aggregation = 'aggregation',
  batchUpdate = 'batch-update',
  batchDelete = 'batch-delete',
}

enum ERequestType {
  page = 'page',
  query = 'query',
  list = 'list',
  aggregation = 'aggregation',
  update = 'update',
  delete = 'delete',
}

/**
 * Functional Component
 */
const Index = observer(({ level }: any) => {
  const [fields, setFields] = useState<model.data.BaseDataObjectField[]>([]);
  const [apiDisableMapping, setApiDisableMapping] = useState({});
  const [activeKey, setActiveKey] = useState<string | string[]>('');
  const {
    dataObject: { dataObjectTreeData, dataObjectDetail },
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store; // fixme // fixme 这个文件都没改
  useEffect(() => {
    // 监听 dataObjectTreeData, 重置字段列表
    let newFieldList: Array<model.data.BaseDataObjectField> = [];
    mapTree(toJS([dataObjectTreeData.masterModel]), (item) => {
      newFieldList.push(
        ...item.fields.map((obj) => ({
          ...obj,
          displayName: obj.displayName ? obj.displayName.replace(/,|，|。|\n|\r/g, ' ') : null,
        }))
      );
    });
    // 对象数组按照名称属性首字母排序
    newFieldList = newFieldList.sort((preObj: any, nextObj: any) => {
      return preObj?.aliasName.localeCompare(nextObj?.aliasName);
    });
    setFields(newFieldList);
  }, [dataObjectTreeData]);
  useEffect(() => {
    setActiveKey(''); // 清空折叠面板key
  }, [dataObjectDetail.dataObjectCode]);
  useEffect(() => {
    getApiStatus(dataObjectDetail.dataObjectId);
  }, [dataObjectDetail.dataObjectId]);

  /**
   * 处理折叠面板的key切换
   * @param {string} val 折叠面板当前的key
   */
  const handleChangActiveKey = (val: string | string[]): void => {
    setActiveKey(val);
  };

  // 获取API的启用/禁用状态
  const getApiStatus = (dataObjectId) => {
    fetchApiDisableStatus(dataObjectId).then((res) => {
      if (Array.isArray(res) && res.length) {
        setApiDisableMapping(
          res.reduce((acc, current) => {
            return { ...acc, [current.apiCode]: current.enabledFlag };
          }, {})
        );
      }
    });
  };

  // 启用/禁用 切换操作
  const handleToggleUsage = (e, apiCode: string, enabledFlag: boolean) => {
    e.stopPropagation();
    Modal.confirm({
      title: `请确认是否${enabledFlag ? '启用' : '禁用'}当前Api？`,
      okText: '确认',
      cancelText: '取消',
      lowcodeSize: 'small',
    }).then((res1) => {
      if (res1 === 'ok') {
        updateApiDisableStatus(dataObjectDetail.dataObjectId, {
          apiCode,
          enabledFlag: enabledFlag ? 1 : 0,
        }).then((res) => {
          if (getResponse(res) && res && res.apiCode) {
            // 成功
            setApiDisableMapping({
              ...apiDisableMapping,
              [res.apiCode]: res.enabledFlag,
            });
            notification.success({
              description: '操作成功',
            });
          }
        });
      }
    });
  };

  // 渲染启用/禁用按钮
  const renderToggleDisableButton = (apiCode: ApiCodeType) => {
    const isDisableStatus: boolean = apiDisableMapping[apiCode] === false; // 只有明确为 false 才是真的禁用，true 或者 undefined 都是启用

    // 预定义的不能编辑；
    // 【平台级模型超级管】除了【预定义】的数据，其他都能编辑
    // 【租户级模型管理员】只能对【租户自定义】类型的数据进行更改
    const isPrefixFlag = dataObjectDetail.dataObjectOwnerType === 'PREDEFINE';
    const isTenantRoleLevelEditor =
      level === 'tenant' && dataObjectDetail.dataObjectOwnerType !== 'TENANT';

    return (
      <Button
        funcType={FuncType.flat}
        disabled={isPrefixFlag || isTenantRoleLevelEditor}
        color={isDisableStatus ? ButtonColor.default : ButtonColor.default}
        className={styles['toggle-disable']}
        onClick={(e) => handleToggleUsage(e, apiCode, isDisableStatus)}
      >
        {isDisableStatus ? '启用' : '禁用'}
      </Button>
    );
  };

  /**
   * 渲染
   */
  return (
    <article className={styles['api-pane']}>
      <Collapse
        bordered={false}
        activeKey={activeKey}
        onChange={handleChangActiveKey}
        accordion
        expandIcon={() => (
          <ImgIcon name="open-black.svg" size={14} className={styles['icon-expand_more']} />
        )}
      >
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>GET</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/page`}</h4>
              <i>分页查询模型数据</i>
              {renderToggleDisableButton(ApiCodeType.page)}
            </div>
          }
          key="page"
          className={styles['panel-blue']}
          style={
            apiDisableMapping[ApiCodeType.page] === false ? { filter: 'grayscale(1)' } : undefined
          }
        >
          <Request
            requestType={ERequestType.page}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.page]}
          />
        </Panel>
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>GET</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/query`}</h4>
              <i>查询模型单条数据</i>
              {renderToggleDisableButton(ApiCodeType.query)}
            </div>
          }
          key="query"
          className={styles['panel-blue']}
          style={
            apiDisableMapping[ApiCodeType.query] === false ? { filter: 'grayscale(1)' } : undefined
          }
        >
          <Request
            requestType={ERequestType.query}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.query]}
          />
        </Panel>
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>GET</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/list`}</h4>
              <i>不分页查询模型数据</i>
              {renderToggleDisableButton(ApiCodeType.list)}
            </div>
          }
          key="list"
          className={styles['panel-blue']}
          style={
            apiDisableMapping[ApiCodeType.list] === false ? { filter: 'grayscale(1)' } : undefined
          }
        >
          <Request
            requestType={ERequestType.list}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.list]}
          />
        </Panel>
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>GET</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/aggregation`}</h4>
              <i>聚合查询模型数据</i>
              {renderToggleDisableButton(ApiCodeType.aggregation)}
            </div>
          }
          key="aggregation"
          className={styles['panel-blue']}
          style={
            apiDisableMapping[ApiCodeType.aggregation] === false
              ? { filter: 'grayscale(1)' }
              : undefined
          }
        >
          <Request
            requestType={ERequestType.aggregation}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.aggregation]}
          />
        </Panel>
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>POST</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/batch-update`}</h4>
              <i>
                <Tooltip
                  placement="top"
                  title="数据对象模型关系存在1-n时，不支持增删改操作，仅支持查询操作"
                >
                  <ImgIcon name="help.svg" size={14} style={{ marginRight: 14, marginBottom: 2 }} />
                </Tooltip>
                批量创建或更新模型数据
              </i>
              {renderToggleDisableButton(ApiCodeType.batchUpdate)}
            </div>
          }
          key="update"
          className={styles['panel-green']}
          style={
            apiDisableMapping[ApiCodeType.batchUpdate] === false
              ? { filter: 'grayscale(1)' }
              : undefined
          }
        >
          <Request
            requestType={ERequestType.update}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.batchUpdate]}
          />
        </Panel>
        <Panel
          header={
            <div className={styles['panel-header']}>
              <span>DELETE</span>
              <h4>{`/v1/{organizationId}/executor/{dataObjectCode}/batch-delete`}</h4>
              <i>
                <Tooltip
                  placement="top"
                  title="数据对象模型关系存在1-n时，不支持增删改操作，仅支持查询操作"
                >
                  <ImgIcon name="help.svg" size={14} style={{ marginRight: 14, marginBottom: 2 }} />
                </Tooltip>
                批量删除模型数据
              </i>
              {renderToggleDisableButton(ApiCodeType.batchDelete)}
            </div>
          }
          key="delete"
          className={styles['panel-red']}
          style={
            apiDisableMapping[ApiCodeType.batchDelete] === false
              ? { filter: 'grayscale(1)' }
              : undefined
          }
        >
          <Request
            requestType={ERequestType.delete}
            fields={fields}
            dataObjectDetail={dataObjectDetail}
            tryItOutDisableStatus={apiDisableMapping[ApiCodeType.batchDelete]}
          />
        </Panel>
      </Collapse>
    </article>
  );
});
export default Index;
