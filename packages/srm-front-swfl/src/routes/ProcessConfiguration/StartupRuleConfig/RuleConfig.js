/* eslint-disable guard-for-in */
/* eslint-disable no-param-reassign */
/**
 * RuleConfig
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useMemo, useState } from 'react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { isNil } from 'lodash';

import { HZERO_HWFP } from 'utils/config';
import { operatorRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { saveRuleConfig, updateRuleConfig, deleteRuleConfig } from '../processConfigurationService';
import RuleConfigModal from './RuleConfigModal';

const ruleConfigKey = Modal.key();
export default function RuleConfig(props = {}) {
  const { procAssignConfId, variableConfig, tenantId, disabled = false } = props;
  const [queryFieldsProps, setQueryFieldsProps] = useState([]);
  const getType = (type) => {
    const typeName = type.split('/')[0];
    switch (typeName) {
      case 'LOV':
        return 'object';
      case 'NUMBER':
        return 'number';
      default:
        return 'string';
    }
  };

  const columns = useMemo(() => {
    const variableConfigColumns = variableConfig.map((config) => {
      const { variableName } = config;
      const splitType = config.variableFieldType.split('/')[0];
      if (splitType === 'LOV') {
        return {
          name: `${variableName}LOV`,
          width: 180,
          renderer: ({ record }) => {
            if (!record || isNil(record.data)) {
              return null;
            }
            return record.data[`${variableName}_describe`] || record.data[variableName];
          },
        };
      } else {
        return {
          name: variableName,
          width: 180,
          renderer: ({ record }) => {
            if (!record || isNil(record.data)) {
              return null;
            }
            return record.data[`${variableName}_describe`] || record.data[variableName];
          },
        };
      }
    });
    return [
      ...variableConfigColumns,
      {
        name: 'procDef',
        width: 180,
      },
      {
        name: 'employee',
        width: 180,
      },
      {
        name: 'remark',
        type: 'string',
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a onClick={() => editRuleConfig(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'delete',
              ele: (
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                  onConfirm={() => onDeleteRuleConfig(record)}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ];
          if (!disabled) {
            return operatorRender(operators, record);
          }
        },
      },
    ];
  }, [procAssignConfId, variableConfig]);

  const ruleConfigDs = useMemo(() => {
    const otherLovFields = [];
    const otherQueryFields = [];
    const variableConfigFields = variableConfig.map((config) => {
      const {
        variableFieldType,
        variableName,
        description,
        variableValueSource,
        searchFlag,
        variableConfId,
      } = config;
      const splitType = variableFieldType.split('/')[0];
      if (splitType === 'LOV') {
        const valueField = {
          type: 'string',
          name: variableName,
          computedProps: {
            bind: ({ record }) => {
              return `${variableName}LOV.${record
                .getField(`${variableName}LOV`)
                .get('valueField')}`;
            },
          },
        };
        const textField = {
          type: 'string',
          name: `${variableName}_describe`,
          computedProps: {
            bind: ({ record }) => {
              return `${variableName}LOV.${record.getField(`${variableName}LOV`).get('textField')}`;
            },
          },
        };
        const lovField = {
          label: description,
          type: getType(variableFieldType),
          lovCode: variableValueSource,
          name: `${variableName}LOV`,
        };
        otherLovFields.push(textField, valueField);
        if (searchFlag === 1) {
          otherQueryFields.push(
            {
              type: 'string',
              name: variableConfId,
              computedProps: {
                bind: ({ record }) => {
                  return `${variableConfId}LOV.${record
                    .getField(`${variableConfId}LOV`)
                    .get('valueField')}`;
                },
              },
            },
            {
              label: description,
              type: getType(variableFieldType),
              lovCode: variableValueSource,
              name: `${variableConfId}LOV`,
              ignore: 'always',
            }
          );
        }
        return lovField;
      } else if (splitType === 'SELECT') {
        const selectField = {
          label: description,
          type: getType(variableFieldType),
          lookupCode: variableValueSource,
          name: variableName,
        };
        if (searchFlag === 1) {
          otherQueryFields.push({
            ...selectField,
            name: variableConfId,
          });
        }
        return selectField;
      } else {
        const field = {
          label: description,
          name: variableName,
          type: getType(variableFieldType),
        };
        if (searchFlag === 1) {
          otherQueryFields.push({
            ...field,
            name: variableConfId,
          });
        }
        return field;
      }
    });
    const fieldsProps = {};
    otherQueryFields.forEach((f) => {
      fieldsProps[f.name] = {
        clearButton: true,
      };
    });
    const dynamicFields = [...variableConfigFields, ...otherLovFields];
    dynamicFields.forEach((f) => {
      if (f.name.includes('.')) {
        dynamicFields.push({
          ...f,
          name: f.name.replace(/\./g, '@'),
        });
      }
    });
    setQueryFieldsProps(fieldsProps);
    const ds = new DataSet({
      autoCreate: false,
      selection: false,
      fields: [
        ...dynamicFields,
        {
          name: 'procDef',
          label: intl.get('swfl.processAppoint.model.ruleConfig.process').d('流程'),
          type: 'object',
          lovCode: 'SWFL.PROCESS_DEFINITION',
          ignore: 'always',
          required: true,
          lovPara: {
            procAssignId: procAssignConfId,
            asyncCountFlag: 'DEFAULT',
          },
        },
        {
          name: 'procDefId',
          type: 'string',
          bind: 'procDef.id',
        },
        {
          name: 'name',
          type: 'string',
          bind: 'procDef.name',
        },
        {
          name: 'employee',
          label: intl
            .get('swfl.processAppoint.model.ruleConfig.defaultSubmitUserId')
            .d('默认流程发起人'),
          type: 'object',
          lovCode: 'HWFP.EMPLOYEE',
          ignore: 'always',
          logPara: {
            enabledFlag: 1,
            tenantId,
          },
        },
        {
          name: 'defaultSubmitEmployee',
          type: 'string',
          bind: 'employee.employeeNum',
        },
        {
          name: 'defaultSubmitEmployeeName',
          type: 'string',
          bind: 'employee.name',
        },
        {
          name: 'remark',
          label: intl.get('swfl.processAppoint.model.ruleConfig.remark').d('备注'),
          type: 'string',
        },
        {
          name: 'action',
          label: intl.get('hzero.common.button.action').d('操作'),
          type: 'string',
        },
      ],
      queryFields: [
        {
          name: 'processDefinitionId',
          label: intl.get('swfl.processAppoint.model.ruleConfig.process').d('流程'),
          type: 'object',
          lovCode: 'SWFL.PROCESS_DEFINITION',
          lovPara: {
            procAssignId: procAssignConfId,
            asyncCountFlag: 'DEFAULT',
          },
          transformRequest: (value) => (value ? value.id : undefined),
        },
        {
          name: 'defaultSubmitEmployee',
          label: intl
            .get('swfl.processAppoint.model.ruleConfig.defaultSubmitUserId')
            .d('默认流程发起人'),
          type: 'object',
          lovCode: 'HWFP.EMPLOYEE',
          logPara: {
            enabledFlag: 1,
            tenantId,
          },
          transformRequest: (value) => (value ? value.employeeNum : undefined),
        },
        ...otherQueryFields,
      ],
      transport: {
        read: ({ data, params }) => {
          const { defaultSubmitEmployee, processDefinitionId, ...otherParams } = data;
          return {
            url: `${HZERO_HWFP}/v1/${tenantId}/process-assign-rule/list`,
            method: 'POST',
            params: {
              ...params,
              procAssignConfId,
              defaultSubmitEmployee,
              processDefinitionId,
            },
            data: otherParams,
          };
        },
      },
      events: {
        beforeLoad: ({ data }) => {
          data.forEach((d) => {
            const { procAssignRuleVarDTOS } = d;
            const variableData = (procAssignRuleVarDTOS || []).map((li) => {
              const tmpName = li.variableName.replace(/\./g, '@');
              return {
                [li.variableName]: li.variableValue,
                [tmpName]: li.variableValue,
                [`${li.variableName}_describe`]: li.variableValueDesc,
                [`${tmpName}_describe`]: li.variableValueDesc,
              };
            });
            return Object.assign(d, ...variableData);
          });
        },
      },
    });
    ds.query();
    return ds;
  }, [procAssignConfId, variableConfig]);

  const addRuleConfig = async () => {
    const record = await ruleConfigDs.create();
    openModal(record, intl.get('hzero.common.create').d('新建'));
  };

  const editRuleConfig = (record) => {
    openModal(record, intl.get('hzero.common.button.edit').d('编辑'));
  };

  const openModal = (record, title) => {
    const { data } = record;
    for (const key in data) {
      if (key.includes('.')) {
        data[key.replace(/\./g, '@')] = data[key];
      }
      if (key.endsWith('LOV')) {
        const valueField = ruleConfigDs.getField(key).get('valueField');
        const textField = ruleConfigDs.getField(key).get('textField');
        data[key] = {
          [textField]: data[key.replace(/LOV$/, '').concat('_describe')],
          [valueField]: data[key.replace(/LOV$/, '')],
        };
      }
    }
    Modal.open({
      title,
      key: ruleConfigKey,
      drawer: true,
      style: {
        width: '380px',
      },
      children: <RuleConfigModal record={record} variableConfig={variableConfig} />,
      onOk: () => new Promise((resolve, reject) => onHandleSave(resolve, reject)),
      onClose: () => {
        ruleConfigDs.reset();
      },
    });
  };

  const onHandleSave = (resolve, reject) => {
    ruleConfigDs
      .validate()
      .then((flag) => {
        if (flag) {
          const actionName = ruleConfigDs.current.get('procAssignRuleConfId')
            ? updateRuleConfig
            : saveRuleConfig;
          const dsData = ruleConfigDs.toJSONData() || [];
          const procAssignRuleList = dsData.map((data) => {
            const {
              procDefId,
              remark,
              name,
              defaultSubmitEmployee,
              defaultSubmitEmployeeName,
              procAssignRuleConfId,
              objectVersionNumber,
              ...others
            } = data;
            const ruleHeader = others;
            for (const key in ruleHeader) {
              const field = variableConfig
                ? variableConfig.find((v) => v.variableName === key)
                : undefined;
              if (
                field &&
                field.variableFieldType &&
                field.variableFieldType.split('/')[0] === 'SELECT'
              ) {
                ruleHeader[key] = others[key.replace(/\./g, '@')];
                const text = ruleConfigDs.getField(key).getText(ruleHeader[key]);
                ruleHeader[key.concat('_describe')] = text;
              } else if (key.includes('@') && !key.endsWith('_describe')) {
                const originKey = key.replace(/@/g, '.');
                ruleHeader[originKey] = others[key];
                if (key.endsWith('LOV')) {
                  const valueField = ruleConfigDs.getField(originKey).get('valueField');
                  const textField = ruleConfigDs.getField(originKey).get('textField');
                  ruleHeader[originKey.replace(/LOV$/, '')] = others[key]
                    ? others[key][valueField]
                    : undefined;
                  ruleHeader[originKey.replace(/LOV$/, '').concat('_describe')] = others[key]
                    ? others[key][textField]
                    : undefined;
                }
                delete ruleHeader[key];
              }
            }
            return {
              procDefId,
              remark,
              name,
              defaultSubmitEmployee,
              procAssignRuleConfId,
              objectVersionNumber,
              ruleHeader,
            };
          });
          actionName({
            procAssignConfId,
            procAssignRuleList,
          }).then((res) => {
            if (getResponse(res)) {
              notification.success();
              ruleConfigDs.query();
              resolve();
            } else {
              reject(false);
            }
          });
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        reject(err);
      });
  };

  const onDeleteRuleConfig = (record) => {
    deleteRuleConfig([record.toData()])
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          ruleConfigDs.query();
        }
      })
      .catch((err) => {
        notification.error({
          message: err,
        });
      });
  };

  const ruleConfigButtons = [
    <Button color="primary" icon="playlist_add" size="small" onClick={() => addRuleConfig()}>
      {intl.get('swfl.processAppoint.model.button.addRuleConfig').d('新增规则配置')}
    </Button>,
  ];
  return (
    <div className="rule-config">
      <div className="table-title">
        <span>{intl.get('swfl.processAppoint.model.button.ruleConfig').d('规则配置')}</span>
      </div>
      <Table
        dataSet={ruleConfigDs}
        columns={columns}
        buttons={ruleConfigButtons}
        queryFields={queryFieldsProps}
      />
    </div>
  );
}
