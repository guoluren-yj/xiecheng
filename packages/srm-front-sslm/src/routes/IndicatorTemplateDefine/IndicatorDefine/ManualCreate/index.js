/*
 * ManualCreate - 手工新建/编辑指标
 * @Date: 2023-10-08 11:15:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Table } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { TopSection, SecondSection } from '_components/Section';

import GeneralForm from '@/routes/components/GeneralForm';
import {
  getFormulaConfigColumns,
  getOptionsConfigColumns,
} from '../../stores/getIndicatorConfigDS';

const ManualCreate = observer(props => {
  const {
    type,
    remote,
    isEdit,
    record,
    onRef,
    remoteRef,
    indicatorFormDs,
    formulaConfigDs,
    optionsConfigDs,
  } = props;
  const { parentIndicatorId, scoreType, indicatorType } =
    indicatorFormDs.current?.get(['parentIndicatorId', 'scoreType', 'indicatorType']) || {};

  useEffect(() => {
    if (record) {
      if (indicatorType === 'OPT') {
        optionsConfigDs.query();
      } else if (scoreType === 'SYSTEM') {
        formulaConfigDs.query();
      }
    }
    if (remote && remote.event) {
      remote.event.fireEvent('cuxManualInit', { remoteRef });
    }
  }, [indicatorType, scoreType, record]);

  // 基础信息字段
  const basicFields = [
    {
      name: 'parentIndicatorName',
    },
    {
      name: 'indicatorCode',
    },
    {
      name: 'indicatorName',
      componentType: 'INTLFIELD',
    },
  ];
  const remoteBasicFields = remote
    ? remote.process('SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_BASIC_FIELDS', basicFields)
    : basicFields;

  // 指标信息字段
  const newIndicatorFields = [
    {
      name: 'scoreType',
      componentType: 'SELECT',
    },
    {
      name: 'indicatorType',
      componentType: 'SELECT',
    },
    {
      name: 'evalStandard',
      componentType: 'TEXTAREA',
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'scoreFrom',
      componentType: 'NUMBERFIELD',
    },
    {
      name: 'scoreTo',
      componentType: 'NUMBERFIELD',
    },
    {
      name: 'defaultScore',
      componentType: 'NUMBERFIELD',
      hidden: indicatorType !== 'SCORE',
    },
    {
      name: 'indicatorScore',
      componentType: 'NUMBERFIELD',
    },
    {
      name: 'isStandard',
      componentType: 'CHECKBOX',
      hidden: !['TICK', 'VETO'].includes(indicatorType),
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
    {
      name: 'benchmarkScore',
      componentType: 'NUMBERFIELD',
      hidden: ![-1, null].includes(parentIndicatorId),
      help: intl
        .get('spfm.supplierKpiIndicator.model.supplier.benchmarkScoreMsg')
        .d('最终分数=顶级指标基准分值+下级指标汇总分数'),
      showHelp: isEdit ? 'tooltip' : 'label',
    },
    {
      name: 'orderSeq',
      componentType: 'NUMBERFIELD',
    },
  ];
  const indicatorFields = remote
    ? remote.process('SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_INDICATOR_FIELDS', newIndicatorFields, {
        ...props,
      })
    : newIndicatorFields;

  const remoteRenderProps = {
    type,
    record,
    isEdit,
    onRef,
  };

  return (
    <>
      {type === 'EDIT' && (
        <Alert
          showIcon
          closable
          type="info"
          iconType="help"
          className="formula-config-alert"
          style={{ margin: '-20px -20px 16px' }}
          message={intl
            .get('spfm.supplierKpiIndicator.view.message.updateIndicatorNameMsg')
            .d('修改指标名称后，所有历史评分模板和业务单据中的指标名称将同步更新，请谨慎调整')}
        />
      )}
      <TopSection>
        <SecondSection
          code="baseInfo"
          title={intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        >
          <GeneralForm
            columns={2}
            isEdit={isEdit}
            fields={remoteBasicFields}
            useWidthPercent={false}
            dataSet={indicatorFormDs}
            style={{ marginBottom: 32 }}
          />
        </SecondSection>
        <SecondSection
          code="indicatorInfo"
          title={intl.get('sslm.common.view.title.indicatorInfo').d('指标信息')}
        >
          <GeneralForm
            columns={2}
            isEdit={isEdit}
            useWidthPercent={false}
            fields={indicatorFields}
            dataSet={indicatorFormDs}
            style={{ marginBottom: 32 }}
          />
        </SecondSection>
        {remote &&
          remote.render(
            'SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_EXTRA_RENDER',
            null,
            remoteRenderProps
          )}
        {indicatorType === 'OPT' && (
          <SecondSection
            code="optionsConfig"
            title={intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置')}
          >
            <Table
              dataSet={optionsConfigDs}
              buttons={isEdit ? ['add', 'delete'] : []}
              selectionMode={isEdit ? 'rowbox' : 'none'}
              columns={getOptionsConfigColumns({ isEdit })}
              customizedCode="SSLM.INDICATOR_TEMPLATE.OPTIONS_CONFIG"
            />
          </SecondSection>
        )}
        {scoreType === 'SYSTEM' && (
          <SecondSection
            code="formulaConfig"
            title={intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
          >
            {isEdit && (
              <Alert
                showIcon
                closable
                type="info"
                iconType="help"
                className="formula-config-alert"
                message={intl
                  .get('spfm.supplierKpiIndicator.view.button.formulaConfigMsg')
                  .d('【系统计算】类型的指标必须要且仅可维护一个启用状态的公式')}
              />
            )}
            <Table
              dataSet={formulaConfigDs}
              buttons={isEdit ? ['add', 'delete'] : []}
              selectionMode={isEdit ? 'rowbox' : 'none'}
              columns={getFormulaConfigColumns({ isEdit, type })}
              customizedCode="SSLM.INDICATOR_TEMPLATE.FORMULA_CONFIG"
            />
          </SecondSection>
        )}
      </TopSection>
    </>
  );
});

export default ManualCreate;
