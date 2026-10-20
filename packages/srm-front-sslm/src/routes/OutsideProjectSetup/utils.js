/*
 * @Description: 外部寻源-Store
 * @Date: 2025-05-22 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { renderStatus } from '@/routes/components/utils';
import { listOperate } from '@/services/outsideProjectSetupService';
import ResButton from './components/ResponseSupplier';

export const organizationId = getCurrentOrganizationId();

// 列表tab
export const getListTab = () => [
  {
    key: 'waitPublish',
    tab: intl.get('sslm.outsideProjectSetup.view.title.waitPublish').d('待发布'),
    customizeUnitCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_WAIT_PUBLISH',
    searchCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_WAIT_PUBLISH.SEARCH',
  },
  {
    key: 'waitResponse',
    tab: intl.get('sslm.outsideProjectSetup.view.title.waitResponse').d('待响应'),
    customizeUnitCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_WAIT_RESPONSE',
    searchCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_WAIT_RESPONSE.SEARCH',
  },
  {
    key: 'doneResponse',
    tab: intl.get('sslm.outsideProjectSetup.view.title.donePublish').d('有响应'),
    customizeUnitCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_DONE_RESPONSE',
    searchCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_DONE_RESPONSE.SEARCH',
  },
  {
    key: 'doneEnd',
    tab: intl.get('sslm.outsideProjectSetup.view.title.doneEnd').d('已结束'),
    customizeUnitCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_DONE_END',
    searchCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_DONE_END.SEARCH',
  },
  {
    key: 'all',
    tab: intl.get('sslm.outsideProjectSetup.view.title.all').d('全部'),
    customizeUnitCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_ALL',
    searchCode: 'SSLM_OUTSIEDPROJECTSETUP.LIST_ALL.SEARCH',
  },
];

/**
 * 列表Columns
 * @delivery {*} params
 * return arr
 */
export function lineColumns(dispatch, tabKey, setLoading) {
  // 跳转明细
  const jumpDetail = ({ status, extSourceReqId }) => {
    dispatch(
      routerRedux.push({
        pathname: `/sslm/oueside-project-setup/${status}`,
        search: querystring.stringify({
          extSourceReqId,
        }),
      })
    );
  };

  // 撤销
  const handleRevoke = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.outsideProjectSetup.message.revoke.tips')
        .d('撤销后当前单据会终结，请确认是否结束此次寻源'),
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          listOperate({ type: 'revoke', data: record.toData() })
            .then(res => {
              if (getResponse(res)) {
                resolve(true);
                notification.success();
                record.dataSet.query(record.dataSet.currentPage);
              }
            })
            .finally(() => {
              setLoading(false);
              resolve(false);
            });
        });
      },
    });
  };

  // 完成
  const handleFinish = record => {
    const unrespondedFlag = record.get('unrespondedFlag');
    const children = unrespondedFlag
      ? intl
          .get('sslm.outsideProjectSetup.message.finish.unrespondedMsg')
          .d('存在未处理的报价供应商，请确认是否结束询价？')
      : intl.get('sslm.outsideProjectSetup.message.finish.finishMsg').d('确认结束询价？');
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children,
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          listOperate({ type: 'finish', data: record.toData() })
            .then(res => {
              if (getResponse(res)) {
                resolve(true);
                notification.success();
                record.dataSet.query(record.dataSet.currentPage);
              }
            })
            .finally(() => {
              setLoading(false);
              resolve(false);
            });
        });
      },
    });
  };

  // 行操作按钮
  const lineOperate = (record, type) => {
    setLoading(true);
    listOperate({
      type,
      data: record.toData(),
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          record.dataSet.query(record.dataSet.currentPage);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = [
    {
      name: 'reqStatus',
      width: 120,
      renderer: renderStatus,
    },
    {
      name: 'operator',
      width: 160,
      renderer: ({ record }) => {
        const reqStatus = record?.get('reqStatus');
        return [
          ['NEW', 'CONFIRM_EXT_REJECTED', 'EXT_CONFIRMING', 'WAIT_RESPONSE'].includes(reqStatus) &&
            !['waitPublish', 'waitResponse'].includes(tabKey) && (
              <Button
                funcType="link"
                onClick={() =>
                  jumpDetail({
                    status: 'detail',
                    extSourceReqId: record?.get('extSourceReqId'),
                  })
                }
              >
                {intl.get('hzero.common.button.editor').d('编辑')}
              </Button>
            ),
          ['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus) && (
            <Button funcType="link" onClick={() => lineOperate(record, 'release')}>
              {intl.get('hzero.common.button.realse').d('发布')}
            </Button>
          ),
          ['RESPONSED'].includes(reqStatus) && (
            <Button funcType="link" onClick={() => handleFinish(record)}>
              {intl.get('hzero.common.button.finish').d('完成')}
            </Button>
          ),
          <Button funcType="link" onClick={() => lineOperate(record, 'copy')}>
            {intl.get('hzero.common.button.copy').d('复制')}
          </Button>,
          ['EXT_CONFIRMING', 'CONFIRM_EXT_REJECTED', 'WAIT_RESPONSE'].includes(reqStatus) && (
            <Button funcType="link" onClick={() => handleRevoke(record)}>
              {intl.get('hzero.common.button.revoke').d('撤销')}
            </Button>
          ),
          ['RESPONSED'].includes(reqStatus) && tabKey === 'all' && (
            <Button
              funcType="link"
              onClick={() =>
                jumpDetail({
                  status: 'detail',
                  extSourceReqId: record?.get('extSourceReqId'),
                })
              }
            >
              {intl.get('sslm.common.button.choice').d('选用')}
            </Button>
          ),
        ].filter(Boolean);
      },
    },
    {
      name: 'reqNumber',
      width: 140,
      renderer: ({ value, record }) => {
        return (
          <a
            onClick={() =>
              jumpDetail({
                status: ['waitPublish', 'waitResponse', 'doneResponse'].includes(tabKey)
                  ? 'detail'
                  : 'read',
                extSourceReqId: record?.get('extSourceReqId'),
              })
            }
          >
            {value}
          </a>
        );
      },
    },
    {
      name: 'reqTitle',
      width: 160,
    },
    {
      name: 'responseStatus',
      width: 100,
      hiddenFlag: ['waitPublish', 'waitResponse']?.includes(tabKey),
      renderer: ({ record }) => {
        return [
          <ResButton
            extSourceReqId={record?.get('extSourceReqId')}
            btnText={intl.get('hzero.common.button.look').d('查看')}
          />,
        ];
      },
    },
    {
      name: 'endDate',
      width: 120,
    },
    {
      name: 'companyName',
      width: 240,
    },
    {
      name: 'releaseDate',
      width: 120,
    },
    {
      name: 'realName',
      width: 100,
      hidden: true, // 表格小齿轮里默认隐藏
    },
    {
      name: 'creationDate',
      width: 140,
      hidden: true, // 表格小齿轮里默认隐藏
    },
  ].filter(col => !col.hiddenFlag);

  return columns;
}

/**
 * 个性化单元加载配置
 * @object {string} unitCode - 个性化单元编码
 */
export const customizeConfig = {
  unitCode: ['SSLM_OUTSIEDPROJECTSETUP.TABS', ...getListTab()?.map(item => item.customizeUnitCode)],
};
