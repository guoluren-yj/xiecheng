/* eslint-disable no-param-reassign */
/**
 * 事件定义步骤条
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import { Steps } from 'choerodon-ui';
import { Button, DataSet, Modal } from 'choerodon-ui/pro';
import { Header } from 'components/Page';

import { getResponse } from '@/utils/utils';
import {
  fetchSaveStepOne,
  fetchSaveStepTwo,
  fetchSaveStepThree,
  getThemeList,
} from '@/services/riskDefinitionService';

import { ScopeListDS, SupplierListDS, CompanyLovDS, SupplierLovDS } from '../stores/riskDetailDS';
import { AccountListDS } from '../stores/riskDefinitionDS';

import ScopeStep from './ScopeStep';
import ExternalRiskStep from './ExternalRiskStep';
import BusinessRiskStep from './BusinessRiskStep';
import styles from './index.less';

const { Step } = Steps;

let scopeValue = null;
let defineName = null;
let _tls = null;
let defineId = null;
let groupCodeStr = null;
let enabledFlag = '';
let stepOneData = {};
let saveMap = {};
let stepTwoIndexList = []; // 第二步编辑的指标列表
let disasterStepList = []; // 灾害风险编辑的指标列表
let cachedAllIndex = []; // 第二步所有指标
let cachedAllDisaster = []; // 灾害风险所有指标
let stepThreeIndexList = []; // 第三步指标数据
let cachedAllBusinessRisk = []; // 第三步所有指标
let canNext = true; // 是否可以点击下一步
let lockKey = 1;

const Detail = props => {
  const scopeListDS = useMemo(() => new DataSet(ScopeListDS()), []);
  const supplierListDS = useMemo(() => new DataSet(SupplierListDS()), []);
  const companyLovDS = useMemo(() => new DataSet(CompanyLovDS()), []);
  const supplierLovDS = useMemo(() => new DataSet(SupplierLovDS()), []);
  const accountListDS = useMemo(() => new DataSet({ ...AccountListDS() }), []);
  const intlDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'defineName',
            type: 'intl',
          },
        ],
      }),
    []
  );

  const { match = {}, history } = props;

  defineId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add
  const pageType = match?.params?.pageType ?? ''; // 区分第二步是编辑还是新建 edit/create
  const editType = match?.params?.editType ?? ''; // 区分第四步是编辑还是新建 edit/create
  const groupCode = match?.params?.groupCode ?? '';
  const viewFlag = match?.params?.viewFlag ?? ''; // 用于控制显示标题

  const [current, setCurrent] = useState(0);
  const [themeList, setThemeList] = useState([]);
  const [themeMap, setThemeMap] = useState({});

  useEffect(() => {
    getThemeList().then(res => {
      if (getResponse(res) && res.length) {
        const themeObj = {};
        const data = res.map(item => item.themeCode);
        res.forEach(item => {
          themeObj[item.themeCode] = item.themeName;
        });
        setThemeList(data || []);
        setThemeMap(themeObj);
      }
    });

    return () => {
      lockKey = 1;
      canNext = true;
      scopeValue = null;
      defineName = null;
      _tls = null;
      stepOneData = {};
      saveMap = {};
      enabledFlag = '';
      defineId = null;
      groupCodeStr = null;
      stepTwoIndexList = [];
      disasterStepList = [];
      stepThreeIndexList = [];
      cachedAllIndex = [];
      cachedAllDisaster = [];
      cachedAllBusinessRisk = [];
    };
  }, []);

  const handleChangeScope = value => {
    scopeValue = value;
  };

  const handleChangeDefineName = (params = {}) => {
    defineName = params?.defineName ?? null;
    _tls = params?._tls ?? {};
  };

  const handleChangeFlag = value => {
    enabledFlag = value ? String(value) : '';
  };

  const handleChangeStepOne = obj => {
    stepOneData = { ...obj };
  };

  const handleSaveHeaderId = id => {
    defineId = id;
  };

  const handleChangeIndexList = arr => {
    stepTwoIndexList = arr;
  };

  const handleChangeDisasterIndex = arr => {
    disasterStepList = arr;
  };

  const handleChangeBusinessList = arr => {
    stepThreeIndexList = arr;
  };

  const handleCacheAllIndex = arr => {
    cachedAllIndex = arr;
  };

  const handleCacheAllDisaster = arr => {
    cachedAllDisaster = arr;
  };

  const handleCacheAllBusiness = arr => {
    cachedAllBusinessRisk = arr;
  };

  const handleChangeNextFlag = value => {
    canNext = value;
  };

  /**
   * 设置保存状态 是新建保存 还是编辑保存
   */
  const handleChangeSaveFlag = (type, eventType) => {
    saveMap[eventType] = type;
  };

  const getSteps = () => {
    return [
      {
        title: intl.get(`sdat.riskDefinition.model.applicationScope`).d('基础信息'),
        keyCode: 'applicationScope',
        content: (
          <ScopeStep
            key="applicationScope"
            onChangeScope={handleChangeScope}
            onChangeDefineName={handleChangeDefineName}
            onChangeFlag={handleChangeFlag}
            onChangeStepOne={handleChangeStepOne}
            onSaveDefineHeaderId={handleSaveHeaderId}
            scopeListDS={scopeListDS}
            supplierListDS={supplierListDS}
            companyLovDS={companyLovDS}
            supplierLovDS={supplierLovDS}
            intlDs={intlDs}
            defineId={defineId}
            viewFlag={viewFlag}
            defineName={defineName}
            groupCode={groupCode || groupCodeStr}
          />
        ),
      },

      // 外部风险
      themeList.indexOf('externalRisk') !== -1 && {
        title: themeMap.externalRisk,
        keyCode: 'externalRisk',
        content: (
          <ExternalRiskStep
            key="externalRisk"
            pageType={pageType}
            editType={editType}
            defineId={defineId}
            scope={scopeValue}
            enabledFlag={enabledFlag}
            history={history}
            groupCode={groupCode || groupCodeStr}
            accountListDS={accountListDS}
            viewFlag={viewFlag}
            riskFlag="externalRisk"
            onChangeIndexList={handleChangeIndexList}
            onCacheAllIndex={handleCacheAllIndex}
            onChangeNextFlag={handleChangeNextFlag}
            onChangeSaveType={e => handleChangeSaveFlag(e, 'externalRisk')}
          />
        ),
      },

      // 灾害风险
      themeList.indexOf('disasterRisk') !== -1 && {
        title: themeMap.disasterRisk,
        keyCode: 'disasterRisk',
        content: (
          <ExternalRiskStep
            key="disasterRisk"
            pageType={pageType}
            editType={editType}
            defineId={defineId}
            scope={scopeValue}
            enabledFlag={enabledFlag}
            history={history}
            groupCode={groupCode || groupCodeStr}
            accountListDS={accountListDS}
            viewFlag={viewFlag}
            riskFlag="disasterRisk"
            onChangeIndexList={handleChangeDisasterIndex}
            onCacheAllIndex={handleCacheAllDisaster}
            onChangeNextFlag={handleChangeNextFlag}
            onChangeSaveType={e => handleChangeSaveFlag(e, 'disasterRisk')}
          />
        ),
      },

      // 业务风险
      themeList.indexOf('businessRisk') !== -1 && {
        title: themeMap.businessRisk,
        keyCode: 'businessRisk',
        content: (
          <BusinessRiskStep
            key="businessRisk"
            pageType={pageType}
            editType={editType}
            history={history}
            defineId={defineId}
            scope={scopeValue}
            viewFlag={viewFlag}
            enabledFlag={enabledFlag}
            groupCode={groupCode || groupCodeStr}
            accountListDS={accountListDS}
            onChangeBusinessList={handleChangeBusinessList}
            onCacheAllIndex={handleCacheAllBusiness}
            onChangeSaveType={e => handleChangeSaveFlag(e, 'businessRisk')}
          />
        ),
      },
    ].filter(Boolean);
  };

  /**
   * 获取当前层级下的所有指标
   * @param {*} item
   * @returns
   */
  const validIndexList = (item = {}, field) => {
    const indexArr = [];
    const loopIndex = list => {
      if (list.length) {
        list.forEach(item2 => {
          // 选中的列表
          if (item2.themeLevel === 4 && item2[field]) {
            indexArr.push({ ...item2 });
          }

          if (item2.childList && item2.childList.length) {
            loopIndex(item2.childList);
          }
        });
      }
    };

    if (item.childList && item.childList.length) {
      loopIndex(item.childList);
    }

    return indexArr;
  };

  /**
   * 校验没有经办人(level2) 但是有选中的列表(level4) 校验不通过
   * @param {*} data
   * @returns
   */
  const validPeople = (data, field) => {
    const treeData = [...data];

    let isValid = true; // 无经办人 false 校验不通过
    let fieldName = '';

    let allSelectData = []; // 所有选中的数据

    if (treeData.length > 0) {
      treeData.forEach(item => {
        if (item.childList && item.childList.length) {
          item.childList.forEach(item2 => {
            const arr = validIndexList(item2, field);
            allSelectData = [...allSelectData, ...arr];
            if (arr.length) {
              // 有选中的指标 没有风险经办人
              if (!item2.personCount || Number(item2.personCount) <= 0) {
                fieldName = !fieldName ? item2.themeName : fieldName;
                isValid = false;
              }
            }
          });
        }
      });
    }

    if (!allSelectData || !allSelectData.length) {
      // 无选中数据
      return intl.get('sdat.riskDefinition.view.title.indexMustHasItem').d('风险定义信息未维护');
    }

    if (!isValid) {
      // 有选中数据 无经办人
      return intl.get('sdat.riskDefinition.view.title.indexMustHasPeople', { name: fieldName });
    }
  };

  /**
   * 保存范围数据
   * @returns
   */
  const handleSaveScopeRisk = async flag => {
    // 编辑过的列表
    const lineList = scopeListDS
      .filter(record => record.status !== 'delete')
      .map(item => item.toData());

    const supplierList = supplierListDS
      .filter(record => record.status !== 'delete')
      .map(item => item.toData());

    if (['1', 1].includes(scopeValue) && !lineList.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('sdat.riskDefinition.view.message.mustSelectOneOrMore')
              .d('公司信息未维护，无法下一步，请确认')}
          </div>
        ),
      });
      return false;
    }

    if (['2', 2].includes(scopeValue) && !supplierList.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('sdat.riskDefinition.view.message.mustSelectOneOrMoreSupplier')
              .d('供应商信息未维护，无法下一步，请确认')}
          </div>
        ),
      });
      return false;
    }

    if (['1', 1].includes(stepOneData.enableFlag) && !flag) {
      const num = current + 1;
      setCurrent(num);
      return false;
    }

    const commonList = ['1', 1].includes(scopeValue) ? [...lineList] : [...supplierList];

    const params = {
      ...stepOneData,
      scope: scopeValue || 0,
      lineList: ['1', 1, '2', 2].includes(scopeValue) ? commonList : [],
      enableFlag: defineId === 'add' ? '2' : enabledFlag || '0',
      tenantId: getCurrentOrganizationId(),
      defineId: defineId === 'add' ? '' : defineId,
      groupCode: groupCode === 'selfCode' ? '' : groupCode,
      defineName,
      _tls: _tls || {},
    };

    lockKey = 0;
    const res = await fetchSaveStepOne({ ...params });
    lockKey = 1;

    if (getResponse(res)) {
      defineId = res?.defineId ?? '';
      groupCodeStr = res?.groupCode ?? '';
      scopeValue = res?.scope ?? '';
      defineName = res?.defineName ?? null;
      if (res.defineId) {
        history.replace(
          `/sdat/risk-control-workbench/risk-definition/detail/${res.defineId}/${pageType}/${editType}/${groupCodeStr}/${viewFlag}`
        );
      }
      if (!flag) {
        const num = current + 1;
        setCurrent(num);
      } else {
        history.push('/sdat/risk-control-workbench/risk-definition/list');
      }
    }
  };

  /**
   * 风险共用的保存
   * @param {*} flag
   * @param {*} riskType
   * @param {*} arr1
   * @param {*} arr2
   * @returns
   */
  const commonSaveRisk = (flag, riskType = '', arr1 = [], arr2 = []) => {
    const continueOperation = async () => {
      if ((!arr1 || !arr1.length) && !flag) {
        const num = current + 1;
        setCurrent(num);
        return false;
      }

      lockKey = 0;
      const res = await fetchSaveStepTwo({
        tenantId: getCurrentOrganizationId(),
        defineId: defineId === 'add' ? '' : defineId,
        ruleList: arr1 || [],
        themeCode: riskType,
        scope: scopeValue,
        needGroup: [1, '1', 2, '2'].includes(scopeValue),
        pageType: saveMap[riskType],
        groupCode: groupCode === 'selfCode' ? '' : groupCode,
        defineName,
        _tls: _tls || {},
      });
      lockKey = 1;

      if (getResponse(res)) {
        history.replace(
          `/sdat/risk-control-workbench/risk-definition/detail/${defineId}/edit/${editType}/${groupCode}/${viewFlag}`
        );
        if (!flag) {
          const num = current + 1;
          setCurrent(num);
        } else {
          history.push('/sdat/risk-control-workbench/risk-definition/list');
        }
      }
    };

    const msg = validPeople(arr2, 'ruleChoose');

    if (!msg || [1, '1'].includes(enabledFlag)) {
      return continueOperation();
    } else {
      return Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: <div>{msg}</div>,
      }).then(async button => {
        if (button === 'ok') {
          return continueOperation();
        }
      });
    }
  };

  /**
   * 保存外部风险
   * @returns
   */
  const handleSaveOuterRisk = flag => {
    return commonSaveRisk(flag, 'externalRisk', stepTwoIndexList, cachedAllIndex);
  };

  /**
   * 保存灾害风险
   * @returns
   */
  const handleSaveDisasterRisk = flag => {
    return commonSaveRisk(flag, 'disasterRisk', disasterStepList, cachedAllDisaster);
  };

  /**
   * 保存业务风险
   * @returns
   */
  const handleSaveBusinessStep = async () => {
    // 重新拼接 conditionExpression
    if (stepThreeIndexList && stepThreeIndexList.length) {
      stepThreeIndexList.forEach(item => {
        item.conditionExpression = `${item.indexCode} >= ${item.equal} && ${item.indexCode} < ${item.lessThan}`;
      });
    }

    const msg = validPeople(cachedAllBusinessRisk, 'strategyChoose');

    if (['1', 1].includes(stepOneData.enableFlag)) {
      history.push('/sdat/risk-control-workbench/risk-definition/list');
      return false;
    }

    const { isValid: rangeValid, errorItem } = validRange(cachedAllBusinessRisk || []);
    if (!rangeValid) {
      notification.info({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdat.riskDefinition.view.message.validRangeError', {
          name: errorItem,
        }),
      });
      return false;
    }

    const continueOperation = async () => {
      const res = await fetchSaveStepThree({
        tenantId: getCurrentOrganizationId(),
        defineId: defineId === 'add' ? '' : defineId,
        editType: saveMap?.businessRisk ?? '',
        ruleList: stepThreeIndexList,
        themeCode: 'businessRisk',
        scope: scopeValue,
        groupCode: groupCode === 'selfCode' ? '' : groupCode,
        needGroup: [1, '1', 2, '2'].includes(scopeValue),
        defineName,
        _tls: _tls || {},
      });
      if (getResponse(res)) {
        history.push('/sdat/risk-control-workbench/risk-definition/list');
      }
    };

    if (!msg || [1, '1'].includes(enabledFlag)) {
      return continueOperation();
    } else {
      return Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: <div>{msg}</div>,
      }).then(button => {
        if (button === 'ok') {
          return continueOperation();
        }
      });
    }
  };

  /**
   * 下一步
   */
  const handleNextStep = flag => {
    const stepList = getSteps();

    // 详情接口没有响应完成 不能点击下一步
    if (!canNext) return false;

    // 保存适用范围数据
    if (stepList[current].keyCode === 'applicationScope' && lockKey === 1) {
      return handleSaveScopeRisk(flag);
    }

    // 保存外部风险的数据
    if (stepList[current].keyCode === 'externalRisk' && lockKey === 1) {
      return handleSaveOuterRisk(flag);
    }

    // 保存灾害风险的数据
    if (stepList[current].keyCode === 'disasterRisk' && lockKey === 1) {
      return handleSaveDisasterRisk(flag);
    }

    // 保存业务风险的数据
    if (stepList[current].keyCode === 'businessRisk' && lockKey === 1) {
      return handleSaveBusinessStep(flag);
    }
  };

  /**
   * 上一步
   */
  const handlePrevStep = () => {
    const num = current - 1;
    setCurrent(num);
  };

  /**
   * 校验数据范围 是否重叠
   * @param {*} data
   * @returns
   */
  const validRange = (data = []) => {
    let isValid = true; // true 验证通过
    let errorItem = '';

    const validNumberRange = (list = []) => {
      if (list.length) {
        let sum = 0;
        let itemName = '';
        list.forEach(item => {
          itemName = item.ruleCode;
          sum += parseFloat(item.lessThan) - parseFloat(item.equal);
        });

        if (sum > 100 && itemName !== 'invoicingDelayDays') {
          // 区间和 超过100 不通过
          return false;
        } else {
          list.sort((a, b) => {
            return a.equal - b.equal;
          }); // 按最小值排序(小 -> 大)

          for (let i = 0; i < list.length - 1; i++) {
            if (list[i].lessThan > list[i + 1].equal) {
              // 前一个的最大值 大于后一个的最小值
              return false;
            }
          }
        }

        return true;
      }
      return true;
    };

    const loopTree = arr => {
      if (arr.length) {
        arr.forEach(item => {
          if (item.themeLevel === 3 && isValid) {
            // 有一次校验不通过即不再进行
            isValid = validNumberRange(item.childList);
            errorItem = item.themeName || '';
          } else if (item.childList && item.childList.length) {
            loopTree(item.childList);
          }
        });
      }
    };

    loopTree(data || []);
    return { isValid, errorItem };
  };

  const steps = getSteps();

  const title =
    viewFlag === 'create'
      ? intl.get('sdat.riskDefinition.view.title.createRiskDefinition').d('新建风险定义')
      : viewFlag === 'edit'
      ? intl.get('sdat.riskDefinition.view.title.editRiskDefinition').d('编辑风险定义')
      : intl.get('sdat.riskDefinition.view.title.riskDefinitionDetailInfo').d('风险定义详情');

  return (
    <div className={styles['risk-definition-detail-content']}>
      <Header title={title} backPath="/sdat/risk-control-workbench/risk-definition/list">
        {current < steps.length - 1 ? (
          <Button
            color={![1, '1'].includes(enabledFlag) ? 'primary' : ''}
            icon="recover"
            funcType={![1, '1'].includes(enabledFlag) ? '' : 'flat'}
            style={{ color: ![1, '1'].includes(enabledFlag) ? '#fff' : '#000' }}
            onClick={() => handleNextStep('')}
          >
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
        ) : null}

        {current === steps.length - 1 && ![1, '1'].includes(enabledFlag) ? (
          <Button
            color="primary"
            icon="check"
            style={{ color: ![1, '1'].includes(enabledFlag) ? '#fff' : '#000' }}
            onClick={() => handleNextStep('end')}
          >
            {intl.get('hzero.common.button.finish').d('完成')}
          </Button>
        ) : null}

        {current > 0 ? (
          <Button icon="reply" funcType="flat" onClick={handlePrevStep}>
            {intl.get('hzero.common.button.previous').d('上一步')}
          </Button>
        ) : null}
      </Header>
      <div className={styles['risk-definition-basic']}>
        <div className={styles['risk-definition-basic-step-panel']}>
          <Steps size="small" current={current}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </div>
        <div className={styles['risk-definition-step-content-panel']}>{steps[current].content}</div>
      </div>
    </div>
  );
};

export default connect(state => state)(
  formatterCollections({
    code: ['sdat.riskDefinition'],
  })(Detail)
);
