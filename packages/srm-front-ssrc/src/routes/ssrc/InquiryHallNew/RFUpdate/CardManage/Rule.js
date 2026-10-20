import React, { Fragment, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import {
  CheckBox,
  NumberField,
  Table,
  DateTimePicker,
  Select,
  SelectBox,
  Lov,
  // DataSet,
  Button,
  Output,
  TextField,
  Modal,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { SRM_SSRC } from '_utils/config';
import CommonImportNew from 'hzero-front/lib/components/Import';

import { withOverride } from '@/utils/utils';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import { saveAllScoringTemplate, saveBidRuleType } from '@/services/rfService';
import Store from '../store/index';
import styles from '../../rfComponents/common.less';

export default observer(function RuleCard() {
  const {
    routerParams: { sourceCategory, rfHeaderId },
    commonDs: {
      ruleFormDs,
      expertTableDs,
      businessIndicateDs,
      techIndicateDs,
      noneIndicateDs,
      expertModalDs,
    },
    match,
    customizeCollapseForm,
    customizeTable,
    cuxProps = {}, // 用于存放重写二开方法的集合
  } = useContext(Store);

  const { current } = ruleFormDs;

  const [businessWeightFlag, setBusinessWeightFlag] = useState(0);
  const [techWeightFlag, setTechWeightFlag] = useState(0);

  /** ruleFormDs update事件
   * @protected 番缆服务二开
   */
  function ruleFormDsUpdateEvent({ name, value, record }) {
    // 设置报价运行时间
    if (name === 'quotationDay' || name === 'quotationHour' || name === 'quotationMinute') {
      let data = null;
      const days = record.get('quotationDay') || null;
      const hours = record.get('quotationHour') || null;
      const minutes = record.get('quotationMinute') || null;

      if (!days && !hours && !minutes) {
        record.set('quotationDay', null);
        record.set('quotationHour', null);
        record.set('quotationMinute', null);
        return;
      }

      if (name === 'quotationDay') {
        data = value * 1440 + hours * 60 + minutes;
      } else if (name === 'quotationHour') {
        data = days * 1440 + value * 60 + minutes;
      } else if (name === 'quotationMinute') {
        data = days * 1440 + hours * 60 + value;
      }

      record.set('quotationRunningDuration', data);
    }
    // 权重
    if (name === 'technologyWeight') {
      if (value === 100) {
        return;
      }
      record.set('businessWeight', 100 - value);
    }
    if (name === 'businessWeight') {
      if (value === 100) {
        return;
      }
      record.set('technologyWeight', 100 - value);
    }
    if (name === 'bidRuleType') {
      // 从区分切换到不区分,还原默认值
      record.set('technologyWeight', 50);
      record.set('businessWeight', 50);
      // 切换标书规则，若有参考模板，则清空参考模板
      if (record.get('templateLov')) {
        record.set('templateLov', null);
      }
      // 设置openBidOrder默认值
      record.set('openBidOrder', 'SYNC');
    }
  }

  const _update = withOverride.call(cuxProps, ruleFormDsUpdateEvent, 'ruleFormDsUpdateEvent');

  useEffect(() => {
    ruleFormDs.addEventListener('update', _update);
  }, []);

  const queryIndicates = () => {
    // 查询
    if (current.get('bidRuleType') === 'DIFF') {
      businessIndicateDs.query();
      techIndicateDs.query();
    } else {
      noneIndicateDs.query();
    }
  };

  // 保存参考模板
  const changeTemplate = async (record) => {
    const { templateId = null, businessWeight = null, technologyWeight = null } = record || {};

    if (isEmpty(templateId)) return;

    let result = await saveAllScoringTemplate({
      rfHeaderId,
      scoreTemplateId: templateId,
    });
    result = getResponse(result);
    if (!result) {
      return;
    }

    // 如果是区分，从参考模板带值
    if (current.get('bidRuleType') === 'DIFF') {
      current.set({
        technologyWeight,
        businessWeight,
      });
    }

    notification.success();
    queryIndicates();
  };

  // 保存标书规则
  const handleSaveBidRuleType = (value) => {
    return saveBidRuleType({ bidRuleType: value, rfHeaderId }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        if (value === 'DIFF') {
          noneIndicateDs.loadData([]);
        } else {
          techIndicateDs.loadData([]);
          businessIndicateDs.loadData([]);
        }
        expertTableDs.query();
        return true;
      }
      return false;
    });
  };

  // 改变标的规则前，监听事件
  const changeBidRuleType = (value) => {
    return Modal.confirm({
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get(`ssrc.rf.view.tips.changeBidRuleType`)
        .d('标书规则切换后，将清除已填写的评分要素，是否继续？'),
      onOk: () => handleSaveBidRuleType(value),
      onCancel: () => {
        Modal.destroyAll();
        return false;
      },
    });
  };

  // 分配专家modal
  const handleAssignExpertModal = (record = {}) => {
    expertModalDs.setQueryParameter('rfIndicateId', record.get('rfIndicateId'));
    expertModalDs.query();
    const expertColumns = [
      {
        name: 'loginName',
        width: 150,
      },
      {
        name: 'expertName',
      },
      {
        name: 'assignFlag',
        width: 150,
        editor: true,
      },
      // 仅打分制评分要素允许输入
      record?.get('indicateType') === 'SCORE'
        ? {
            name: 'expertWeight',
            width: 150,
            editor: true,
          }
        : null,
    ];

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get(`ssrc.rf.model.rf.assignExpert`).d('分配专家'),
      children: customizeTable(
        {
          code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_ASSIGN_${sourceCategory}`,
        },
        <Table dataSet={expertModalDs} columns={expertColumns} />
      ),
      style: { width: '742px' },
      drawer: true,
      onOk: async () => {
        record.set('expertDistribute', 1);
        const flag = await expertModalDs.validate();
        if (flag) {
          await expertModalDs.submit();
        } else {
          // 防止弹框关闭
          return false;
        }
      },
      onCancel: () => {},
    });
  };

  // 新建一级报价明细项
  const handleAddOneItem = (ds = {}) => {
    const key = uuid();

    const data = {
      rfIndicateId: key,
      parentRfIndicateId: null, // 一级细项标记
      tempIndicateId: key, // 新建给后端父子结构的标记字段
      tempParentIndicateId: null,
      expand: true,
    };

    // eslint-disable-next-line no-unused-expressions
    ds?.create(data, 0);
  };

  const handleDeleteItem = (ds = {}) => {
    const data = ds.selected;
    ds.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  // 新增二级要素细项
  const handleAddTWOItem = (record = {}, ds) => {
    // 清空最大值最小值
    if (record.children) {
      record.set('minScore', null);
      record.set('maxScore', null);
    }

    const key = uuid();

    let data = {};

    // 一级是新建行
    if (record.get('tempIndicateId')) {
      data = {
        rfIndicateId: key,
        parentRfIndicateId: record.get('rfIndicateId'), // 一级细项标记
        tempIndicateId: key, // 新建给后端父子结构的标记字段
        tempParentIndicateId: record.get('rfIndicateId'),
        indicateType: 'SCORE',
      };
    } else {
      data = {
        parentRfIndicateId: record.get('rfIndicateId'), // 一级细项标记
        indicateType: 'SCORE',
      };
    }

    // eslint-disable-next-line no-unused-expressions
    ds?.create(data, 0);
  };

  // 批量新增
  const newImportButton = useCallback(
    (type = '') => {
      const code = 'SSRC.RF_INDICATE_IMPORT';
      const tenantId = getCurrentOrganizationId();

      const ImportProps = {
        businessObjectTemplateCode: code,
        prefixPatch: SRM_SSRC,
        refreshButton: true,
        name: 'itemImportNew',
        args: {
          tenantId: getCurrentOrganizationId(),
          scoreType: ruleFormDs.current?.get('scoreType'),
          rfHeaderId,
          templateCode: code,
          scoreCategory: type,
        },
        buttonProps: {
          funcType: 'flat',
          icon: 'archive',
          color: 'primary',
          permissionList: [
            {
              code: `${match?.path}.button.item-import-rfp-new`.toLowerCase(),
              type: 'button',
              meaning:
                intl.get('ssrc.rf.view.card.title.rfpTitle').d('编辑方案征询书') -
                `${intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}`,
            },
          ],
        },
        buttonText: `${intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}`,
        autoRefreshInterval: 5000,
        tenantId,
        action: 'hzero.common.title.batchImport',
        auto: true,
        successCallBack: batchImportOk,
      };

      return <CommonImportNew {...ImportProps} />;
    },
    [ruleFormDs, ruleFormDs.current, match]
  );

  // 评分要素批量导入
  const onImportScoringElements = (type) => {
    if (!rfHeaderId) return;
    const code = 'SSRC.RF_INDICATE_IMPORT';

    const Props = {
      code,
      auto: true,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: getCurrentOrganizationId(),
        scoreType: ruleFormDs.current?.get('scoreType'),
        rfHeaderId,
        templateCode: code,
        scoreCategory: type,
      }),
      autoRefreshInterval: 5000,
      tenantId: getCurrentOrganizationId(),
      action: 'hzero.common.title.batchImport',
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: batchImportOk,
      onCancel: batchImportOk,
    });
  };

  // 批量导入确认后
  const batchImportOk = () => {
    queryIndicates();
  };

  // 要素类型变化回调
  const handleSelectIndicateType = (record, value, oldValue) => {
    const clearObj = {
      indicateWeight: null,
      minScore: null,
      maxScore: null,
      indicateRemark: null,
    };
    if (value === 'PASS') {
      if (oldValue === 'SCORE') {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('ssrc.inquiryHall.model.inquiryHall.passConfirm')
            .d('要素类型由打分制改为通过制后，系统将自动清空要素细项，是否继续？'),
          onOk: () => {
            const { indicateWeight, minScore, maxScore, indicateRemark } = record.get([
              'indicateWeight',
              'minScore',
              'maxScore',
              'indicateRemark',
            ]);
            record.setState('scoreObj', {
              indicateWeight,
              minScore,
              maxScore,
              indicateRemark,
            });
            setRecord(record, clearObj);
          },
          onCancel: () => {
            record.set('indicateType', 'SCORE');
          },
        });
      } else {
        setRecord(record, clearObj);
      }
    }
    if (value === 'SCORE' && oldValue === 'PASS') {
      const scoreObj = record.getState('scoreObj') || {};
      record.set('indicateRemark', null);
      setRecord(record, {
        ...scoreObj,
        minScore: ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? scoreObj.minScore
          : scoreObj.minScore ?? 0,
        maxScore: ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? scoreObj.maxScore
          : scoreObj.maxScore ?? 100,
      });
    }
  };

  // 设置record
  const setRecord = (record, obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      record.set(key, value);
    });
  };

  // 过滤评分方式
  const optionsFilterScoreType = (optionRecord) => {
    const newScoreFlag = ruleFormDs?.getState('newScoreFlag') || false;
    const optionValue = optionRecord.get('value') || null;
    if (newScoreFlag) {
      return optionValue !== 'SCORE';
    } else {
      return optionValue !== 'SCORE_NEW';
    }
  };

  const expertColumns = useMemo(
    () =>
      [
        {
          name: 'expertLov',
          width: 150,
          editor: true,
        },
        {
          name: 'expertName',
        },
        {
          name: 'expertRole',
          width: 150,
          editor: true,
        },
        current?.get('bidRuleType') !== 'NONE'
          ? {
              name: 'scoreCategory',
              width: 150,
              editor: true,
            }
          : null,
        {
          name: 'expertType',
          width: 150,
        },
        {
          name: 'phone',
          width: 300,
          renderer: ({ record, text }) =>
            [
              record.getField('internationalTelCode')?.getText(record.get('internationalTelCode')),
              text,
            ]
              .filter(Boolean)
              .join(' | '),
        },
        {
          name: 'email',
          width: 250,
        },
      ].filter(Boolean),
    [current?.get('bidRuleType')]
  );

  const scoreElementColumns = useCallback(
    (ds) =>
      [
        {
          name: 'indicate',
          header: intl.get(`ssrc.rf.model.rf.indicateCode`).d('要素编码'),
          width: 180,
          className: styles['indicate-table-cell'],
          renderer: ({ record }) => {
            // 一级
            if (record?.get('parentRfIndicateId') === null) {
              return (
                <Lov
                  name="indicateLov"
                  record={record}
                  style={{ height: '0.28rem', width: '100%' }}
                />
              );
            } else {
              // 二级
              return (
                <TextField
                  name="indicateCode"
                  record={record}
                  style={{ height: '0.28rem', width: '100%' }}
                />
              );
            }
          },
        },
        {
          name: 'indicateName',
          width: 200,
          editor: true,
        },
        {
          name: 'indicateType',
          width: 150,
          editor: (record) => (
            <Select
              clearButton={false}
              name="indicateType"
              onChange={(value, oldValue) => handleSelectIndicateType(record, value, oldValue)}
            />
          ),
        },
        current?.get('scoreType') === 'WEIGHT'
          ? {
              name: 'indicateWeight',
              width: 120,
              editor: true,
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? {
              name: 'minScore',
              width: 120,
              editor: true,
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? {
              name: 'maxScore',
              width: 120,
              editor: true,
            }
          : null,
        {
          name: 'indicateRemark',
          editor: true,
        },
        {
          name: 'expertDistribute',
          header: intl.get('hzero.common.action').d('操作'),
          width: 150,
          renderer: ({ record = {} }) => {
            if (record?.get('parentRfIndicateId')) return null;
            return !record?.get('tempIndicateId') || record?.get('indicateType') === 'SCORE' ? (
              <Fragment>
                {!record?.get('tempIndicateId') && record?.get('parentRfIndicateId') === null && (
                  <a style={{ marginRight: '8px' }} onClick={() => handleAssignExpertModal(record)}>
                    {intl.get(`ssrc.rf.view.message.button.distribution`).d('分配专家')}
                  </a>
                )}
                {record?.get('parentRfIndicateId') === null &&
                  record?.get('indicateType') === 'SCORE' && (
                    <a
                      onClick={() => handleAddTWOItem(record, ds)}
                      disabled={
                        !record?.get('indicateType') || record?.get('indicateType') === 'PASS'
                      }
                    >
                      {intl.get(`ssrc.rf.view.message.button.addItems`).d('新增细项')}
                    </a>
                  )}
              </Fragment>
            ) : null;
          },
        },
      ].filter(Boolean),
    [current?.get('scoreType')]
  );

  // 权重框失焦
  const handleBlur = (e, value, flag) => {
    if (e.target.value > 100 || e.target.value < 0) {
      if (flag === 'businessWeightFlag') {
        setBusinessWeightFlag(true);
      } else {
        setTechWeightFlag(true);
      }
      return;
    }
    if (
      [0, 100].includes(current?.get('technologyWeight')) ||
      [0, 100].includes(current?.get('businessWeight'))
    ) {
      return;
    }
    if (flag === 'businessWeightFlag') {
      setBusinessWeightFlag(!value);
    } else {
      setTechWeightFlag(!value);
    }
  };

  return (
    <Fragment>
      <h3 className={styles['card-sub-title']} style={{ marginTop: '16px' }}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rf.view.card.subtitle.processNode').d('流程节点设置')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_${sourceCategory}`,
          dataSet: ruleFormDs,
        },
        <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" useWidthPercent>
          <Select name="expertScoreType" showHelp="tooltip" />
        </CollapseForm>
      )}
      <div className={styles.consultationStage}>
        <h3 className={styles['card-sub-title']}>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.rf.view.card.subtitle.consultationStage').d('征询阶段')}
        </h3>
        {customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL.RF_EDIT.CONF_RULE_STAGE_${sourceCategory}`,
            dataSet: ruleFormDs,
          },
          <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" useWidthPercent>
            <CheckBox name="startFlag" />
            {current?.get('startFlag') && (
              <div name="quotationHour">
                <NumberField
                  name="quotationDay"
                  style={{ width: '33%' }}
                  label={intl.get(`ssrc.rf.model.rf.quotRunningDuration`).d('报价运行时间')}
                  placeholder={intl.get('hzero.common.date.unit.hours').d('天')}
                />
                <NumberField
                  name="quotationHour"
                  style={{ width: '33%' }}
                  label={null}
                  placeholder={intl.get('hzero.common.date.unit.hours').d('小时')}
                />
                <NumberField
                  name="quotationMinute"
                  style={{ width: '33%' }}
                  label={null}
                  placeholder={intl.get('hzero.common.date.unit.minutes').d('分钟')}
                />
              </div>
            )}
            {!current?.get('startFlag') && [
              <DateTimePicker name="quotationStartDate" />,
              <DateTimePicker name="quotationEndDate" />,
            ]}
            {current?.get('lineItemsFlag') && [
              <Lov name="currencyLov" />,
              <CheckBox name="multiCurrencyFlag" />,
            ]}
            <Select name="replyType" />,
            <DateTimePicker name="clarifyEndDate" />,
          </CollapseForm>
        )}
      </div>
      {current?.get('expertScoreType') === 'ONLINE' ? (
        <Fragment>
          <h3
            className={styles['card-sub-title']}
            style={{ paddingBottom: '16px', marginBottom: 0 }}
          >
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.expert').d('专家组')}
          </h3>
          {customizeCollapseForm(
            {
              code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_RULE_${sourceCategory}`,
              dataSet: ruleFormDs,
            },
            <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" useWidthPercent>
              <SelectBox name="bidRuleType" onBeforeChange={changeBidRuleType} />
              {current?.get('bidRuleType') === 'DIFF' && <Select name="openBidOrder" />}
              <Select name="scoreType" clearButton={false} optionsFilter={optionsFilterScoreType} />
            </CollapseForm>
          )}
          {customizeTable(
            {
              code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_EXPERTS_${sourceCategory}`,
            },
            <Table
              style={{
                marginTop: '16px',
              }}
              dataSet={expertTableDs}
              columns={expertColumns}
              buttons={[
                'add',
                <TooltipButtonPro
                  name="delete"
                  icon="delete_sweep"
                  disabled={isEmpty(expertTableDs.selected)}
                  onClick={() => handleDeleteItem(expertTableDs)}
                  help={intl
                    .get('ssrc.common.view.message.expert-group-line.select.tip')
                    .d('请先勾选专家组成员')}
                >
                  {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
                </TooltipButtonPro>,
              ]}
            />
          )}
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.scoreIndics').d('评分要素')}
          </h3>
          {customizeCollapseForm(
            {
              code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_CONFIG_${sourceCategory}`,
              dataSet: ruleFormDs,
            },
            <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" useWidthPercent>
              <Lov name="templateLov" onChange={changeTemplate} />
            </CollapseForm>
          )}
          {current?.get('bidRuleType') === 'DIFF' ? (
            <Fragment>
              <h4 style={{ marginTop: '16px', height: '30px', lineHeight: '30px' }}>
                {intl.get('ssrc.rf.view.card.subtitle.techScoreIndics').d('技术组')}
                {current.get('scoreType') !== 'SCORE_NEW' ? (
                  <span style={{ marginLeft: '8px', fontWeight: '400' }}>
                    （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
                    {techWeightFlag ? (
                      <NumberField
                        record={current}
                        name="technologyWeight"
                        size="small"
                        style={{ width: '80px', margin: '0 6px' }}
                        onBlur={(e) => handleBlur(e, techWeightFlag, 'techWeightFlag')}
                      />
                    ) : (
                      <Fragment>
                        <Output
                          record={current}
                          name="technologyWeight"
                          style={{ marginLeft: '2px' }}
                          renderer={({ text }) => `${text}%`}
                        />
                        <Button
                          color="primary"
                          funcType="flat"
                          icon="mode_edit"
                          size="small"
                          onClick={() => setTechWeightFlag(!techWeightFlag)}
                        />
                      </Fragment>
                    )}
                    ）
                  </span>
                ) : null}
              </h4>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_TECH_${sourceCategory}`,
                },
                <Table
                  mode="tree"
                  dataSet={techIndicateDs}
                  columns={scoreElementColumns(techIndicateDs)}
                  buttons={[
                    ['add', { onClick: () => handleAddOneItem(techIndicateDs) }],
                    <TooltipButtonPro
                      name="delete"
                      icon="delete_sweep"
                      disabled={isEmpty(techIndicateDs.selected)}
                      onClick={() => handleDeleteItem(techIndicateDs)}
                      help={intl
                        .get('ssrc.common.view.message.score-indicate-line.select.tip')
                        .d('请先勾选评分要素')}
                    >
                      {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
                    </TooltipButtonPro>,
                    <Button
                      icon="archive"
                      disabled={!rfHeaderId}
                      onClick={() => onImportScoringElements('TECHNOLOGY')}
                    >
                      {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
                    </Button>,
                    newImportButton('TECHNOLOGY'),
                  ]}
                />
              )}
              <h4 style={{ marginTop: '24px', height: '30px', lineHeight: '30px' }}>
                {intl.get('ssrc.rf.view.card.subtitle.busScoreIndics').d('商务组')}
                {current.get('scoreType') !== 'SCORE_NEW' ? (
                  <span style={{ marginLeft: '8px', fontWeight: '400' }}>
                    （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
                    {businessWeightFlag ? (
                      <NumberField
                        record={current}
                        name="businessWeight"
                        size="small"
                        style={{ width: '80px', margin: '0 6px' }}
                        onBlur={(e) => handleBlur(e, businessWeightFlag, 'businessWeightFlag')}
                      />
                    ) : (
                      <Fragment>
                        <Output
                          record={current}
                          name="businessWeight"
                          style={{ marginLeft: '2px' }}
                          renderer={({ text }) => `${text}%`}
                        />
                        <Button
                          color="primary"
                          funcType="flat"
                          icon="mode_edit"
                          size="small"
                          onClick={() => setBusinessWeightFlag(!businessWeightFlag)}
                        />
                      </Fragment>
                    )}
                    ）
                  </span>
                ) : null}
              </h4>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_BUSI_${sourceCategory}`,
                },
                <Table
                  mode="tree"
                  dataSet={businessIndicateDs}
                  columns={scoreElementColumns(businessIndicateDs)}
                  buttons={[
                    ['add', { onClick: () => handleAddOneItem(businessIndicateDs) }],
                    <TooltipButtonPro
                      name="delete"
                      icon="delete_sweep"
                      disabled={isEmpty(businessIndicateDs.selected)}
                      onClick={() => handleDeleteItem(businessIndicateDs)}
                      help={intl
                        .get('ssrc.common.view.message.score-indicate-line.select.tip')
                        .d('请先勾选评分要素')}
                    >
                      {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
                    </TooltipButtonPro>,
                    <Button
                      icon="archive"
                      disabled={!rfHeaderId}
                      onClick={() => onImportScoringElements('BUSINESS')}
                    >
                      {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
                    </Button>,
                    newImportButton('BUSINESS'),
                  ]}
                />
              )}
            </Fragment>
          ) : (
            customizeTable(
              {
                code: `SSRC.INQUIRY_HALL.RF_EDIT.SCORE_INDICATES_${sourceCategory}`,
              },
              <Table
                mode="tree"
                dataSet={noneIndicateDs}
                style={{
                  marginTop: '16px',
                }}
                columns={scoreElementColumns(noneIndicateDs)}
                buttons={[
                  ['add', { onClick: () => handleAddOneItem(noneIndicateDs) }],
                  <TooltipButtonPro
                    name="delete"
                    icon="delete_sweep"
                    disabled={isEmpty(noneIndicateDs.selected)}
                    onClick={() => handleDeleteItem(noneIndicateDs)}
                    help={intl
                      .get('ssrc.common.view.message.score-indicate-line.select.tip')
                      .d('请先勾选评分要素')}
                  >
                    {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
                  </TooltipButtonPro>,
                  <Button
                    icon="archive"
                    disabled={!rfHeaderId}
                    onClick={() => onImportScoringElements('BUSINESS_TECHNOLOGY')}
                  >
                    {intl.get(`ssrc.inquiryHall.view.button.import`).d('导入')}
                  </Button>,
                  newImportButton('BUSINESS_TECHNOLOGY'),
                ]}
              />
            )
          )}
        </Fragment>
      ) : null}
    </Fragment>
  );
});
