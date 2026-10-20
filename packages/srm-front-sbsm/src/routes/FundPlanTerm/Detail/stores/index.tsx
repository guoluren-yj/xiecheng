import { parse, stringify } from 'querystring';
import type { ParsedUrlQuery } from 'querystring';
import { flow } from 'lodash';
import type { ReactElement } from 'react';
import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { DataSet, ModalProvider, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import type { Operate } from '../../utils/type';
import { DetailCollapseCode, DetailCustomizeCode, DetailBtnCode, permissionCodeMap } from '../../utils/type';
import { termHeaderDS, termLineDS } from './detailDS';
import { permissionDS } from '../../List/listDS';

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  hideBackFlag: string, // 是否隐藏返回按钮
};
export type StoreValueType = {
  state: any,
  remote: any,
  search: string,
  pathname: string,
  history: any,
  termHeaderId: string | number, // 付款条款单主键id
  operate: Operate, // 路由操作
  allFlag: boolean, // 全部可操作按钮
  editFlag: boolean, // 可编辑
  copyFlag: boolean, // 可复制
  viewFlag: boolean, // 只读
  createFlag: boolean, // 新建
  historyFlag: boolean, // 历史记录
  termLineDs: DataSet, // 结构化行ds
  hideBackFlag: string, // 是否隐藏返回按钮
  termHeaderDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  customizeCollapse: Function,
  customizeBtnGroup: Function,
  handleBackList: () => void; // 返回列表页
  handleToDetail: (termHeaderId: string | number, operate: Operate) => void, // 跳转详情页
  snapshotFlag?: boolean,
  notPub: boolean,
  permissionMap: any,
};

export const Store = createContext<any>({});

export const wholeAmountEnableJSONData = {
  enableFlag: 1,
  excessCheckLevel: 'BAN',
  tolControlType: 'AMOUNT',
  excessTolerance: 0,
};

const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailCollapseCode,
      DetailBtnCode,
      ...Object.values(DetailCustomizeCode),
    ],
  }),
  formatterCollections({ code: ['sbsm.payTermsCtrl', 'sbsm.common', 'sbsm.fundPlanForecast'] }),
)((props) => {
  const { remote, history, match, location, children, customizeForm, customizeTable, customizeCollapse, customizeBtnGroup } = props;
  const { params } = match || {};
  const { state, pathname = '', search = '' } = location || {};
  const { termHeaderId } = params;
  const { operate, hideBackFlag, snapshotFlag: shotFlag } = parse(search.substring(1)) as ParsedSearchType;
  const allFlag = operate === 'all';
  const editFlag = operate === 'edit';
  const copyFlag = operate === 'copy';
  const historyFlag = operate === 'history';
  const viewFlag = ['view', 'all', 'history', undefined].includes(operate);
  const createFlag = operate === 'create' || termHeaderId === 'create';
  const snapshotFlag = Number(shotFlag) === 1;
  const notPub = pathname?.split('/')[1] !== 'pub';

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleLineUpdate = useCallback(({ name, record, value }) => {
    if (name === 'fcDateRule') {
      if (value === 'NO_NEED_CALCULATE') {
        record.set({
          fcBaseDateType: null,
          fcDeadLine: null,
          fcFixedDay: null,
          fcAccountPeriod: null,
          fcAddMonth: null,
        });
      } else if (value === 'DYNAMIC_PAY_DATE') {
        record.set({
          fcDeadLine: null,
          fcFixedDay: null,
          fcAddMonth: null,
        });
      }
    } else if (name === 'exDateRule') {
      if (value === 'NO_NEED_CALCULATE') {
        record.set({
          exBaseDateType: null,
          exDeadLine: null,
          exFixedDay: null,
          exAccountPeriod: null,
          exAddMonth: null,
        });
      } else if (value === 'DYNAMIC_PAY_DATE') {
        record.set({
          exDeadLine: null,
          exFixedDay: null,
          exAddMonth: null,
        });
      }
    } else if (name === 'stageType') {
      record.set({
        fcBaseDateType: null,
        exBaseDateType: null,
      });
    }
  }, []);

  const termLineDs = useMemo(() => new DataSet({
    ...termLineDS(),
    events: { update: handleLineUpdate },
  }), [handleLineUpdate]);

  const onHeaderUpdate = useCallback(({ name, value }) => {
    // 如果阶段计算金额规则不是比例(按实际维护) 清空行上的阶段比例的值且不可编辑
    if (name === 'amountComputeMode' && value !== 'INPUT_PERCENT') {
      termLineDs.forEach((line) => {
          line.set({
            stagePercent: null,
          });
      });
    }
  }, [termLineDs]);

  const termHeaderDs = useMemo(() => new DataSet({
    ...termHeaderDS({termHeaderId, createFlag, copyFlag }),
    children: {
      termLineList: termLineDs,
    },
    events: { update: onHeaderUpdate },
  }), [termHeaderId, createFlag, copyFlag, termLineDs, onHeaderUpdate]);


  // 跳转至详情页
  const handleToDetail = useCallback((termHeaderId, operate) => {
    if (!termHeaderId) return;
    history.push({
      pathname: `/sbsm/payment-terms/detail/${termHeaderId}`,
      search: stringify({ operate }),
    });
  }, [history]);

  // 跳回列表页
  const handleBackList = useCallback(() => {
    history.push({
      pathname: `/sbsm/payment-terms/list`,
    });
  }, [history]);

  useEffect(() => {
    if (copyFlag && termLineDs) {
      termHeaderDs.query().then((res) => {
        termLineDs.loadData([]);
        const { termLineList = [] } = res || {};
        termLineList.map((item) => {
          termLineDs.create(item);
        });
      });
    }
  }, [copyFlag, termHeaderDs, termLineDs]);

  const value: StoreValueType = useMemo(() => {
    return {
      state,
      remote,
      search,
      pathname,
      history,
      termHeaderId,
      operate,
      allFlag,
      editFlag,
      copyFlag,
      viewFlag,
      createFlag,
      historyFlag,
      termLineDs,
      hideBackFlag,
      termHeaderDs,
      customizeForm,
      customizeTable,
      customizeCollapse,
      handleBackList,
      handleToDetail,
      snapshotFlag,
      notPub,
      permissionMap,
      customizeBtnGroup,
    };
  }, [
    state,
    remote,
    search,
    pathname,
    history,
    termHeaderId,
    operate,
    allFlag,
    editFlag,
    copyFlag,
    viewFlag,
    createFlag,
    historyFlag,
    termLineDs,
    hideBackFlag,
    termHeaderDs,
    customizeForm,
    customizeTable,
    customizeCollapse,
    handleBackList,
    handleToDetail,
    snapshotFlag,
    notPub,
    permissionMap,
    customizeBtnGroup,
  ]);

  if (!termHeaderDs.current) {
    return <Spin />;
  }

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export default StoreProvider;
