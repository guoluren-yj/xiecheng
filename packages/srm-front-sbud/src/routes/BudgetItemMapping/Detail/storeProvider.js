/* eslint-disable react-hooks/exhaustive-deps */

import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
  // getCurrentTenant,
} from 'utils/utils';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import { baseInfoDS, mappingLineDS } from '../store/detailDs';

export const Store = createContext();

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const StoreProvider = function StoreProvider(props) {
  const { cacheKey, history, location, children, readOnly, budgetItemId } = props;

  const userId = getCurrentUserId();
  const organizationId = getCurrentOrganizationId();

  const detailListDs = useDataSet(
    () =>
      mappingLineDS({
        budgetItemId,
        readOnly,
      }),
    [budgetItemId, readOnly]
  );

  const headerDs = useDataSet(
    () =>
      baseInfoDS({
        budgetItemId,
        readOnly,
      }),
    [budgetItemId, organizationId, readOnly]
  );

  const header = headerDs.current;

  // 更新页面信息
  const commonUpdate = useCallback(() => {
    if (budgetItemId && budgetItemId !== 'new' && cacheKey) {
      headerDs.loadData([
        {
          ...JSON.parse(window.sessionStorage.getItem(cacheKey)),
        },
      ]);
      detailListDs.query();
    } else {
      headerDs.loadData([
        {
          enabledFlag: '1',
          predefinedFlag: '0',
        },
      ]);
    }
  }, [cacheKey, budgetItemId, detailListDs, headerDs]);

  // 获取头信息
  const getHeaderInfo = async () => {
    const errorMessage = [];
    const headerFlag = await headerDs?.validate();

    if (headerFlag) {
      return header?.toData() || {};
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.baseInfo`).d('基本信息'));
      return errorMessage;
    }
  };

  // 获取基础信息
  const getDetailInfo = async () => {
    const errorMessage = [];
    const lineFlag = await detailListDs.validate();

    if (lineFlag) {
      return {
        itemMappingList: detailListDs.toData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.detailInfo`).d('明细信息'));
      return errorMessage;
    }
  };

  // 获取页面单据信息
  const handleGetInfo = useCallback(async () => {
    const errorTipMsg = [];
    const headerInfo = await getHeaderInfo();
    const detailInfo = await getDetailInfo();

    if (isArray(headerInfo)) errorTipMsg.push(...headerInfo);

    if (isArray(detailInfo)) errorTipMsg.push(...detailInfo);

    if (errorTipMsg.length === 0) {
      return {
        ...headerInfo,
        ...detailInfo,
      };
    } else {
      const allErrorMsg = [];
      const headerError = await header.getValidationErrors();
      const lineError = await detailListDs.getValidationErrors();
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
            ele?.record?.get('documentTypeMeaning')
              ? `${intl.get(`${commonPrompt}.documentType`).d('单据类型')}【${ele?.record?.get(
                  'documentTypeMeaning'
                )}】, ${lineErrorMsg.join('')}`
              : ` ${theFirst} ${detailListDs.indexOf(ele.record) +
                  1} ${langLine} ${lineErrorMsg.join('')}`
          );
        });
        allErrorMsg.push(`【${detailInfo[0]}】${langUnit}: ${linesErrorMsg.join(' ')}`);
      }

      notification.error({
        message: `${allErrorMsg.join(';')}`,
      });
      return false;
    }
  }, [header]);

  const value = useMemo(() => {
    return {
      history,
      location,
      readOnly,
      budgetItemId,
      header,
      headerDs,
      detailListDs,
      commonUpdate,
      handleGetInfo,
    };
  }, [
    history,
    location,
    readOnly,
    budgetItemId,
    header,
    headerDs,
    detailListDs,
    commonUpdate,
    handleGetInfo,
  ]);

  useEffect(() => {
    commonUpdate();
  }, [budgetItemId, detailListDs, headerDs]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
