import React, { createContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';

import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { isArray, isEmpty, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  getCurrentTenant,
} from 'utils/utils';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { ModalProvider, useDataSet, DataSet, Form, Modal } from 'choerodon-ui/pro';

// import Anchor from '../components/Anchor';
import {
  fetchDoExecute,
  fetchPermissions,
  fetchAutoGetCompany,
  fetchAutoGetPurchasing,
  fetchUomControl,
  fetchBasePrice,
  fetchConditionFields,
  operationModalService,
  aiCheckSubmitService,
} from '@/services/purchaseRequisitionCreationService';
import { fetchConfig, fetchChangeOldConfig } from '@/services/purchaseRequisitionCancelService';
import {
  fetchExecutionLink,
  fetchDocLinkControl,
} from '@/services/purchaseRequisitionAssignmentService';
import HeaderDs from './HeaderDs';
import ListDs from './ListDs';
import BatchMaintainDs from './BatchMaintainDs';
import BatchAddDs from './BatchAdd';

import '../tag.less';

export const Store = createContext();

let timer = null;

const StoreProvider = function StoreProvider(props) {
  const {
    id, // 工作流审批的businessKey
    code,
    source, // 来源那个页面
    sourceType,
    history,
    children,
    listUnitCode,
    headerUnitCode,
    customizeTable,
    customizeForm,
    customizeBtnGroup,
    prHeaderId,
    backPath,
    urlflagIf,
    customizeCollapseForm,
    customizeCollapse,
    pubPathFlag,
    docLinkFlag,
    backViodPageFlag,
    getHocInstance,
    remote,
    location,
  } = props;
  const userId = getCurrentUserId();
  const organizationId = getCurrentOrganizationId();
  const [init, setInit] = useState(false); // 是否初始化
  const [headerLoading, setHeaderLoading] = useState(false);
  const [isOldUser, setIsOldUser] = useState(false); // 是否是执行链路老租户
  const [isNewCancelTeant, setIsNewCancelTean] = useState(false); // 取消配置新租户
  const [isNewChangeTeant, setIsNewChangeTeant] = useState(false); // 变更配置新租户
  const [permissonFlag, setPermissonFlag] = useState({}); // 权限集
  // const [itemLimitRule, setItemLimitRule] = useState([]); // 物料规则限制
  const [conditionFields, setConditionFields] = useState([]);
  const [uomCodeAndNameRule, setUomCodeAndNameRule] = useState(null); // 单位规则限制
  const [uomControl, setUomControl] = useState(0); // 双单位控制.开启后原单位,数量不可编辑
  const [docLinkControl, setDocLinkControl] = React.useState(0); // 单据流-业务规则控制.开启后单据流才展示
  const [prSourcePlatform, setPrSourcePlatform] = useState(null);
  const [headerCompanyId, setHeaderCompanyId] = useState(null);
  const [lineCompanyId, setLineCompanyId] = useState(null);
  const [lineDsSaveFlag, setLineDsSaveFlag] = useState(0); // 明细行ds保存后查询的标识，为了保证移除批量编辑按钮的残留影响
  const cuxLineRef = useRef({});

  const {
    handleInitCreateData,
    handleBackPath,
    handleSetDsPara,
    handleDoubleCuxUom,
    dsListenerEvent,
    renderCreateLineColumns,
    handleCacelLineCols,
    handleWorkFlowCheck,
    handleLineChange,
    limitAttr,
    limitator,
    cuxUpdate,
    cuxAddField,
    handleCuxParaAdd,
    cuxNotBringPurchaseOrgLov,
    cuxNotBringPurchaseAgentLov,
    handleCuxRequest,
    handleCuxRequestPara,
    cuxListField,
    cuxQueryUrl,
    updateLineInvOrganization,
    cuxBatchListField,
    cuxBatchFormComponent,
    handleBatchLineChange,
    cuxBatchFormTakeCondition,
    handleHeaderDefaulteValue,
    handleBeforeSave,
    handleBeforeSubmit,
    handleCuxSubmit,
    handleBeforeSRMSubmit,
    cuxAddImportLine,
    cuxHandleColumns,
    cuxHandleLineBtns,
    cuxHandlebeforeUpload,
    cuxMsgHelp,
    cuxCuzAttachment,
    handleCuxHeaderButtons,
    handleCuxHeaderClose,
    handleCuxLineCancelClose,
    handleCuxOperation,
    handleChangeSubmit,
    handleRenderCuxOperation,
    handleCuxSave,
    handleCuxBatchMaintainForm,
    handleDefaultRowExpanded,
    handleCuxEditMaintainDs,
    handleCuxListData,
    handleSetDisabled,
    handleCuxBatchEditChange,
    handleCuxBatchEditTrueFlag,
    handleCuxPushField,
    handleCuxBatchEditFeild,
    handleCuxHeaderField,
    handleChangeAddDefault,
    handleSubmitedMsg,
    cuxBudgetCheck,
    cuxCacelLineAllowEdit,
    cuxQueryPageLineUrl,
    cuxQueryPageHeaderUrl,
    handleSubmitedAfterMsg,
  } = remote?.props?.process || {};

  const listDs = useDataSet(() => {
    const config = ListDs({
      code,
      id,
      source,
      urlflagIf,
      prHeaderId,
      pubPathFlag,
      customizeUnitCode: listUnitCode,
      organizationId,
      backViodPageFlag,
      uomCodeAndNameRule,
      uomControl,
      setLineCompanyId,
      limitAttr,
      cuxListField,
      handleLineChange,
      cuxQueryUrl,
      updateLineInvOrganization,
      handleSetDisabled,
      cuxQueryPageLineUrl,
      remote,
      location,
    });
    return remote
      ? remote.process('SPRM_PRDETAIL_REMOTE_PROCESS_LINE_DS_CONFIG', config, {
          prHeaderId,
          id,
          code,
          source,
          sourceType,
          location,
        })
      : config;
  }, [
    code,
    id,
    source,
    urlflagIf,
    pubPathFlag,
    docLinkFlag,
    prHeaderId,
    organizationId,
    listUnitCode,
    backViodPageFlag,
    uomCodeAndNameRule,
    uomControl,
    setLineCompanyId,
    limitAttr,
    cuxListField,
    handleLineChange,
    cuxQueryUrl,
    updateLineInvOrganization,
    handleSetDisabled,
    cuxQueryPageLineUrl,
    remote,
  ]);

  // 变更新增行
  const addLineDs = useDataSet(() => {
    const config = ListDs({
      addLineDsFlag: 1,
      source,
      urlflagIf,
      prHeaderId,
      customizeUnitCode: listUnitCode,
      organizationId,
      backViodPageFlag,
      uomCodeAndNameRule,
      handleLineChange,
      uomControl,
      limitAttr,
      cuxQueryUrl,
      updateLineInvOrganization,
      cuxListField,
      cuxQueryPageLineUrl,
    });
    return remote
      ? remote.process('SPRM_PRDETAIL_REMOTE_PROCESS_ADD_LINE_DS_CONFIG', config, {
          prHeaderId,
          id,
          code,
          source,
          sourceType,
        })
      : config;
  }, [
    source,
    urlflagIf,
    pubPathFlag,
    prHeaderId,
    organizationId,
    listUnitCode,
    handleLineChange,
    backViodPageFlag,
    uomCodeAndNameRule,
    uomControl,
    limitAttr,
    cuxQueryUrl,
    updateLineInvOrganization,
    cuxListField,
    cuxQueryPageLineUrl,
  ]);

  const headerDs = useDataSet(() => {
    const sourceConfig = HeaderDs({
      customizeUnitCode: headerUnitCode,
      organizationId,
      prHeaderId,
      listDs,
      addLineDs,
      limitAttr,
      limitator,
      cuxUpdate,
      cuxAddField,
      pubPathFlag,
      cuxNotBringPurchaseOrgLov,
      cuxNotBringPurchaseAgentLov,
      cuxQueryPageHeaderUrl,
    });
    return remote
      ? remote.process('SPRM_PRDETAIL_REMOTE_PROCESS_HEADER_DS_CONFIG', sourceConfig, { listDs })
      : sourceConfig;
  }, [
    prHeaderId,
    pubPathFlag,
    organizationId,
    listDs,
    addLineDs,
    headerUnitCode,
    limitAttr,
    cuxUpdate,
    cuxAddField,
    cuxNotBringPurchaseOrgLov,
    cuxNotBringPurchaseAgentLov,
    cuxQueryPageHeaderUrl,
    remote,
  ]);

  const header = headerDs.current;

  const batchMaintainDs = useDataSet(
    () =>
      BatchMaintainDs({
        header,
        organizationId,
        cuxBatchListField,
        handleBatchLineChange,
        uomCodeAndNameRule,
        listDs,
      }),
    [header, organizationId, cuxBatchListField, handleBatchLineChange, uomCodeAndNameRule, listDs]
  );

  const batchAddDs = useDataSet(
    () =>
      BatchAddDs({
        header,
        organizationId,
        uomCodeAndNameRule,
        listDs,
      }),
    [header, organizationId, uomCodeAndNameRule, listDs]
  );

  // 获取物料规则限制
  const getItemLimitRule = (...arg) => {
    if (arg && arg?.name) {
      if (isEmpty(conditionFields)) {
        return;
      }
      if (uomCodeAndNameRule && isArray(uomCodeAndNameRule) && isArray(conditionFields)) {
        if (!conditionFields.includes(arg.name)) {
          return;
        }
      }
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const parameterMap = {
        ...(headerDs.toData()[0] || {}),
        companyLov: undefined,
        ouLov: undefined,
        unitLov: undefined,
        prTypeLov: undefined,
        requestedByLov: undefined,
        localCurrencyLov: undefined,
        originalCurrencyLov: undefined,
        purchaseOrgLov: undefined,
        purchaseAgentLov: undefined,
        invoiceAddressLov: undefined,
        invoiceMethodCodeLov: undefined,
        invoiceTypeCodeLov: undefined,
        invoiceTitleTypeCodeLov: undefined,
        invoiceDetailTypeCodeLov: undefined,
        prLineList: undefined,
        addLineList: undefined,
      };
      Object.keys(parameterMap).forEach((key) => {
        if (typeof parameterMap[key] === 'object') {
          parameterMap[key] = undefined;
        }
      });

      setTimeout(() => {
        fetchDoExecute([
          {
            fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
            parameterMap,
          },
        ]).then((res) => {
          if (res) {
            if (res) {
              listDs.setState({
                // eslint-disable-next-line no-unused-expressions
                itemLimitRule: res[0] ? JSON.parse(res[0])?.map((rule) => rule) : [],
              });
              // eslint-disable-next-line no-unused-expressions
              addLineDs?.setState({
                // eslint-disable-next-line no-unused-expressions
                itemLimitRule: res[0] ? JSON.parse(res[0])?.map((rule) => rule) : [],
              });
            }
          }
        });
      }, 50);
    }, 50);
  };

  // 更新页面信息
  const commonUpdate = useCallback(
    async (cacheFlag) => {
      if (prHeaderId) {
        await headerDs.query(undefined, undefined, cacheFlag);
        getItemLimitRule();
        setPrSourcePlatform(headerDs.current?.get('prSourcePlatform'));
        setHeaderCompanyId(headerDs.current?.get('companyId'));
        if (isFunction(handleSetDsPara)) {
          await handleSetDsPara({ headerDs, listDs, addLineDs, location, cuxLineRef });
        }
        fetchBasePrice({
          companyId: headerDs.current?.get('companyId'),
          prSourcePlatform: headerDs.current?.get('prSourcePlatform'),
        }).then((res) => {
          if (getResponse(res)) {
            headerDs.setState('basePriceFlag', res);
          }
        });
        if (pubPathFlag) {
          // eslint-disable-next-line no-unused-expressions
          headerDs?.current?.set({
            pubPathFlag: true,
          });
        }
      } else {
        fetchAutoGetCompany().then(async (res) => {
          const createDefaultParams = isFunction(handleInitCreateData)
            ? await handleInitCreateData({ location, headerDs, companyRes: res })
            : {};
          let defalutData = {
            attachmentUuId: uuid(),
            prSourcePlatform: 'SRM',
            ...createDefaultParams,
          };
          if (getResponse(res)) {
            const {
              companyId,
              companyName,
              purchaseOrgId,
              purchaseOrgName,
              ouId,
              ouCode,
              ouName,
            } = res;
            if (companyId) {
              if (purchaseOrgId) {
                const res1 = await fetchAutoGetPurchasing({ purchaseOrgId, functionCode: 'PR' });
                if (res1 && !res1.failed) {
                  const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res1;
                  defalutData = {
                    ...defalutData,
                    companyLov: { companyId, companyName },
                    companyId,
                    companyName,
                    purchaseOrgLov: purchaseOrgId
                      ? {
                          purchaseOrgId,
                          purchaseOrgName,
                          organizationName: purchaseOrgName,
                        }
                      : null,
                    ouLov: ouId ? { ouId, ouCode, ouName } : null,
                    purchaseAgentLov: purchaseAgentId
                      ? {
                          purchaseAgentId,
                          purchaseAgentCode,
                          purchaseAgentName,
                        }
                      : null,
                  };
                }
              } else {
                defalutData = {
                  ...defalutData,
                  companyLov: { companyId, companyName },
                  companyId,
                  companyName,
                  purchaseOrgLov: purchaseOrgId
                    ? {
                        purchaseOrgId,
                        purchaseOrgName,
                        organizationName: purchaseOrgName,
                      }
                    : null,
                  ouLov: ouId ? { ouId, ouCode, ouName } : null,
                };
              }
            }
          }
          fetchBasePrice({
            companyId: res?.companyId,
            prSourcePlatform: headerDs.current?.get('prSourcePlatform') || 'SRM',
          }).then((result) => {
            if (getResponse(result)) {
              headerDs.setState('basePriceFlag', result);
            }
          });

          headerDs.loadData([]);
          headerDs.create(defalutData);
          getItemLimitRule();
          setPrSourcePlatform('SRM');
          if (isFunction(handleHeaderDefaulteValue)) {
            handleHeaderDefaulteValue({ headerDs, listDs, addLineDs, location });
          }
        });
      }
    },
    [prHeaderId, headerDs, listDs, conditionFields]
  );

  // 头报错信息解析
  const getHeaderErrorMsg = (allErrors = []) => {
    // 所以的错误信息打平成[{ruleName:XXX,injectionOptions:{label}}]
    console.log(allErrors); // 页面报错解析
    const errorArray = allErrors?.map((ele) => ele.errors[0]);
    const errorTpye = allErrors?.map((ele) => ele.errors[0].ruleName);
    const aa = Array.from(new Set(errorTpye));
    let errorMsg = '';
    // eslint-disable-next-line no-unused-expressions
    aa?.forEach((e) => {
      const classifyType = errorArray?.filter((item) => item.ruleName === e);
      if (e === 'valueMissing') {
        const zzz = Array.from(new Set(classifyType?.map((item) => item.injectionOptions?.label)));
        errorMsg += intl.get('hzero.common.validation.notNull', {
          name: zzz.join('，'),
        });
      } else {
        // eslint-disable-next-line no-unused-expressions
        classifyType?.forEach((item) => {
          errorMsg += `${item.validationMessage}，`;
        });
      }
    });
    return errorMsg;
  };

  // 行报错信息解析
  const getLineErrorMsg = (lineError = []) => {
    // 解套娃: 原报错信息格式是: [{error:{errors:[{ruleName:XXX,injectionOptions:{label}}]},record:{}}]
    return lineError?.map((ele) => {
      const currentLineError = ele.errors?.map((item) => item.errors[0]); // {errors:[{ruleName:XXX,injectionOptions:{label}}]}
      const currentIndex = ele.record.get('displayLineNum') || ele.record.index + 1; // 取当前行号
      const errorTypeArr = [...new Set(currentLineError?.map((item) => item.ruleName))]; // 获取当前行的报错信息类型
      let currentInfo = '';
      errorTypeArr.forEach((e) => {
        const classifyType = currentLineError?.filter((item) => item.ruleName === e);
        if (e === 'valueMissing') {
          // 针对于字段未填写的类型统一报错
          const zzz = Array.from(
            new Set(classifyType?.map((item) => item.injectionOptions?.label))
          );
          currentInfo += intl.get('hzero.common.validation.notNull', {
            name: zzz.join('，'),
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          currentLineError?.forEach((item, ind) => {
            if (item.ruleName !== 'valueMissing') {
              currentInfo += `${item.validationMessage}${
                ind === currentLineError.length - 1 ? '' : '，'
              }`;
            }
          });
        }
      });
      return ele.record.get('displayLineNum') ? (
        <div>
          {intl
            .get(`sprm.common.view.message.lineErrorAndReasonWithDynamicNum`, { num: currentIndex })
            .d(`行号为{num}，数据校验不通过。具体原因为`)}
          {`：${currentInfo}`}
        </div>
      ) : (
        <div>
          {intl.get('sprm.common.model.intlTips', { value: currentIndex }).d(`第${currentIndex}行`)}
          {`，${currentInfo}`}
        </div>
      );
    });
  };

  // 获取页面单据信息
  const handleGetInfo = useCallback(() => {
    if (header && header.status && source === 'create') {
      header.status = 'update';
    }
    return new Promise(async (resolve) => {
      const headerFlag = await header?.validate(false, true);
      const lineFlag = await listDs.validate();
      if (headerFlag && lineFlag) {
        const { batchEditFieldMap = {}, cuxBatchFieldMap = {} } = header.get([
          'batchEditFieldMap',
          'cuxBatchFieldMap',
        ]);
        const { records = [], updated = [] } = listDs;
        // eslint-disable-next-line no-unused-expressions
        updated?.forEach((i) => i.set({ dirtyFlag: 1 }));
        // cuxStandFieldMap：标准的批量维护字段，老娘舅receiveAddress由字符类型改成lov类型,需在保存时进行类型更改
        const { cuxStandFieldMap, ...others } = batchEditFieldMap || {};
        resolve({
          ...header?.toData(),
          batchEditFieldMap: {
            ...(cuxBatchFieldMap || {}),
            ...(others || {}),
            ...(cuxStandFieldMap || {}),
          },
          prLineList:
            records?.length >= 100 && updated.length <= 20 && updated.length > 0
              ? updated.map((e) => e.toData())
              : listDs.toData(),
        });
      } else {
        const headerError = await header?.getValidationErrors();
        const lineError = await listDs.getValidationErrors();
        const lineMsg = getLineErrorMsg(lineError);
        const headerErrorMsg = getHeaderErrorMsg(headerError);
        notification.error({
          message: (
            <div>
              {headerErrorMsg}
              {!lineFlag && (
                <div>
                  <p style={{ marginBottom: 3, fontWeight: 600 }}>
                    {intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}:
                  </p>
                  {lineMsg}
                </div>
              )}
            </div>
          ),
        });
        resolve();
      }
    });
  }, [header, listDs, getHeaderErrorMsg, getLineErrorMsg]);

  // 获取是否展示外部附件权限
  const fetchCurrentRulePermissions = async () => {
    const buttonPermissionList = ['hzero.srm.requirement.prm.pr-platform.ps.external-attachment'];
    await fetchPermissions(buttonPermissionList).then((res) => {
      if (res && res[0]) {
        const currentRolePermissonFlag = {};
        currentRolePermissonFlag.externalAttachmentUuid = res[0].approve || false;
        setPermissonFlag(currentRolePermissonFlag);
      }
    });
  };

  // 获取是否开启双单位控制
  const queryUomControl = async () => {
    await fetchUomControl().then((res) => {
      if (res && res.failed) {
        notification.error({ message: res.message });
      } else {
        setUomControl(res?.SPRM || 0);
      }
    });
  };

  // 获取是否开启单据流
  const queryDocLinkControl = async () => {
    await fetchDocLinkControl({ businessModule: 'SPRM' }).then((res) => {
      const result = getResponse(res);
      if (result) {
        const { displayDocFlow = 1 } = result;
        setDocLinkControl(Number(displayDocFlow));
      }
    });
  };

  // 获取规则限制
  const fetchgetLimitRule = async () => {
    return fetchDoExecute([{ fullPathCode: 'SITE.SMDM.UOM_DISPLAY_CONFIGURATION' }]).then((res) => {
      if (res) {
        const [result] = res;
        setUomCodeAndNameRule(result ? JSON.parse(result) : 0);
      }
    });
  };

  // 获取是否是执行链路老租户
  const fetchIsExecutionOldUser = () => {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        setIsOldUser(true);
      }
    });
  };

  /**
   * 工作流审批前操作弹窗
   * @param {*} params operationType SUBMIT 提交;CHANGE_SUBMIT 变更提交;CLOSE 关闭;CANCEL 取消
   * @returns
   */
  const handleOperationModal = async (params = {}) => {
    const { operationType, body, handleOk, handleCancel, dataInfo } = params;
    const query = { operationType };
    const res = getResponse(await operationModalService({ query, body }));
    if (!res) return false;
    const { workflowDesignatedFlag } = res || {};
    if (workflowDesignatedFlag === 1) {
      const ds = remote.process(
        'SPRM_PRDETAIL_REMOTE_PROCESS_FLOW_APPROVE_DS',
        {
          autoCreate: true,
          fields: [],
        },
        {
          ...props,
          operationType,
          dataInfo,
          handleCancel,
        }
      );
      const dataSet = new DataSet(ds);
      const cuxRender = await remote.process(
        'SPRM_PRDETAIL_REMOTE_RENDER_FLOW_APPROVE_FORM',
        <></>,
        {
          dataSet,
          handleCancel,
        }
      );
      return new Promise((resolve) => {
        Modal.open({
          title: intl.get('hzero.common.button.approval').d('审批'),
          drawer: true,
          style: { width: '380px' },
          children: customizeForm(
            {
              code: params.code,
              dataSet,
            },
            <Form dataSet={dataSet} columns={1} labelLayout="float">
              {cuxRender}
            </Form>
          ),
          onOk: async () => {
            const flag = await dataSet.validate();
            if (!flag) return false;
            if (handleOk) {
              handleOk(dataSet.current.toData());
            }
            resolve(true);
          },
          onClose: () => {
            if (handleCancel) {
              handleCancel();
            }
            resolve(false);
          },
        });
      });
    }
    return true;
  };

  /**
   * 智能审核提交
   */
  const handleAiCheckSubmit = async () => {
    if (headerDs.getState('updated') || listDs.getState('updated')) {
      notification.error({
        message: intl
          .get('sprm.common.view.aiCheckErrorMsg')
          .d(
            '操作失败，当前存在已修改但未保存的信息，为确保预审助手获取最新数据，请先保存申请，再重新执行智能预审操作'
          ),
      });
      return;
    }
    const params = headerDs.current.toData();
    const res = await aiCheckSubmitService(params);
    if (res && res.failed) {
      notification.error({ message: res.message });
      return;
    }
    if (res) {
      await headerDs.query();
    }
  };

  const value = useMemo(() => {
    return {
      id,
      code,
      source,
      sourceType,
      userId,
      organizationId,
      history,
      prHeaderId,
      prSourcePlatform,
      headerCompanyId,
      lineCompanyId,
      customizeTable,
      customizeForm,
      getHocInstance,
      customizeCollapseForm,
      customizeCollapse,
      customizeBtnGroup,
      listDs,
      headerDs,
      addLineDs,
      batchMaintainDs,
      batchAddDs,
      backPath,
      urlflagIf,
      pubPathFlag,
      docLinkFlag,
      backViodPageFlag,
      isOldUser,
      isNewCancelTeant,
      isNewChangeTeant,
      listUnitCode,
      headerUnitCode,
      permissonFlag,
      uomControl,
      docLinkControl,
      headerLoading,
      setHeaderLoading,
      handleGetInfo,
      commonUpdate,
      handleBackPath,
      renderCreateLineColumns,
      handleCacelLineCols,
      handleWorkFlowCheck,
      handleOperationModal,
      limitAttr,
      handleCuxParaAdd,
      handleCuxRequest,
      handleCuxRequestPara,
      cuxListField,
      cuxQueryUrl,
      lineDsSaveFlag,
      setLineDsSaveFlag,
      cuxBatchListField,
      cuxBatchFormComponent,
      handleBatchLineChange,
      cuxBatchFormTakeCondition,
      handleBeforeSave,
      handleBeforeSubmit,
      handleBeforeSRMSubmit,
      handleCuxSubmit,
      remote,
      location,
      cuxAddImportLine,
      cuxHandleColumns,
      cuxHandleLineBtns,
      cuxHandlebeforeUpload,
      cuxMsgHelp,
      cuxCuzAttachment,
      handleCuxHeaderButtons,
      handleCuxHeaderClose,
      handleCuxLineCancelClose,
      handleCuxOperation,
      handleChangeSubmit,
      handleRenderCuxOperation,
      handleCuxSave,
      handleCuxBatchMaintainForm,
      handleCuxEditMaintainDs,
      handleDefaultRowExpanded,
      handleCuxListData,
      handleSetDisabled,
      handleCuxBatchEditChange,
      handleCuxBatchEditTrueFlag,
      handleCuxPushField,
      handleCuxBatchEditFeild,
      handleChangeAddDefault,
      handleSubmitedMsg,
      cuxBudgetCheck,
      cuxCacelLineAllowEdit,
      handleSubmitedAfterMsg,
      cuxLineRef,
      handleAiCheckSubmit,
    };
  }, [
    id,
    code,
    source,
    sourceType,
    userId,
    organizationId,
    history,
    prHeaderId,
    prSourcePlatform,
    headerCompanyId,
    lineCompanyId,
    customizeTable,
    customizeForm,
    getHocInstance,
    customizeCollapseForm,
    customizeCollapse,
    customizeBtnGroup,
    listDs,
    headerDs,
    addLineDs,
    batchAddDs,
    batchMaintainDs,
    backPath,
    urlflagIf,
    pubPathFlag,
    docLinkFlag,
    backViodPageFlag,
    isOldUser,
    isNewCancelTeant,
    isNewChangeTeant,
    listUnitCode,
    headerUnitCode,
    permissonFlag,
    uomControl,
    docLinkControl,
    headerLoading,
    setHeaderLoading,
    handleGetInfo,
    commonUpdate,
    handleBackPath,
    renderCreateLineColumns,
    handleCacelLineCols,
    handleWorkFlowCheck,
    limitAttr,
    handleCuxParaAdd,
    handleCuxRequest,
    handleCuxRequestPara,
    cuxListField,
    cuxQueryUrl,
    lineDsSaveFlag,
    setLineDsSaveFlag,
    cuxBatchListField,
    cuxBatchFormComponent,
    handleBatchLineChange,
    cuxBatchFormTakeCondition,
    handleBeforeSubmit,
    handleBeforeSave,
    handleBeforeSRMSubmit,
    handleCuxSubmit,
    remote,
    location,
    cuxAddImportLine,
    cuxHandleColumns,
    cuxHandleLineBtns,
    cuxHandlebeforeUpload,
    cuxMsgHelp,
    cuxCuzAttachment,
    handleCuxHeaderButtons,
    handleCuxHeaderClose,
    handleCuxLineCancelClose,
    handleCuxOperation,
    handleChangeSubmit,
    handleRenderCuxOperation,
    handleCuxSave,
    handleCuxBatchMaintainForm,
    handleCuxEditMaintainDs,
    handleDefaultRowExpanded,
    handleCuxListData,
    handleSetDisabled,
    handleCuxBatchEditChange,
    handleCuxBatchEditTrueFlag,
    handleCuxPushField,
    handleCuxBatchEditFeild,
    handleChangeAddDefault,
    handleSubmitedMsg,
    cuxBudgetCheck,
    cuxCacelLineAllowEdit,
    handleSubmitedAfterMsg,
    cuxLineRef,
  ]);

  // 初始化数据
  useEffect(() => {
    fetchIsExecutionOldUser();
    fetchCurrentRulePermissions();
    queryUomControl();
    queryDocLinkControl();
    fetchgetLimitRule().finally(() => {
      // 初始化获得数据成功
      setInit(true);
    });
    fetchConditionFields([
      {
        fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
      },
    ]).then((res) => {
      if (getResponse(res)) {
        setConditionFields(res?.conditionLeftValueFields);
      }
    });
  }, []);

  useEffect(() => {
    // 查询或者变更来源
    if (['inquery', 'cacel'].includes(source)) {
      // 读取采购申请取消老租户保留原有逻辑配置表
      fetchConfig({
        organizationId,
        tenant: getCurrentTenant().tenantNum,
        tenantNum: getCurrentTenant().tenantNum,
      }).then((res) => {
        const result = getResponse(res);
        if (result) {
          if (isEmpty(result.content)) {
            setIsNewCancelTean(true);
          }
        }
      });

      // 读取采购申请变更老租户保留原有逻辑配置表
      fetchChangeOldConfig({
        organizationId,
        tenant: getCurrentTenant().tenantNum,
        tenantNum: getCurrentTenant().tenantNum,
      }).then((res) => {
        const result = getResponse(res);
        if (result) {
          if (isEmpty(result.content)) {
            setIsNewChangeTeant(true);
          }
        }
      });
    }
  }, [source]);

  useEffect(() => {
    headerDs.addEventListener('update', getItemLimitRule);
    return () => {
      headerDs.removeEventListener('update', getItemLimitRule);
    };
  }, [headerDs, conditionFields, uomCodeAndNameRule]);

  useEffect(() => {
    if (init) {
      if (isFunction(handleCuxHeaderField)) {
        handleCuxHeaderField(headerDs);
      }
      // 博威二开埋点：需求计划来源为采购申请的不调用双单位逻辑
      if (isFunction(handleDoubleCuxUom)) {
        const flag = handleDoubleCuxUom({ headerDs, uomControl });
        setUomControl(flag);
      }
      commonUpdate();
    }
  }, [prHeaderId, init, headerDs, pubPathFlag]);

  // ds监听事件埋点
  useEffect(() => {
    if (isFunction(dsListenerEvent)) {
      dsListenerEvent(headerDs, listDs, 'mount');
      return () => {
        dsListenerEvent(headerDs, listDs, 'unmount');
      };
    }
  }, [headerDs, listDs, dsListenerEvent]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default cuxRemote(
  {
    code: 'SPRM_PRDETAIL_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleInitCreateData: undefined,
      handleBackPath: undefined,
      handleHeaderData: undefined,
      handleSetDsPara: undefined,
      handleDoubleCuxUom: undefined,
      handleLineChange: undefined,
      renderCreateLineColumns: undefined,
      handleCacelLineCols: undefined,
      handleWorkFlowCheck: undefined,
      dsListenerEvent: undefined,
      limitAttr: undefined,
      limitator: undefined,
      cuxUpdate: undefined,
      cuxAddField: [],
      handleCuxParaAdd: undefined,
      cuxNotBringPurchaseOrgLov: undefined,
      cuxNotBringPurchaseAgentLov: undefined,
      handleCuxRequest: undefined,
      handleCuxRequestPara: undefined,
      cuxListField: undefined,
      updateLineInvOrganization: undefined,
      cuxBatchListField: undefined,
      cuxBatchFormComponent: undefined,
      handleBatchLineChange: undefined,
      cuxBatchFormTakeCondition: undefined,
      handleHeaderDefaulteValue: undefined,
      handleBeforeSave: undefined,
      handleBeforeSubmit: undefined,
      handleBeforeSRMSubmit: undefined,
      handleCuxSubmit: undefined,
      cuxQueryUrl: undefined,
      cuxHandleColumns: undefined,
      cuxHandleLineBtns: undefined,
      cuxHandlebeforeUpload: undefined,
      cuxMsgHelp: undefined,
      cuxCuzAttachment: undefined,
      handleCuxHeaderButtons: undefined,
      handleCuxHeaderClose: undefined,
      handleCuxLineCancelClose: undefined,
      handleCuxOperation: undefined,
      handleChangeSubmit: undefined,
      handleRenderCuxOperation: undefined,
      handleCuxSave: undefined,
      handleDefaultRowExpanded: undefined,
      handleCuxBatchMaintainForm: undefined,
      handleCuxEditMaintainDs: undefined,
      handleCuxListData: undefined,
      getCuxBatchEditFlag: undefined,
      handleCuxBatchEditFlag: undefined,
      handleSetDisabled: undefined,
      handleCuxBatchEditChange: undefined,
      handleCuxBatchEditTrueFlag: undefined,
      handleCuxPushField: undefined,
      handleCuxBatchEditFeild: undefined,
      handleCuxHeaderField: undefined,
      handleChangeAddDefault: undefined,
      handleSubmitedMsg: undefined,
      cuxBudgetCheck: undefined,
      cuxCacelLineAllowEdit: undefined,
      cuxQueryPageHeaderUrl: undefined,
      cuxQueryPageLineUrl: undefined,
      handleSubmitedAfterMsg: undefined,
    },
  }
)(observer(StoreProvider));
