import { isEmpty } from 'lodash';
import React, { useEffect, useCallback } from 'react';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import { Modal } from 'choerodon-ui/pro';

import StatusTag from '@/routes/components/StatusTag';
import {
  enableReviewPoint,
  disableReviewPoint,
  copyReviewPoint,
  unlockReviewTemplate,
  publishReviewTemplate,
  copyReviewTemplate,
  enableOrDisableReviewTemplate,
} from '@/services/contractReviewConfigService';
import MoreButton from '@/routes/components/MoreButton';

import HistoryVersion from './HistoryVersion';

const ListTable = ({
  dataSet,
  dispatch,
  activeKey,
  searchCode,
  customizeCode,
  customizeTable,
  openPointDefinitionModal = () => {},
}) => {
  const isReviewPointTab = activeKey === 'pointDefinition';

  useEffect(() => {}, []);

  // 审查点-复制
  const handlePointCopy = (params) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('spcm.common.view.message.copyMsg').d('确认复制该行？'),
      onOk: () => {
        return new Promise((resolve) => {
          copyReviewPoint(params)
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                dataSet.query();
              }
            })
            .finally(() => resolve(true));
        });
      },
    });
  };

  // 审查点-禁用
  const handlePointDisable = (params) => {
    return disableReviewPoint(params).then((res) => {
      if (getResponse(res)) {
        notification.success();
        dataSet.query();
      }
    });
  };

  // 审查点-启用
  const handlePointEnable = (params) => {
    return enableReviewPoint(params).then((res) => {
      if (getResponse(res)) {
        notification.success();
        dataSet.query();
      }
    });
  };

  // 获取审查点行上操作按钮
  const getPointLineBtns = useCallback((record) => {
    const { reviewPointId, status, ruleSource } =
      record.get(['reviewPointId', 'status', 'ruleSource']) || {};
    const showEditBtn = ruleSource !== 'predefine';
    const showCopyBtn = ruleSource === 'predefine';
    const enableFlag = status === 'enable';
    return [
      {
        name: 'edit',
        hidden: !showEditBtn,
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => openPointDefinitionModal({ type: 'edit', record }),
      },
      {
        name: 'copy',
        hidden: !showCopyBtn,
        child: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handlePointCopy({ reviewPointId }),
      },
      {
        name: 'disable',
        hidden: !enableFlag,
        child: intl.get('hzero.common.status.disable').d('禁用'),
        onClick: () => handlePointDisable({ reviewPointId }),
      },
      {
        name: 'enable',
        hidden: enableFlag,
        child: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handlePointEnable({ reviewPointId }),
      },
    ].filter((btn) => !btn.hidden);
  }, []);

  // 审查点定义列
  const getPointColumns = () => {
    const columns = [
      {
        name: 'status',
        width: 120,
        renderer: ({ value, record }) => (
          <StatusTag text={record.get('statusMeaning')} value={value} />
        ),
      },
      {
        name: 'action',
        width: 160,
        renderer: ({ record }) => {
          const buttons = getPointLineBtns(record);
          return isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'reviewCode',
        width: 180,
        renderer: ({ record, value }) => {
          return <a onClick={() => openPointDefinitionModal({ type: 'view', record })}>{value}</a>;
        },
      },
      {
        name: 'reviewName',
        width: 200,
      },
      {
        name: 'routeNameMeaning',
        width: 200,
      },
      {
        name: 'routeUrl',
        width: 160,
      },
      {
        name: 'validationType',
        width: 120,
      },
      {
        name: 'ignoreReasonFlag',
        width: 140,
        renderer: ({ value }) => {
          return yesOrNoRender(value || 0);
        },
      },
      {
        name: 'riskType',
        width: 120,
      },
      {
        name: 'riskLevel',
        width: 120,
      },
      {
        name: 'riskDescription',
        width: 160,
      },
      {
        name: 'resolution',
        width: 160,
      },
      {
        name: 'ruleDescription',
        width: 160,
      },
      {
        name: 'ruleSource',
        width: 160,
      },
      {
        name: 'customCopyFlag',
        width: 180,
        renderer: ({ value }) => {
          return yesOrNoRender(value || 0);
        },
      },
      {
        name: 'copyReviewCode',
        width: 160,
        renderer: ({ record, value }) => {
          return (
            <a
              onClick={() =>
                openPointDefinitionModal({ type: 'view', record, predefinedFlag: true })
              }
            >
              {value}
            </a>
          );
        },
      },
      {
        name: 'reviewType',
        width: 160,
      },
    ];
    return columns;
  };

  // 编辑审查模版
  const handleEditTemplate = async (record) => {
    if (record) {
      const { templateStatus, reviewTemplateId } =
        record.get(['templateStatus', 'reviewTemplateId']) || {};
      if (['PUBLISHED', 'DISABLED'].includes(templateStatus)) {
        const data = record.toData();
        return unlockReviewTemplate(data).then((res) => {
          if (getResponse(res)) {
            const { reviewTemplateId: newTemplateId } = res;
            goToTemplateDetail({
              type: 'edit',
              reviewTemplateId: newTemplateId,
            });
          }
        });
      } else {
        goToTemplateDetail({
          type: 'edit',
          reviewTemplateId,
        });
      }
    }
  };

  // 发布审查模版
  const handleTemplateRelease = async (record) => {
    if (record) {
      const payload = {
        data: record.toData(),
      };
      return publishReviewTemplate(payload).then((res) => {
        if (getResponse(res)) {
          notification.success();
          dataSet.query();
        }
      });
    }
  };

  // 复制审查模版
  const handleTemplateCopy = async (record) => {
    if (record) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('spcm.common.view.message.copyMsg').d('确认复制该行？'),
        onOk: () => {
          return new Promise((resolve) => {
            const payload = record.toData();
            copyReviewTemplate(payload)
              .then((res) => {
                if (getResponse(res)) {
                  notification.success();
                  dataSet.query();
                }
              })
              .finally(() => resolve(true));
          });
        },
      });
    }
  };

  // 启用/禁用审查模版
  const handleTemplateEnableOrDisable = async (params = {}) => {
    const { record, type = '' } = params;
    const enableFlag = type === 'enable' ? 1 : 0;
    if (record) {
      // 区分启用禁用 todo
      const payload = {
        ...(record.toData() || {}),
        enableFlag,
      };
      return enableOrDisableReviewTemplate(payload).then((res) => {
        if (getResponse(res)) {
          notification.success();
          dataSet.query();
        }
      });
    }
  };

  // 审查模版行按钮
  const getTemplateLineBtns = useCallback((record) => {
    const { templateStatus, versionNumber, children, enableFlag } =
      record.get(['templateStatus', 'versionNumber', 'children', 'enableFlag']) || {};
    // 已发布
    const publishFlag = templateStatus === 'PUBLISHED';
    // 未发布
    const unPublishFlag = templateStatus === 'UN_PUBLISHED';
    const showHistory = publishFlag && versionNumber > 1;
    return [
      {
        name: 'edit',
        hidden: !isEmpty(children),
        child: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleEditTemplate(record),
      },
      {
        name: 'copy',
        child: intl.get('hzero.common.button.copy').d('复制'),
        onClick: () => handleTemplateCopy(record),
      },
      {
        name: 'enable',
        hidden: enableFlag !== 0,
        child: intl.get('hzero.common.status.enable').d('启用'),
        onClick: () => handleTemplateEnableOrDisable({ type: 'enable', record }),
      },
      {
        name: 'disable',
        hidden: !publishFlag,
        child: intl.get('hzero.common.status.disable').d('禁用'),
        onClick: () => handleTemplateEnableOrDisable({ type: 'disable', record }),
      },
      {
        name: 'release',
        hidden: !unPublishFlag,
        child: intl.get('hzero.common.button.release').d('发布'),
        onClick: () => handleTemplateRelease(record),
      },
      {
        name: 'historyVersion',
        isMenu: true,
        hidden: !showHistory,
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

  // 审查模版定义列
  const getTemplateColumns = () => {
    const columns = [
      {
        name: 'templateStatus',
        headerStyle: { paddingLeft: 48 },
        width: 140,
        renderer: ({ value, record }) => (
          <StatusTag text={record.get('templateStatusMeaning')} value={value} />
        ),
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => {
          const buttons = getTemplateLineBtns(record);
          return isEmpty(buttons) ? '-' : <MoreButton buttons={buttons} />;
        },
      },
      {
        name: 'reviewTemplateCode',
        width: 180,
        renderer: ({ record, value }) => {
          const reviewTemplateId = record.get('reviewTemplateId');
          return (
            <a
              onClick={() =>
                goToTemplateDetail({
                  type: 'view',
                  reviewTemplateId,
                })
              }
            >
              {value}
            </a>
          );
        },
      },
      {
        name: 'reviewTemplateName',
        width: 200,
      },
      {
        name: 'versionNumber',
        width: 120,
      },
      {
        name: 'reviewTemplateDesc',
        width: 240,
      },
    ];
    return columns;
  };

  // 跳转
  const goToTemplateDetail = (params = {}) => {
    const { reviewTemplateId, type = 'view' } = params;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-review-config/template/detail/${reviewTemplateId}/${type}`,
      })
    );
  };

  return customizeTable(
    {
      code: customizeCode,
    },
    <SearchBarTable
      cacheState
      dataSet={dataSet}
      columns={isReviewPointTab ? getPointColumns() : getTemplateColumns()}
      mode={isReviewPointTab ? 'list' : 'tree'}
      searchCode={searchCode}
      style={{
        maxHeight: `calc(100vh - 280px)`,
      }}
    />
  );
};

export default ListTable;
