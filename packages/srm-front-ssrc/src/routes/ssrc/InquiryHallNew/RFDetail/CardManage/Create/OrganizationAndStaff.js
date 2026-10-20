import React, { Fragment, useMemo, useContext, useEffect } from 'react';
import { Table, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { yesOrNoRender } from 'utils/renderer';

import Store from '../../store/index';
import styles from '../../../rfComponents/common.less';

export default function OrganizationAndStaffCard() {
  const {
    routerParams: { sourceCategory },
    commonDs: { createBasicFormDs, sourceGroupDs },
    customizeCollapseForm,
    customizeTable,
  } = useContext(Store);

  useEffect(() => {
    sourceGroupDs.query();
  }, []);

  const columns = useMemo(
    () => [
      {
        name: 'loginName',
        width: 180,
      },
      {
        name: 'contactName',
        width: 250,
      },
      {
        name: 'contactMail',
        width: 250,
      },
      {
        name: 'contactPhone',
        renderer: ({ record, text }) =>
          [
            record.getField('internationalTelCode')?.getText(record.get('internationalTelCode')),
            text,
          ]
            .filter(Boolean)
            .join(' | '),
      },
      {
        name: 'publicContactFlag',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ],
    []
  );

  return (
    <Fragment>
      {customizeCollapseForm(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.HEADER_ORG_${sourceCategory}`,
          dataSet: createBasicFormDs,
        },
        <CollapseForm
          dataSet={createBasicFormDs}
          columns={3}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          useWidthPercent
        >
          <Output name="companyName" />
          <Output name="unitName" />
          <Output name="purOrganizationName" />
          <Output name="purAgentName" />
        </CollapseForm>
      )}
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rfDetail.view.card.subtitle.sourceGroup').d('寻源小组')}
      </h3>
      {customizeTable(
        {
          code: `SSRC.INQUIRY_HALL_RF_DETAIL.MEMBER_${sourceCategory}`,
        },
        <Table dataSet={sourceGroupDs} columns={columns} />
      )}
    </Fragment>
  );
}
