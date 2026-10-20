/*
 * @Date: 2023-10-18 15:00:55
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Tag } from 'choerodon-ui';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { useObserver } from 'mobx-react-lite';
import { Tabs, useDataSet, Spin } from 'choerodon-ui/pro';
import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { compose, forEach, head, isEmpty, isArray, pick, omit, mapKeys, nth, isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import remotes from 'hzero-front/lib/utils/remote';
import { queryUnifyIdpValue } from 'services/api';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { getTagColor } from '@/routes/components/utils';
import {
  saveTemplate,
  publishTemplate,
  unlockTemp,
} from '@/services/indicatorTemplateDefineService';

import HeaderBtns from './HeaderBtns';
import styles from '../../index.less';
import { getBasicDs } from './stores/getBasicDS';
import { getSummaryRuleDs } from './stores/getSummaryRuleDS';
import { getScoreResultDs } from './stores/getScoreResultDS';
import { getSubsequentActionDs } from './stores/getSubsequentActionDS';
import { getEvaluationCycleDs } from './stores/getEvaluationCycleDS';
import { getScorerFormDs, getScorerTableDs } from './stores/getScorerDS';
import { getEvaluationIndicatorDs } from './stores/getEvaluationIndicatorDS';
import { getSuppliersDs, getEvaluationObjectDs } from './stores/getEvaluationObjectDS';
import {
  getBackPath,
  getHeaderTitle,
  getTabPaneList,
  scorerTableKey,
  scorerSearchCode,
} from './utils';

const { TabPane } = Tabs;

const tenantId = getCurrentOrganizationId();

const Index = ({
  dispatch,
  location,
  match: {
    params: { status, evalTplId, evalTplType },
  },
  remote,
  customizeBtnGroup,
}) => {
  const tabPaneList = useMemo(() => getTabPaneList({ evalTplType }), [evalTplType]);
  const tabPaneKeys = useMemo(() => tabPaneList.map(n => n.key), [tabPaneList]);
  const isEdit = useMemo(() => status !== 'view', [status]);
  const routerParam = querystring.parse(location.search.substr(1));
  const { jumpSource, sourceEvalTplId, sourceEvalTplType, editFlag, historyFlag } = routerParam;
  // 新建跳转到明细，自动定位到第二个页签
  const defaultActiveKey = jumpSource === 'CREATE' ? nth(tabPaneList, 1)?.key : 'baseInfo';

  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [querySuccessFlag, setQuerySuccessFlag] = useState(true); // 大查询完成标识
  const [otherFields, setOtherFields] = useState([]); // 除基础信息外的其他表单字段汇总
  const [validateStatus, setValidateStatus] = useState({}); // tab页签的校验状态

  const basicDs = useDataSet(() => getBasicDs({ isEdit, evalTplId }), [isEdit, evalTplId]);
  const evaluationCycleDs = useDataSet(() => {
    const dsProps = getEvaluationCycleDs({
      isEdit,
      evalTplId,
      remote,
    });
    return remote ? remote.process('getRemoteEvaluationCycleDs', dsProps, {}) : dsProps;
  }, [isEdit, evalTplId]);
  const evaluationObjectDs = useDataSet(() => getEvaluationObjectDs({ isEdit }), [isEdit]);

  // 参评供应商ds
  const suppliersDsProps = getSuppliersDs({ evalTplId });
  const remoteSuppliersDsProps = remote.process(
    'SSLM.INDICATORTEMPLATEDEFINE.DETAIL_EVALUATION_OBJECT_SUPPLIERS_DS_PROPS',
    suppliersDsProps,
    {
      evalTplId,
    }
  );
  const suppliersDs = useDataSet(() => remoteSuppliersDsProps, [evalTplId]);
  const evaluationIndicatorDs = useDataSet(() => getEvaluationIndicatorDs({ evalTplId }), [
    evalTplId,
  ]);
  const scorerFormDs = useDataSet(() => getScorerFormDs({ isEdit }), [isEdit]);
  const { evalRespRule, respCalMethod } = useObserver(() =>
    scorerFormDs.current?.get(['evalRespRule', 'respCalMethod'])
  );
  const scorerTableDs = useDataSet(
    () => getScorerTableDs({ evalTplId, evalRespRule, respCalMethod }),
    [evalTplId, evalRespRule, respCalMethod]
  );
  const summaryRuleDs = useDataSet(() => getSummaryRuleDs({ isEdit }), [isEdit]);
  const scoreResultDs = useDataSet(() => getScoreResultDs({ isEdit }), [isEdit]);
  const subsequentActionDs = useDataSet(() => getSubsequentActionDs(), []);

  const { presetFlag, versionNum, evalStatusCode } =
    basicDs.current?.get(['presetFlag', 'versionNum', 'evalStatusCode']) || {};

  // ds集合
  const dataSetObj = {
    baseInfo: basicDs,
    kpiAutoConfig: evaluationCycleDs,
    kpiEvalTplIndList: evaluationIndicatorDs,
    evaluationObject: [
      {
        key: 'evaluationObject',
        isForm: true,
        dataSet: evaluationObjectDs,
      },
      {
        key: 'kpiEvalTplScopeList',
        dataSet: suppliersDs,
      },
    ],
    scorer: [
      {
        key: 'scorerForm',
        isForm: true,
        dataSet: scorerFormDs,
      },
      {
        key: 'scorerTable',
        dataSet: scorerTableDs,
      },
    ],
    summaryRule: summaryRuleDs,
    scoreResult: scoreResultDs,
    subsequentAction: subsequentActionDs,
  };

  useEffect(() => {
    queryUnifyIdpValue('SSLM.KPI_EVAL_DIM_GROUP', {
      tenantId,
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        evaluationCycleDs.setState('defaultCompany', head(res)); // 集团级维度时，默认的公司
      }
    });
  }, []);

  // 处理form的数据渲染, 不使用一个ds存储表单是因为tab的校验需分ds校验
  const handleFormData = (response = {}) => {
    const { kpiAutoConfig, ...rest } = response;
    if (!isEmpty(kpiAutoConfig) && kpiAutoConfig.initiateType) {
      // 发起方式有值时load，否则默认值不生效
      evaluationCycleDs.loadData([kpiAutoConfig]);
    }
    // 考评对象
    const evaluationObjectFields = getEvaluationObjectDs().fields.map(n => n.name);
    evaluationObjectDs.loadData([
      pick(rest, [
        ...evaluationObjectFields,
        'trxLineFlag',
        'categoryDescriptions',
        'itemCategoryNames',
        'purchaseAgentNames',
      ]),
    ]);
    // 评分人表单
    const scorerFormFields = getScorerFormDs().fields.map(n => n.name);
    scorerFormDs.loadData([pick(rest, scorerFormFields)]);
    scorerFormDs.setState('evalGranularity', rest.evalGranularity);
    // 汇总规则
    const summaryRuleFields = getSummaryRuleDs().fields.map(n => n.name);
    summaryRuleDs.loadData([pick(rest, summaryRuleFields)]);
    // 评分结果
    const scoreResultFields = getScoreResultDs().fields.map(n => n.name);
    scoreResultDs.loadData([pick(rest, scoreResultFields)]);
    // 后续动作
    const subsequentActionFields = getSubsequentActionDs().fields.map(n => n.name);
    subsequentActionDs.loadData([pick(rest, subsequentActionFields)]);
    subsequentActionDs.setState('evalGranularity', rest.evalGranularity);
    // 考评指标中存储基础信息
    evaluationIndicatorDs.setState('headerInfo', response);
    // 除基础信息外的其他表单字段汇总
    const newOtherFields = [
      ...evaluationObjectFields,
      ...scorerFormFields,
      ...summaryRuleFields,
      ...scoreResultFields,
      ...subsequentActionFields,
      'kpiAutoConfig',
      'kpiEvalTplIndList',
      'kpiEvalTplScopeList',
      'kpiEvalTplRespDmsList', // 指定评分人
      'assignKpiEvalTplIndList', // 按指标分配
      'kpiEvalTplDataList', // 按供应商分配/按品类分配/按物料分配
    ];
    setOtherFields(newOtherFields);
  };

  // 添加评分人规则改变时，评分人表格重新查询
  useEffect(() => {
    if (evalRespRule && tabPaneKeys.includes('scorer')) {
      scorerTableDs.setQueryParameter('customizeUnitCode', scorerSearchCode[evalRespRule]);
      scorerTableDs.query();
    }
  }, [evalRespRule, respCalMethod, tabPaneKeys]);

  const hanldeTabChange = async key => {
    // 大查询完成后再保存，否则版本不一致
    if (isEdit && querySuccessFlag) {
      const dataSet = dataSetObj[activeKey]; // 当前tab的ds
      const validatePromise = []; // 需校验的ds
      if (isArray(dataSet)) {
        forEach(dataSet, item => {
          validatePromise.push(item.dataSet?.validate());
        });
      } else {
        validatePromise.push(dataSet.validate());
      }
      const validateFlag = await Promise.all(validatePromise); // 校验当前ds必输字段是否维护完成
      if (validateFlag.includes(false)) {
        return notification.warning({
          message: intl
            .get('sslm.indicatorTemplate.view.message.tabChangeMsg')
            .d('需填写必输字段，才可切换至下一个页签'),
        });
      } else {
        const saveParams = await getSaveParams({ isValidate: false });
        if (saveParams) {
          const { presetFlag: newPresetFlag, ...rest } = saveParams;
          // 切换tab时带保存和查询功能
          setLoading(true);
          await saveTemplate({
            ...rest,
            presetFlag: newPresetFlag ? 1 : 0, //  是否变更预设标识
          })
            .then(async response => {
              const res = getResponse(response);
              if (res) {
                await handleRefresh();
                setActiveKey(key); // 保存成功才切换tab
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }
    } else {
      setActiveKey(key);
    }
  };

  // 编辑
  const handleEdit = () => {
    if (evalStatusCode === 'PUBLISHED') {
      setLoading(true);
      return unlockTemp(basicDs.current?.toData())
        .then(response => {
          const res = getResponse(response);
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/sslm/indicator-template-define/template-detail/${res.evalTplId}/${res.evalTplType}/edit`,
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sslm/indicator-template-define/template-detail/${evalTplId}/${evalTplType}/edit`,
        })
      );
    }
  };

  // 获取需校验的tab
  const getValidatePanel = () => {
    const validatePanel = [];
    forEach(tabPaneList, panel => {
      const ds = dataSetObj[panel.key];
      // 当前页签作为第一个需校验的页签，其他页签按顺序校验
      if (panel.key === activeKey) {
        validatePanel.unshift({ ...panel, dataSet: ds });
      } else {
        validatePanel.push({ ...panel, dataSet: ds });
      }
    });
    return validatePanel;
  };

  // 处理校验问题
  const handleValidate = ({ label, dataSet, key, parentKey, isForm, isValidate }) => {
    if (dataSet) {
      return new Promise(async (resolve, reject) => {
        const errorsMsg = [];
        const validateFlag = await dataSet.validate();
        const { errors = [] } = head(dataSet.getValidationErrors()) || {};
        if (!validateFlag && !isEmpty(errors) && isValidate) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              errorsMsg.push(<div>{validationMessage}</div>);
            }
          });
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ label, key: parentKey || key, errorsMsg });
        } else {
          let data;
          // 基础信息需去除其他表单的值，否则保存时会覆盖其他表单的值，导致更新不生效
          if (key === 'baseInfo') {
            data = omit(dataSet.current?.toJSONData(), otherFields);
          } else {
            data = isForm ? dataSet.current?.toJSONData() : dataSet.toJSONData() || [];
          }
          resolve({ [key]: data });
        }
      });
    }
  };

  // 获取校验结果
  const getValidateResult = async ({ isValidate }) => {
    const validateResult = [];
    const validatePanel = getValidatePanel();
    forEach(validatePanel, panel => {
      const { label, key, isForm, dataSet } = panel;
      if (isArray(dataSet)) {
        forEach(dataSet, item => {
          if (item.key === 'kpiEvalTplScopeList') {
            // 参评供应商仅在【选择参评供应商范围】为手动添加时才显示，故那时候才校验
            const trxLineFlags = evaluationObjectDs?.current?.get('trxLineFlags') || [];
            if (!trxLineFlags.includes('0')) {
              return false;
            }
          }
          const errorMsg = handleValidate({
            label,
            dataSet: item.dataSet,
            isForm: item.isForm,
            key: item.key,
            parentKey: key,
            isValidate,
          });
          validateResult.push(errorMsg);
        });
      } else {
        const errorMsg = handleValidate({ label, dataSet, key, isForm, isValidate });
        validateResult.push(errorMsg);
      }
    });
    const dataList = await Promise.allSettled(validateResult);
    return dataList;
  };

  // 获取TabPane的校验状态
  const getTabPaneValidate = async () => {
    const dataList = await getValidateResult({ isValidate: true });
    const newValidateStatus = {};
    forEach(dataList, data => {
      const { status: promiseStatus, value, reason } = data;
      if (promiseStatus === 'rejected') {
        const { key } = reason;
        newValidateStatus[key] = 0;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            newValidateStatus[key] = 1;
          }
        }
      }
    });
    // 处理表单、表格组合情况
    if (newValidateStatus.scorerForm && newValidateStatus.scorerTable) {
      newValidateStatus.scorer = 1;
    } else if (newValidateStatus.evaluationObject && newValidateStatus.kpiEvalTplScopeList) {
      newValidateStatus.evaluationObject = 1;
    }
    setValidateStatus(newValidateStatus);
  };

  // 获取需保存的参数
  const getSaveParams = async ({ isValidate = true } = {}) => {
    const dataList = await getValidateResult({ isValidate });
    let saveData = null;
    const dataObj = {};
    forEach(dataList, data => {
      const { status: promiseStatus, value, reason } = data;
      if (promiseStatus === 'rejected') {
        const { label, key, errorsMsg } = reason;
        notification.warning({
          message: intl
            .get('sslm.common.view.warn.infoNotFilled', {
              name: label,
            })
            .d(`【${label}】页签信息未填写`),
          description: errorsMsg,
        });
        saveData = null;
        setActiveKey(key);
        return false;
      } else {
        for (const key in value) {
          if (Object.hasOwnProperty.call(value, key)) {
            const element = value[key];
            if (isArray(element) || key === 'kpiAutoConfig') {
              dataObj[key] = element;
            } else {
              Object.assign(dataObj, element);
            }
          }
        }
        saveData = dataObj;
      }
    });

    if (saveData) {
      saveData = mapKeys(saveData, (_, key) => {
        if (key === 'scorerTable') {
          return scorerTableKey[evalRespRule];
        } else {
          return key;
        }
      });
    }
    return saveData;
  };

  // 大刷新
  const handleRefresh = async (firstQuery = false) => {
    setQuerySuccessFlag(false);
    setLoading(true);
    const queryPromise = [
      basicDs.query().then(response => {
        if (response) {
          handleFormData(response);
        }
      }),
      tabPaneKeys.includes('evaluationObject') && suppliersDs.query(),
      tabPaneKeys.includes('kpiEvalTplIndList') && evaluationIndicatorDs.query(),
      tabPaneKeys.includes('scorer') && !firstQuery && scorerTableDs.query(),
    ].filter(Boolean);
    await Promise.allSettled(queryPromise)
      .then(response => {
        if (response) {
          setQuerySuccessFlag(true);
        }
      })
      .finally(() => {
        getTabPaneValidate();
        setLoading(false);
      });
  };

  // 初始查询
  useEffect(() => {
    handleRefresh(true);
  }, [evalTplId, isEdit]);

  // 保存
  const handleSave = async () => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setLoading(true);
      return saveTemplate({
        ...saveParams,
        presetFlag: 1, //  是否变更预设标识
      })
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleRefresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 发布
  const handlePublish = async () => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setLoading(true);
      return publishTemplate(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: '/sslm/indicator-template-define/list',
              })
            );
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Fragment>
      <Header
        title={getHeaderTitle(status, jumpSource, versionNum)}
        backPath={getBackPath({ jumpSource, sourceEvalTplId, sourceEvalTplType, editFlag })}
      >
        <HeaderBtns
          remote={remote}
          isEdit={isEdit}
          loading={loading}
          basicDs={basicDs}
          dispatch={dispatch}
          editFlag={editFlag}
          versionNum={versionNum}
          jumpSource={jumpSource}
          historyFlag={historyFlag}
          sourceEvalTplId={sourceEvalTplId}
          sourceEvalTplType={sourceEvalTplType}
          onSave={handleSave}
          onEdit={handleEdit}
          onPublish={handlePublish}
          customizeBtnGroup={customizeBtnGroup}
        />
      </Header>
      <Content className={styles['template-content']}>
        <Spin spinning={loading}>
          <Tabs tabPosition="left" activeKey={activeKey} onChange={hanldeTabChange}>
            {tabPaneList.map(tabPane => (
              <TabPane
                forceRender
                key={tabPane.key}
                tab={() => {
                  // 状态展示逻辑，避免明显的过渡过程
                  const statusShowFlag = isEdit && !isNil(presetFlag) && !isEmpty(validateStatus);
                  return (
                    <div className="tab-title-wrap">
                      <span className="tab-title">{tabPane.label}</span>
                      {statusShowFlag && (
                        <Tag
                          color={!presetFlag ? 'gray' : getTagColor(validateStatus[tabPane.key])}
                        >
                          {!presetFlag
                            ? intl.get('sslm.common.model.status.presuppose').d('预设')
                            : validateStatus[tabPane.key]
                            ? intl.get('sslm.common.modal.status.completed').d('已完成')
                            : intl.get('sslm.common.modal.status.unfinished').d('未完成')}
                        </Tag>
                      )}
                    </div>
                  );
                }}
              >
                <tabPane.component
                  isEdit={isEdit}
                  evalTplId={evalTplId}
                  evalTplType={evalTplType}
                  onRefresh={handleRefresh}
                  dataSet={dataSetObj[tabPane.key]}
                  remote={remote}
                />
              </TabPane>
            ))}
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.scoreLevel',
      'spfm.evaluationTemplate',
      'spfm.supplierKpiIndicator',
      'sslm.supplierKpiIndicator',
      'sslm.supplierDocManage',
      'sslm.indicatorTemplate',
      'sslm.evaluationTemplate',
    ],
  }),
  withCustomize({
    unitCode: ['SSLM.TEMPLATE_DEFINE.HEADER_BTNS'],
  }),
  remotes(
    {
      code: 'SSLM.INDICATORTEMPLATEDEFINE.DETAIL',
      name: 'remote',
    },
    {
      cuxEvaluationCyclUpdate: () => {},
    }
  )
)(Index);
