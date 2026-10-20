import React, { Component } from 'react';
import {
  Table,
  Button,
  Form,
  TextField,
  Select,
  Switch,
  IconPicker,
  NumberField,
  DataSet,
  Lov,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Card } from 'hzero-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';

const isTenantRole = isTenantRoleLevel();
const tenantLovDs = new DataSet({
  autoCreate: true,
  fields: [
    {
      name: 'tenantLov',
      type: 'object',
      multiple: true,
      label: intl.get('hzero.common.model.common.tenant').d('租户'),
      lovCode: 'HPFM.TENANT',
    },
  ],
});

export default class LableModal extends Component {
  constructor(props) {
    super(props);
    const { record } = this.props;
    const showTenantLine = record.get('level') === 'TENANT';
    this.state = { showTenantLine };
  }

  handleAddTenant = (value = []) => {
    const { tenantLineDs } = this.props;
    const allData = tenantLineDs.toData().map((ele) => ele.assignValueId) || [];

    if (value) {
      let newAssignValue = value;
      if (allData.length > 0) {
        newAssignValue = value.filter((ele) => !allData.includes(Number(ele.tenantId)));
      }
      newAssignValue.forEach((element) => {
        tenantLineDs.create(
          filterNullValueObject({
            ...element,
            tenantId: null,
            assignValueId: Number(element.tenantId),
          })
        );
      });
    }
    tenantLovDs.reset();
  };

  handleDelete = () => {
    const { tenantLineDs } = this.props;
    const { selected } = tenantLineDs;
    const deleteLine = selected.filter((ele) => ele.status !== 'add');
    deleteLine.forEach((ele) => {
      ele.set({ actionType: 0 });
    });
    tenantLineDs.delete(selected);
  };

  render() {
    const { showTenantLine } = this.state;
    const { record, tenantLineDs } = this.props;
    const col = [{ name: 'tenantNum' }, { name: 'tenantName' }];
    const buttons = [
      <Lov
        noCache
        icon="add"
        dataSet={tenantLovDs}
        mode="button"
        name="tenantLov"
        clearButton={false}
        onChange={(value = {}) => this.handleAddTenant(value)}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </Lov>,
      <Button key="delete" funcType="flat" icon="delete" onClick={() => this.handleDelete()}>
        {intl.get('hzero.common.button.toDelete').d('删除')}
      </Button>,
    ];
    return (
      <div>
        <Form columns={1} record={record} labelAlign="left" labelWidth={100}>
          <TextField name="labelCode" />
          <TextField name="labelName" />
          <TextField name="labelDescription" />
          <Lov name="docLabelEntityList" />
          <IconPicker
            name="icon"
            icons={[
              'notification_important-o',
              'new_releases-o',
              'offline_bolt-o',
              'notifications_active-o',
              'speaker_notes_off-o',
              'publish_cancel',
              'agile_epic',
              'trending_up',
              'trending_down',
              'report',
              'lock_outline',
              'operation_change',
              'operation_event',
              'operation_problem',
              'priority',
              'sync_disabled',
              'sync_problem',
              'sentiment_very_dissatisfied',
              'swap_vertical_circle',
            ]}
          />
          {!isTenantRole && (
            <Select
              name="level"
              disabled={isTenantRole}
              onChange={(value) => {
                this.setState({ showTenantLine: value === 'TENANT' });
              }}
            />
          )}
          <Switch name="enabledFlag" />
          <NumberField name="orderSeq" />
        </Form>
        {showTenantLine && !isTenantRole && (
          <Card
            key="surfaceTable"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>{intl.get('spfm.docTransferDefin.model.view.tenantTable').d('租户维护')}</h3>
            }
          >
            <Table dataSet={tenantLineDs} columns={col} buttons={buttons} />
          </Card>
        )}
      </div>
    );
  }
}
