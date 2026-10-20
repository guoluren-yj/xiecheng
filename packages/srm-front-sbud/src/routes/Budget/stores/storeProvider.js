import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import moment from 'moment';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { isArray, isEmpty, isFunction } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';

import { ModalProvider, useDataSet, Spin } from 'choerodon-ui/pro';
import { fetchTemplateFields, validUnique } from '@/services/budgetService';
import { HeaderDs, ListDs } from './detailDs';
import { getBugetFieldsConfig } from '../hook';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const userId = getCurrentUserId();
const organizationId = getCurrentOrganizationId();

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    back,
    status,
    history,
    children,
    budgetHeaderId,
    budgetTemplateId,
    budgetTemplateCode,
    budgetTemplateDesc,
    pubPathFlag,
    readOnly,
    remote,
  } = props;

  const {
    getTemplateFieldsAllowEdit,
    setCuxColumns,
    setCuxColumnsOthers,
    getCuxInit,
    setCuxHeaderFields,
    setCuxLineFields,
    setCuxLineChange,
    setCuxEffect,
    getCuxBudgetBtn,
    getCuxLineButtons,
    setFormFieldsHiddenObj,
  } = remote.props.process;

  const [templateFields, setTemplateFields] = useState(null);
  const [isArchived, setIsArchived] = useState(false); // 是否已归档
  const [canResetAcionsFlag, setCanResetFlag] = useState(false); // 是否已归档
  const [budgetHeaderStatus, setBudgetHeaderStatus] = useState('NEW');

  const headerDs = useDataSet(
    () =>
      HeaderDs({
        budgetHeaderId,
        readOnly,
        setCuxHeaderFields,
      }),
    [budgetHeaderId, readOnly, setCuxHeaderFields]
  );

  const header = headerDs.current;

  const listDs = useDataSet(
    () =>
      ListDs({
        budgetHeaderId,
        budgetTemplateCode,
        readOnly,
        setCuxLineFields,
        setCuxLineChange,
        selection:
          pubPathFlag || ['APPROVING', 'EDIT_APPROVING'].includes(budgetHeaderStatus) || (isArchived && !canResetAcionsFlag)
            ? false
            : 'multiple',
      }),
    [
      isArchived,
      canResetAcionsFlag,
      budgetHeaderId,
      budgetHeaderStatus,
      templateFields,
      budgetTemplateCode,
      pubPathFlag,
      readOnly,
      setCuxLineFields,
      setCuxLineChange,
    ]
  );

  // 获取模板字段
  const getTemplateFields = curBudgetTemplateCode => {
    fetchTemplateFields(curBudgetTemplateCode).then(res => {
      if (getResponse(res)) {
        setTemplateFields(res);
      }
    });
  };

  const upDateLine = (cacheFlag) => {
    listDs.query({}, {}, cacheFlag); 
  };

  // 更新页面信息
  const commonUpdate = useCallback(async (cacheFlag = false) => {
    if (budgetHeaderId) {
      headerDs.query().then(res => {
        if (res && !res?.failed) {
          setBudgetHeaderStatus(res?.budgetHeaderStatus);
          if (
            res.budgetHeaderStatus === 'ABOLISHED' ||
            (!['NEW', 'REJECT'].includes(res.budgetHeaderStatus) &&
              (moment().isBefore(res?.startDate) || moment().isAfter(res?.endDate)))
          ) {
            setIsArchived(true);
          } else {
            setIsArchived(false);
          }
          if ((moment().isBefore(res?.endDate))) {
            setCanResetFlag(true);
          } else {
            setCanResetFlag(false);
          }
          if (budgetTemplateCode && !templateFields) {
            getTemplateFields(budgetTemplateCode);
          } else {
            setTimeout(() => {
              upDateLine(cacheFlag);
            }, 50);
          }
        }
        headerDs.setState('isVaild', true);
      });
    } else {
      setBudgetHeaderStatus('NEW');
      headerDs.create({
        budgetTemplateId,
        budgetTemplateCode,
        budgetTemplateDesc,
      });
      getTemplateFields(budgetTemplateCode);
      // 根据路由新增头行的默认值
      if (isFunction(getCuxInit)) {
        if (isFunction(getCuxInit)) {
          const cuxInitData = getCuxInit({ history, props, headerDs, listDs });
          headerDs.current?.set(cuxInitData);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgetHeaderId, headerDs, budgetTemplateCode, templateFields, listDs]);

  // 获取头信息
  const getHeaderInfo = async () => {
    const errorMessage = [];
    const headerFlag = await header.validate();

    if (headerFlag) {
      const { adjustValidityDate = {}, validityDate = {}, ...other } = header.toData();
      return {
        ...other,
        ...adjustValidityDate,
        ...validityDate,
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.baseInfo`).d('基本信息'));
      return errorMessage;
    }
  };

  // 获取行信息
  const getLineInfo = async () => {
    const errorMessage = [];
    const lineFlag = await listDs.validate();

    if (lineFlag) {
      return {
        budgetLineList: listDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.budgetDetailInfo`).d('预算明细'));
      return errorMessage;
    }
  };

  // 获取页面单据信息
  const handleGetInfo = useCallback(async () => {
    const errorTipMsg = [];
    const headerInfo = await getHeaderInfo();
    const lineInfo = await getLineInfo();

    if (isArray(headerInfo)) errorTipMsg.push(...headerInfo);

    if (isArray(lineInfo)) errorTipMsg.push(...lineInfo);

    if (errorTipMsg.length === 0) {
      return {
        ...headerInfo,
        ...lineInfo,
      };
    } else {
      const allErrorMsg = [];
      const headerError = await header.getValidationErrors();
      const lineError = await listDs.getValidationErrors();
      const langUnit = intl.get(`${commonPrompt}.unit`).d('单元');
      const langLine = intl.get(`${commonPrompt}.line`).d('行');
      const theFirst = intl.get(`${commonPrompt}.theFirst`).d('第');

      if (!isEmpty(headerError)) {
        const headerErrorMsg = [];
        const requiredFields = [];
        headerError.forEach(ele => {
          const item = ele.errors.toJS()[0];
          if (item.ruleName === 'valueMissing') {
            requiredFields.push(`【${item.injectionOptions.label}】`);
          } else {
            headerErrorMsg.push(item.validationMessage);
          }
        });
        if (!isEmpty(requiredFields)) {
          headerErrorMsg.unshift(
            intl
              .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
              .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
          );
        }
        allErrorMsg.push(`【${headerInfo[0]}】${langUnit}: ${headerErrorMsg.join('、')}`);
      }
      if (!isEmpty(lineError)) {
        const linesErrorMsg = [];
        lineError.forEach(ele => {
          const lineErrorMsg = [];
          const requiredFields = [];
          ele.errors.forEach(data => {
            const item = data.errors.toJS()[0];
            if (item.ruleName === 'valueMissing') {
              requiredFields.push(`【${item.injectionOptions.label}】`);
            } else {
              lineErrorMsg.push(item.validationMessage);
            }
          });
          if (!isEmpty(requiredFields)) {
            lineErrorMsg.unshift(
              intl
                .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
            );
          }
          linesErrorMsg.push(
            `${theFirst}${listDs.indexOf(ele.record) + 1} ${langLine} ${lineErrorMsg.join('')}`
          );
        });
        allErrorMsg.push(`【${lineInfo[0]}】${langUnit}: ${linesErrorMsg.join(' ')}`);
      }

      notification.error({
        message: `${allErrorMsg.join(';')}`,
      });
      return false;
    }
  }, [headerDs, header, listDs]);

  // 添加动态字段
  const addDynamicFields = dataSet => {
    const { queryDataSet } = dataSet;

    templateFields.forEach(item => {
      const { queryFlag } = item;

      // const { gridField, queryField } = getBugetFieldsConfig(item);
      const { gridField, queryField } = remote.process('getBugetFieldsConfig', item);

      const { name } = gridField;

      listDs.addField(name, gridField);
      if (queryFlag) {
        // 处理查询条件
        if (queryDataSet) {
          if (!queryDataSet.getField(name)) {
            queryDataSet.addField(name, queryField);
            // queryDataSet.props.fields.push(queryField);
          }
        }
      }
    });
  };

  // 校验行数据是否唯一
  const lineValidUnique = () => {
    const lineData = [];
    listDs.all.forEach(record => {
      if (record.getState('isVaild')) {
        lineData.push(record.toData());
      }
    });

    // 有行数据才进行校验
    if (!isEmpty(lineData)) {
      const { adjustValidityDate = {}, validityDate = {}, ...other } =
        headerDs?.current?.toData() || {};
      validUnique({
        ...adjustValidityDate,
        ...validityDate,
        ...other,
        budgetLineList: lineData,
      }).then(res => {
        if (getResponse(res)) {
          if (!isEmpty(res) && isArray(res)) {
            res.forEach(ele => {
              const { errorFlag, primaryKey, errorMessage } = ele;
              // eslint-disable-next-line no-unused-expressions
              listDs
                .find(record => record.get('primaryKey') === primaryKey)
                ?.init({
                  errorFlag,
                  errorMessage,
                });
            });
          }
        }
      });
    }
  };

  useEffect(() => {
    if (!readOnly) {
      const templateFieldsName = templateFields?.map(ele => ele.budgetItemCode) || [];

      const handleHeaderUpdate = async ({ name, value, record }) => {
        if (name === 'budgetTemplateCode' && value) {
          getTemplateFields(value?.budgetTemplateCode);
        }
        const field = record.getField(name);
        if (field.get('required')) {
          if (value && (await record.validate())) {
            headerDs.setState('isVaild', true);
            // 执行行校验
            lineValidUnique();
          } else {
            headerDs.setState('isVaild', false);
          }
        }
      };

      const handleLineUpdate = async ({ name, value, record }) => {
        const field = record.getField(name);
        if (templateFieldsName.includes(name)) {
          if (field.get('multiple')) {
            if (field.get('type') === 'object') {
              record.init({
                [`${name}Meaning`]: (value || []).map(v => v[field.get('textField')]).join(','),
              });
            } else {
              record.init({
                [`${name}Meaning`]: (value || []).map(ele => field.getText(ele)).join(','),
              });
            }
          } else {
            record.init({
              [`${name}Meaning`]: field.getText(),
            });
          }

          if (await record.validate()) {
            record.setState('isVaild', true);
            if (headerDs.getState('isVaild')) {
              // 执行行校验
              lineValidUnique();
            }
          } else {
            record.setState('isVaild', false);
          }
        } else if (field.get('required')) {
          if (value && (await record.validate())) {
            record.setState('isVaild', true);
            if (headerDs.getState('isVaild')) {
              // 执行行校验
              lineValidUnique();
            }
          } else {
            record.setState('isVaild', false);
          }
        }
      };

      const handleLineLoad = async ({ dataSet }) => {
        dataSet.data.forEach(record => {
          record.init({
            primaryKey: uuid(),
          });
          record.setState('isVaild', true);
        });

        if (headerDs.getState('isVaild')) {
          // 执行行校验
          lineValidUnique();
        }
      };

      const handleLineRemove = () => {
        if (headerDs.getState('isVaild')) {
          // 执行行校验
          lineValidUnique();
        }
      };

      headerDs.addEventListener('update', handleHeaderUpdate);
      listDs.addEventListener('update', handleLineUpdate);
      listDs.addEventListener('load', handleLineLoad);
      listDs.addEventListener('remove', handleLineRemove);

      return () => {
        headerDs.removeEventListener('update', handleHeaderUpdate);
        listDs.removeEventListener('update', handleLineUpdate);
        listDs.removeEventListener('load', handleLineLoad);
        listDs.removeEventListener('remove', handleLineRemove);
      };
    }
  }, [headerDs, listDs, templateFields, readOnly]);

  // 当模板改变 行ds也将改变
  useEffect(() => {
    if (templateFields) {
      // 对listDs 进行处理
      addDynamicFields(listDs);
      // 然后查询
      if (budgetHeaderId) {
        listDs.query();
      }
    }
  }, [listDs, budgetHeaderId]);

  useEffect(() => {
    commonUpdate();
  }, [budgetHeaderId, headerDs]);

  useEffect(() => {
    if (isFunction(setCuxEffect)) {
      setCuxEffect({ headerDs });
    }
  }, [setCuxEffect, budgetHeaderId]);

  const value = useMemo(() => {
    return {
      userId,
      organizationId,
      history,
      listDs,
      headerDs,
      header,
      status,
      back,
      isArchived,
      canResetAcionsFlag,
      pubPathFlag,
      templateFields,
      budgetHeaderId,
      budgetHeaderStatus,
      budgetTemplateCode,
      handleGetInfo,
      commonUpdate,
      getCuxBudgetBtn,
      getTemplateFieldsAllowEdit,
      setCuxColumns,
      setCuxColumnsOthers,
      getCuxInit,
      setFormFieldsHiddenObj,
    };
  }, [
    userId,
    organizationId,
    history,
    listDs,
    headerDs,
    header,
    status,
    back,
    isArchived,
    canResetAcionsFlag,
    pubPathFlag,
    templateFields,
    budgetHeaderId,
    budgetHeaderStatus,
    budgetTemplateCode,
    handleGetInfo,
    commonUpdate,
    getCuxBudgetBtn,
    getCuxLineButtons,
    getTemplateFieldsAllowEdit,
    setCuxColumns,
    setCuxColumnsOthers,
    getCuxInit,
    setFormFieldsHiddenObj,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>
        <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>{children}</Spin>
      </ModalProvider>
    </Store.Provider>
  );
};

export default remote(
  {
    code: 'SBUD_CUX_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      getBugetFieldsConfig,
      getCuxBudgetBtn: undefined,
      getCuxLineButtons: undefined,
      getTemplateFieldsAllowEdit: undefined,
      getCuxInit: undefined,
      setCuxHeaderFields: undefined,
      setCuxLineFields: undefined,
      setCuxLineChange: undefined,
      setFormFieldsHiddenObj: undefined,
    },
  }
)(observer(StoreProvider));
