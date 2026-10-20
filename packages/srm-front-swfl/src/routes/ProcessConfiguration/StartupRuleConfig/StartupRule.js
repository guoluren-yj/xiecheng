/**
 * StartupRuleConfig
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Table, Modal, Button } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { getCurrentTenant, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { Context } from '../store';
import {
  saveVariableConfig,
  updateVariableConfig,
  deleteVariableConfig,
} from '../processConfigurationService';
import ExpressionEngineRule from '../../../components/ExpressionEngineRule/index.tsx';
import VariableConfigModal from './VariableConfigModal';
import RuleConfig from './RuleConfig';

const sceneCode = 'SRM.WP.SETUP.PROCESS-ASSIGN'; // 场景编码
const variableConfigKey = Modal.key();

function StartupRule(props) {
  const { record, processAppoint = {}, disabled = false } = props;
  const { variableConfigDs } = useContext(Context);
  const [ruleConfig, setRuleConfig] = useState({ visible: false, variableConfig: [] });
  const { tenantNum, tenantId } = getCurrentTenant();
  const { procAssignConfId } = processAppoint;

  useEffect(() => {
    if (processAppoint.startupRuleType === 'DEFAULT') {
      variableConfigDs.setQueryParameter('procAssignConfId', procAssignConfId);
      queryVariableConfig();
    } else {
      resetRuleConfig();
    }
  }, [processAppoint]);

  useEffect(() => {
    resetRuleConfig();
  }, [record.categoryId]);

  const resetRuleConfig = () => {
    setRuleConfig({
      visible: false,
      variableConfig: [],
    });
  };

  const queryVariableConfig = () => {
    variableConfigDs.query().then((res) => {
      setRuleConfig({
        visible: true,
        variableConfig: res && res.content,
      });
    });
  };

  const getEngineCode = () => {
    return `${tenantNum}:${sceneCode}:${record.categoryCode}:${record.documentCode}`;
  };

  const addVariableConfig = async () => {
    const currentRecord = await variableConfigDs.create();
    openModal(currentRecord, intl.get('hzero.common.create').d('新建'));
  };

  const editVariableConfig = (currentRecord) => {
    openModal(currentRecord, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const openModal = (currentRecord, title) => {
    Modal.open({
      title,
      key: variableConfigKey,
      drawer: true,
      style: {
        width: '380px',
      },
      children: <VariableConfigModal record={currentRecord} />,
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        variableConfigDs.reset();
      },
    });
  };

  const onHandleSave = (resolve) => {
    variableConfigDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = variableConfigDs.current.get('formId')
            ? updateVariableConfig
            : saveVariableConfig;
          actionName({
            procAssignConfId,
            procAssignVarConfs: variableConfigDs.toJSONData(),
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              queryVariableConfig();
              resolve();
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      })
      .catch(() => {
        resolve(false);
      });
  };

  const onDeleteVariableConfig = (currentRecord) => {
    deleteVariableConfig([currentRecord.toData()])
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          queryVariableConfig();
        }
      })
      .catch((err) => {
        notification.error({
          message: err,
        });
      });
  };

  const variableConfigColumns = [
    {
      name: 'orderSeq',
      width: '80',
    },
    {
      name: 'variable',
      width: '200',
    },
    {
      name: 'description',
    },
    {
      name: 'variableFieldType',
      width: '200',
    },
    {
      name: 'variableValueSourceLov',
      width: '200',
    },
    {
      name: 'variableColumnWidth',
      width: '100',
    },
    {
      name: 'searchFlag',
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'action',
      width: 120,
      renderer: ({ record: currentRecord }) => {
        if (!disabled) {
          return (
            <div>
              <a onClick={() => editVariableConfig(currentRecord)} style={{ marginRight: 8 }}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                onConfirm={() => onDeleteVariableConfig(currentRecord)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </div>
          );
        }
      },
    },
  ];

  const variableConfigButtons = [
    <Button color="primary" icon="playlist_add" size="small" onClick={() => addVariableConfig()}>
      {intl.get(`swfl.processAppoint.model.button.addVariableConfig`).d('新增变量配置')}
    </Button>,
  ];

  const renderStartupRule = useCallback(() => {
    if (processAppoint.startupRuleType && processAppoint.procAssignConfId) {
      if (processAppoint.startupRuleType === 'DEFAULT') {
        return (
          <div>
            <div className="variable-config">
              <div className="table-title">
                <span>
                  {intl.get(`swfl.processAppoint.model.button.variableConfig`).d('变量配置')}
                </span>
              </div>
              <Table
                columns={variableConfigColumns}
                dataSet={variableConfigDs}
                buttons={variableConfigButtons}
              />
            </div>
            {ruleConfig.visible && (
              <RuleConfig
                procAssignConfId={procAssignConfId}
                variableConfig={ruleConfig.variableConfig}
                tenantId={tenantId}
              />
            )}
          </div>
        );
      } else {
        return (
          <ExpressionEngineRule
            code={getEngineCode()}
            showTitle={false}
            sceneCode={sceneCode}
            leftValueLovQueryPara={{
              documentId: record.documentId,
              isIncludePredefineFlag: 'N',
              categoryId: record.processCategoryId,
            }}
            dataSource={processAppoint}
          />
        );
      }
    } else {
      return null;
    }
  }, [processAppoint, ruleConfig]);

  return renderStartupRule();
}

export default observer(StartupRule);
