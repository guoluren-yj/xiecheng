/* eslint-disable react/jsx-key */
/* eslint-disable react/display-name */
/* eslint-disable no-param-reassign */
import React, { useMemo, useCallback } from 'react';
import {
  DataSet,
  Button,
  Table,
  Tooltip,
  TextField,
  Modal,
  Form,
  IntlField,
  Lov,
  Select,
} from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { getResponse, getCurrentLanguage } from 'utils/utils';
import { omit } from 'lodash';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { runInAction } from "mobx";
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import notification from 'utils/notification';

import {
  updateDataSetNode,
  updateDataSetField,
  updateDataSetObj,
  savePrintDatasetMetas,
  saveApproveNode,
  deleteApproveNode,
} from '@/services/dataSetService';
import { getTreeNodeIcon, getObjectDs, addFieldTableDs } from './store';
import styles from './index.less';
import SelectField from './SelectField';

const CreateNodeOrObjForm = observer(({ limitArr, record }) => {
  const type = record.get('type');
  return (
    <Form record={record} labelLayout="float">
      <Select
        name="type"
        clearButton={false}
        optionsFilter={(r) => limitArr.includes(r.get('value'))}
      />
      {['node', 'approve'].includes(type) ? (
        <>
          <TextField name="nodeCode" restrict="0-9A-Za-z-._" />
          <IntlField name="nodeName" />
        </>
      ) : (
        <Lov name="object" clearButton={false} hidden={type !== 'object'} />
      )}
    </Form>
  );
});

const nodeNameTlsMap = {
  "zh_CN": "审批记录节点",
  "en_US": "Approval Record Node",
  "ja_JP": "Approval Record Node",
  "th_TH": "Approval Record Node",
  "zh_TW": "審批記錄節點",
  "vi_VN": "Approval Record Node",
  "ru_RU": "Approval Record Node",
};

const MetaData = ({ isUrlDataSet, metaDataTableDs, formDs, initData, metaDataUpdate, approveNodeFlag, canEdit, isAdmin }) => {
  const objectDs = useMemo(
    () =>
      new DataSet(
        getObjectDs(formDs.current ? (formDs.current.get('tenantId') || {}).tenantId : undefined)
      ),
    [formDs]
  );

  const handleEditNode = useCallback(
    (record) => {
      const { _type } = record.get(['_type', '_name']);
      const nameField =
        _type === 'node' ? 'nodeName' : _type === 'obj' ? 'objectName' : 'fieldName';
      const ds = new DataSet({
        fields: [
          {
            name: '_code',
            disabled: true,
            label:
              _type === 'node'
                ? intl.get('hrpt.reportDataSet.view.label.nodeCode').d('节点编码')
                : _type === 'obj'
                ? intl.get('hrpt.reportDataSet.view.label.objCode').d('对象编码')
                : intl.get('hrpt.reportDataSet.view.label.fieldCode').d('字段编码'),
            validator: (value) => {
              if (_type !== 'node') return;
              if (/_/.test(value || "")) {
                return intl.get("hrpt.reportDataSet.validate.noUnderLine.nodeCode").d("打印数据集中，节点编码不支持包含下划线");
              }
            },
          },
          {
            name: nameField,
            label:
              _type === 'node'
                ? intl.get('hrpt.reportDataSet.view.label.nodeName').d('节点名称')
                : _type === 'obj'
                ? intl.get('hrpt.reportDataSet.view.label.objName').d('对象名称')
                : intl.get('hrpt.reportDataSet.view.label.fieldName').d('字段名称'),
            type: 'intl',
            required: true,
          },
        ],
      });
      ds.create({ ...record.toData() }).status = 'update';
      Modal.open({
        title:
          _type === 'node'
            ? intl.get('hrpt.reportDataSet.view.title.editNodeName').d('编辑节点名称')
            : _type === 'obj'
            ? intl.get('hrpt.reportDataSet.view.title.editObjName').d('编辑对象名称')
            : intl.get('hrpt.reportDataSet.view.label.editFieldName').d('编辑字段名称'),
        children: (
          <Form dataSet={ds} labelLayout="float">
            <TextField name="_code" />
            <IntlField name={nameField} />
          </Form>
        ),
        onOk: () =>
          handleSaveNodeName({
            ds,
            nameField,
            record,
          }),
      });
    },
    [handleSaveNodeName]
  );

  const handleSaveNodeName = useCallback(
    async ({ ds, nameField, record }) => {
      const flag = await ds.validate();
      if (!flag) {
        return false;
      }
      if (ds.current) {
        const newName = ds.current.get(nameField);
        const { _tls, fieldCode, fieldName } = ds.current.toJSONData();
        const _type = record.get('_type');
        if (_type === 'approveStageExField' || _type === 'approveStageDetailExField') {
          const parentRecord = record.parent;
          if (parentRecord) {
            const config = parentRecord.get('config') ? JSON.parse(parentRecord.get('config')) : {};
            if (_type === 'approveStageExField' && config.stageExFields && config.stageExFields.length > 0) {
              config.stageExFields = config.stageExFields.map(f => f.fieldCode !== fieldCode ? f : { ...f, fieldName, _tls });
            } else if (_type === 'approveStageDetailExField' && config.detailExFields && config.detailExFields.length > 0) {
              config.detailExFields = config.detailExFields.map(f => f.fieldCode !== fieldCode ? f : { ...f, fieldName, _tls });
            }
            parentRecord.set('config', JSON.stringify(config));
            return saveApproveNode({ data: parentRecord.toData() }).then(res => {
              if (getResponse(res)) {
                parentRecord.set('__token', res.__token);
                parentRecord.set('objectVersionNumber', res.objectVersionNumber);
                record.set('fieldName', fieldName);
                record.set('_name', fieldName);
                record.set('_tls', _tls);
                notification.success();
                return true;
              }
              return false;
            });
          }
        } else if (isUrlDataSet) {
          record.set(nameField, newName);
          record.set('_name', newName);
          record.set('_tls', _tls);
          if (record.get("_type") === 'field') {
            record.set("fieldPointerType", "NONE");
          }
        } else {

          const sericeParam = omit(
            {
              ...record.toData(),
              ...ds.current.toData(),
            },
            ['datasetObjectList', 'lastUpdateDate', 'lastUpdatedBy']
          );
          let serviceName = updateDataSetField;
          switch(record.get('_type')) {
            case 'node': serviceName = updateDataSetNode;break;
            case 'field': serviceName = updateDataSetField;break;
            case 'obj': serviceName = updateDataSetObj;break;
            default:return;
          }
          const res = await serviceName(sericeParam);
          if (getResponse(res)) {
            notification.success();
            if (!res) {
              return;
            }
            const { _token, objectVersionNumber } = res;
            record.set('_token', _token);
            record.set('objectVersionNumber', objectVersionNumber);

            record.set(nameField, res[nameField]);
            record.set('_name', res[nameField]);
            record.status = 'sync';
          }
        }
      }
    },
    [metaDataTableDs, isUrlDataSet]
  );

  const handleEdit = useCallback((record) => {
    record.setState('editing', true);
  }, []);

  const handleSave = useCallback(
    async (record) => {
      const param = omit(
        {
          ...record.toData(),
        },
        ['datasetObjectList', 'lastUpdateDate', 'lastUpdatedBy']
      );
      const res = await updateDataSetField(param);
      if (getResponse(res)) {
        notification.success();
        if (!res) {
          return;
        }
        const { businessType, _token, objectVersionNumber } = res;
        record.set('_token', _token);
        record.set('objectVersionNumber', objectVersionNumber);
        record.set('businessType', businessType);
        // eslint-disable-next-line no-param-reassign
        record.status = 'sync';
        record.setState('editing', false);
        return true;
      }
      return false;
    },
    [metaDataTableDs]
  );

  const handleCancle = useCallback((record) => {
    record.setState('editing', false);
    record.reset();
  }, []);


  const handleAddNodeOrObj = useCallback(
    ({ record: parentNode }) => {
      const type = parentNode.get("_type");
      let limitArr = [];
      if (isUrlDataSet) limitArr.push("node", "object");
      if (!approveNodeFlag && type === 'node' && ['0', undefined].includes(parentNode.get("_parentId"))) limitArr.push('approve');
      const ds = new DataSet({
        events: {
          update: ({ record, name, value }) => {
            if (name === 'type') {
              record.init('object', undefined);
              record.init('nodeCode', value === "approve" ? "XXXapprovalRecordRootXXX" : undefined);
              record.set("nodeName", undefined);
              record.set("_tls", {});
              if (value === "approve") {
                record.set("nodeName", nodeNameTlsMap[getCurrentLanguage()] || "审批记录节点");
                record.set("_tls", { "nodeName": nodeNameTlsMap });
                // 此处检验是为了解决切换type的时候nodeName校验多语言异常的问题
                record.validate();
              }
            }
          },
        },
        fields: [
          {
            name: 'type',
            label: intl.get('hrpt.reportDataSet.view.label.type').d('类型'),
            required: true,
            defaultValue: limitArr[0],
            options: new DataSet({
              selection: 'single',
              data: [
                {
                  meaning: intl.get('hrpt.reportDataSet.view.label.node').d('节点'),
                  value: 'node',
                },
                {
                  meaning: intl.get('hrpt.reportDataSet.view.label.object').d('对象'),
                  value: 'object',
                },
                {
                  meaning: intl.get('hrpt.reportDataSet.view.label.approve').d('审批记录节点'),
                  value: 'approve',
                },
              ],
            }),
          },
          {
            name: 'object',
            label: intl.get('hrpt.reportDataSet.view.label.businessObject').d('业务对象'),
            type: 'object',
            lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
            dynamicProps: {
              required: ({ record }) => record.get('type') === 'object',
            },
          },
          {
            name: 'nodeCode',
            label: intl.get('hrpt.reportDataSet.view.label.nodeCode').d('节点编码'),
            dynamicProps: {
              required: ({ record }) => record.get('type') === 'node',
              disabled: ({ record }) => record.get('type') === 'approve',
            },
            validator: (value, name, record) => {
              if (record.get('type') !== 'node') return;
              if (/_/.test(value || "")) {
                return intl.get("hrpt.reportDataSet.validate.noUnderLine.nodeCode").d("打印数据集中，节点编码不支持包含下划线");
              }
            },
          },
          {
            name: 'nodeName',
            type: 'intl',
            label: intl.get('hrpt.reportDataSet.view.label.nodeName').d('节点名称'),
            dynamicProps: {
              required: ({ record }) => ['node', 'approve'].includes(record.get('type')),
              disabled: ({ record }) => record.get('type') === 'approve',
            },
          },
        ],
      });
      const record = ds.create(limitArr[0] === 'approve' ? {
        _tls: { "nodeName": nodeNameTlsMap },
        nodeCode: "XXXapprovalRecordRootXXX",
        nodeName: nodeNameTlsMap[getCurrentLanguage()] || "审批记录节点",
      } : {});

      const tenantIdObj = (formDs.current && formDs.current.get('tenantId')) || {};
      Modal.open({
        title: isUrlDataSet ? intl.get('hrpt.reportDataSet.view.title.addNodeOrObj').d('添加节点/对象') : intl.get('hrpt.reportDataSet.view.label.addNode').d('添加节点'),
        children: (
          <CreateNodeOrObjForm
            record={record}
            approveNodeFlag={approveNodeFlag}
            limitArr={limitArr}
          />
        ),
        onOk: async () => {
          const flag = await record.validate();
          if (!flag) {
            return false;
          }
          const datasetCode = formDs.current.get('datasetCode');
          const parentNodeCode = parentNode.get('nodeCode');
          const parentId = parentNode.get('nodeUuid') || parentNode.get('_id');
          const { _tls } = record.toJSONData();
          const { type, nodeCode, nodeName, object } = record.get([
            'type',
            'nodeCode',
            'nodeName',
            'object',
          ]);
          let newData = null;
          const { businessObjectCode, businessObjectName } = object || {};
          switch(type) {
            case 'node':
              newData = {
                _id: uuid().replaceAll('-', ''),
                _type: 'node',
                _name: nodeName,
                _code: nodeCode,
                nodeCode,
                nodeName,
                datasetCode,
                orderSeq: 0,
                datasetObjectList: [],
                _parentId: parentId,
                parentNodeUuid: parentId,
                parentNodeCode,
                _tls,
              };
              break;
            case 'object':
              newData = {
                _id: uuid().replaceAll('-', ''),
                _type: 'obj',
                _name: businessObjectName,
                _code: businessObjectCode,
                objectCode: businessObjectCode,
                objectName: businessObjectName,
                tableName: businessObjectCode,
                tableAlias: businessObjectCode,
                objectSourceType: 'BUSINESS_OBJECT',
                objectPointerType: 'BUSINESS_OBJECT',
                businessObjectCode,
                orderSeq: 0,
                _parentId: parentId,
              };
              break;
            case 'approve':
              if (isUrlDataSet) {
                if (!await handleBatchSave(true)) {
                  return false;
                }
              }
              newData = {
                orderSeq: 0,
                _id: uuid().replaceAll('-', ''), _type: 'approve', _name: nodeName, _code: nodeCode, _parentId: parentId,
                nodeCode, nodeName, parentNodeUuid: parentId, parentNodeCode, datasetUuid: formDs.current.get('datasetUuid'), datasetCode,
                _tls,
                tenantId: tenantIdObj.tenantId,
              };
              return saveApproveNode({ data: newData }).then(res => {
                if (getResponse(res)) {
                  initData();
                  notification.success();
                  return true;
                }
                return false;
              });
          }
          if (newData && type !== "approve") metaDataTableDs.create(newData);
          return true;
        },
      });
    },
    [formDs, metaDataTableDs, approveNodeFlag, handleBatchSave]
  );

  const handleAddNode = useCallback(
    (parentNode) => {
      // 不传就是创建根节点
      const ds = new DataSet({
        fields: [
          {
            name: 'nodeCode',
            label: intl.get('hrpt.reportDataSet.view.label.nodeCode').d('节点编码'),
            required: true,
            validator: (value) => {
              if (/_/.test(value || "")) {
                return intl.get("hrpt.reportDataSet.validate.noUnderLine.nodeCode").d("打印数据集中，节点编码不支持包含下划线");
              }
            },
          },
          {
            name: 'nodeName',
            type: 'intl',
            label: intl.get('hrpt.reportDataSet.view.label.nodeName').d('节点名称'),
            required: true,
          },
        ],
      });
      const isRoot = !parentNode;
      if (!isRoot) {
        ds.create({
          parentNodeName: parentNode.get('nodeName'),
          parentNodeCode: parentNode.get('nodeCode'),
        });
      } else {
        ds.create();
      }
      Modal.open({
        title: intl.get('hrpt.reportDataSet.view.button.addNode').d('新增节点'),
        children: (
          <Form dataSet={ds} labelLayout="float">
            <TextField name="nodeCode" restrict="0-9A-Za-z-._" />
            <IntlField name="nodeName" />
            {!isRoot && (
              <TextField
                disabled
                name="parentNodeName"
                label={intl.get('hrpt.reportDataSet.view.label.parentNodeName').d('父节点名称')}
              />
            )}
          </Form>
        ),
        onOk: async () => {
          if (ds.current) {
            ds.current.status = 'update';
          }
          const flag = await ds.validate();
          if (!flag || !formDs.current) {
            return false;
          }
          const { _tls } = ds.current.toJSONData();
          const { nodeCode, nodeName, parentNodeCode } = ds.current.get([
            'nodeCode',
            'nodeName',
            'parentNodeCode',
          ]);
          const datasetCode = formDs.current.get('datasetCode');
          let newNode = {
            _id: uuid().replaceAll('-', ''),
            _type: 'node',
            _name: nodeName,
            _code: nodeCode,
            nodeCode,
            nodeName,
            datasetCode,
            orderSeq: 0,
            datasetObjectList: [],
            _tls,
          };
          if (!isRoot) {
            const parentId = parentNode.get('nodeUuid') || parentNode.get('_id');
            newNode = {
              ...newNode,
              _parentId: parentId,
              parentNodeUuid: parentId,
              parentNodeCode,
            };
          }
          metaDataTableDs.create(newNode);
          return true;
        },
      });
    },
    [formDs, metaDataTableDs]
  );

  const handleAdd = useCallback(
    ({ dataSet, record, type }) => {
      if (type === 'approveStage') {
        handleAddApproveStageField({ dataSet, record });
      } else if (['obj', 'approve'].includes(type)) {
        handleAddField({ dataSet, record, type });
      } else {
        handleAddNodeOrObj({ dataSet, record, type });
      }
    },
    [handleAddApproveStageField, handleAddField, handleAddNodeOrObj]
  );

  const handleAddApproveStageField = useCallback(
    ({ dataSet, record }) => {
      const formDs = new DataSet({
        fields: [
          { name: 'level', defaultValue: 'stage', required: true, label: intl.get('hrpt.reportDataSet.approveStage.level').d('所属层级') },
          { 
            name: 'fieldCode',
            label: intl.get('hrpt.reportDesign.view.title.fieldCode').d('字段编码'),
            required: true,
            validator: (value) => {
              if (value && /[\u4e00-\u9fa5 ]/.test(value)) {
                return intl.get('hrpt.reportDesign.validation.NotIncludeChinese').d(`不支持中文、空格`);
              }
            },
          },
          { name: 'fieldName', type: 'intl', required: true, label: intl.get('hrpt.reportDesign.view.title.fieldName').d('字段名称') },
        ],
      });
      const formRecord = formDs.create();
      Modal.open({
        title: intl.get('hrpt.reportDataSet.view.title.addField').d('添加字段'),
        style: { width: '600px' },
        children: (
          <Form record={formRecord} columns={1} labelLayout='float'>
            <Select name='level' clearButton={false}>
              <Select.Option value='stage'>{intl.get('hrpt.reportDesign.view.title.approveStage').d('审批阶段')}</Select.Option>
              <Select.Option value='detail'>{intl.get('hrpt.reportDesign.view.title.approveRecordDetail').d('审批记录详情')}</Select.Option>
            </Select>
            <TextField name='fieldCode' />
            <IntlField name='fieldName' />
          </Form>
        ),
        onOk: async() => {
          const flag = await formRecord.validate();
          if (!flag) {
            return false;
          }
          const { level, fieldCode, fieldName, _tls } = formRecord.get(['level', 'fieldCode', 'fieldName', '_tls']);
          const fieldsKey = level === 'stage' ? 'stageExFields' : 'detailExFields';
          let config = JSON.parse(record.get('config') || '{}');
          if ((config[fieldsKey] || []).some(({ fieldCode: fc }) => fc === fieldCode)) {
            notification.warning({
              message: intl.get('hrpt.reportDataSet.view.title.approveNodeExist').d('审批记录节点同阶段下字段编码不可重复'),
            });
            return false;
          }
          config[fieldsKey] = (config[fieldsKey] || []).concat({
            fieldName,
            fieldCode,
            _tls,
          });
          record.set('config', JSON.stringify(config));
          const result = await saveApproveNode({ data: record.toData() });
          if (getResponse(result)) {
            record.set('__token', result.__token);
            record.set('objectVersionNumber', result.objectVersionNumber);
            dataSet.create({
              ...formRecord.toData(),
              _id: uuid().replaceAll('-', ''),
              _type: level === 'stage' ? 'approveStageExField' : 'approveStageDetailExField',
              _name: fieldName,
              _code: fieldCode,
              _parentId: record.get('nodeUuid'),
            }).status= 'sync';
            return true;
          }
          return false;
        },
      });
    }
  , []);

  const handleAddField = useCallback(
    ({ dataSet, record }) => {
      // 已选择的字段
      const usedFileds = dataSet
        .filter((r) => r.get('_type') === 'field' && r.get('_parentId') === record.get('_id'))
        .map((i) => i.toData());
      const businessObjectCode = record.get('businessObjectCode');
      const tableDs = new DataSet(addFieldTableDs());
      const { tenantId } = (formDs.current && formDs.current.get('tenantId')) || {};
      Modal.open({
        title: intl.get('hrpt.reportDataSet.view.title.addField').d('添加字段'),
        style: {
          width: '600px',
        },
        children: (
          <SelectField
            tenantId={tenantId}
            usedFileds={usedFileds}
            tableDs={tableDs}
            businessObjectCode={businessObjectCode}
          />
        ),
        onOk: () => {
          if (!tableDs.selected || !tableDs.selected.length) {
            notification.warning({
              message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
            });
            return false;
          }
          tableDs.selected.forEach((r) => {
            const {
              businessObjectFieldCode,
              dataType,
              fieldName,
              fieldType,
              multiLanguageFlag,
              tableColumnName,
              tableName,
            } = r.get([
              'businessObjectFieldCode',
              'dataType',
              'fieldName',
              'fieldType',
              'multiLanguageFlag',
              'tableColumnName',
              'tableName',
            ]);
            const newNode = {
              _id: uuid().replaceAll('-', ''),
              _type: 'field',
              _name: fieldName,
              _code: businessObjectFieldCode,
              _parentId: record.get('objectUuid') || record.get('_id'),
              fieldName,
              fieldType,
              multiLanguageFlag,
              dataType,
              tableName,
              tableColumnName,
              canBeDeleted: 1,
              businessObjectFieldCode,
              fieldCode: businessObjectFieldCode,
              fieldSourceType: 'MODEL',
              fieldPointerType: 'BUSINESS_OBJECT_FIELD',
              businessType: 'NONE',
            };
            metaDataTableDs.create(newNode);
          });
        },
      });
    },
    [formDs]
  );

  const handleDelete = useCallback((dataSet, record) => {
    Modal.confirm({
      title: intl.get('hrpt.reportDataSet.view.title.confirmDelete').d('确定删除吗'),
      onOk: () => {
        const _type = record.get("_type");
        if (!['approve', 'approveStage', "approveStageExField", "approveStageDetailExField"].includes(_type)) {
          return dataSet.remove(record, true);
        } else if (_type === 'approveStageExField' || _type === 'approveStageDetailExField') {
          const parentRecord = record.parent;
          if (parentRecord) {
            const config = parentRecord.get('config') ? JSON.parse(parentRecord.get('config')) : {};
            if (_type === 'approveStageExField' && config.stageExFields && config.stageExFields.length > 0) {
              config.stageExFields = config.stageExFields.filter(f => f.fieldCode !== record.get('fieldCode'));
            } else if (_type === 'approveStageDetailExField' && config.detailExFields && config.detailExFields.length > 0) {
              config.detailExFields = config.detailExFields.filter(f => f.fieldCode !== record.get('fieldCode'));
            }
            parentRecord.set('config', JSON.stringify(config));
            return saveApproveNode({ data: parentRecord.toData() }).then(res => {
              if (getResponse(res)) {
                parentRecord.set('__token', res.__token);
                parentRecord.set('objectVersionNumber', res.objectVersionNumber);
                notification.success();
                dataSet.remove(record, true)
                return true;
              }
              return false;
            });
          }
        } else {
          return deleteApproveNode({ data: record.toJSONData() }).then(res => {
            if (getResponse(res)) {
              initData();
              notification.success();
              return true;
            }
            return false;
          });
        }
      },
    });
  }, [initData]);

  const handleBatchSave = useCallback(async (flag) => {
    const nodeList = [];
    const tenantIdObj = (formDs.current && formDs.current.get('tenantId')) || {};
    if (isUrlDataSet) {
      const data = metaDataTableDs.toData();
      data.forEach((node) => {
        if (['node', 'approve', 'approveStage'].includes(node._type)) {
          const newNode = node;
          const objList = [];
          if (node._type === 'node') {
            data.forEach((obj) => {
              const newObj = obj;
              if (obj._type === 'obj' && obj._parentId === node._id) {
                const fieldList = [];
                data.forEach((field) => {
                  if (field._type === 'field' && field._parentId === obj._id) {
                    fieldList.push({
                      ...field,
                      tenantId: tenantIdObj.tenantId,
                    });
                  }
                });
                newObj.datasetFieldList = fieldList;
                newObj.tenantId = tenantIdObj.tenantId;
                objList.push(newObj);
              }
            });
            // 说明是批量保存新建的节点
            if (node.nodeId === undefined || node.nodeId === null) {
              // 后端在创建级联节点时，需要nodeUuid
              node.nodeUuid = node._id;
            }
            newNode.datasetObjectList = objList;
          }
          newNode.tenantId = tenantIdObj.tenantId;
          nodeList.push(newNode);
        }
      });
    }
    if (!formDs.current) {
      return;
    }
    const resp = await savePrintDatasetMetas({
      params: { tenantId: tenantIdObj.tenantId },
      data: {
        ...formDs.current.toData(),
        datasetNodeList: nodeList,
      },
    });
    if (getResponse(resp)) {
      // 临时性改动，适配小保存前的批量保存
      if (!flag) {
        notification.success();
      }
      await initData();
      return true;
    }
    return false;
  }, [formDs, metaDataTableDs, isUrlDataSet]);

  useMemo(() => {
    runInAction(() => {
      metaDataUpdate.addFlag = metaDataTableDs && !metaDataTableDs.records.length;
      metaDataUpdate.handleAddNode = handleAddNode;
      metaDataUpdate.handleBatchSave = handleBatchSave;
      metaDataUpdate.isInit = true;
    });
  }, [metaDataUpdate, metaDataTableDs && !metaDataTableDs.records.length, handleBatchSave, handleAddNode]);

  const metaDataTableColumn = useMemo(() => {
    return [
      {
        name: '_name',
        tooltip: 'none',
        renderer: ({ value, record, dataSet }) => {
          if (!record) {
            return;
          }
          const { _id, _parentId, _type, fieldPointerType, dataType, canBeDeleted, deprecatedFlag } = record.get([
            '_id',
            '_parentId',
            '_type',
            'fieldPointerType',
            'dataType',
            'canBeDeleted',
            'deprecatedFlag',
          ]);
          // url数据集，字段名称仅admin账号可编辑
          const canEditNameFlag =
            isUrlDataSet ?
              (_type !== 'field' && _type !== 'approve')
              : (
                ['obj', 'node', 'approveStage', 'approveStageExField', 'approveStageDetailExField'].includes(_type) 
                || (_type === 'field' && fieldPointerType === 'NONE')
              );
          const canAddNodeFlag = !approveNodeFlag && _type === "node" && ['0', undefined].includes(_parentId) || isUrlDataSet && ['node', 'obj'].includes(_type);
          // url数据集【非根节点的无子级的节点和对象】或【canBeDeleted等于1的字段】可删除
          const canDeletedFlag = ["approve", "approveStage", "approveStageExField", "approveStageDetailExField"].includes(_type) || isUrlDataSet && _parentId && (
            _type === 'field' ? canBeDeleted === 1 : !dataSet.some((r) => r.get('_parentId') === _id)
          );
          const canAddApproveStageFlag = _type === "approve";
          const canAddApproveStageFieldFlag = _type === "approveStage";
          return (
            <span className={styles['node-name']}>
              <span className={styles['node-name-icon']}>
                {getTreeNodeIcon(_type === 'field' ? dataType : _type)}
              </span>
              <span className={styles['node-name-text']}>{value}</span>
              {
                deprecatedFlag && (
                  <Tooltip title={intl.get('hrpt.common.view.title.deprecatedField').d('该字段已在业务对象中删除，模板中该字段可能无法正常打印出值，如有需要请联系对象所属功能团队')}>
                    <Icon type="help" style={{ color: "#868d9c", fontSize: "14px", lineHeight: "20px", height: "22px" }} />
                  </Tooltip>
                )
              }
              {canEditNameFlag && !canAddApproveStageFlag && (
                <Tooltip title={intl.get('hrpt.reportDataSet.view.button.editName').d('编辑名称')}>
                  <Icon
                    type="mode_edit"
                    onClick={() => {
                      if (_type === 'approveStage') {
                        handleAddApproveStage({
                          handleBatchSave, isUrlDataSet,
                          initData, record, formDs, metaDataTableDs
                        });
                      } else {
                        handleEditNode(record);
                      }
                    }}
                  />
                </Tooltip>
              )}
              {canEdit && canAddNodeFlag && !canAddApproveStageFlag && (
                <Tooltip
                  title={
                    isUrlDataSet ? _type === 'obj'
                      ? intl.get('hrpt.reportDataSet.view.label.addField').d('添加字段')
                      : intl.get('hrpt.reportDataSet.view.label.addNodeOrObj').d('添加节点/对象')
                    : intl.get('hrpt.reportDataSet.view.label.addNode').d('添加节点')
                  }
                >
                  <Icon type="add" onClick={() => handleAdd({ dataSet, record, type: _type })} />
                </Tooltip>
              )}
              {canEdit &&
                canAddApproveStageFlag && (
                <Tooltip
                  title={intl.get('hrpt.reportDataSet.view.title.addApproveStage', { type: intl.get("hzero.common.view.title.create") }).d('{type}审批阶段')}
                >
                  <Icon
                    type="add"
                    onClick={() => {
                      handleAddApproveStage({
                        initData, record, addFlag: true, handleBatchSave, isUrlDataSet,
                        formDs, metaDataTableDs,
                      });
                    }}
                  />
                </Tooltip>
              )}
              {canEdit && canAddApproveStageFieldFlag && (
                <Tooltip
                  title={intl.get('hrpt.reportDataSet.view.label.addField').d('添加字段')}
                >
                  <Icon type="add" onClick={() => handleAdd({ dataSet, record, type: _type })} />
                </Tooltip>
              )}
              {canEdit && canDeletedFlag && (
                <Tooltip title={intl.get('hrpt.reportDataSet.view.label.delete').d('删除')}>
                  <Icon
                    type="delete_black-o"
                    onClick={() => {
                      handleDelete(dataSet, record);
                    }}
                  />
                </Tooltip>
              )}
              {['approveStageExField', 'approveStageDetailExField'].includes(_type) && (
                <Tooltip
                  title={_type === 'approveStageExField'
                    ? intl.get('hrpt.reportDataSet.view.title.approveStage.tip').d('审批阶段')
                    : intl.get('hrpt.reportDataSet.view.title.approveStageEx.tip').d('审批记录详情')
                  }
                >
                  <Icon type="help_outline" style={{ marginLeft: '16px' }} />
                </Tooltip>    
              )}
            </span>
          );
        },
      },
      {
        name: '_code',
        width: 250,
      },
      {
        name: 'businessObjectCode',
        width: 250,
      },
      {
        name: 'dataType',
        width: 150,
      },
      {
        name: 'businessType',
        width: 150,
        editor: (record) =>
          record.get('_type') === 'field' && (isUrlDataSet || record.getState('editing')),
      },
      !isUrlDataSet && {
        name: 'operator',
        width: 150,
        lock: 'right',
        header: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) => {
          if (!record || record.get('_type') !== 'field') {
            return null;
          }
          if (!record.getState('editing')) {
            return [
              <Button color="primary" funcType="flat" onClick={() => handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>,
            ];
          } else {
            return [
              <Button color="primary" funcType="flat" onClick={() => handleSave(record)}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              <Button color="primary" funcType="flat" onClick={() => handleCancle(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>,
            ];
          }
        },
      },
    ].filter(Boolean);
  }, [
    isUrlDataSet,
    objectDs,
    approveNodeFlag,
    handleEditNode,
    handleSave,
    handleEdit,
    handleCancle,
    handleAdd,
    handleAddNode,
    handleAddField,
    handleAddApproveStageField,
    handleDelete,
    initData,
    canEdit,
    metaDataTableDs,
  ]);

  return (
    <Table
      className={styles['meta-table']}
      mode="tree"
      dataSet={metaDataTableDs}
      columns={metaDataTableColumn}
      autoHeight={{ type: 'maxHeight', diff: 40 }}
    />
  );
};

const handleAddApproveStage = ({ isUrlDataSet, initData, record, addFlag, formDs, handleBatchSave, metaDataTableDs }) => {
  const type = record.get("_type");

  const datasetUuid = formDs.current.get('datasetUuid');
  const datasetCode = formDs.current.get('datasetCode');
  const tenantIdObj = (formDs.current && formDs.current.get('tenantId')) || {};
  const ds = new DataSet({
    autoQuery: false,
    primaryKey: 'id',
    parentField: 'parentId',
    paging: false,
    idField: 'id',
    fields: [
      {
        label: intl.get('hrpt.reportDataSet.view.title.approveStageName').d('审批阶段名称'),
        name: 'nodeName',
        type: "intl",
        required: type === "approve",
      },
      {
        label: intl.get('hrpt.reportDataSet.view.title.approveStageCode').d('审批阶段编码'),
        name: 'nodeCode',
        required: type === "approve",
      },
    ],
  });
  if (!addFlag) {
    ds.loadData([record.toJSONData()]);
  } else {
    ds.create();
  }
  Modal.open({
    title: intl.get('hrpt.reportDataSet.view.title.addApproveStage', {
      type: addFlag ? intl.get("hzero.common.view.title.create") : intl.get("hzero.common.view.title.edit"),
    }).d('{type}审批阶段'),
    style: {
      width: '600px',
    },
    children: (
      <Form dataSet={ds} labelLayout="float">
        <TextField name="nodeCode" restrict="0-9A-Za-z-._" disabled={!addFlag} />
        <IntlField name="nodeName" />
      </Form>
    ),
    onOk: async () => {
        const currentData = {
          parentNodeUuid: record.get("nodeUuid"), parentNodeCode: record.get("nodeCode"),
          ...ds.current.toJSONData(),
        };
        if (!currentData.nodeCode) return false;
        if (isUrlDataSet) {
          if (!await handleBatchSave(true)) {
            return false;
          }
        }
        if (!addFlag) {
          const targetRecord = metaDataTableDs.find(r => r.get('_id') === currentData._id);
          if (targetRecord) {
            currentData.objectVersionNumber = targetRecord.get('objectVersionNumber');
            currentData._token = targetRecord.get('_token');
          }
        }
        const parentId = addFlag ? record.get("_id") : currentData.parentNodeUuid;
        const data = {
          orderSeq: 0,
          _id: currentData.nodeUuid || uuid().replaceAll('-', ''), _type: 'approveStage', _name: currentData.nodeName, _code: currentData.nodeCode, _parentId: parentId,
          ...currentData,
          datasetUuid, datasetCode,
          tenantId: tenantIdObj.tenantId,
        };
        return saveApproveNode({ data }).then(res => {
          if (getResponse(res)) {
            initData();
            notification.success();
            return true;
          }
          return false;
        });
    },
  });
};

export default observer(MetaData);
