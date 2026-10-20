import React, { useMemo, useEffect, useState } from 'react';
import { IStore } from '@/routes/ProcessDefinition/Designer/store';
import intl from 'srm-front-boot/lib/utils/intl';
import { Icon, message } from 'choerodon-ui';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Tree, Modal, Menu, Dropdown } from 'choerodon-ui/pro';
import classNames from 'classnames';
import notification from 'utils/notification';
import {
  flowContextFormDataSet,
  flowContextTreeDataSet,
} from '../../datasets/constructCreateFlowContextDataSet';
import { getUrlParamHref } from '@/utils/common';
import EditContext from './EditContext';
import styles from './FlowContext.less';

interface IProps {
  store: IStore;
  versionDisabled?: boolean;
  viewType?: string;
  version?: any;
}

export default function Node(props: IProps) {
  const { store, versionDisabled, viewType, version } = props;
  const [result, setResult] = useState({});
  const [context] = useState({ tenantId: 0 });
  const FlowTypes = new Map([
    ['input', '事务流-入参'],
    ['output', '事务流-出参'],
    ['custom', '自定义变量'],
  ]);

  const formDataSet = useMemo(() => {
    return flowContextFormDataSet(getUrlParamHref('flowId'));
  }, []);

  const inputDataSet = useMemo(() => {
    return flowContextTreeDataSet();
  }, []);

  const outputDataSet = useMemo(() => {
    return flowContextTreeDataSet();
  }, []);

  const customDataSet = useMemo(() => {
    return flowContextTreeDataSet();
  }, []);

  useEffect(() => {
    // 请求详情
    // console.log(version?.toData());
    formDataSet.setQueryParameter('version', version?.get('version'));
    formDataSet.query().then((res) => {
      const { inputParameter = '', outputParameter = '', customVariable = '' } = res || {};
      setResult(res);
      inputDataSet.create({
        name: FlowTypes.get('input'),
        commonType: 'input',
        id: 1,
        showId: '1',
      });
      outputDataSet.create({
        name: FlowTypes.get('output'),
        commonType: 'output',
        id: 1,
        showId: '1',
      });
      customDataSet.create({ name: FlowTypes.get('custom'), commonType: 'custom', id: 1 });
      // 事务流-入参
      if (inputParameter && inputParameter !== '[]') {
        const showInputParameter = (JSON.parse(inputParameter) || [])?.map((item) => {
          if (item?.parentId !== 1) {
            return {
              ...item,
              showId: `${item?.parentId}_${item?.id}`,
              showParentId: item?.parentId,
            };
          }
          return {
            ...item,
            showId: item?.id,
            showParentId: item?.parentId,
          };
        });
        inputDataSet.appendData(showInputParameter);
      }
      // 事务流-出参
      if (outputParameter && outputParameter !== '[]') {
        const showOutputParameter = (JSON.parse(outputParameter) || [])?.map((item) => {
          if (item?.parentId !== 1) {
            return {
              ...item,
              showId: `${item?.parentId}_${item?.id}`,
              showParentId: item?.parentId,
            };
          }
          return {
            ...item,
            showId: item?.id,
            showParentId: item?.parentId,
          };
        });
        outputDataSet.appendData(showOutputParameter);
      }
      // 自定义变量
      if (customVariable && customVariable !== '[]') {
        customDataSet.appendData(JSON.parse(customVariable));
      }
      handleUpdate(res);
    });
  }, []);

  const handleDs = (ds, params, type, commonType) => {
    const cIndex = ds.findIndex((val: any) => val.get('code') === params[0].code);
    if (type === 'add' && cIndex > -1) {
      message.error(
        intl.get('hmde.processDefinition.view.flowContext.code.error').d('code重复,请重新填写')
      );
      return false;
    }
    console.log(params);
    if (type === 'edit') {
      ds.splice(cIndex, 1, new Record(params[0]));
      let beforeBusinessField: any = [];
      if (params[0].inputParamType === 'custom') {
        beforeBusinessField = ds.filter((val) =>
          val.get('code') && val.get('parentId') !== 1
            ? val.get('parentId')?.includes(params[0].code)
            : false
        );
      } else {
        console.log(ds.toData());
        beforeBusinessField = ds.filter((val) => val.get('parentId') === params[0].id);
      }
      ds.remove(beforeBusinessField);
    } else {
      ds.appendData(params);
    }
    if (params[0]?.businessField && commonType !== 'custom') {
      let { businessField = [] } = params[0];
      if (params[0].inputParamType === 'custom') {
        businessField = params[0].datasetData || [];
      }

      businessField.map((v) => {
        ds.push(new Record(v));
        return v;
      });
    }
  };

  // 新增/编辑
  const handleModal = (record, type) => {
    let params: any = null;
    const commonType = record.get('commonType');
    let jsonParseFlag = true; // 自定义入参json解析标识
    Modal.open({
      title: FlowTypes.get(commonType),
      drawer: true,
      children: (
        <EditContext
          tenantId={context.tenantId}
          update={async ({ data, selected }) => {
            const flag = await data.validate();
            if (flag) params = [{ ...data?.toData()[0], businessField: selected || [] }];
          }}
          commonType={commonType}
          data={type === 'edit' ? record : null}
          getJsonParseFlag={(val) => {
            jsonParseFlag = val;
          }}
        />
      ),
      onOk: () => {
        if (commonType === 'input' && !jsonParseFlag) {
          notification.error({
            message: '请解析JSON参数',
            placement: 'bottomRight',
          });
          return false;
        }
        if (!params) return false;
        if (commonType === 'input') {
          if (params[0].inputParamType === 'custom') {
            params[0].datasetData = params[0].datasetData?.map((item) => ({
              ...item,
              id: `${params[0].code}_${item.id}`,
              parentId: item.parentId ? `${params[0].code}_${item.parentId}` : params[0].code,
              showId: `${params[0].code}_${item.id}`,
              showParentId: item.parentId ? `${params[0].code}_${item.parentId}` : params[0].code,
            }));
            params[0].id = params[0].code;
            params[0].showId = params[0].code;
            params[0].showParentId = params[0].parentId;
          }
          if (params[0]?.businessField) {
            params = params?.map((item) => {
              return {
                ...item,
                showId: item?.id,
                showParentId: String(item?.parentId),
              };
            });
            params[0].businessField = params[0].businessField?.map((item) => {
              return {
                ...item,
                showId: `${item?.parentId}_${item?.id}`,
                showParentId: item?.parentId,
              };
            });
          }
          handleDs(inputDataSet, params, type, commonType);
        } else if (commonType === 'output') {
          if (params[0]?.businessField) {
            params = params?.map((item) => {
              return {
                ...item,
                showId: item?.id,
                showParentId: String(item?.parentId),
              };
            });
            params[0].businessField = params[0].businessField?.map((item) => {
              return {
                ...item,
                showId: `${item?.parentId}_${item?.id}`,
                showParentId: item?.parentId,
              };
            });
          }
          handleDs(outputDataSet, params, type, commonType);
        } else if (commonType === 'custom') {
          handleDs(customDataSet, params, type, commonType);
        }
        handleUpdate(result);
      },
    });
  };

  const handleUpdate = (extraParams) => {
    store.setState('inputDataSet', inputDataSet);
    store.setState('outputDataSet', outputDataSet);
    store.setState('customDataSet', customDataSet);
    store.setState('extraParams', extraParams);
  };

  // 二次确认
  const handleConfirm = (record) => {
    Modal.confirm({
      title: '是否确认删除该条数据?',
    }).then((button) => {
      if (button === 'ok') handleDelete(record);
    });
  };

  // 删除
  const handleDelete = (record) => {
    const commonType = record.get('commonType');
    if (commonType === 'input') {
      inputDataSet.remove(record);
      // 删除关联的子级
      const childList =
        record.get('inputParamType') === 'custom'
          ? inputDataSet.filter(
              (item) =>
                item?.get('code') &&
                item?.get('parentId') !== 1 &&
                item?.get('parentId')?.includes(record.get('code'))
            )
          : inputDataSet.filter((item) => item?.get('parentId') === record.get('id'));
      childList.map((item: any) => inputDataSet.remove(item));
    } else if (commonType === 'output') {
      outputDataSet.remove(record);
      // 删除关联的子级
      const childList = outputDataSet.filter((item) => item?.get('parentId') === record.get('id'));
      childList.map((item: any) => outputDataSet.remove(item));
    } else if (commonType === 'custom') {
      customDataSet.remove(record);
    }
  };

  const nodeRenderer = (data) => {
    const { record } = data;
    let nodeName = '';
    if (
      record.get('name') ||
      record.get('commonType') === 'custom' ||
      record.get('inputParamType') === 'custom'
    ) {
      nodeName = `${record.get('name') || record.get('code')}`;
    } else if (record.get('type')) {
      nodeName = `${record.get('code')} (${record.get('type')})`;
    } else {
      nodeName = `${record.get('businessObjectName') || record.get('businessObjectFieldName')} (${
        record.get('businessObjectCode') || record.get('businessObjectFieldCode')
      })`;
    }
    return (
      <div className={styles['flow-context-node']} key={record.get('businessObjectFieldCode')}>
        <span
          className={classNames({
            [styles.flowContextName]: true,
            [styles.flowContextTitle]: !!record.get('name'),
          })}
        >
          {nodeName}
        </span>
        {record.get('name') && !versionDisabled && viewType === 'detail' ? (
          <Icon
            className={styles['flow-context-icon']}
            type="add"
            onClick={() => handleModal(record, 'add')}
          />
        ) : null}
        {Number(record.get('parentId')) === 1 && !versionDisabled && viewType === 'detail' ? (
          <Dropdown
            overlay={() => (
              <Menu>
                <Menu.Item onClick={() => handleModal(record, 'edit')}>
                  <Icon type="edit-o" />
                  <span>{intl.get('hzero.common.edit').d('编辑')}</span>
                </Menu.Item>
                <Menu.Item onClick={() => handleConfirm(record)}>
                  <Icon type="delete_forever-o" />
                  <span>{intl.get('hzero.common.delete').d('删除')}</span>
                </Menu.Item>
              </Menu>
            )}
          >
            <Icon
              className={`${styles['flow-context-action']} ${styles['flow-context-icon']}`}
              type="more_vert"
            />
          </Dropdown>
        ) : null}
      </div>
    );
  };

  const treeProps = {
    className: styles['flow-context-comp'],
    showLine: {
      showLeafIcon: false,
    },
    showIcon: true,
    renderer: nodeRenderer,
  };

  return (
    <div className={styles['flow-context-comp']}>
      <Tree dataSet={inputDataSet} {...treeProps} />
      <Tree dataSet={outputDataSet} {...treeProps} />
      {/* <Tree dataSet={customDataSet} {...treeProps} /> */}
    </div>
  );
}
