import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { connect } from 'dva';
import { compose } from 'lodash';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import queryString from 'querystring';

import { Header } from 'components/Page';
import { DataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化
import {
  baseInfoDS,
  splitHeaderDS,
  mergeHeaderDS,
  balanceHeaderDS,
  splitLineDS,
  mergeLineDS,
} from '../stores/indexDS';
import BaseInfo from './BaseInfo';
import RuleConfig from './RuleConfig';

import { fetchContainer, fetchContainerHistory } from '@/services/RequisitionPlanConfigServices';

import styles from '../index.less';

const { TabPane } = Tabs;

const TabTitle = ({ title }) => {
  return <div className={styles.tabTitle}> {title} </div>;
};

const Index = ({ match, dispatch }) => {
  const [containerId] = useState(match.params?.id);
  const [containerName, setContainerName] = useState(
    intl.get(`srpm.common.model.common.version`).d('版本')
  );
  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS({ containerId })), [containerId]);
  const splitInfoDs = useMemo(() => new DataSet(splitHeaderDS({ containerId })), [containerId]);
  const splitlineDs = useMemo(
    () =>
      new DataSet({
        ...splitLineDS({ containerId }),
        selection: false,
      }),
    [containerId]
  );
  const mergeInfoDs = useMemo(
    () =>
      new DataSet({
        ...mergeHeaderDS({ containerId }),
      }),
    [containerId]
  );
  const mergelineDs = useMemo(
    () =>
      new DataSet({
        ...mergeLineDS({ containerId }),
        selection: false,
      }),
    [containerId]
  );

  const balanceInfoDS = useMemo(
    () =>
      new DataSet({
        ...balanceHeaderDS({ containerId }),
      }),
    [containerId]
  );

  // const [headInfo, setHeadInfo ] = useState({})
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (containerId && containerId !== 'new') {
      commonUpdate(containerId);
    }
  }, [containerId]);

  //
  const getHistoryList = (curContainerId) => {
    fetchContainerHistory(curContainerId).then((res) => {
      if (getResponse(res)) {
        setHistoryList(res);
      } else {
        setHistoryList([]);
      }
    });
  };

  // update头行信息
  const commonUpdate = (curContainerId) => {
    setLoading(true);
    fetchContainer(curContainerId)
      .then(async (res) => {
        if (getResponse(res)) {
          // setHeadInfo(res)
          setContainerName(res.containerName);
          const {
            splitNode,
            splitMode,
            splitQuantityControlRule,
            mergeQuantityControlRule,
            balanceQuantityControlRule,
            ...other
          } = res;
          baseInfoDs.loadData([
            {
              ...other,
            },
          ]);
          splitInfoDs.loadData([
            {
              splitNode,
              splitMode,
              splitQuantityControlRule,
            },
          ]);
          mergeInfoDs.loadData([
            {
              mergeQuantityControlRule,
            },
          ]);
          balanceInfoDS.loadData([
            {
              balanceQuantityControlRule,
            },
          ]);
          await splitlineDs.query();
          await mergelineDs.query();
          if (res.containerStatus === 'PUBLISHED') {
            getHistoryList(containerId);
          }
        }
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      });
  };

  const toHistory = (e) => {
    openTab({
      key: `/srpm/requisition-plan-config/history/${e.containerId}`,
      title: `${containerName}-${e.version}`,
    });
  };

  const menu = useMemo(() => {
    return (
      <Menu style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {historyList.map((e) => (
          <Menu.Item className={styles['menu-list-history']}>
            <a onClick={() => toHistory(e)}>
              <div className={styles.version}>
                {' '}
                {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}${
                  e.version
                }`}{' '}
              </div>
              <div className={styles.lastupdate_info}>
                {`${e.lastUpdatedByName}${dateTimeRender(e.lastUpdateDate)}`}
              </div>
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [historyList]);

  const HeaderBtn = observer(() => {
    const headerButtons = [
      match?.path.includes('/srpm/requisition-plan-config/detail-query/') && (
        <Button
          icon="mode_edit"
          funcType="flat"
          color="default"
          type="c7n-pro"
          onClick={() => {
            dispatch(
              routerRedux.push({
                pathname: `/srpm/requisition-plan-config/detail/${containerId}`,
                search: queryString.stringify({ back: 'inquery' }),
              })
            );
          }}
        >
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </Button>
      ),
      baseInfoDs.current?.get('version') > 1 && historyList?.length > 0 && (
        <Dropdown overlay={menu}>
          <Button icon="schedule" type="c7n-pro" funcType="flat" color="default">
            {intl.get(`hzero.common.button.History`).d('历史版本')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ),
    ];
    return headerButtons;
  });

  return (
    <Fragment>
      <Header
        backPath={
          match?.path.includes('/srpm/requisition-plan-config/detail-query/')
            ? '/srpm/requisition-plan-config/list'
            : null
        }
        title={intl.get('srpm.common.title.requisitionPlanConfig.detail').d('需求计划配置详情')}
      >
        <HeaderBtn />
      </Header>
      <div className={styles['config-page-content']}>
        <Spin spinning={loading || false} wrapperClassName="full-height-spinning">
          <Tabs keyboard={false} className="config-vertical-tabs" tabPosition="left" flex>
            <TabPane
              tab={<TabTitle title={intl.get('srpm.common.title.baseInfo').d('基本信息')} />}
              key="baseInfo"
            >
              <BaseInfo
                baseInfoDs={baseInfoDs}
                containerId={containerId}
                currentStatusFlag={
                  match?.path.includes('/srpm/requisition-plan-config/detail-query/') ? 1 : 0
                }
              />
            </TabPane>
            <TabPane
              tab={<TabTitle title={intl.get('srpm.common.title.ruleConfig').d('规则配置')} />}
              key="ruleConfig"
            >
              <RuleConfig
                splitInfoDs={splitInfoDs}
                splitlineDs={splitlineDs}
                mergeInfoDs={mergeInfoDs}
                mergelineDs={mergelineDs}
                balanceInfoDS={balanceInfoDS}
                containerId={containerId}
              />
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: [
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.item',
    ],
  })
)(Index);
