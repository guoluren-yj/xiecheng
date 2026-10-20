import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';

import querystring from 'querystring';
import { compose, isArray, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import { DataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { dateTimeRender } from 'utils/renderer'; //日期时间格式化
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  fetchDetail,
  save,
  release,
  fetchIsMutlTemplate,
  fetchHistory,
} from '@/services/budgetStrategyService';
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

const Index = ({ dispatch, match }) => {
  const params = querystring.parse(location.search.substr(1)) || {};
  const { source } = params;
  const budgetStrategyId = match.params?.id;
  const [ruleList, setRuleList] = useState([]);
  const [isMutlTemplate, setIsMutlTemplate] = useState(null);

  const [budgetStrategyDesc, setBudgetStrategyDesc] = useState(
    intl.get(`${commonPrompt}.version`).d('版本')
  );

  const strategyNodeArr = useMemo(() => {
    return [
      {
        strategyNodeCode: 'ECPO',
        strategyNodeName: intl.get(`${commonPrompt}.mallOrder`).d('商城订单'),
        overrunTolerance: 0,
      },
      {
        strategyNodeCode: 'PR',
        strategyNodeName: intl.get(`${commonPrompt}.purchaseRequisition`).d('采购申请'),
        overrunTolerance: 0,
      },
      {
        strategyNodeCode: 'PC',
        strategyNodeName: intl.get(`${commonPrompt}.contact`).d('采购协议'),
        overrunTolerance: 0,
      },
      {
        strategyNodeCode: 'PO',
        strategyNodeName: intl.get(`${commonPrompt}.purchaseOrder`).d('采购订单'),
        overrunTolerance: 0,
      },
      {
        strategyNodeCode: 'ASN',
        strategyNodeName: intl.get(`${commonPrompt}.logisticsReceipt`).d('物流收货'),
        overrunTolerance: 0,
      },
      {
        strategyNodeCode: 'INVOICE',
        strategyNodeName: intl.get(`${commonPrompt}.settlementInvoice`).d('结算-开票'),
        overrunTolerance: 0,
      },
    ];
  });

  const headerDs = useMemo(() => new DataSet(baseInfoDS({ budgetStrategyId, isMutlTemplate })), [
    budgetStrategyId,
    isMutlTemplate,
  ]);

  const [headInfo, setHeadInfo] = useState({});
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = ({ name, record, dataSet, value }) => {
      if (name === 'budgetControlSelectBox') {
        ruleList.forEach(ele => {
          if (value === 'internalBudgetFlag') {
            ele.baseInfoDs?.current?.set({
              externalBudgetFlag: 0,
              internalBudgetFlag: 1,
              budgetControlSelectBox: value,
              budgetStrategyTemplateCond: null,
            });
          } else {
            ele.baseInfoDs?.current?.set({
              externalBudgetFlag: 1,
              internalBudgetFlag: 0,
              budgetControlSelectBox: value,
              budgetStrategyTemplateCond: null,
            });
          }
        });
        setHeadInfo({ ...record?.toData() });
        setTimeout(() => {
          record.set({
            newBudgetStrategyTemplateList: null,
          });
        }, 10);
      }

      if (name === 'newBudgetStrategyTemplateList') {
        if (isEmpty(value)) {
          record.set({
            templateCodeList: [],
          });
        } else {
          record.set({
            templateCodeList: value?.map(ele => ele.budgetTemplateCode),
          });
        }
        if (budgetStrategyId && budgetStrategyId !== 'new') {
          if (isEmpty(value)) {
            const defaultTemplateCodeObj = headInfo.budgetStrategyTemplateList.find(
              ele => !ele.budgetTemplateCode || ele.budgetTemplateCode === 'NONE'
            );
            const baseInfoDs = new DataSet(controlRuleHeaderDs({ budgetStrategyId }));
            const controlRuleLineDs = new DataSet(
              controlRuleLineDS({ budgetStrategyId, baseInfoDs, headerDs })
            );
            if (defaultTemplateCodeObj) {
              baseInfoDs.loadData([
                {
                  ...defaultTemplateCodeObj,
                  budgetControlSelectBox: headerDs?.current?.get('budgetControlSelectBox'),
                  externalBudgetFlag: headerDs?.current?.get('externalBudgetFlag'),
                  internalBudgetFlag: headerDs?.current?.get('internalBudgetFlag'),
                },
              ]);
              controlRuleLineDs.loadData(defaultTemplateCodeObj.budgetStrategyNodeList);
            } else {
              baseInfoDs.loadData([
                {
                  ...headInfo,
                  budgetControlSelectBox: headerDs?.current?.get('budgetControlSelectBox'),
                  externalBudgetFlag: headerDs?.current?.get('externalBudgetFlag'),
                  internalBudgetFlag: headerDs?.current?.get('internalBudgetFlag'),
                  budgetTemplateCode: 'NONE',
                  budgetTemplateDesc: intl.get(`${commonPrompt}.controlRules`).d('控制规则'),
                  templateCodeList: undefined,
                  budgetStrategyTemplateList: undefined,
                  budgetStrategyNodes: null,
                  _token: undefined,
                },
              ]);
              strategyNodeArr.forEach(record => {
                controlRuleLineDs.create(record);
              });
            }
            setRuleList([
              {
                budgetTemplateCode: 'NONE',
                budgetTemplateDesc: intl.get(`${commonPrompt}.controlRules`).d('控制规则'),
                baseInfoDs,
                controlRuleLineDs,
              },
            ]);
          } else {
            const templateCodeList = value?.map(ele => ele.budgetTemplateCode);
            const ruleCodeList = ruleList.map(ele => ele.budgetTemplateCode);
            const reserveRuleList = ruleList.filter(ele =>
              templateCodeList.includes(ele.budgetTemplateCode)
            );
            const newCodeList = value
              .filter(ele => !ruleCodeList.includes(ele.budgetTemplateCode))
              .map(ele => {
                const templateCodeObj = headInfo.budgetStrategyTemplateList.find(
                  data => data.budgetTemplateCode === ele.budgetTemplateCode
                );
                const baseInfoDs = new DataSet(controlRuleHeaderDs({ budgetStrategyId }));
                const controlRuleLineDs = new DataSet(
                  controlRuleLineDS({ budgetStrategyId, baseInfoDs, headerDs })
                );
                if (templateCodeObj) {
                  baseInfoDs.loadData([
                    {
                      ...templateCodeObj,
                      budgetControlSelectBox: headerDs?.current?.get('budgetControlSelectBox'),
                      externalBudgetFlag: headerDs?.current?.get('externalBudgetFlag'),
                      internalBudgetFlag: headerDs?.current?.get('internalBudgetFlag'),
                    },
                  ]);
                  controlRuleLineDs.loadData(templateCodeObj.budgetStrategyNodeList);
                } else {
                  baseInfoDs.loadData([
                    {
                      ...headInfo,
                      budgetTemplateCode: ele.budgetTemplateCode,
                      budgetTemplateDesc: `${ele.budgetTemplateDesc}-${intl
                        .get(`${commonPrompt}.controlRules`)
                        .d('控制规则')}`,
                      budgetControlSelectBox: headerDs?.current?.get('budgetControlSelectBox'),
                      externalBudgetFlag: headerDs?.current?.get('externalBudgetFlag'),
                      internalBudgetFlag: headerDs?.current?.get('internalBudgetFlag'),
                      templateCodeList: undefined,
                      budgetStrategyTemplateList: undefined,
                      budgetStrategyNodes: null,
                      _token: undefined,
                    },
                  ]);
                  strategyNodeArr.forEach(record => {
                    controlRuleLineDs.create(record);
                  });
                }
                return {
                  budgetTemplateCode: ele.budgetTemplateCode,
                  budgetTemplateDesc: `${ele.budgetTemplateDesc}-${intl
                    .get(`${commonPrompt}.controlRules`)
                    .d('控制规则')}`,
                  baseInfoDs,
                  controlRuleLineDs,
                };
              });
            setRuleList([...reserveRuleList, ...newCodeList]);
            // 判断是不是ruleList 中的 ，判断是不是headInfo中的
          }
        }
      }
    };
    headerDs.addEventListener('update', handleUpdate);
    return () => {
      headerDs.removeEventListener('update', handleUpdate);
    };
  }, [ruleList, budgetStrategyId, isMutlTemplate, headerDs, headInfo]);

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

  // 发布
  const handleRelease = async () => {
    const allInfo = await getAllInfo();

    if (allInfo) {
      setLoading(true);
      const res = getResponse(await release(allInfo));
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sbud/budget-strategy/list`,
          })
        );
        // commonUpdate(budgetStrategyId);
      } else {
        setLoading(false);
      }
    }
  };

  // 获取基本信息
  const getBaseInfo = async () => {
    const errorMessage = [];
    const baseFlag = await headerDs.validate();

    if (baseFlag) {
      return {
        ...headerDs.toJSONData()[0],
        budgetStrategyTemplateList: headerDs.toJSONData()[0]?.newBudgetStrategyTemplateList,
        newBudgetStrategyTemplateList: undefined,
      };
    } else {
      errorMessage.push(intl.get(`${commonPrompt}.baseInfo`).d('基本信息'));
      return errorMessage;
    }
  };

  // 获取控制规则
  const getControlRuleInfo = async () => {
    if (budgetStrategyId && budgetStrategyId !== 'new') {
      const lineFlagList = await Promise.all(
        ruleList.map(async ele => ({
          flag: await ele.controlRuleLineDs.validate(),
          budgetTemplateDesc: ele.budgetTemplateDesc,
          budgetTemplateCode: ele.budgetTemplateCode,
        }))
      );

      if (lineFlagList.every(ele => !!ele.flag)) {
        return {
          budgetStrategyNodes: [],
          budgetStrategyTemplateList: ruleList.map(ele => ({
            ...ele.baseInfoDs.toData()[0],
            budgetStrategyNodeList: ele.controlRuleLineDs.toData(),
            budgetTemplateDesc: ele.budgetTemplateDesc,
          })),
        };
      } else {
        return lineFlagList
          .filter(ele => !ele.flag)
          .map(
            data =>
              `【${data.budgetTemplateDesc}】${intl
                .get(`${commonPrompt}.unit`)
                .d('单元')} ${intl
                .get(`${commonPrompt}.requiredFieldIsNull`)
                .d('有必输字段未维护')}`
          );
      }
    } else {
      return {
        budgetStrategyNodes: [],
      };
    }
  };

  // 获取所有信息
  const getAllInfo = async () => {
    const errorTipMsg = [];
    const baseInfo = await getBaseInfo();
    const ruleInfo = await getControlRuleInfo();

    if (isArray(baseInfo)) errorTipMsg.push(...baseInfo);

    if (isArray(ruleInfo)) errorTipMsg.push(...ruleInfo);

    if (errorTipMsg.length === 0) {
      return {
        ...baseInfo,
        ...ruleInfo,
        budgetStrategyCond: null,
      };
    } else {
      const allErrorMsg = [];
      const baseError = await headerDs.current?.getValidationErrors();
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

      if (isArray(ruleInfo)) {
        allErrorMsg.push(...ruleInfo);
      }
      // if (!isEmpty(controlRuleLineError)) {
      //   const controlRuleLineErrorMsg = [];
      //   controlRuleLineError.forEach((ele) => {
      //     const lineErrorMsg = [];
      //     const requiredFields = [];
      //     ele.errors.forEach((data) => {
      //       const item = data.errors.toJS()[0];
      //       if (item.ruleName === 'valueMissing') {
      //         requiredFields.push(`【${item.injectionOptions.label}】`);
      //       } else {
      //         lineErrorMsg.push(item.validationMessage);
      //       }
      //     });
      //     if (!isEmpty(requiredFields)) {
      //       lineErrorMsg.unshift(
      //         intl
      //           .get(`${commonPrompt}.valueMissing`, { label: requiredFields.join('、') })
      //           .d(`${requiredFields.join('、')}为必填，请输入后保存。`)
      //       );
      //     }
      //     controlRuleLineErrorMsg.push(
      //       `${ele.record.get('strategyNodeName')}${langLine} ${lineErrorMsg.join('')}`
      //     );
      //   });
      //   allErrorMsg.push(`【${ruleInfo[0]}】${langUnit}: ${controlRuleLineErrorMsg.join(' ')}`);
      // }

      notification.error({
        message: `${allErrorMsg.join(';')}`,
      });
      return null;
    }
  };

  // 保存
  const handleSave = async () => {
    const allInfo = await getAllInfo();

    if (allInfo) {
      setLoading(true);

      const res = getResponse(
        await save({
          ...allInfo,
          budgetStrategyTemplateList:
            budgetStrategyId === 'new' ? [] : allInfo.budgetStrategyTemplateList,
        })
      );

      if (res) {
        notification.success();

        if (budgetStrategyId === 'new') {
          dispatch(
            routerRedux.push({
              pathname: `/sbud/budget-strategy/detail/${res.budgetStrategyId}`,
            })
          );
        } else {
          commonUpdate(budgetStrategyId);
        }
      } else {
        setLoading(false);
      }
    }
  };

  const toHistory = e => {
    openTab({
      key: `/sbud/budget-strategy/read-only/${e.budgetStrategyId}`,
      title: `${budgetStrategyDesc}-${e.version}`,
    });
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
    const headerButtons = [];

    if (budgetStrategyId && budgetStrategyId !== 'new') {
      headerButtons.push(
        <Button
          onClick={handleRelease}
          type="c7n-pro"
          icon="publish2"
          color="primary"
          funcType="raised"
          disabled={loading}
        >
          {intl.get(`hzero.common.button.publish`).d('发布')}
        </Button>
      );
    }

    if (headInfo.templateStatus !== 'PUBLISHED') {
      if (budgetStrategyId === 'new') {
        headerButtons.push(
          <Button
            onClick={() => handleSave()}
            type="c7n-pro"
            icon="save"
            color="primary"
            funcType="raised"
            disabled={loading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        );
      } else {
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
    }

    if (String(headInfo?.version) !== '1' && budgetStrategyId !== 'new' && false) {
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
            ? `/sbud/budget-strategy/read-only/${budgetStrategyId}`
            : '/sbud/budget-strategy/list'
        }
        title={
          budgetStrategyId === 'new'
            ? intl.get(`${commonPrompt}.createBudgetStrategyConfig`).d('新建预算策略')
            : intl.get(`${commonPrompt}.editBudgetStrategyConfig`).d('编辑预算策略')
        }
      >
        <HeaderBtn />
      </Header>
      <div className={styles['config-page-content']}>
        <Spin spinning={loading || false} wrapperClassName="full-height-spinning">
          {!budgetStrategyId || budgetStrategyId === 'new' ? (
            <div className={'config-new-base-content'}>
              <BaseInfo
                baseInfoDs={headerDs}
                budgetStrategyId={budgetStrategyId}
                isMutlTemplate={isMutlTemplate}
              />
            </div>
          ) : (
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
                    isMutlTemplate={isMutlTemplate}
                    baseInfoDs={ele.baseInfoDs}
                    headerDs={headerDs}
                    controlRuleLineDs={ele.controlRuleLineDs}
                    budgetStrategyId={budgetStrategyId}
                  />
                </TabPane>
              ))}
            </Tabs>
          )}
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
