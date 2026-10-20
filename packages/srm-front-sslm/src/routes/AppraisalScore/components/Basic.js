/*
 * @Date: 2023-10-20 17:14:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { renderStatus } from '@/routes/components/utils';
import GeneralForm from '@/routes/components/GeneralForm';
import { rangeDateRender } from '@/routes/components/utils/utils';
import styles from '../index.less';

const Basic = observer(({ dataSet, custLoading, customizeForm }) => {
  const { evalTplType } = dataSet?.current?.get(['evalTplType']) || {};

  const fields = [
    {
      name: 'evalNum',
    },
    {
      name: 'evalName',
    },
    {
      name: 'evalStatusMeaning',
      renderer: renderStatus,
    },
    {
      name: 'evalTplName',
    },
    {
      name: 'evalDimensionMeaning',
    },
    {
      name: 'evalDimensionValueMeaning',
    },
    {
      name: 'evalCycleMeaning',
    },
    {
      name: 'createdUserName',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'evalDate',
      renderer: ({ record }) => {
        const { evalDateFrom, evalDateTo } = record?.get(['evalDateFrom', 'evalDateTo']) || {};
        return rangeDateRender(evalDateFrom, evalDateTo, DEFAULT_DATE_FORMAT);
      },
    },
    {
      name: 'docTypeMeaning',
      hidden: evalTplType !== 'BDKPI_EVAL',
    },
    {
      name: 'docNum',
      hidden: evalTplType !== 'BDKPI_EVAL',
    },
    {
      name: 'evalRuleRemark',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
    },
    {
      name: 'remark',
      newLine: true,
      rows: 3,
      cols: 2,
      colSpan: 2,
      resize: 'vertical',
    },
  ];

  return (
    <Fragment>
      <div className={styles['score-card']}>
        <div className={styles['card-title']}>
          {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        </div>
        <GeneralForm
          dataSet={dataSet}
          fields={fields}
          isEdit={false}
          custLoading={custLoading}
          customizeForm={customizeForm}
          customizeUnitCode="SSLM.SCORING_WORKBENCH_DETAIL.BASIC"
        />
      </div>
    </Fragment>
  );
});

export default Basic;
