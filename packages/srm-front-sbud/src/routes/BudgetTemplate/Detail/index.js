import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import querystring from 'querystring';
import { compose, isArray, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import { Tooltip, DataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import classnames from 'classnames';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchDetail, save, release, fetchHistory } from '@/services/budgetTemplateService';
import { baseInfoDS, dimensionGroupLineDS } from '../stores/detailDs';
import BaseInfo from './BaseInfo';
import DimensionGroup from './DimensionGroup';

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

const Index = ({ dispatch, match, history }) => {
  const budgetTemplateId = match.params?.id;
  const params = querystring.parse(location.search.substr(1)) || {};
  const { source } = params;
  const [budgetTemplateDesc, setBudgetTemplateDesc] = useState(
    intl.get(`${commonPrompt}.version`).d('版本')
  );

  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS({ budgetTemplateId })), [
    budgetTemplateId,
  ]);
  const dimensionGroupLineDs = useMemo(
    () => new DataSet(dimensionGroupLineDS({ budgetTemplateId })),
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

  // 发布
  const handleRelease = async () => {
    const allInfo = await getAllInfo();

    if (allInfo) {
      const templateItemList = [...allInfo.templateItemList];

      if (templateItemList.length === 0) {
        notification.error({
          message: intl
            .get(`${commonPrompt}.atLeastOneDimension`)
            .d('预算模板发布失败，原因是预算维度未维护，请维护后发布。'),
        });
      } else {
        setLoading(true);

        const res = getResponse(await release(allInfo));

        if (res) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/sbud/budget-template/list`,
            })
          );
          // commonUpdate(budgetTemplateId);
        } else {
          setLoading(false);
        }
      }
    }
  };

  // 获取基本信息
  const getBaseInfo = async () => {
    const errorMessage = [];
    const baseFlag = await baseInfoDs.validate();

    if (baseFlag) {
      return {
        ...baseInfoDs.toJSONData()[0],
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.baseInfo`).d('基本信息'));
      return errorMessage;
    }
  };

  // 获取预算维度组
  const getDimensionGroupInfo = async () => {
    const errorMessage = [];
    const dimensionGroupFlag = await dimensionGroupLineDs.validate();

    if (dimensionGroupFlag) {
      return {
        templateItemList: dimensionGroupLineDs.toJSONData(),
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.budgetDimensionGroup`).d('预算维度组'));
      return errorMessage;
    }
  };

  // 获取所有信息
  const getAllInfo = async () => {
    const errorTipMsg = [];
    const baseInfo = await getBaseInfo();
    const ruleInfo = await getDimensionGroupInfo();

    if (isArray(baseInfo)) errorTipMsg.push(...baseInfo);

    if (isArray(ruleInfo)) errorTipMsg.push(...ruleInfo);

    if (errorTipMsg.length === 0) {
      return {
        ...baseInfo,
        ...ruleInfo,
      };
    } else {
      const allErrorMsg = [];
      const baseError = await baseInfoDs.current?.getValidationErrors();
      const dimensionGroupLineError = await dimensionGroupLineDs.getValidationErrors();
      const langUnit = intl.get(`${commonPrompt}.unit`).d('单元');
      const langLine = intl.get(`${commonPrompt}.line`).d('行');

      if (!isEmpty(baseError)) {
        const baseErrorMsg = [];
        const requiredFields = [];
        baseError.forEach(ele => {
          const item = ele.errors.toJS()[0];
          if (item.ruleName === 'valueMissing') {
            requiredFields.push(`【${item.injectionOptions.label}】`);
          } else {
            baseErrorMsg.push(item.validationMessage);
          }
        });
        if (!isEmpty(requiredFields)) {
          baseErrorMsg.unshift(
            intl
              .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
              .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
          );
        }
        allErrorMsg.push(`【${baseInfo[0]}】${langUnit}: ${baseErrorMsg.join('、')}`);
      }
      if (!isEmpty(dimensionGroupLineError)) {
        const dimensionGroupLineErrorMsg = [];
        dimensionGroupLineError.forEach(ele => {
          const lineErrorMsg = [];
          const requiredFields = [];
          ele.errors.forEach(data => {
            const item = data.errors.toJS()[0];
            if (item.ruleName === 'valueMissing') {
              requiredFields.push(`【${item.injectionOptions.label}】`);
            } else {
              lineErrorMsg.push(item.validationMessage);
            }
          });
          if (!isEmpty(requiredFields)) {
            lineErrorMsg.unshift(
              intl
                .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
                .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
            );
          }
          dimensionGroupLineErrorMsg.push(
            `${intl.get(`${commonPrompt}.budgetItemCode`).d('维度编码')}(${ele.record.get(
              'budgetItemCode'
            )})${langLine} ${lineErrorMsg.join('')}`
          );
        });
        allErrorMsg.push(`【${ruleInfo[0]}】${langUnit}: ${dimensionGroupLineErrorMsg.join(' ')}`);
      }

      notification.error({
        message: `${allErrorMsg.join(';')}`,
      });
      return null;
    }
  };

  // 保存
  const handleSave = async (createTemplateItemList = []) => {
    const allInfo = await getAllInfo();
    if (allInfo) {
      const templateItemList = [...createTemplateItemList, ...allInfo.templateItemList];

      setLoading(true);
      const res = getResponse(
        await save({
          ...allInfo,
          templateItemList,
        })
      );
      if (res) {
        notification.success();

        if (budgetTemplateId === 'new') {
          dispatch(
            routerRedux.push({
              pathname: `/sbud/budget-template/detail/${res.budgetTemplateId}`,
            })
          );
        } else {
          commonUpdate(budgetTemplateId);
        }
      } else {
        setLoading(false);
      }
    }
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

  const HeaderBtn = observer(() => {
    const headerButtons = [
      <Button
        onClick={handleRelease}
        type="c7n-pro"
        icon="publish2"
        color="primary"
        funcType="raised"
        disabled={loading}
      >
        {intl.get(`hzero.common.button.publish`).d('发布')}
      </Button>,
    ];

    if (headInfo.templateStatus !== 'PUBLISHED') {
      headerButtons.push(
        <Button
          onClick={() => handleSave()}
          type="c7n-pro"
          icon="save"
          funcType="flat"
          disabled={loading}
        >
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      );
    }

    if (budgetTemplateId !== 'new' && String(headInfo?.version) !== '1' && false) {
      headerButtons.push(
        <Dropdown overlay={menu}>
          <Button type="c7n-pro" icon="schedule" funcType="flat">
            {intl.get(`${commonPrompt}.viewHistory`).d('查看历史版本')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      );
    }
    return headerButtons;
  });

  return (
    <Fragment>
      <Header
        backPath={
          source === 'read'
            ? `/sbud/budget-template/read-only/${budgetTemplateId}`
            : '/sbud/budget-template/list'
        }
        title={
          budgetTemplateId === 'new'
            ? intl.get(`${commonPrompt}.createBudgetTemplateConfig`).d('新建预算模板')
            : intl.get(`${commonPrompt}.editBudgetTemplateConfig`).d('编辑预算模板')
        }
      >
        <HeaderBtn />
      </Header>
      <div className={classnames(styles['new-detail-content'])}>
        <Content>
          <h3 className="content-title">{intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}</h3>
          <BaseInfo baseInfoDs={baseInfoDs} budgetTemplateId={budgetTemplateId} />
        </Content>

        <Content className="dimension-group-content">
          <h3 className="content-title">
            {intl.get(`${commonPrompt}.budgetDimensionGroup`).d('预算维度组')}
          </h3>
          <DimensionGroup
            handleSave={handleSave}
            dimensionGroupLineDs={dimensionGroupLineDs}
            budgetTemplateId={budgetTemplateId}
            history={history}
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
