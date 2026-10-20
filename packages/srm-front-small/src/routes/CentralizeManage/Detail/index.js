import React, { useEffect, useMemo, useState } from 'react';
import qs from 'qs';
import {
  Button,
  SelectBox,
  IntlField,
  Output,
  Spin,
  DataSet,
  DatePicker,
  Tooltip,
  Icon,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import FormPro from '@/components/FormPro';
import Card from './Card';
import SkuInfo from './SkuInfo';
import RuleConfig from './RuleConfig';
import { tagRender } from '../renderer';
import openRecords from '../openRecords';
import { fetchCentralize, centralizeSave, centralizePublish } from '../api';
import { getFormDsProps, getRuleConfigDsProps } from './dataSet';
import { handleCheck } from '../func';
import styles from './index.less';

function Detail(props) {
  const {
    match: { params: { status } = {} },
    location: { search },
  } = props;

  const { templateId } = qs.parse(search.substr(1));
  const [readOnly, setReadOnly] = useState(false);

  const formDataSet = useMemo(() => new DataSet(getFormDsProps()), []);
  const enableRuleDataSet = useMemo(() => new DataSet(getRuleConfigDsProps('ENABLE')), []);
  const executeRuleDataSet = useMemo(() => new DataSet(getRuleConfigDsProps('PERFORM')), []);

  const baseRecord = formDataSet.current;

  // 只有未发布允许编辑
  const editable = baseRecord.get('publishStatus') === 'UNPUBLISHED';

  useEffect(() => {
    const editing = (!templateId || editable) && status !== 'read';
    setReadOnly(!editing);
  }, [status, templateId, editable]);

  useEffect(() => {
    if (templateId) {
      initData();
    }
  }, [templateId]);

  // 数据初始化
  async function initData() {
    try {
      formDataSet.status = 'loading';
      const res = getResponse(await fetchCentralize(templateId));
      if (res) {
        const enableHead =
          res.centralizedConditionHeadList?.find(f => f.ruleType === 'ENABLE') || {};
        const executeHead =
          res.centralizedConditionHeadList?.find(f => f.ruleType === 'PERFORM') || {};
        formDataSet.loadData([
          {
            ...res,
            enabledRuleFlag: enableHead.conditionType,
            executeRuleFlag: executeHead.conditionType,
            enabledExpression: enableHead.conditionExpression,
            executeExpression: executeHead.conditionExpression,
          },
        ]);
        enableRuleDataSet.loadData(enableHead.centralizedConditionLineList || [{}]);
        enableRuleDataSet.setState('deleteConditionIdList', []);
        executeRuleDataSet.loadData(executeHead.centralizedConditionLineList || [{}]);
        executeRuleDataSet.setState('deleteConditionIdList', []);
      }
    } finally {
      formDataSet.status = 'ready';
    }
  }

  // 处理规则行数据
  const handleConditionLineList = configDataSet => {
    return configDataSet.map((record, index) => {
      const conditionLovCode = record.getField('centralizedConditionValueList').get('lovCode');
      const ruleItem = record.toData();
      return {
        ...ruleItem,
        conditionLovCode,
        conditionNumber: index + 1,
        centralizedConditionValueList:
          typeof ruleItem.conditionLineValue === 'object'
            ? ruleItem.centralizedConditionValueList.map((m, mIndex) => {
                return {
                  conditionLineValue: ruleItem.conditionLineValue[mIndex],
                  conditionLineValueMeaning: ruleItem.conditionLineValueMeaning[mIndex],
                };
              })
            : [
                {
                  conditionLineValue: ruleItem.conditionLineValue,
                  conditionLineValueMeaning: ruleItem.conditionLineValueMeaning,
                },
              ],
      };
    });
  };

  // 保存｜发布校验&参数get
  async function validateInfo() {
    const baseInfoFlag = await formDataSet.validate();
    const {
      templateType,
      enabledRuleFlag,
      executeRuleFlag,
      enabledExpression,
      executeExpression,
      centralizedConditionHeadList,
      ...baseInfo
    } = formDataSet.current.toJSONData();
    // 不是固定活动同时自定义规则
    const isEnableRule = templateType !== 'FIXED_TIME' && enabledRuleFlag;
    const enableFormFlag = isEnableRule ? await enableRuleDataSet.validate() : true;
    const executeFormFlag = executeRuleFlag ? await executeRuleDataSet.validate() : true;
    if (baseInfoFlag && enableFormFlag && executeFormFlag) {
      const enableHead = centralizedConditionHeadList?.find(f => f.ruleType === 'ENABLE') || {};
      const executeHead = centralizedConditionHeadList?.find(f => f.ruleType === 'PERFORM') || {};
      const params = {
        templateType,
        ...baseInfo,
        centralizedConditionHeadList: [
          {
            ...enableHead,
            ruleType: 'ENABLE',
            conditionType: isEnableRule ? 1 : 0,
            conditionExpression: isEnableRule ? enabledExpression : null,
            deleteConditionIdList: enableRuleDataSet.getState('deleteConditionIdList'),
            centralizedConditionLineList: isEnableRule
              ? handleConditionLineList(enableRuleDataSet)
              : null,
          },
          {
            ...executeHead,
            ruleType: 'PERFORM',
            conditionType: executeRuleFlag,
            conditionExpression: executeRuleFlag ? executeExpression : null,
            deleteConditionIdList: executeRuleDataSet.getState('deleteConditionIdList'),
            centralizedConditionLineList: executeRuleFlag
              ? handleConditionLineList(executeRuleDataSet)
              : null,
          },
        ],
      };
      return params;
    }
  }

  // 保存
  async function handleSave() {
    const params = await validateInfo();
    if (params) {
      const res = getResponse(await centralizeSave(params));
      if (res) {
        notification.success();
        if (!templateId && res.templateId) {
          props.history.push(`/small/centralize-manage/detail/edit?templateId=${res.templateId}`);
        } else {
          await initData();
        }
      }
    }
  }

  // 发布
  async function handlePublish() {
    async function publishCallback(list) {
      const res = getResponse(await centralizePublish(templateId, list));
      if (res) {
        notification.success();
        props.history.push(`/small/centralize-manage/list`);
      }
    }
    if (readOnly) {
      await handleCheck(templateId, publishCallback);
    } else {
      const params = await validateInfo();
      if (params) {
        const res = getResponse(await centralizeSave(params));
        if (res) {
          initData();
          await handleCheck(templateId, publishCallback);
        }
      }
    }
  }

  const title =
    status === 'create'
      ? intl.get('small.centralize.view.create.title').d('新建拼单活动')
      : readOnly
      ? intl.get('small.centralize.view.detail.title').d('拼单活动详情')
      : intl.get('small.centralize.view.edit.title').d('编辑拼单活动');

  const buttons = useMemo(() => {
    return [
      {
        show: !!templateId && editable, // 模板已创建同时状态为未发布
        btnText: intl.get('small.common.button.handle.publish').d('发布'),
        btnProps: { color: 'primary', icon: 'publish2', onClick: () => handlePublish() },
      },
      {
        show: !readOnly,
        btnText: intl.get('hzero.common.button.save').d('保存'),
        btnProps: { funcType: 'flat', icon: 'save', onClick: () => handleSave() },
      },
      {
        show: readOnly && editable && status === 'read',
        btnText: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: { funcType: 'flat', icon: 'mode_edit', onClick: () => setReadOnly(false) },
      },
      {
        show: !!templateId,
        btnText: intl.get('small.common.model.handle.record').d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: () => openRecords(baseRecord),
        },
      },
    ]
      .filter(f => f.show !== false)
      .map(m => <Button {...m.btnProps}>{m.btnText}</Button>);
  }, [status, readOnly, templateId, editable, baseRecord]);

  // 基本信息字段
  const baseInfoFields = useMemo(
    () => [
      {
        name: 'templateCode',
        label: intl.get('small.centralize.view.centralizeCode').d('拼单编码'),
      },
      {
        name: 'templateName',
        label: intl.get('small.centralize.view.centralizeName').d('拼单名称'),
        FormField: IntlField,
      },
      {
        name: 'publishStatus',
        label: intl.get('hzero.common.status').d('状态'),
        FormField: Output,
        renderer: tagRender,
        show: readOnly,
      },
    ],
    [readOnly]
  );

  // 拼单规则字段
  const ruleFields = useMemo(
    () => [
      {
        name: 'templateType',
        FormField: SelectBox,
        help: '123',
        showHelp: 'tooltip',
        optionRenderer: ({ text, value }) => {
          const optionTips = {
            OPENNESS: intl
              .get('small.centralize.view.openModeDesc')
              .d('无固定开始截止时间的开放性采买活动'),
            FIXED_TIME: intl
              .get('small.centralize.view.fixTimeDesc')
              .d('有固定开始截止时间的短期团购活动'),
          };
          const tip = optionTips[value];
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{text}</span>
              {tip && (
                <Tooltip placement="top" title={tip} arrowPointAtCenter>
                  <Icon type="help" style={{ fontSize: 16, color: '#868D9C', marginLeft: 4 }} />
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        name: 'templateDate',
        FormField: DatePicker,
        show: ({ record }) => record.get('templateType') === 'FIXED_TIME',
      },
    ],
    []
  );

  // 拼单规则卡片区域
  const cardConfig = [
    {
      title: intl.get('small.centralize.view.skuInfo').d('商品信息'),
      show: baseRecord.get('templateType') === 'FIXED_TIME',
      children: <SkuInfo templateId={templateId} readOnly={readOnly} />,
    },
    {
      title: intl.get('small.centralize.view.enableRule').d('启用规则'),
      show: baseRecord.get('templateType') !== 'FIXED_TIME',
      children: (
        <RuleConfig
          formDataSet={formDataSet}
          configDataSet={enableRuleDataSet}
          readOnly={readOnly}
          ruleName="enabledRuleFlag"
          expressionName="enabledExpression"
        />
      ),
    },
    {
      title: intl.get('small.centralize.view.execRule').d('执行规则'),
      children: (
        <RuleConfig
          formDataSet={formDataSet}
          configDataSet={executeRuleDataSet}
          readOnly={readOnly}
          ruleName="executeRuleFlag"
          expressionName="executeExpression"
        />
      ),
    },
  ].filter(f => f.show !== false);

  return (
    <>
      <Header title={title} backPath="/small/centralize-manage/list">
        {buttons}
      </Header>
      <Content className={styles['centralize-detail']}>
        <Spin dataSet={formDataSet}>
          <div className="centralize-base-info" style={{ width: '75%' }}>
            <div className="centralize-content-title">
              {intl.get('small.centralize.view.baseInfo').d('基本信息')}
            </div>
            <FormPro
              dataSet={formDataSet}
              columns={3}
              readOnly={readOnly}
              fields={baseInfoFields}
            />
          </div>
          {templateId && (
            <>
              <div className="invide" />
              <div className="centralize-rule" style={{ width: '75%' }}>
                <div className="centralize-content-title">
                  {readOnly
                    ? intl.get('small.centralize.view.centralizeRule').d('拼单规则')
                    : intl.get('small.centralize.view.centralizeRuleConfig').d('拼单规则配置')}
                </div>
                <FormPro
                  dataSet={formDataSet}
                  columns={3}
                  readOnly={readOnly}
                  fields={ruleFields}
                  style={{ marginTop: readOnly ? 0 : 24, marginBottom: 32 }}
                />
                {cardConfig.map(m => (
                  <Card key={m.title} title={m.title}>
                    {m.children}
                  </Card>
                ))}
              </div>
            </>
          )}
        </Spin>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['small.common', 'small.centralize'],
})(observer(Detail));
