/**
 * FinanceInfo - 财务信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from '../../index.less';

const FinanceInfo = ({
  dataSet,
  isEdit,
  changeReqId,
  finInfo = {},
  showAllTab = true,
  remoteHiddenTips = false,
}) => {
  const { remark, atLeastFlag: atLeast = 1, enableFieldList = [] } = finInfo;
  const showTips = isEdit && !showAllTab && !!atLeast && !remoteHiddenTips;

  useEffect(() => {
    if (changeReqId) {
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
  }, [changeReqId]);

  const columns = [
    {
      name: 'year',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'currencyLov',
      width: 140,
      editor: isEdit,
    },
    {
      name: 'totalAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'totalLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'revenue',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'netProfit',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'assetLiabilityRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'currentRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'totalAssetsEarningsRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });
  const buttons = isEdit
    ? [
        'add',
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Content>
      <div className={styles['certification-title']} id="spfm_company_fin">
        {intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息')}
        {showTips && (
          <span className={styles['certification-title-tips']}>
            {intl
              .get('spfm.enterpriseCertification.view.register.financeAtLast', {
                atLeast,
              })
              .d(`请至少填写${atLeast}条财务信息`)}
          </span>
        )}
      </div>
      {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={buttons}
        selectionMode={isEdit ? 'rowbox' : 'click'}
      />
    </Content>
  );
};

export default FinanceInfo;
