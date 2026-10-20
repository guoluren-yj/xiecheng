import React, { Fragment, useContext, useCallback, useEffect, useMemo } from 'react';
import { Table, Output, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../../store/index';
import styles from '../../../rfComponents/common.less';

export default observer(function RuleCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: {
      ruleFormDs,
      expertTableDs,
      techIndicateDs,
      expertModalDs,
      businessIndicateDs,
      noneIndicateDs,
    },
    customizeCollapseForm,
    customizeTable,
  } = useContext(Store);

  const { current } = ruleFormDs;

  useEffect(() => {
    ruleFormDs.query();
  }, []);

  // 监听专家评分以及要素查询
  useEffect(() => {
    if (ruleFormDs?.current?.get('expertScoreType') === 'ONLINE') {
      expertTableDs.query();
      if (ruleFormDs?.current?.get('bidRuleType') === 'DIFF') {
        techIndicateDs.query();
        businessIndicateDs.query();
      } else if (ruleFormDs?.current?.get('bidRuleType') === 'NONE') {
        noneIndicateDs.query();
      }
    }
  }, [ruleFormDs?.current?.get('expertScoreType')]);

  // 渲染报价运行时间
  const renderDurationTime = useCallback(
    (record = {}, field = null) => {
      if (!field) {
        return null;
      }

      let quoteDay = 0;
      let quoteHour = 0;
      let quoteMinute = 0;
      const Times = record.get(field) || null;

      const setFields = () => {
        const DayMeaning =
          quoteDay +
          intl.get('hzero.common.date.unit.day').d('天') +
          quoteHour +
          intl.get('hzero.common.date.unit.hours').d('小时') +
          quoteMinute +
          intl.get('hzero.common.date.unit.minutes').d('分钟');

        return DayMeaning;
      };

      if (!Times && Times !== 0) {
        setFields();
        return;
      }

      quoteDay = Math.floor(Times / 1440);
      quoteHour =
        quoteDay > 0
          ? Math.floor((Times - quoteDay * 1440) / 60)
          : Times
          ? Math.floor(Times / 60)
          : Times;
      quoteMinute =
        quoteHour > 0 || quoteDay > 0 ? Times - quoteDay * 1440 - quoteHour * 60 : Times;

      quoteMinute = quoteMinute.toFixed(2);
      return setFields();
    },
    [current?.get('quotationRunningDuration')]
  );

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
      },
      // 仅打分制评分要素允许输入
      record?.get('indicateType') === 'SCORE'
        ? {
            name: 'expertWeight',
            width: 150,
          }
        : null,
    ];

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get(`ssrc.rfDetail.model.rfDetail.assignExpert`).d('分配专家'),
      children: customizeTable(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_ASSIGN_${sourceCategory}`,
        },
        <Table border dataSet={expertModalDs} columns={expertColumns} />
      ),
      style: { width: '742px' },
      drawer: true,
      onOk: async () => {
        await expertModalDs.submit();
      },
      onCancel: () => {},
    });
  };

  const expertColumns = useMemo(
    () =>
      [
        {
          name: 'loginName',
          width: 150,
        },
        {
          name: 'expertName',
        },
        {
          name: 'expertRole',
          width: 150,
        },
        current?.get('bidRuleType') !== 'NONE'
          ? {
              name: 'scoreCategory',
              width: 150,
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
    () =>
      [
        {
          name: 'indicateCode',
          width: 180,
        },
        {
          name: 'indicateName',
          width: 200,
          tooltip: 'overflow',
        },
        {
          name: 'indicateTypeMeaning',
          width: 120,
        },
        current?.get('scoreType') === 'WEIGHT'
          ? {
              name: 'indicateWeight',
              width: 120,
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? {
              name: 'minScore',
              width: 120,
            }
          : null,
        ['SCORE', 'SCORE_NEW'].includes(current?.get('scoreType'))
          ? {
              name: 'maxScore',
              width: 120,
            }
          : null,
        {
          name: 'indicateRemark',
          tooltip: 'overflow',
        },
        {
          name: 'assignedExperts',
          width: 120,
        },
        {
          name: 'expertDistribute',
          header: intl.get('hzero.common.action').d('操作'),
          width: 150,
          renderer: ({ record = {} }) => {
            return (
              <Fragment>
                {!record?.get('tempIndicateId') && record?.get('parentRfIndicateId') === null && (
                  <a onClick={() => handleAssignExpertModal(record)}>
                    {intl.get(`ssrc.rfDetail.view.message.button.distribution`).d('分配专家')}
                  </a>
                )}
              </Fragment>
            );
          },
        },
      ].filter(Boolean),
    [current?.get('scoreType')]
  );

  return (
    <Fragment>
      <h3 className={styles['card-sub-title']} style={{ marginTop: '16px' }}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rfDetail.view.card.subtitle.processNode').d('流程节点设置')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_NODE_${sourceCategory}`,
          dataSet: ruleFormDs,
        },
        <CollapseForm
          dataSet={ruleFormDs}
          columns={3}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output name="expertScoreType" />
        </CollapseForm>
      )}
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rfDetail.view.card.subtitle.consultationStage').d('征询阶段')}
      </h3>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_STAGE_${sourceCategory}`,
          dataSet: ruleFormDs,
        },
        <CollapseForm
          dataSet={ruleFormDs}
          columns={3}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output name="startFlag" renderer={({ value }) => yesOrNoRender(value)} />
          {current?.get('startFlag') && (
            <Output
              name="quotationRunningDuration"
              renderer={({ record: currentRecord }) =>
                renderDurationTime(currentRecord, 'quotationRunningDuration')
              }
            />
          )}
          {!current?.get('startFlag') && [
            <Output name="quotationStartDate" />,
            <Output name="quotationEndDate" />,
          ]}
          {current?.get('lineItemsFlag') && [
            <Output name="currencyCode" />,
            <Output name="multiCurrencyFlag" renderer={({ value }) => yesOrNoRender(value)} />,
          ]}
          <Output name="replyType" />,
          <Output name="clarifyEndDate" />,
        </CollapseForm>
      )}
      {current?.get('expertScoreType') === 'ONLINE' ? (
        <Fragment>
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.expert').d('专家组')}
          </h3>
          {customizeCollapseForm(
            {
              code: `SSRC.INQUIRY_HALL_RF_DETAIL.CONF_RULE_EXPERT_${sourceCategory}`,
              dataSet: ruleFormDs,
            },
            <CollapseForm
              dataSet={ruleFormDs}
              columns={3}
              labelLayout="vertical"
              labelAlign="left"
              className="c7n-pro-vertical-form-display"
              useWidthPercent
            >
              <Output name="bidRuleType" />
              {current?.get('bidRuleType') === 'DIFF' && <Output name="openBidOrder" />}
              <Output name="scoreType" />
            </CollapseForm>
          )}
          {customizeTable(
            {
              code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_EXPERTS_${sourceCategory}`,
            },
            <Table dataSet={expertTableDs} columns={expertColumns} style={{ marginTop: '16px' }} />
          )}
          <h3 className={styles['card-sub-title']}>
            <div className={styles['card-sub-title-line']} />
            {intl.get('ssrc.rfDetail.view.card.subtitle.scoreIndics').d('评分要素')}
          </h3>
          {customizeCollapseForm(
            {
              code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_CONFIG_${sourceCategory}`,
              dataSet: ruleFormDs,
            },
            <CollapseForm
              dataSet={ruleFormDs}
              columns={3}
              labelLayout="vertical"
              labelAlign="left"
              className="c7n-pro-vertical-form-display"
              useWidthPercent
            >
              <Output name="scoreTemplateCode" />
            </CollapseForm>
          )}
          {current?.get('bidRuleType') === 'DIFF' ? (
            <Fragment>
              <h4 style={{ marginTop: '12px' }}>
                {intl.get('ssrc.rfDetail.view.card.subtitle.techScoreIndics').d('技术组')}
                {current.get('scoreType') !== 'SCORE_NEW' ? (
                  <span style={{ marginLeft: '8px', fontWeight: '400' }}>
                    （{intl.get('ssrc.rfDetail.view.card.subtitle.weight').d('权重')}
                    <Output
                      record={current}
                      name="technologyWeight"
                      style={{ marginLeft: '2px' }}
                      renderer={({ text }) => `${text}%`}
                    />
                    ）
                  </span>
                ) : null}
              </h4>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_TECH_${sourceCategory}`,
                },
                <Table mode="tree" dataSet={techIndicateDs} columns={scoreElementColumns()} />
              )}
              <h4 style={{ marginTop: '16px' }}>
                {intl.get('ssrc.rfDetail.view.card.subtitle.busScoreIndics').d('商务组')}
                {current.get('scoreType') !== 'SCORE_NEW' ? (
                  <span style={{ marginLeft: '8px', fontWeight: '400' }}>
                    （{intl.get('ssrc.rfDetail.view.card.subtitle.weight').d('权重')}
                    <Output
                      record={current}
                      name="businessWeight"
                      style={{ marginLeft: '2px' }}
                      renderer={({ text }) => `${text}%`}
                    />
                    ）
                  </span>
                ) : null}
              </h4>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_BUSI_${sourceCategory}`,
                },
                <Table mode="tree" dataSet={businessIndicateDs} columns={scoreElementColumns()} />
              )}
            </Fragment>
          ) : (
            customizeTable(
              {
                code: `SSRC.INQUIRY_HALL_RF_DETAIL.SCORE_INDICATES_${sourceCategory}`,
              },
              <Table
                mode="tree"
                dataSet={noneIndicateDs}
                columns={scoreElementColumns()}
                style={{ marginTop: '16px' }}
              />
            )
          )}
        </Fragment>
      ) : null}
    </Fragment>
  );
});
