import React, { Component } from 'react';
import { Form, DatePicker, Lov, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

export default class BatchMaintainItemForm extends Component {
  componentWillUnmount() {
    const { clearProperties = () => {}, rfx = {} } = this.props;
    const { sourceKey } = rfx;

    clearProperties(function clearCache() {
      this.cache[`SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_ITEM_FORM`] = {};
      this.cache[`SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_ITEM_FORM`].computeRes = {};
    }, []);
  }

  render() {
    const {
      customizeForm,
      custLoading,
      BatchMaintainItemDS,
      expandCompanyVisible,
      expandInvOrganizationVisible,
      rfx = {},
      tableDs = {},
      remote,
    } = this.props;
    const { sourceKey } = rfx;

    const _fields = [
      <DatePicker name="demandDate" />,
      <Lov name="taxIdLov" />,
      <Lov name="ouIdLov" />,
      <Lov name="invOrganizationIdLov" />,
      <Lov
        name="projectTaskId"
        tableProps={{
          selectionMode: 'rowbox',
          virtual: true,
          style: {
            maxHeight: '500px',
          },
        }}
      />,
      <Lov
        name="expandCompany"
        hidden={!expandCompanyVisible}
        onChange={this.changeExpandCompany}
      />,
      <Lov name="expandInvOrganization" hidden={!expandInvOrganizationVisible} />,
    ];
    const fields = remote
      ? remote?.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_BATCHEDIT_FIELDS',
          _fields,
          { BatchMaintainItemDS, custLoading, expandCompanyVisible }
        )
      : _fields;
    const form = (
      <Form dataSet={BatchMaintainItemDS} columns={1} custLoading={custLoading} labelLayout="float">
        {fields}
      </Form>
    );

    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 10px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
            marginBottom: '20px',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(tableDs.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllPageDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: tableDs.selected.length,
                })
                .d(`已勾选${tableDs.selected.length}条数据进行批量编辑`)}
        </div>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_ITEM_FORM`,
            dataSet: BatchMaintainItemDS,
          },
          remote
            ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_ITEMLINETABLE_PROCESS_BATCHEDIT', form, {
                dataSet: BatchMaintainItemDS,
                custLoading,
              })
            : form
        )}
      </div>
    );
  }
}
