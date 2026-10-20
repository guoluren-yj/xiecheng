import React, { useCallback } from 'react';
import { Table, Modal, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';
import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';

import {
  historyDiffRenderComp,
  ComponentDiffRender,
} from '@/routes/ssrc/InquiryHallNew/RFController/utils.js';
import styles from '../../rfComponents/common.less';

import Style from './index.less';

const ScoringElements = observer((props) => {
  const {
    customizeTable,
    customizeCollapseForm,
    businessIndicateDs,
    techIndicateDs,
    noneIndicateDs,
    expertModalDs,
    consultationDs,
    getCustomizeUnitCode,
    viewType,
  } = props;

  const { current } = consultationDs || {};
  const { scoreType, bidRuleType } = current ? current.get(['scoreType', 'bidRuleType']) : {};

  // 分配专家
  const handleAssignExpertModal = (record = {}) => {
    const { rfIndicateAdjustId, rfHeaderAdjustId, indicateType } = record.get([
      'rfIndicateAdjustId',
      'rfHeaderAdjustId',
      'indicateType',
    ]);
    const unitCode = getCustomizeUnitCode('indicateAssign', viewType);
    expertModalDs.setQueryParameter('rfIndicateAdjustId', rfIndicateAdjustId);
    expertModalDs.setQueryParameter('rfHeaderAdjustId', rfHeaderAdjustId);
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
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      // 仅打分制评分要素允许输入
      indicateType === 'SCORE'
        ? {
            name: 'expertWeight',
            width: 120,
          }
        : null,
    ];

    Modal.open({
      destroyOnClose: true,
      key: Modal.key(),
      title: intl.get(`ssrc.rf.model.rf.assignExpert`).d('分配专家'),
      children: customizeTable(
        {
          code: unitCode,
          dataSet: expertModalDs,
        },
        <Table border dataSet={expertModalDs} columns={expertColumns} />
      ),
      style: { width: '742px' },
      drawer: true,
      afterClose: () => {
        expertModalDs.loadData([]);
      },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const getColumns = useCallback(() => {
    return [
      {
        name: 'indicateCode',
        width: 180,
        renderer: ({ record, dataSet }) => {
          return historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateCode');
        },
      },
      {
        name: 'indicateName',
        width: 180,
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateName'),
      },
      {
        name: 'indicateType',
        width: 150,
        renderer: ({ record, dataSet, text }) => {
          return historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateType', text);
        },
      },
      scoreType === 'WEIGHT'
        ? {
            name: 'indicateWeight',
            width: 120,
            renderer: ({ record, dataSet }) =>
              historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateWeight'),
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(scoreType)
        ? {
            name: 'minScore',
            width: 120,
            renderer: ({ record, dataSet }) =>
              historyDiffRenderComp(record, dataSet, 'rfIndicate', 'minScore'),
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(scoreType)
        ? {
            name: 'maxScore',
            width: 120,
            renderer: ({ record, dataSet }) =>
              historyDiffRenderComp(record, dataSet, 'rfIndicate', 'maxScore'),
          }
        : null,
      {
        name: 'indicateRemark',
        renderer: ({ record, dataSet }) =>
          historyDiffRenderComp(record, dataSet, 'rfIndicate', 'indicateRemark'),
      },
      {
        width: 100,
        name: 'expertDistribute',
        renderer: ({ record = {} }) => {
          const { parentRfIndicateId, tempIndicateId } = record.get([
            'parentRfIndicateId',
            'tempIndicateId',
          ]);
          if (parentRfIndicateId) {
            return '';
          }

          return (
            <React.Fragment>
              {!tempIndicateId && !parentRfIndicateId && (
                <a onClick={() => handleAssignExpertModal(record)}>
                  {intl.get(`ssrc.rf.view.message.button.distribution`).d('分配专家')}
                </a>
              )}
            </React.Fragment>
          );
        },
      },
    ];
  }, [current]);

  return (
    <React.Fragment>
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
      </h3>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('scoreTemp', viewType),
          dataSet: consultationDs,
        },
        <CollapseForm dataSet={consultationDs} columns={3} labelLayout="float" useWidthPercent>
          <ComponentDiffRender
            name="scoreTemplateCode"
            special
            record={consultationDs}
            historyDTO="rfConfRuleOriginalDTO"
          >
            <Output
              name="scoreTemplateCode"
              renderer={({ text }) => (text ? <div> {text} </div> : '')}
            />
          </ComponentDiffRender>
        </CollapseForm>
      )}

      {bidRuleType === 'DIFF' ? (
        <React.Fragment>
          <div className={Style['score-element-header']}>
            <h4 className={Style['score-title']}>
              {intl.get('ssrc.rfController.model.technology.group').d('技术组')}
              {scoreType !== 'SCORE_NEW' ? (
                <span className={Style['tech-input']}>
                  （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
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
                    {'%'})
                  </>
                </span>
              ) : null}
            </h4>
          </div>
          {customizeTable(
            {
              code: getCustomizeUnitCode('tech', viewType),
              dataSet: techIndicateDs,
            },
            <Table
              mode="tree"
              dataSet={techIndicateDs}
              columns={getColumns()}
              style={{ maxHeight: '4.5rem' }}
            />
          )}
          <div className={Style['score-element-header']}>
            <h4 className={Style['score-title']}>
              {intl.get('ssrc.rfController.model.business.group').d('商务组')}
              {scoreType !== 'SCORE_NEW' ? (
                <span className={Style['tech-input']}>
                  （{intl.get('ssrc.rf.view.card.subtitle.weight').d('权重')}
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
                    {'%'})
                  </React.Fragment>
                </span>
              ) : null}
            </h4>
          </div>
          {customizeTable(
            {
              code: getCustomizeUnitCode('business', viewType),
              dataSet: businessIndicateDs,
            },
            <Table
              mode="tree"
              dataSet={businessIndicateDs}
              columns={getColumns()}
              style={{ maxHeight: '4.5rem' }}
            />
          )}
        </React.Fragment>
      ) : (
        customizeTable(
          {
            code: getCustomizeUnitCode('indicate', viewType),
            dataSet: noneIndicateDs,
          },
          <Table
            mode="tree"
            dataSet={noneIndicateDs}
            columns={getColumns()}
            style={{ maxHeight: '4.5rem' }}
          />
        )
      )}
    </React.Fragment>
  );
});

export default ScoringElements;
