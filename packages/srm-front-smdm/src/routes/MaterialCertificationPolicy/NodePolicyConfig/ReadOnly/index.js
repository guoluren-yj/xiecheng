/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useContext, useState } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import { compose, isEmpty } from 'lodash';
import intl from 'utils/intl';
import classnames from 'classnames';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { observer } from 'mobx-react-lite';
// import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Form, Table, Button, Output, Dropdown, Icon, Spin, Menu } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { getNodePolicyHistory } from '@/services/materialCertificationPolicyService';
import { colorRender } from '../hook';

import { Store } from '../storeProvider';
import StoreProvider from '../storeProvider';

import styles from '../../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Detail = function Detail() {
  const [historyList, setHistoryList] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  const { version, header, formDs, listDs, strategyHeaderId, dispatch } = useContext(Store);

  const columns = useMemo(() => {
    const roleList = version
      ? [
          {
            name: 'operateRoleHisList',
            width: 150,
          },
          {
            name: 'queryRoleHisList',
            width: 150,
          },
        ]
      : [
          {
            name: 'operateRoleList',
            width: 150,
          },
          {
            name: 'queryRoleList',
            width: 150,
          },
        ];

    return [
      {
        name: 'orderSeq',
        width: 150,
      },
      {
        name: 'nodeCode',
        width: 150,
        renderer: ({ record }) => record.get('nodeCodeMeaning'),
      },
      {
        name: 'releaseRule',
        width: 150,
      },
      {
        name: 'skipFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'earlyTerminationFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'closedFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'feedbackFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'preapprovalFlag',
        width: 150,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'testingResultEnterFlag',
        width: 200,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'closedRule',
        width: 150,
      },
      {
        name: 'feedbackRule',
        width: 150,
      },

      {
        name: 'feedbackRejectReturnRule',
        width: 150,
      },
      ...roleList,
    ];
  }, [version]);

  useEffect(() => {
    if (strategyHeaderId && strategyHeaderId !== 'new') {
      formDs.query();
      listDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({});
    }
  }, [strategyHeaderId, formDs, listDs]);

  const handleToHistory = (data) => {
    dispatch(
      routerRedux.push({
        pathname: `/smdm/material-certification-policy/node-policy-read/${data?.strategyHeaderHisId}`,
        search: `?version=${data.versionNumber}`,
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
                    {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${
                      e.versionNumber
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
      getNodePolicyHistory(record?.get('strategyHeaderId'))
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
        pathname: `/smdm/material-certification-policy/node-palicy-detail/${strategyHeaderId}`,
        search: `?source=read`,
      })
    );
  };

  return (
    <>
      <Header
        backPath="/smdm/material-certification-policy/list"
        title={`${intl
          .get(`${commonPrompt}.viewCertificationNodePolicyConfig`)
          .d('查看认证策略配置')}${
          version ? ` ${intl.get(`${commonPrompt}.version`).d('版本')}V${version}` : ''
        }`}
      >
        {!version && (
          <Button onClick={() => handleEdit()} type="c7n-pro" icon="mode_edit" funcType="flat">
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        )}

        {String(formDs?.current?.get('versionNumber')) !== '1' && (
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
            useWidthPercent
            dataSet={formDs}
            showLines={6}
            columns={3}
            useColon={false}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="strategyNum" />
            <Output name="strategyName" colSpan={2} />
            <Output
              name="strategyStatusCode"
              renderer={({ value, text }) => colorRender(value, text)}
            />

            <Output name="strategyDimension" />
            <Output name="versionNumber" />
            <Output name="createdByName" />
          </Form>
        </Content>

        <Content className="stage-read-detail-content">
          <h3 className="content-title">{intl.get(`${commonPrompt}.stageDetail`).d('策略明细')}</h3>

          <Table
            style={{ maxHeight: '420px' }}
            dataSet={listDs}
            columns={columns}
            buttons={[]}
            customizable
            customizedCode="SMDM_CERTIFICATION_CONFIG.NODE_POLICY_LINE_LIST"
          />
        </Content>
      </div>
    </>
  );
};

const Index = function Index(props) {
  const { strategyHeaderId } = props.match.params;
  return (
    <StoreProvider {...{ ...props, strategyHeaderId, readOnly: true }}>
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
