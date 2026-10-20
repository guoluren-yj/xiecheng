import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import {
  deleteStrategy,
  getNodePolicyHistory,
} from '@/services/materialCertificationPolicyService';
import { Table, Dropdown, Icon, Spin, Menu, Modal } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import { Button } from 'components/Permission';

import { colorRender } from './hook';
import styles from '../index.less';
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const Index = function Index({ dataSet, handleEdit }) {
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const renderViewHistoryMenu = () => {
    return (
      <Spin spinning={historyLoading}>
        <Menu style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {!isEmpty(historyList) ? (
            historyList.map((e) => (
              <Menu.Item style={{ height: 'auto' }}>
                <div className={styles['history-item-wrapper']}>
                  <div className={styles[`history-content`]} onClick={() => handleEdit(e)}>
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${e.versionNumber
                      }`}
                    <div className={styles[`history-extra`]}>
                      {`${e.releaseByName} ${dateTimeRender(e.lastUpdateDate)}`}
                    </div>
                  </div>
                </div>
              </Menu.Item>
            ))
          ) : (
            <Menu.Item disabled>
              <span>{intl.get(`${commonPrompt}.historyEmpty`).d('暂无历史版本信息')}</span>
            </Menu.Item>
          )}
        </Menu>
      </Spin>
    );
  };

  // 获取历史数据
  const fetchHistoryList = (record, hidden) => {
    // 隐藏
    if (!hidden) {
      setHistoryLoading(true);
      getNodePolicyHistory(record.get('strategyHeaderId'))
        .then((res) => {
          if (getResponse(res)) {
            setHistoryList(res);
          } else {
            setHistoryList([]);
          }
        })
        .finally(() => {
          setHistoryLoading(false);
        });
    } else {
      setHistoryList([]);
    }
  };

  const handleDelete = (record) => {
    return new Promise(async (resolve) => {
      const detailInfo = record?.toData();
      if (detailInfo) {
        deleteStrategy({
          ...detailInfo,
          deleteOnlyCheckFlag: 1,
        })
          .then((res) => {
            if (getResponse(res)) {
              Modal.confirm({
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: (
                  <div>{intl.get(`${commonPrompt}.deleteStrategy`).d(`是否确认删除该策略`)}</div>
                ),
              }).then((button) => {
                if (button === 'ok') {
                  return new Promise((resolve) => {
                    deleteStrategy({
                      ...detailInfo,
                      deleteOnlyCheckFlag: 0,
                    })
                      .then((res) => {
                        if (getResponse(res)) {
                          notification.success();
                          dataSet.query();
                        }
                      })
                      .finally(() => {
                        resolve();
                      });
                  });
                }
              });
            }
          })
          .finally(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'strategyStatusCode',
        width: 150,
        renderer: ({ value, record }) =>
          colorRender(value, record.get('strategyStatusCodeMeaning')),
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => (
          <>
            <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => handleEdit(record.toData(), 'edit')}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            {record?.get('strategyStatusCode') === 'NOT_RELEASED' && (
              <Button
                style={{ marginLeft: '16px' }}
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => handleDelete(record)}
                permissionList={[
                  {
                    code: 'srm.smdm.material.certification.policy.template.button.strategy.delete',
                  },
                ]}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            )}
            {String(record.get('versionNumber')) !== '1' && (
              <Dropdown
                overlay={renderViewHistoryMenu()}
                onHiddenBeforeChange={(hidden) => {
                  fetchHistoryList(record, hidden);
                }}
              >
                <Button
                  style={{ marginLeft: '16px' }}
                  type="c7n-pro"
                  funcType="link"
                  color="primary"
                >
                  {intl.get(`${commonPrompt}.historyVersion`).d('历史版本')}
                  <Icon type="expand_more" style={{ fontSize: '14px' }} />
                </Button>
              </Dropdown>
            )}
          </>
        ),
      },
      {
        name: 'strategyNum',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => handleEdit(record.toData(), 'read')}>{value}</a>
        ),
      },
      {
        name: 'strategyName',
        width: 250,
      },
      {
        name: 'versionNumber',
        width: 100,
      },
      {
        name: 'itemAuthStrLineList',
        width: 300,
        renderer: ({ value }) => {
          if (value) {
            return value?.reduce(
              (a, b) => (a ? `${a} - ${b?.nodeCodeMeaning}` : b?.nodeCodeMeaning),
              ''
            );
          }
        },
      },
      {
        name: 'createdByName',
        width: 150,
      },
      {
        name: 'lastUpdateDate',
        width: 150,
      },
    ];
  });

  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      <Table
        dataSet={dataSet}
        columns={columns}
        style={{ maxHeight: 'calc(100vh - 300px)' }}
        customizable
        customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_POLICY_LIST"
      />
    </div>
  );
};

export default Index;
