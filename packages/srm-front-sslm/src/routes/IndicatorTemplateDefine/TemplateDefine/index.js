/*
 * @Date: 2023-10-07 15:51:40
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty, isFunction } from 'lodash';
import { Tag } from 'choerodon-ui';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import React, { useCallback } from 'react';
import { Spin, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import MoreButton from '@/routes/components/MoreButton';
import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import {
  unlockTemp,
  publishListTemplate,
  enableEvalTemplate,
} from '@/services/indicatorTemplateDefineService';

import HistoryVersion from './HistoryVersion';

let searchBarRef; // 筛选器ref

const Index = ({ remote, loading, dataSet, dispatch, setLoading, customizeTable }) => {
  // 跳转详情页
  const jumpDetail = useCallback((record, type) => {
    const { evalTplId, evalTplType, children } = record.get([
      'evalTplId',
      'evalTplType',
      'children',
    ]);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/indicator-template-define/template-detail/${evalTplId}/${evalTplType}/${type}`,
        search: querystring.stringify({
          sourceEvalTplId: evalTplId, // 存储最新版本id,用于明细历史版本跳转
          sourceEvalTplType: evalTplType,
          editFlag: isEmpty(children) ? 1 : 0, // 判断当前模板是否有子集，用于处理明细编辑按钮
        }),
      })
    );
  }, []);

  // 发布
  const handleRelease = (record, resolve) => {
    setLoading(true);
    publishListTemplate(record.toData())
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dataSet.query(dataSet.currentPage);
          if (isFunction(resolve)) {
            resolve();
          }
        }
      })
      .finally(() => {
        if (isFunction(resolve)) {
          resolve(false);
        }
        setLoading(false);
      });
  };

  // 发布弹框
  const releaseModal = useCallback((record) => {
    const { parentId } = record.get(['parentId']) || {};
    const parentRow = parentId
      ? dataSet.find((itemRecord) => itemRecord.get('evalTplId') === parentId)
      : null;
    if (parentRow && parentRow.get('enabledFlag') === 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.indicatorTemplate.modal.message.releaseMsg')
          .d('当前模板为禁用状态，发布后模板会变更为已发布状态，确认发布新版本吗?'),
        onOk: () => {
          return new Promise((resolve) => {
            handleRelease(record, resolve);
          });
        },
      });
    } else {
      handleRelease(record);
    }
  }, []);

  // 复制
  const handleCopy = (record) => {
    const { evalTplId, evalTplType } = record.get(['evalTplId', 'evalTplType']);
    dispatch(
      routerRedux.push({
        pathname: '/sslm/indicator-template-define/template-detail/create',
        search: querystring.stringify({
          evalTplId,
          evalTplType,
          jumpSource: 'COPY',
        }),
      })
    );
  };

  // 启用、禁用
  const hanldeEnable = (record, enabledFlag) => {
    setLoading(true);
    enableEvalTemplate([
      {
        ...record.toData(),
        enabledFlag: enabledFlag === 1 ? 0 : 1,
      },
    ])
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          dataSet.query(dataSet.currentPage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 编辑
  const handleEdit = useCallback((record) => {
    const evalStatusCode = record.get('evalStatusCode');
    if (evalStatusCode === 'PUBLISHED') {
      setLoading(true);
      unlockTemp(record.toData())
        .then((response) => {
          const res = getResponse(response);
          if (res) {
            const { evalTplId: newEvalTplId, evalTplType: newEvalTplType } = res;
            dispatch(
              routerRedux.push({
                pathname: `/sslm/indicator-template-define/template-detail/${newEvalTplId}/${newEvalTplType}/edit`,
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      jumpDetail(record, 'edit');
    }
  }, []);

  const handleQuery = ({ params, currentPage }) => {
    if (dataSet.queryDataSet?.current) {
      const { customizeOrderField, ...rest } = params;
      const orderField = {}; // 排序
      if (customizeOrderField) {
        const newCustomizeOrderField = customizeOrderField?.split(':');
        const orderKey = newCustomizeOrderField[0];
        const orderValue = newCustomizeOrderField[1];
        if (orderKey === 'creationDate') {
          // 按创建时间排序时，后端自己手动处理
          orderField.creationDateOrder = orderValue;
        } else {
          orderField.customizeOrderField = customizeOrderField;
        }
      }
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['creationDateOrder'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...rest,
        ...orderField,
        ...clearParams,
      });
      dataSet.query(currentPage);
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  // 清除筛选器字段
  const clearFieldsValues = () => {
    if (dataSet.queryDataSet && dataSet.queryDataSet.current) {
      dataSet.queryDataSet.current.reset();
    }
  };

  // 获取行上操作按钮
  const getLineBtns = useCallback((record) => {
    const { enabledFlag, evalStatusCode, children, versionNum, parentId } = record.get([
      'enabledFlag',
      'evalStatusCode',
      'children',
      'versionNum',
      'parentId',
    ]);
    const editBtnFlag = evalStatusCode === 'PUBLISHED' && !isEmpty(children);
    const remoteEditBtnFlag = remote
      ? remote.process('SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_TEMPLATE_EDIT_BTN', editBtnFlag, {
          record,
          dataSet,
        })
      : editBtnFlag;
    return [
      {
        name: 'release',
        hidden: evalStatusCode === 'PUBLISHED' || enabledFlag === 0,
        child: intl.get(`hzero.common.button.release`).d('发布'),
        onClick: () => releaseModal(record),
      },
      {
        name: 'edit',
        hidden: remoteEditBtnFlag,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEdit(record),
      },
      {
        name: 'copy',
        hidden: Boolean(parentId),
        child: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handleCopy(record),
      },
      {
        name: 'disable',
        hidden: !(enabledFlag === 1 && evalStatusCode === 'PUBLISHED'),
        child: intl.get('hzero.common.status.disable').d('禁用'),
        onClick: () => hanldeEnable(record, enabledFlag),
      },
      {
        name: 'enable',
        hidden: enabledFlag !== 0,
        child: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => hanldeEnable(record, enabledFlag),
      },
      {
        name: 'historyVersion',
        isMenu: true,
        hidden: ['NEW', 'UPDATED'].includes(evalStatusCode) || versionNum === 0,
        label: intl.get('hzero.common.button.historyVersion').d('历史版本'),
        child: (
          <HistoryVersion
            type="LIST_HISTORY"
            record={record}
            dispatch={dispatch}
            showSubMenuFlag={isEmpty(children)}
          />
        ),
      },
    ].filter((btn) => !btn.hidden);
  }, []);

  const columns = [
    {
      name: 'evalStatusCode',
      headerStyle: { paddingLeft: 48 },
      renderer: ({ name, value, record }) => {
        const { enabledFlag } = record.get(['enabledFlag']);
        if (!enabledFlag) {
          return (
            <Tag color="red" style={{ border: 'none' }}>
              {intl.get('hzero.common.status.disable').d('禁用')}
            </Tag>
          );
        } else {
          return renderStatus({ name, value, record });
        }
      },
    },
    {
      name: 'action',
      width: 190,
      renderer: ({ record }) => {
        const buttons = getLineBtns(record);
        return <MoreButton buttons={buttons} />;
      },
    },
    {
      name: 'evalTplCode',
      renderer: ({ value, record }) => <a onClick={() => jumpDetail(record, 'view')}>{value}</a>,
    },
    {
      name: 'evalTplName',
    },
    {
      name: 'evalTplType',
    },
    {
      name: 'versionNum',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'lastUpdateDate',
    },
  ];
  return (
    <Spin spinning={loading}>
      <div style={{ height: tableHeight.hasTab }}>
        {customizeTable(
          {
            code: 'SSLM.TEMPLATE_DEFINE.LIST_TABLE',
          },
          <SearchBarTable
            virtual
            virtualCell
            cacheState
            mode="tree"
            dataSet={dataSet}
            columns={columns}
            searchBarRef={(ref) => {
              searchBarRef = ref;
            }}
            style={{ maxHeight: tableMaxHeight.hasTab }}
            searchCode="SSLM.TEMPLATE_DEFINE.LIST_SEARCH_BAR"
            searchBarConfig={{
              onQuery: handleQuery,
              onClear: () => clearFieldsValues(),
              onReset: () => clearFieldsValues(),
            }}
          />
        )}
      </div>
    </Spin>
  );
};

export default Index;
