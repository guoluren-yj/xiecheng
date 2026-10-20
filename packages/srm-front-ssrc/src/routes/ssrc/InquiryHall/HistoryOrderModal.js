import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

export default class historyOrderModal extends Component {
  componentDidMount() {
    this.props.tableDs.query();
  }

  render() {
    const { tableDs, bidFlag } = this.props;
    const listLineColumns = [
      {
        name: 'rfxStatusMeaning',
        width: 100,
      },
      {
        name: 'rfxNum',
        width: 150,
      },
      {
        name: 'rfxTitle',
        width: 180,
      },
      {
        name: 'purOrganizationName',
        width: 120,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'preQualificationFlag',
        width: 100,
        renderer: ({ value }) => <span> {yesOrNoRender(value)}</span>,
      },
      {
        name: 'expertScoreFlag',
        width: 100,
        renderer: ({ value }) => <span> {yesOrNoRender(value)}</span>,
      },
      {
        name: 'templateName',
        width: 120,
      },
      !bidFlag
        ? {
            name: 'sourceCategoryMeaning',
            width: 120,
          }
        : null,
      {
        name: 'sourceMethodMeaning',
        width: 120,
      },
      {
        name: 'quotationTypeMeaning',
        width: 120,
      },
      {
        name: 'sealedQuotationFlag',
        width: 120,
        renderer: ({ value }) => <span> {yesOrNoRender(value)}</span>,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 120,
      },
      {
        name: 'createdByName',
        width: 100,
      },
      {
        name: 'createdUnitName',
        width: 100,
      },
    ].filter(Boolean);

    return <Table dataSet={tableDs} queryFieldsLimit={3} columns={listLineColumns} />;
  }
}
