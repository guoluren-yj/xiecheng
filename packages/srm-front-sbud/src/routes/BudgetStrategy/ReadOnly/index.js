import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import querystring from 'querystring';
import { compose, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import { DataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchDetail, fetchHistory, fetchIsMutlTemplate } from '@/services/budgetStrategyService';
import { baseInfoDS, controlRuleHeaderDs, controlRuleLineDS } from '../stores/detailDs';
import BaseInfo from './BaseInfo';
import ControlRule from './ControlRule';

import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const { TabPane } = Tabs;

const TabTitle = ({ title }) => {
  return (
    <>
      {/* <Tooltip title={title}> */}
      <div className={styles.tabTitle}> {title} </div>
      {/* </Tooltip> */}
    </>
  );
};

const Index = ({ match, location, dispatch }) => {
  const params = querystring.parse(location.search.substr(1)) || {};
  const budgetStrategyId = match.params?.id;
  const { version, type } = params;
  const [headInfo, setHeadInfo] = useState({});
  const [ruleList, setRuleList] = useState([]);
  const [isMutlTemplate, setIsMutlTemplate] = useState(null);

  const [budgetStrategyDesc, setBudgetStrategyDesc] = useState(
    intl.get(`${commonPrompt}.version`).d('版本')
  );

  const headerDs = useMemo(() => new DataSet(baseInfoDS({ budgetStrategyId, isMutlTemplate })), [
    budgetStrategyId,
    isMutlTemplate,
  ]);

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIsMutlTemplate().then(res => {
      if (getResponse(res)) {
        setIsMutlTemplate(!res?.value);
      }
    });
  }, []);

  useEffect(() => {
    if (isMutlTemplate !== null) {
      if (budgetStrategyId && budgetStrategyId !== 'new') {
        commonUpdate(budgetStrategyId);
      }
    }
  }, [budgetStrategyId, isMutlTemplate]);

  // 获取历史列表
  const getHistoryList = curbudgetStrategyId => {
    fetchHistory(curbudgetStrategyId).then(res => {
      if (getResponse(res)) {
        setHistoryList(res);
      } else {
        setHistoryList([]);
      }
    });
  };

  // update头行信息
  const commonUpdate = curbudgetStrategyId => {
    setLoading(true);
    fetchDetail(curbudgetStrategyId)
      .then(async res => {
        if (getResponse(res)) {
          setBudgetStrategyDesc(res.budgetStrategyDesc);
          setHeadInfo(res);
          headerDs.loadData([
            {
              ...res,
            },
          ]);

          const newRuleList = res.budgetStrategyTemplateList.map(data => {
            const baseInfoDs = new DataSet(
              controlRuleHeaderDs({ budgetStrategyId: curbudgetStrategyId })
            );
            const controlRuleLineDs = new DataSet(
              controlRuleLineDS({ budgetStrategyId: curbudgetStrategyId, baseInfoDs, headerDs })
            );
            baseInfoDs.loadData([
              {
                ...data,
                internalBudgetFlag: res?.internalBudgetFlag,
                externalBudgetFlag: res?.externalBudgetFlag,
              },
            ]);
            controlRuleLineDs.loadData(data.budgetStrategyNodeList);
            return {
              budgetTemplateCode: data.budgetTemplateCode,
              budgetTemplateDesc: `${
                data.budgetTemplateDesc
                  ? data.budgetTemplateDesc +
                    '-' +
                    intl.get(`${commonPrompt}.controlRules`).d('控制规则')
                  : intl.get(`${commonPrompt}.controlRules`).d('控制规则')
              }`,
              baseInfoDs,
              controlRuleLineDs,
            };
          });

          setRuleList(newRuleList);

          getHistoryList(curbudgetStrategyId);
        }
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      });
  };

  const toHistory = e => {
    dispatch(
      routerRedux.push({
        pathname: `/sbud/budget-strategy/read-only/${e.budgetStrategyId}`,
        search: `?version=${e.version}`,
      })
    );
  };

  const menu = useMemo(() => {
    return (
      <Menu>
        {!isEmpty(historyList) ? (
          historyList.map(e => (
            <Menu.Item style={{ height: 'auto' }}>
              <div className={styles['history-item-wrapper']}>
                <div className={styles[`history-content`]} onClick={() => toHistory(e)}>
                  {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}v${
                    e.version
                  }`}
                  <div className={styles[`history-extra`]}>
                    {e.releaseByName
                      ? `${e.releaseByName || ''} ${dateTimeRender(e.creationDate)}`
                      : dateTimeRender(e.creationDate)}
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
    );
  }, [historyList]);

  const handleEdit = () => {
    dispatch(
      routerRedux.push({
        pathname: `/sbud/budget-strategy/detail/${budgetStrategyId}`,
        search: `?source=read`,
      })
    );
  };

  const HeaderBtn = observer(() => {
    const headerButtons = [];

    if (String(headInfo?.version) !== '1') {
      headerButtons.push(
        <Dropdown overlay={menu}>
          <Button type="c7n-pro" icon="schedule" funcType="flat">
            {intl.get(`${commonPrompt}.viewHistory`).d('查看历史版本')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      );
    }

    if (!version && headInfo?.strangeStatus === 'NEW' && type === 'edit') {
      headerButtons.push(
        <Button onClick={() => handleEdit()} type="c7n-pro" icon="mode_edit" funcType="flat">
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
      );
    }

    return headerButtons;
  });

  return (
    <Fragment>
      <Header
        backPath="/sbud/budget-strategy/list"
        title={`${intl.get(`${commonPrompt}.viewBudgetStrategyConfig`).d('查看预算策略')}${
          version ? ` ${intl.get(`${commonPrompt}.version`).d('版本')}V${version}` : ''
        }`}
      >
        <HeaderBtn />
      </Header>
      <div className={styles['config-page-content']}>
        <Spin spinning={loading || false} wrapperClassName="full-height-spinning">
          <Tabs keyboard={false} className="config-vertical-tabs" tabPosition="left">
            <TabPane
              tab={<TabTitle title={intl.get(`${commonPrompt}.baseInfo`).d('基本信息')} />}
              key="baseInfo"
            >
              <BaseInfo
                baseInfoDs={headerDs}
                budgetStrategyId={budgetStrategyId}
                isMutlTemplate={isMutlTemplate}
              />
            </TabPane>

            {ruleList.map(ele => (
              <TabPane
                tab={<TabTitle title={ele.budgetTemplateDesc} />}
                key={ele.budgetTemplateCode}
              >
                <ControlRule
                  baseInfoDs={ele.baseInfoDs}
                  controlRuleLineDs={ele.controlRuleLineDs}
                  budgetStrategyId={budgetStrategyId}
                />
              </TabPane>
            ))}
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['sbdm.common', 'hpfm.individual', 'spfm.rulesDefinition', 'hzero.c7nProUI'],
  })
)(Index);
