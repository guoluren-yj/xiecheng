/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useContext, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import classnames from 'classnames';
import { compose, isEmpty, isFunction } from 'lodash';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化
import { Form, Table, Output, Dropdown, Icon, Spin, Menu } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Store } from '../storeProvider';
import StoreProvider from '../storeProvider';

import {
  getNodeConfigHistory,
  changeNodePolicyConfig,
} from '@/services/materialCertificationPolicyService';
import { colorRender } from '../hook';
import styles from '../../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Detail = function Detail() {
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const { version, header, formDs, listDs, nodeId, dispatch, handleCuxReadColumns } = useContext(
    Store
  );

  const columns = useMemo(() => {
    const mulData = !version
      ? [
        {
          name: 'itemAuthNodeAttSupcatList',
          width: 200,
        },
        {
          name: 'itemAuthNodeAttRoleList',
          width: 150,
        },
        {
          name: 'itemAuthNodeAttUserList',
          width: 150,
        },
        {
          name: 'itemAuthNodeAttCategoryList',
          width: 150,
        },
      ]
      : [
        {
          name: 'itemAuthNodeAttSupcHList',
          width: 200,
        },
        {
          name: 'itemAuthNodeAttRoleHList',
          width: 150,
        },
        {
          name: 'itemAuthNodeAttUserHList',
          width: 150,
        },
        {
          name: 'itemAuthNodeAttCateHList',
          width: 150,
        },
      ];
    const newColumns = [
      {
        name: 'attachmentCode',
        width: 150,
      },
      {
        name: 'attachmentName',
        width: 150,
      },
      {
        name: 'attachmentTypeCode',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
      {
        name: 'requiredFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'supplierRequiredFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'attachDeleteFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'supplierVisibleFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      // {
      //   name: 'itemAuthNodeAttSupcatList',
      //   width: 200,
      // },
      // {
      //   name: 'itemAuthNodeAttRoleList',
      //   width: 150,
      // },
      // {
      //   name: 'itemAuthNodeAttUserList',
      //   width: 150,
      // },
      // {
      //   name: 'itemAuthNodeAttCategoryList',
      //   width: 150,
      // },
      ...mulData,
    ];

    if (isFunction(handleCuxReadColumns)) {
      return handleCuxReadColumns(newColumns);
    } else {
      return newColumns;
    }
  }, [version, handleCuxReadColumns]);

  const handleToHistory = (data) => {
    dispatch(
      routerRedux.push({
        pathname: `/smdm/material-certification-policy/node-read/${data?.nodeHisId}`,
        search: `?version=${data.nodeVersionNumber}`,
      })
    );
  };

  const renderViewHistoryMenu = () => {
    return (
      <Spin spinning={historyLoading}>
        <Menu style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {!isEmpty(historyList) ? (
            historyList.map((e) => (
              <Menu.Item style={{ height: 'auto' }}>
                <div className={styles['history-item-wrapper']}>
                  <div className={styles[`history-content`]} onClick={() => handleToHistory(e)}>
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${e.nodeVersionNumber
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
      getNodeConfigHistory(record?.get('nodeId'))
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

  const handleEdit = () => {
    dispatch(
      routerRedux.push({
        pathname: `/smdm/material-certification-policy/node-detail/${nodeId}`,
        search: `?source=read`,
      })
    );
  };

  const changeToEdit = () => {
    return new Promise((resolve) => {
      changeNodePolicyConfig({
        ...(header?.toData() || {}),
      })
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/smdm/material-certification-policy/node-detail/${res?.nodeId}`,
                search: `?source=read`,
              })
            );
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  return (
    <>
      <Header
        backPath="/smdm/material-certification-policy/list"
        title={`${intl.get(`${commonPrompt}.viewCertificationNodeConfig`).d('查看认证阶段配置')}${version ? ` ${intl.get(`${commonPrompt}.version`).d('版本')}V${version}` : ''
          }`}
      >
        {!version && String(header?.get('enabledFlag')) === '0' && (
          <Button onClick={() => handleEdit()} type="c7n-pro" icon="mode_edit" funcType="flat">
            {intl.get(`hzero.common.button.edit`).d('编辑')}
          </Button>
        )}

        {!version && String(header?.get('enabledFlag')) === '1' && (
          <Button funcType="flat" type="c7n-pro" icon="mode_edit" onClick={() => changeToEdit()}>
            {intl.get('hzero.common.button.change').d('变更')}
          </Button>
        )}

        {String(formDs?.current?.get('nodeVersionNumber')) !== '1' && (
          <Dropdown
            overlay={renderViewHistoryMenu()}
            onHiddenBeforeChange={(hidden) => {
              fetchHistoryList(header, hidden);
            }}
          >
            <Button type="c7n-pro" icon="schedule" funcType="flat">
              {intl.get(`${commonPrompt}.historyVersion`).d('历史版本')}
              <Icon type="expand_more" />
            </Button>
          </Dropdown>
        )}
      </Header>
      <div className={classnames(styles['new-detail-content'])}>
        <Content>
          <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>
          <Form
            dataSet={formDs}
            showLines={6}
            columns={3}
            labelLayout="float"
            useColon={false}
            useWidthPercent
          >
            <Output name="orderSeq" />
            <Output name="nodeCode" />
            <Output name="enabledFlag" renderer={({ value, text }) => colorRender(value, text)} />
            <Output name="nodeVersionNumber" />
            <Output name="createdByName" />

            {nodeId && <Output name="lastUpdateDate" />}
          </Form>
        </Content>

        <Content className="attment-read-content">
          <h3 className="content-title">
            {intl.get(`${commonPrompt}.attachmentDefined`).d('附件定义')}
          </h3>

          <Table
            style={{ maxHeight: '420px' }}
            dataSet={listDs}
            columns={columns}
            buttons={[]}
            customizable
            customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_ATTACHMENT_LIST"
          />
        </Content>
      </div>
    </>
  );
};

const Index = function Index(props) {
  const { nodeId } = props.match.params;
  console.log(props);
  return (
    <StoreProvider {...{ ...props, nodeId, readOnly: true }}>
      <Detail />
    </StoreProvider>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['smdm.common', 'hzero.common', 'hzero.c7nProUI'],
  })
)(observer(Index));
