import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect

import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import querystring from 'querystring';
import { compose, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import { Tooltip, DataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import classnames from 'classnames';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import { baseInfoDS, dimensionGroupLineDS } from '../stores/detailDs';
import BaseInfo from './BaseInfo';
import DimensionGroup from './DimensionGroup';

import { fetchDetail, fetchHistory } from '@/services/budgetTemplateService';

import styles from '../index.less';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const { TabPane } = Tabs;

const TabTitle = ({ title }) => {
  return (
    <>
      <Tooltip title={title}>
        <div className={styles.tabTitle}> {title} </div>
      </Tooltip>
    </>
  );
};

const Index = ({ match, location, dispatch }) => {
  const params = querystring.parse(location.search.substr(1)) || {};

  const { version, type } = params;

  console.log(version, params, location);

  const isHistory = location?.pathname?.includes('/sbud/budget-template/history/');

  const budgetTemplateId = match.params?.id;

  const [budgetTemplateDesc, setBudgetTemplateDesc] = useState(
    intl.get(`${commonPrompt}.version`).d('版本')
  );

  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS({ budgetTemplateId })), [
    budgetTemplateId,
  ]);

  const dimensionGroupLineDs = useMemo(
    () => new DataSet(dimensionGroupLineDS({ budgetTemplateId, selection: false })),
    [budgetTemplateId]
  );

  const [headInfo, setHeadInfo] = useState({});
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (budgetTemplateId && budgetTemplateId !== 'new') {
      commonUpdate(budgetTemplateId);
    }
  }, [budgetTemplateId]);

  // 获取历史列表
  const getHistoryList = curBudgetTemplateId => {
    fetchHistory(curBudgetTemplateId).then(res => {
      if (getResponse(res)) {
        setHistoryList(res);
      } else {
        setHistoryList([]);
      }
    });
  };

  // update头行信息
  const commonUpdate = curBudgetTemplateId => {
    setLoading(true);
    fetchDetail(curBudgetTemplateId)
      .then(async res => {
        if (getResponse(res)) {
          setBudgetTemplateDesc(res.budgetTemplateDesc);
          setHeadInfo(res);
          baseInfoDs.loadData([
            {
              ...res,
            },
          ]);
          await dimensionGroupLineDs.query();
          getHistoryList(curBudgetTemplateId);
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
        pathname: `/sbud/budget-template/history/${e.budgetTemplateId}`,
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
        pathname: `/sbud/budget-template/detail/${budgetTemplateId}`,
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

    if (!version && headInfo?.strangeStatus === 'UNRELEASED' && type === 'edit') {
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
        backPath="/sbud/budget-template/list"
        title={`${intl.get(`${commonPrompt}.viewBudgetTemplateConfig`).d('查看预算编制模版配置')}${
          isHistory ? ` ${intl.get(`${commonPrompt}.version`).d('版本')}V${version}` : ''
        }`}
      >
        <HeaderBtn />
      </Header>
      <div className={classnames(styles['new-detail-content'])}>
        <Content>
          <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>
          <BaseInfo baseInfoDs={baseInfoDs} budgetTemplateId={budgetTemplateId} />
        </Content>

        <Content className="dimension-read-group-content">
          <h3 className="content-title">
            {intl.get(`${commonPrompt}.budgetDimensionGroup`).d('预算维度组')}
          </h3>
          <DimensionGroup
            dimensionGroupLineDs={dimensionGroupLineDs}
            budgetTemplateId={budgetTemplateId}
          />
        </Content>
      </div>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: ['sbdm.common', 'hzero.c7nProUI'],
  })
)(Index);
