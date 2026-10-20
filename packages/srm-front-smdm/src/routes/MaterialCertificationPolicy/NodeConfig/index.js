import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Table, Dropdown, Icon, Spin, Menu, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化
import {
  // enableOrdisable,
  getNodeConfigHistory,
  changeNodePolicyConfig,
  deleteStage,
} from '@/services/materialCertificationPolicyService';

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
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${
                      e.nodeVersionNumber
                    }`}
                    <div className={styles[`history-extra`]}>
                      {`${e.createdByName} ${dateTimeRender(e.lastUpdateDate)}`}
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
      getNodeConfigHistory(record.get('nodeId'))
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

  // 启用或禁用
  // const statusChange = (record) => {
  //   return new Promise((resolve) => {
  //     enableOrdisable({
  //       ...record.toData(),
  //       enabledFlag: String(record.get('enabledFlag')) === '0' ? '1' : '0',
  //     })
  //       .then((res) => {
  //         if (getResponse(res)) {
  //           notification.success();
  //           dataSet.query();
  //         }
  //       })
  //       .finally(() => {
  //         resolve();
  //       });
  //   });
  // };

  // 变更
  const changeToEdit = (record) => {
    return new Promise((resolve) => {
      changeNodePolicyConfig({
        ...record.toData(),
      })
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            handleEdit(res, 'change');
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const handleDelete = (record) => {
    return new Promise(async (resolve) => {
      const detailInfo = record?.toData();
      if (detailInfo) {
        deleteStage({
          ...detailInfo,
          deleteOnlyCheckFlag: 1,
        })
          .then((res) => {
            if (getResponse(res)) {
              Modal.confirm({
                title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
                children: (
                  <div>{intl.get(`${commonPrompt}.deleteStage`).d(`是否确认删除该阶段`)}</div>
                ),
              }).then((button) => {
                if (button === 'ok') {
                  return new Promise((resolve) => {
                    deleteStage({
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
        name: 'enabledFlag',
        width: 150,
        renderer: ({ value, record }) => colorRender(value, record.get('enabledFlagMeaning')),
      },
      {
        name: 'action',
        width: 250,
        renderer: ({ record }) => (
          <>
            {/* <Button
              type="c7n-pro"
              funcType="link"
              color="primary"
              onClick={() => statusChange(record)}
            >
              {String(record.get('enabledFlag')) === '0'
                ? intl.get('hzero.common.button.enabled').d('启用')
                : intl.get('hzero.common.button.disable').d('禁用')}
            </Button> */}
            {String(record.get('enabledFlag')) === '0' && (
              <Button
                style={{ marginLeft: '16px' }}
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => handleEdit(record)}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            )}

            {String(record.get('enabledFlag')) === '0' && (
              <Button
                style={{ marginLeft: '16px' }}
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => handleDelete(record)}
                permissionList={[
                  {
                    code: 'srm.smdm.material.certification.policy.template.button.stage.delete',
                  },
                ]}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            )}

            {String(record.get('enabledFlag')) === '1' && (
              <Button
                style={{ marginLeft: '16px' }}
                type="c7n-pro"
                funcType="link"
                color="primary"
                onClick={() => changeToEdit(record)}
              >
                {intl.get('hzero.common.button.change').d('变更')}
              </Button>
            )}

            {String(record.get('nodeVersionNumber')) !== '1' && (
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
        name: 'nodeCode',
        width: 200,
        renderer: ({ record, text }) => <a onClick={() => handleEdit(record, 'read')}>{text}</a>,
      },
      {
        name: 'orderSeq',
        // width: 250,
      },
      {
        name: 'nodeVersionNumber',
      },
      {
        name: 'createdByName',
        // width: 250,
      },
      {
        name: 'lastUpdateDate',
        // width: 250,
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
        customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_LIST"
      />
    </div>
  );
};

export default Index;
