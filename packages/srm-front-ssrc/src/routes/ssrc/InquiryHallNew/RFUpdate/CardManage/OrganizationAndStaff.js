import React, { Fragment, useMemo, useContext } from 'react';
import { Lov, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import Store from '../store/index';
import styles from '../../rfComponents/common.less';

export default observer(function OrganizationAndStaffCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { basicFormDs, sourceGroupDs, ruleFormDs },
    ref: { organizationRef },
    customizeCollapseForm,
    customizeTable,
  } = useContext(Store);

  // 改变公司
  const changeCompany = (value) => {
    if (value) {
      const { currencyCode } = value || {};
      // 物料存在=》币种存在
      if (ruleFormDs.current?.get('lineItemsFlag')) {
        ruleFormDs.current.set({
          currencyCode,
        });
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'loginNameLov',
        editor: true,
        width: 180,
      },
      {
        name: 'contactName',
        editor: true,
        width: 250,
      },
      {
        name: 'contactMail',
        editor: true,
        width: 250,
      },
      {
        name: 'contactPhone',
        editor: true,
      },
      {
        name: 'publicContactFlag',
        editor: true,
        width: 130,
      },
    ],
    []
  );

  const handleDeleteItem = (ds = {}) => {
    const data = ds.selected;
    ds.delete(data, {
      title: intl.get('ssrc.common.message.tip').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
  };

  return (
    <Fragment>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL.RF_EDIT.ORGANIZATION_${sourceCategory}`,
          dataSet: basicFormDs,
        },
        <CollapseForm
          dataSet={basicFormDs}
          columns={3}
          labelLayout="float"
          formRef={ref => {
            organizationRef.current = ref;
          }}
          useWidthPercent
        >
          <Lov name="companyLov" onChange={changeCompany} />
          <Lov name="unitLov" />
          <Lov name="purOrganizationIdLov" />
          <Lov name="purchaseLov" />
        </CollapseForm>
      )}
      <h3 className={styles['card-sub-title']} style={{ marginBottom: '16px' }}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rf.view.card.subtitle.sourceGroup').d('寻源小组')}
      </h3>
      {customizeTable(
        {
          code: `SSRC.INQUIRY_HALL.RF_EDIT.MEMBER_${sourceCategory}`,
        },
        <Table
          dataSet={sourceGroupDs}
          columns={columns}
          buttons={useMemo(
            () => [
              'add',
              <TooltipButtonPro
                name="delete"
                icon="delete_sweep"
                disabled={isEmpty(sourceGroupDs.selected)}
                onClick={() => handleDeleteItem(sourceGroupDs)}
                help={intl.get('ssrc.common.view.message.source-group-line.select.tip').d('请先勾选寻源小组成员')}
              >
                {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
              </TooltipButtonPro>,
              'save',
            ],
            [sourceGroupDs?.selected]
          )}
        />
      )}
    </Fragment>
  );
});
