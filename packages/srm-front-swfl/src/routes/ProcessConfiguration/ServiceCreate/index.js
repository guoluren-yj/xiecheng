/**
 * ProcessConfig
 * @date: 2022-07-12
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Form, Lov, TextField, Select, Switch, DataSet, Output, IntlField } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { isEmpty, isArray, isFunction, omit } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import withProps from 'utils/withProps';
import {
  fetchDetail,
  getApprovalGroupList,
  getApproverList,
  createService,
  updateService,
  queryParams,
  saveDefaultExpressionEngine,
} from '../processConfigurationService';
import {
  getServiceExpressionTable,
  getServiceScriptTable,
  getServiceParamsTable,
} from './serviceStoreDs';
import ApprovalGroup from './ApprovalGroup';
import ExpressionParameter from './ExpressionParameter';
import ExpressionEngine from '../../../components/ExpressionEngine/index.tsx';
import ScriptParameter from './ScriptParameter';
import ParamsDrawer from './ParamsDrawer';

function ServiceCreate(props = {}) {
  const {
    recordData = {},
    currentNode,
    isPredefined, // 预定义
    isSiteFlag,
    serviceConfigFormDs,
    currentTenantId,
    onRef,
    categoryId: originCategoryId,
    documentId,
    categoryCode,
    serviceExpressionTableDs,
    serviceScriptTableDs,
    serviceParamsTableDs,
  } = props;
  const [isApprovalStrategy, setApprovalStrategy] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [currentServiceMode, setCurrentServiceMode] = useState('');
  const [parameterList, setParameterList] = useState([]);
  const [approvalGroupList, setApprovalGroupList] = useState([]); // 审批组下拉框列表
  const [approverList, setApproverList] = useState([]); // 审批人下拉框列表
  const [currentApprovalGroup, setCurrentApprovalGroup] = useState({}); // 当前审批组信息
  const [showApprovalGroup, setShowApprovalGroup] = useState(false);
  const approvalGroup = useRef();
  const expressionEngineRef = useRef({});
  const [formDocumentId, setFormDocumentId] = useState('');
  const [formData, setFormData] = useState({});
  const [categoryId, setCategoryId] = useState();
  const conditionColumnFormDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'conditionColumn',
          type: 'object',
          label: intl.get('hwfp.serviceDefinition.model.button.addConditionColumn').d('添加条件'),
          lovCode: 'HWFP.APPROVAL_GROUP_COLUMN_LOV_VIEW',
          multiple: true,
          textField: 'columnName',
          valueField: 'parameterValue',
          lovPara: {
            columnType: 'INPUT',
          },
          optionsProps: {},
        },
      ],
    });
  }, []);

  useEffect(() => {
    if (!isEmpty(recordData) && recordData.serviceId) {
      setCategoryId(recordData.categoryId || originCategoryId);
      fetchDetailFunc(recordData.serviceId);
    } else {
      setCategoryId(originCategoryId);
      createDsRecord({});
    }
  }, []);

  useEffect(() => {
    if (onRef && isFunction(onRef)) {
      onRef({ handleSave });
    }
  }, []);

  const fetchDetailFunc = (serviceId, flag) => {
    let defaultRecord = {};
    fetchDetail({ serviceId })
      .then((res) => {
        if (getResponse(res)) {
          defaultRecord = res;
          if (
            flag === 'new' &&
            res.serviceMode === 'EXPRESSION_ENGINE' &&
            res.tenantNum &&
            res.serviceCode
          ) {
            saveDefaultExpressionEngine({
              code: `${res.tenantNum}:${res.serviceCode}`,
              conditionExpression: null,
              conditionExpressionJson: '{"conditionType":"TRUE","conditionLines":[]}',
              expressionActionDescription: null,
              id: null,
              objectVersionNumber: null,
              tenantId: null,
            });
          }
          setFormData(res);
          setParameterList(res.parameterList);
          setFormDocumentId(res.documentId);
        }
      })
      .finally(() => {
        createDsRecord(defaultRecord);
        setIsCreate(false);
      });
  };

  const createDsRecord = (record) => {
    const rrr = serviceConfigFormDs.create(record, 0);
    rrr.status = 'update';
    rrr.set('categoryObj', {
      categoryCode: currentNode.categoryCode,
      description: currentNode.description,
      categoryId: record.categoryId || currentNode.categoryId,
    });
    const field = conditionColumnFormDs.getField('conditionColumn');
    if (field) {
      field.setLovPara('defId', currentApprovalGroup?.id || record.approvalGroupDefId);
    }
    const { serviceMode, serviceType } = rrr.get(['serviceMode', 'serviceType']);
    changeServiceType(serviceType);
    changeServiceMode(serviceMode);
    conditionColumnFormDs.loadData([
      {
        conditionColumn: (record.parameterList || [])
          .filter((item) => item.parameterSource !== 'CONSTANT')
          .map((item) => ({
            ...item,
            id: item.interfaceParameterId,
            fieldCode: item.parameterValue,
            fieldName: item.columnName,
          })),
      },
    ]);
  };

  const optionsFilter = (selectOption) => {
    const record = serviceConfigFormDs.current;
    if (record) {
      const serviceType = record.get('serviceType');
      const isTenantLevel = Number(record.get('tenantId')) !== 0;
      const value = selectOption.get('value');
      // EXPRESSION 表达式
      // REMOTE 远程调用
      // LOV_VIEW 值集试图
      // SCRIPT 独立脚本
      // APPROVAL_GROUP 审批组
      // EXPRESSION_ENGINE 表达式引擎

      // APPROVAL_CANDIDATE_RULE 审批规则
      if (serviceType === 'APPROVAL_CANDIDATE_RULE') {
        if (isTenantLevel) {
          return ['EXPRESSION', 'SCRIPT', 'APPROVAL_GROUP'].includes(value);
        } else {
          return ['EXPRESSION', 'REMOTE', 'LOV_VIEW'].includes(value);
        }
        // APPROVAL_STRATEGY 审批方式
      } else if (serviceType === 'APPROVAL_STRATEGY') {
        if (isTenantLevel) {
          return ['SCRIPT', 'EXPRESSION'].includes(value);
        } else {
          return ['EXPRESSION', 'REMOTE'].includes(value);
        }
        // SEQUENCE_CONDITION 跳转方式
      } else if (serviceType === 'SEQUENCE_CONDITION') {
        if (isTenantLevel) {
          return ['SCRIPT', 'EXPRESSION', 'EXPRESSION_ENGINE'].includes(value);
        } else {
          return ['EXPRESSION', 'REMOTE'].includes(value);
        }
        // SERVICE_TASK 服务任务
      } else if (serviceType === 'SERVICE_TASK') {
        if (isTenantLevel) {
          return ['SCRIPT'].includes(value);
        } else {
          return ['REMOTE'].includes(value);
        }
      }
      return true;
    }
  };

  // 服务类别是审批方式时 需要有审批结果表达式
  const changeServiceType = (value) => {
    if (value === 'APPROVAL_STRATEGY') {
      setApprovalStrategy(true);
    } else {
      setApprovalStrategy(false);
    }
    setCurrentServiceMode('');
  };

  const changeServiceMode = (value) => {
    setCurrentServiceMode(value);
    if (value === 'APPROVAL_GROUP') {
      const sourceId = serviceConfigFormDs.current.get('documentId');
      if (sourceId) {
        getApprovalGroupList({ organizationId: currentTenantId, sourceId }).then((res) => {
          if (res && isArray(res)) {
            setApprovalGroupList(res);
          }
        });
      } else {
        setApprovalGroupList([]);
        setShowApprovalGroup(false);
      }
    }
  };

  const changeDocument = (item) => {
    if (item && item.value) {
      setFormDocumentId(item.value);
    } else {
      setFormDocumentId('');
    }
    if (item && !isEmpty(item) && currentServiceMode === 'APPROVAL_GROUP') {
      getApprovalGroupList({ organizationId: currentTenantId, sourceId: item.value }).then(
        (res) => {
          if (res && isArray(res)) {
            setApprovalGroupList(res);
          }
        }
      );
    } else {
      setApprovalGroupList([]);
      setShowApprovalGroup(false);
    }
  };

  const changeApprovalGroup = (value) => {
    const list = approvalGroupList.filter((res) => res.defCode === value);
    if (isArray(list) && list.length > 0) {
      const data = list[0];
      setCurrentApprovalGroup(data);
      const field = conditionColumnFormDs.getField('conditionColumn');
      if (field) {
        field.setLovPara('defId', data.id);
      }
      serviceConfigFormDs.current.set('approvalGroupDefId', data.id);
      serviceConfigFormDs.current.set('approvalGroupDefName', list[0].defName);
      getApproverList({ defId: list[0].id }).then((res) => {
        if (res && isArray(res)) {
          setApproverList(res);
        }
      });
      setShowApprovalGroup(true);
    } else {
      setApproverList([]);
      serviceConfigFormDs.current.set('approvalGroupDefId', null);
      serviceConfigFormDs.current.set('approvalGroupDefName', null);
      const field = conditionColumnFormDs.getField('conditionColumn');
      if (field) {
        field.setLovPara('defId', undefined);
      }
      setShowApprovalGroup(false);
    }
  };

  const handleSave = () => {
    serviceConfigFormDs.validate().then((res) => {
      if (res) {
        const createFunc = serviceConfigFormDs.current.get('serviceId');
        const values = serviceConfigFormDs.current.toData();
        if (!createFunc) {
          let approvalGroupData = [];
          if (values.serviceMode === 'APPROVAL_GROUP' && isFunction(approvalGroup.current.onSave)) {
            approvalGroupData = approvalGroup.current.onSave();
          }
          if (!isArray(approvalGroupData)) {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.approvalGroupData')
                .d('审批人选择不能为空'),
            });
            return;
          }
          let params = {
            ...values,
            parameterList: values.interfaceId
              ? parameterList.map((item) => {
                  const { _token, objectVersionNumber, parameterId, ...other } = item;
                  return { interfaceParameterId: parameterId, ...other };
                })
              : parameterList,
          };
          if (values.serviceMode === 'REMOTE' || values.serviceMode === 'LOV_VIEW') {
            const parameterData = serviceParamsTableDs.toData();
            const isHaveValue = parameterData.find(
              (item) => item.parameterValue === undefined || item.parameterSource === undefined
            );
            if (isHaveValue) {
              notification.warning({
                message: intl
                  .get('hwfp.serviceDefinition.view.message.setValueAndSource')
                  .d('请设置参数值和参数来源'),
              });
              return;
            } else {
              params = { ...params, parameterList: parameterData };
            }
          }
          if (values.serviceMode === 'EXPRESSION') {
            const expressionParameterData = serviceExpressionTableDs
              .toData()
              .map((item) => omit(item, ['parameterValueObj', 'rightParameterValueObj']));
            params = { ...params, parameterList: expressionParameterData };
          }
          if (values.serviceMode === 'APPROVAL_GROUP' && approvalGroupData.length > 0) {
            params = { ...params, parameterList: approvalGroupData };
          }
          if (values.serviceMode === 'SCRIPT') {
            const scriptParameterData = serviceScriptTableDs.toData();
            params = { ...omit(params, ['scriptCodeObj']), parameterList: scriptParameterData };
          }
          if (values.serviceMode !== 'LOV_VIEW') {
            delete params.viewCode;
            delete params.viewName;
          }
          createService(params).then((resp) => {
            if (getResponse(resp)) {
              notification.success();
              fetchDetailFunc(resp.serviceId, 'new');
            }
          });
        } else {
          let approvalGroupData = [];
          if (values.serviceMode === 'APPROVAL_GROUP' && isFunction(approvalGroup.current.onSave)) {
            approvalGroupData = approvalGroup.current.onSave();
          }
          if (!isArray(approvalGroupData)) {
            notification.warning({
              message: intl
                .get('hwfp.serviceDefinition.view.message.approvalGroupData')
                .d('审批人选择不能为空'),
            });
            return;
          }
          let params = {
            parameterList,
            ...values,
          };
          if (values.serviceMode === 'REMOTE' || values.serviceMode === 'LOV_VIEW') {
            const parameterData = serviceParamsTableDs.toData();
            const isHaveValue = parameterData.find(
              (item) => item.parameterValue === undefined || item.parameterSource === undefined
            );
            if (isHaveValue) {
              notification.warning({
                message: intl
                  .get('hwfp.serviceDefinition.view.message.setValueAndSource')
                  .d('请设置参数值和参数来源'),
              });
              return;
            } else {
              params = { ...params, parameterList: parameterData };
            }
          }
          if (values.serviceMode === 'EXPRESSION') {
            const expressionParameterData = serviceExpressionTableDs
              .toData()
              .map((item) => omit(item, ['parameterValueObj', 'rightParameterValueObj']));
            params = { ...params, parameterList: expressionParameterData };
          }
          if (values.serviceMode === 'APPROVAL_GROUP' && approvalGroupData.length > 0) {
            params = { ...params, parameterList: approvalGroupData };
          }
          if (values.serviceMode === 'SCRIPT') {
            const scriptParameterData = serviceScriptTableDs.toData();
            params = { ...omit(params, ['scriptCodeObj']), parameterList: scriptParameterData };
          }
          if (values.serviceMode !== 'LOV_VIEW') {
            delete params.viewCode;
            delete params.viewName;
          }
          updateService(params).then((resp) => {
            if (getResponse(resp)) {
              notification.success();
              if (expressionEngineRef && expressionEngineRef.current) {
                const { onSaveExpressionEngine } = expressionEngineRef.current;
                if (isFunction(onSaveExpressionEngine)) {
                  onSaveExpressionEngine();
                }
              }
              fetchDetailFunc(createFunc);
            }
          });
        }
      }
    });
  };

  const changeInterface = (value) => {
    if (value && value.interfaceId) {
      queryParams({ interfaceId: value.interfaceId }).then((res) => {
        if (isArray(res)) {
          setParameterList(res);
        }
      });
    }
  };

  const renderRequestConstants = ({ text }) => {
    return (
      <Tooltip
        overlayStyle={{ width: '17vw', wordBreak: 'break-all' }}
        theme="light"
        placement="bottomLeft"
        title={`requestConstants: ${text}`}
      >
        <span>requestConstants: {text}</span>
      </Tooltip>
    );
  };

  return (
    <>
      <div className="service-definition-title-info">
        <span>{intl.get('hwfp.serviceDefinition.view.title.serviceDefinition').d('服务定义')}</span>
      </div>
      <Form dataSet={serviceConfigFormDs} columns={3} labelLayout="float">
        {isSiteFlag && <Lov name="tenantObj" />}
        <Lov name="categoryObj" />
        <TextField name="serviceCode" />
        <IntlField name="description" />
        <Select name="serviceType" onChange={changeServiceType} />
        <Select name="serviceMode" optionsFilter={optionsFilter} onChange={changeServiceMode} />
        {currentServiceMode === 'EXPRESSION' && <TextField name="simpleExpression" />}
        {currentServiceMode === 'EXPRESSION' && !isCreate && (
          <TextField name="expression" disabled />
        )}
        {currentServiceMode === 'SCRIPT' && <Lov name="scriptCodeObj" />}
        {['LOV_VIEW', 'REMOTE'].includes(currentServiceMode) &&
          (isCreate ? (
            <Lov name="interfaceObj" onChange={changeInterface} />
          ) : (
            <TextField name="interfaceCode" />
          ))}
        {currentServiceMode === 'LOV_VIEW' && <Lov name="viewCodeObj" />}
        <Select name="documentObj" onChange={changeDocument}>
          {[
            {
              documentId: currentNode.documentId,
              documentDescription: currentNode.documentDescription,
            },
          ].map((item) => (
            <Select.Option value={item.documentId} key={item.documentId}>
              {item.documentDescription}
            </Select.Option>
          ))}
        </Select>
        {currentServiceMode === 'APPROVAL_GROUP' && (
          <Select name="approvalGroupDefCode" onChange={changeApprovalGroup}>
            {approvalGroupList.map((item) => (
              <Select.Option value={item.defCode} key={item.id}>
                {item.defName}
              </Select.Option>
            ))}
          </Select>
        )}
        {isApprovalStrategy && <TextField name="simpleApproveResultExpression" />}
        <Switch name="enabledFlag" />
        {currentServiceMode === 'SCRIPT' && !isEmpty(formData) && formData.requestConstants && (
          <Output
            name="requestConstants"
            value={formData.requestConstants}
            renderer={renderRequestConstants}
          />
        )}
      </Form>

      {['REMOTE', 'LOV_VIEW'].includes(currentServiceMode) && (
        <ParamsDrawer
          isCreate={isCreate}
          isSiteFlag={isSiteFlag}
          isPredefined={isPredefined}
          categoryId={categoryId}
          categoryCode={categoryCode}
          documentId={documentId}
          formDocumentId={formDocumentId}
          currentNode={currentNode}
          parameterList={parameterList}
          serviceConfigFormDs={serviceConfigFormDs}
          serviceParamsTableDs={serviceParamsTableDs}
        />
      )}
      {currentServiceMode === 'SCRIPT' && (
        <ScriptParameter
          isCreate={isCreate}
          isSiteFlag={isSiteFlag}
          isPredefined={isPredefined}
          categoryId={categoryId}
          categoryCode={categoryCode}
          documentId={documentId}
          formDocumentId={formDocumentId}
          currentNode={currentNode}
          parameterList={parameterList}
          serviceScriptTableDs={serviceScriptTableDs}
          serviceConfigFormDs={serviceConfigFormDs}
        />
      )}
      {currentServiceMode === 'EXPRESSION_ENGINE' && !isEmpty(formData) && formData.serviceCode && (
        <ExpressionEngine
          code={`${formData.tenantNum}:${formData.serviceCode}`}
          currentTenantId={serviceConfigFormDs.current.get('tenantId') || currentTenantId}
          leftValueLovQueryPara={{ documentId, categoryId }}
          disabled={isPredefined}
          secondLevelTitleFlag
          showActionButton={false}
          childRef={expressionEngineRef}
        />
      )}
      {currentServiceMode === 'APPROVAL_GROUP' && (showApprovalGroup || !isCreate) && (
        <ApprovalGroup
          isCreate={isCreate}
          isSiteFlag={isSiteFlag}
          isPredefined={isPredefined}
          parameterList={parameterList}
          approverList={approverList}
          currentApprovalGroup={currentApprovalGroup}
          serviceConfigFormDs={serviceConfigFormDs}
          onRef={(ref) => {
            approvalGroup.current = ref;
          }}
          conditionColumnFormDs={conditionColumnFormDs}
        />
      )}
      {currentServiceMode === 'EXPRESSION' && (
        <ExpressionParameter
          isCreate={isCreate}
          isSiteFlag={isSiteFlag}
          isPredefined={isPredefined}
          categoryId={categoryId}
          categoryCode={categoryCode}
          documentId={documentId}
          formDocumentId={formDocumentId}
          currentNode={currentNode}
          parameterList={parameterList}
          serviceExpressionTableDs={serviceExpressionTableDs}
        />
      )}
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common'],
})(
  withProps(
    () => {
      const serviceExpressionTableDs = new DataSet(getServiceExpressionTable());
      const serviceScriptTableDs = new DataSet(getServiceScriptTable());
      const serviceParamsTableDs = new DataSet(getServiceParamsTable());

      return {
        serviceExpressionTableDs,
        serviceScriptTableDs,
        serviceParamsTableDs,
      };
    },
    { cacheState: true }
  )(ServiceCreate)
);
