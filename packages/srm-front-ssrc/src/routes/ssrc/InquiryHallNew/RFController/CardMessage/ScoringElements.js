/*
 * @Descripttion: 寻源过程控制--评分要素
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 20:24:20
 * @LastEditors: yiping.liu
 */
import React, { useContext, useCallback, useState } from 'react';
import intl from 'utils/intl';
import {
  Lov,
  Table,
  Modal,
  Output,
  NumberField,
  Button,
  TextField,
  Select,
} from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import CollapseForm from '_components/CollapseForm';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { changeTemplate } from '@/services/rfService';
import styles from '../../rfComponents/common.less';
import { historyDiffRenderComp, ComponentDiffRender } from '../utils';
import Style from './index.less';
import Store from '../store';

const ScoringElements = observer(() => {
  const {
    customizeTable,
    customizeCollapseForm,
    routerParams: { adjustRecordId },
    commonDs: { businessIndicateDs, techIndicateDs, noneIndicateDs, expertModalDs, consultationDs },
  } = useContext(Store);

  const [businessWeightFlag, setBusinessWeightFlag] = useState(0);
  const [techWeightFlag, setTechWeightFlag] = useState(0);

  // 分配专家
  const handleAssignExpertModal = (record = {}) => {
    expertModalDs.setQueryParameter('rfIndicateAdjustId', record.get('rfIndicateAdjustId'));
    expertModalDs.setQueryParameter('rfHeaderAdjustId', record.get('rfHeaderAdjustId'));
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
          code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_ASSIGN',
          dataSet: expertModalDs,
        },
        <Table border dataSet={expertModalDs} columns={expertColumns} />
      ),
      style: { width: '742px' },
      drawer: true,
      afterClose: () => {
        expertModalDs.loadData([]);
      },
      onOk: async () => {
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
        minScore: ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
          ? scoreObj.minScore
          : scoreObj.minScore ?? 0,
        maxScore: ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
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

  const getColumns = useCallback(
    (ds) => {
      return [
        {
          name: 'indicate',
          width: 180,
          tooltip: 'none',
          header: intl.get(`ssrc.rf.model.rf.indicateCode`).d('要素编码'),
          className: styles['indicate-table-cell'],
          renderer: ({ record }) => {
            // 一级
            if (!record?.get('parentRfIndicateId')) {
              return (
                <ComponentDiffRender record={record} name="indicateCode" historyDTO="rfIndicate">
                  <Lov
                    name="indicateLov"
                    record={record}
                    style={{ height: '0.28rem', width: '100%' }}
                    renderer={({ text }) => (text ? <div> {text} </div> : '')}
                  />
                </ComponentDiffRender>
              );
            } else {
              // 二级
              return (
                <ComponentDiffRender record={record} name="indicateCode" historyDTO="rfIndicate">
                  <TextField
                    name="indicateCode"
                    record={record}
                    style={{ height: '0.28rem', width: '100%' }}
                    renderer={({ text }) => (text ? <div> {text} </div> : '')}
                  />
                </ComponentDiffRender>
              );
            }
          },
        },
        {
          name: 'indicateName',
          editor: true,
          renderer: ({ record, dataSet }) =>
            historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateName'),
        },
        {
          name: 'indicateType',
          width: 150,
          className: styles['indicate-table-cell'],
          renderer: ({ record }) => (
            <ComponentDiffRender record={record} name="indicateType" historyDTO="rfIndicate">
              <Select
                record={record}
                clearButton={false}
                name="indicateType"
                style={{ height: '0.28rem', width: '100%' }}
                renderer={({ text }) => (text ? <div> {text} </div> : '')}
                onChange={(value, oldValue) => handleSelectIndicateType(record, value, oldValue)}
              />
            </ComponentDiffRender>
          ),
        },
        consultationDs?.current?.get('scoreType') === 'WEIGHT'
          ? {
              name: 'indicateWeight',
              width: 120,
              editor: true,
              renderer: ({ record, dataSet }) =>
                historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateWeight'),
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
          ? {
              name: 'minScore',
              width: 120,
              editor: true,
              renderer: ({ record, dataSet }) =>
                historyDiffRenderComp(record, dataSet, 'rfIndicate', 'minScore'),
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(consultationDs?.current?.get('scoreType'))
          ? {
              name: 'maxScore',
              width: 120,
              editor: true,
              renderer: ({ record, dataSet }) =>
                historyDiffRenderComp(record, dataSet, 'rfIndicate', 'maxScore'),
            }
          : null,
        {
          name: 'indicateRemark',
          editor: true,
          renderer: ({ record, dataSet }) =>
            historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateRemark'),
        },
        {
          name: 'expertDistribute',
          header: intl.get('hzero.common.action').d('操作'),
          width: 150,
          renderer: ({ record = {} }) => {
            if (record?.get('parentRfIndicateId')) return null;
            return (
              <React.Fragment>
                {!record?.get('tempIndicateId') && !record?.get('parentRfIndicateId') && (
                  <a style={{ marginRight: '8px' }} onClick={() => handleAssignExpertModal(record)}>
                    {intl.get(`ssrc.rf.view.message.button.distribution`).d('分配专家')}
                  </a>
                )}
                {!record?.get('parentRfIndicateId') && record?.get('indicateType') === 'SCORE' && (
                  <a
                    onClick={() => handleAddTWOItem(record, ds)}
                    disabled={
                      !record?.get('indicateType') || record?.get('indicateType') === 'PASS'
                    }
                  >
                    {intl.get(`ssrc.rf.view.message.button.addItems`).d('新增细项')}
                  </a>
                )}
              </React.Fragment>
            );
          },
        },
      ];
    },
    [consultationDs?.current]
  );

  // 新建一级报价明细项
  const handleAddOneItem = (ds = {}) => {
    const key = uuid();

    const data = {
      rfIndicateAdjustId: key,
      parentRfIndicateId: null, // 一级细项标记
      tempIndicateId: key, // 新建给后端父子结构的标记字段
      tempParentIndicateId: null,
      expand: true,
    };

    // eslint-disable-next-line no-unused-expressions
    ds?.create(data, 0);
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
        rfIndicateAdjustId: key,
        parentRfIndicateId: record.get('rfIndicateAdjustId'), // 一级细项标记
        tempIndicateId: key, // 新建给后端父子结构的标记字段
        tempParentIndicateId: record.get('rfIndicateAdjustId'),
        indicateType: 'SCORE',
      };
    } else {
      data = {
        parentRfIndicateId: record.get('rfIndicateAdjustId'), // 一级细项标记
        indicateType: 'SCORE',
      };
    }

    // eslint-disable-next-line no-unused-expressions
    ds?.create(data, 0);
  };

  // 评分模版选择
  const handleTemplateChange = async (record) => {
    const { templateId = null, businessWeight = null, technologyWeight = null } = record || {};

    if (isEmpty(templateId)) return;

    const result = await changeTemplate({
      adjustRecordId,
      scoreTemplateId: templateId,
      customizeUnitCode: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE',
    });
    if (result && !result.failed) {
      notification.success();
      if (consultationDs?.current?.get('bidRuleType') === 'DIFF') {
        consultationDs.current.set({
          technologyWeight,
          businessWeight,
        });

        businessIndicateDs.query();
        techIndicateDs.query();
      } else {
        noneIndicateDs.query();
      }
    }
  };

  const handleDeleteItem = (ds) => {
    const data = ds.selected;
    const flag = (ds.selected || []).find((i) => i.status !== 'add');
    if (!flag) ds.remove(data);
    if (flag) {
      ds.delete(data, {
        title: intl.get('ssrc.common.message.tip').d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }).then((res) => {
        const result = getResponse(res);
        if (result && result.success) {
          ds.unSelectAll();
          ds.query();
        }
      });
    }
  };

  const renderButtonsTech = [
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
    'save',
  ];

  const renderButtonsBus = [
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
    'save',
  ];

  // 权重框失焦
  const handleBlur = (value, flag) => {
    if (
      [0, 100].includes(consultationDs?.current?.get('technologyWeight')) ||
      [0, 100].includes(consultationDs?.current?.get('businessWeight'))
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
    <React.Fragment>
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
      </h3>
      {customizeCollapseForm(
        {
          code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_TEMPLATE',
          dataSet: consultationDs,
        },
        <CollapseForm dataSet={consultationDs} columns={3} labelLayout="float" useWidthPercent>
          <ComponentDiffRender
            name="scoreTemplateCode"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            <Lov
              name="templateLov"
              renderer={({ text }) => (text ? <div> {text} </div> : '')}
              onChange={handleTemplateChange}
            />
          </ComponentDiffRender>
        </CollapseForm>
      )}
      {consultationDs?.current?.get('bidRuleType') === 'DIFF' ? (
        <React.Fragment>
          <div className={Style['score-element-header']}>
            <h4 className={Style['score-title']}>
              {intl.get('ssrc.rfController.model.technology.group').d('技术组')}
              {consultationDs?.current?.get('scoreType') !== 'SCORE_NEW' ? (
                <span className={Style['tech-input']}>
                  （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
                  {techWeightFlag ? (
                    <ComponentDiffRender
                      record={consultationDs}
                      special
                      name="technologyWeight"
                      historyDTO="rfConfRuleOriginalDTO"
                    >
                      <NumberField
                        record={consultationDs.current}
                        name="technologyWeight"
                        size="small"
                        style={{ width: '80px', margin: '-4px 6px' }}
                        onBlur={() => handleBlur(techWeightFlag, 'techWeightFlag')}
                      />
                    </ComponentDiffRender>
                  ) : (
                    <>
                      <Output
                        record={consultationDs.current}
                        name="technologyWeight"
                        style={{ marginLeft: '2px' }}
                        renderer={({ record, dataSet }) =>
                          historyDiffRenderComp(
                            record,
                            dataSet,
                            'rfConfRuleOriginalDTO',
                            'technologyWeight'
                          )
                        }
                      />
                      {'%'}
                      <Button
                        color="primary"
                        funcType="flat"
                        icon="mode_edit"
                        size="small"
                        onClick={() => setTechWeightFlag(!techWeightFlag)}
                      />
                    </>
                  )}
                  ）
                </span>
              ) : null}
            </h4>
          </div>
          {customizeTable(
            {
              code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_TECH',
              dataSet: techIndicateDs,
            },
            <Table
              mode="tree"
              buttons={renderButtonsTech}
              dataSet={techIndicateDs}
              columns={getColumns(techIndicateDs)}
            />
          )}
          <div className={Style['score-element-header']}>
            <h4 className={Style['score-title']}>
              {intl.get('ssrc.rfController.model.business.group').d('商务组')}
              {consultationDs?.current?.get('scoreType') !== 'SCORE_NEW' ? (
                <span className={Style['tech-input']}>
                  （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
                  {businessWeightFlag ? (
                    <ComponentDiffRender
                      record={consultationDs}
                      special
                      name="businessWeight"
                      historyDTO="rfConfRuleOriginalDTO"
                    >
                      <NumberField
                        record={consultationDs.current}
                        name="businessWeight"
                        size="small"
                        style={{ width: '80px', margin: '-4px 6px' }}
                        onBlur={() => handleBlur(businessWeightFlag, 'businessWeightFlag')}
                      />
                    </ComponentDiffRender>
                  ) : (
                    <React.Fragment>
                      <Output
                        record={consultationDs.current}
                        name="businessWeight"
                        style={{ marginLeft: '2px' }}
                        renderer={({ record, dataSet }) =>
                          historyDiffRenderComp(
                            record,
                            dataSet,
                            'rfConfRuleOriginalDTO',
                            'businessWeight'
                          )
                        }
                      />
                      {'%'}
                      <Button
                        color="primary"
                        funcType="flat"
                        icon="mode_edit"
                        size="small"
                        onClick={() => setBusinessWeightFlag(!businessWeightFlag)}
                      />
                    </React.Fragment>
                  )}
                  ）
                </span>
              ) : null}
            </h4>
          </div>
          {customizeTable(
            {
              code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES_BUSI',
              dataSet: businessIndicateDs,
            },
            <Table
              mode="tree"
              buttons={renderButtonsBus}
              dataSet={businessIndicateDs}
              columns={getColumns(businessIndicateDs)}
            />
          )}
        </React.Fragment>
      ) : (
        customizeTable(
          {
            code: 'SSRC.INQUIRY_HALL.RF_CONTROL.SCORE_INDICATES',
            dataSet: noneIndicateDs,
          },
          <Table
            mode="tree"
            dataSet={noneIndicateDs}
            columns={getColumns(noneIndicateDs)}
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
              'save',
            ]}
          />
        )
      )}
    </React.Fragment>
  );
});

export default ScoringElements;
