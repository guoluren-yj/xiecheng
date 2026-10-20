import React, { useCallback } from 'react';
import { Table, useDataSet, Spin, Output } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';

import { ruleDS, tableDS } from './store';
import style from '../common.less';

export default observer(function Content(props) {
  const {
    sourceFrom = 'RFX',
    sourceFromId = '',
    customizeCollapseForm = noop,
    customizeTable = noop,
  } = props || {};

  const ruleDs = useDataSet(() => ruleDS({ sourceFrom, sourceFromId }), []);
  const tableDs = useDataSet(() => tableDS({ sourceFrom, sourceFromId }), []);

  const getColumns = useCallback(
    () => [
      {
        name: 'expertSubAccount',
        width: 100,
        lock: 'left',
      },
      {
        name: 'expertName',
        width: 110,
        lock: 'left',
      },
      {
        name: 'expertCategoryMeaning',
        width: 120,
      },
      {
        name: 'expertLevelMeaning',
        width: 80,
      },
      {
        name: 'expertTypeMeaning',
        width: 80,
      },
      {
        name: 'replyStatusMeaning',
        width: 100,
      },
      {
        name: 'replyContent',
        width: 200,
      },
      {
        name: 'realStatusMeaning',
        width: 130,
      },
      {
        name: 'roundNumber',
        width: 80,
      },
      {
        name: 'replyStartTime',
        width: 150,
      },
      {
        name: 'replyEndTime',
        width: 150,
      },
    ],
    []
  );

  return (
    <div className={style['extract-experts']}>
      <Spin spinning={ruleDs?.status === 'loading' || tableDs?.status === 'loading'}>
        <div className={classnames('module-line', 'module-line-rule')}>
          {intl.get('ssrc.expertExtract.view.title.extractRules').d('抽取规则')}
        </div>
        {customizeCollapseForm(
          {
            code: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.RULES_DETAIL`,
            dataSet: ruleDs,
          },
          <CollapseForm
            dataSet={ruleDs}
            columns={3}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
          >
            <Output name="expectQuantity" />
            <Output name="replyDuration" />
            <Output name="expertLevelMeaning" />
            <Output name="expertTypeMeaning" />
            <Output name="countryName" />
            <Output name="provinceIdsMeaning" />
            <Output name="cityIdsMeaning" />
            <Output name="itemCategoriesMeaning" />
          </CollapseForm>
        )}
        <div
          className={classnames('module-line', 'module-line-expert')}
          style={{ marginBottom: '16px' }}
        >
          {intl.get('ssrc.expertExtract.view.title.extractExperts').d('抽取专家')}
        </div>
        {customizeTable(
          {
            code: `SSRC.INQUIRY_HALL_RANDOM_EXTRACT.EXPERTS_DETAIL`,
          },
          <Table dataSet={tableDs} columns={getColumns()} style={{ maxHeight: '430px' }} />
        )}
      </Spin>
    </div>
  );
});
