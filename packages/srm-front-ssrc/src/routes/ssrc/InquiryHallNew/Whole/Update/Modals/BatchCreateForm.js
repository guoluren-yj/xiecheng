/**
 * 批量创建物料表单
 */

import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, Lov, NumberField, Switch, DatePicker } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';

class BatchCreateItemForm extends PureComponent {
  changeLnvOrganizationIdLov(value, preValue) {
    if (isEmpty(value)) {
      if (isArray(preValue)) {
        if (!isEmpty(preValue[0]?.invOrganizationId)) {
          return;
        }
      } else if (!isEmpty(preValue?.invOrganizationId)) {
        return;
      }
    }
    const { dataSet } = this.props;
    const record = dataSet.current;
    let currentValue;
    if (isArray(value)) {
      currentValue = value || [];
    } else {
      currentValue = value || {};
    }
    if (isArray(value)) {
      record.set('invOrganizationIdLov', currentValue);
      record.set(
        'invOrganizationName',
        currentValue && currentValue.map((r) => r.organizationName)
      );
      record.set('invOrganizationId', currentValue && currentValue.map((r) => r.organizationId));
      if (currentValue.length > 1) {
        record.set('ouName', null);
        record.set('ouId', null);
      } else if (currentValue.length === 1) {
        record.set('ouName', currentValue[0].ouName);
        record.set('ouId', currentValue[0].ouId);
      }
    } else if (!isEmpty(currentValue)) {
      record.set('invOrganizationIdLov', [currentValue]);
      record.set('invOrganizationName', [currentValue.organizationName]);
      record.set('invOrganizationId', [currentValue.organizationId]);
      record.set('ouName', currentValue.ouName);
      record.set('ouId', currentValue.ouId);
    } else {
      record.set('invOrganizationIdLov', []);
      record.set('invOrganizationName', []);
      record.set('invOrganizationId', []);
    }
    record.set('itemIdLov', null);
    record.set('itemIds', null);
  }

  changeItemIdLov(value) {
    const { dataSet } = this.props;
    const record = dataSet.current;
    let currentValue;
    if (isArray(value)) {
      currentValue = value || [];
    } else {
      currentValue = value || {};
    }
    const invOrganizationIdLov = record.get('invOrganizationIdLov') || [];
    const invOrganizationName = record.get('invOrganizationName') || [];
    const invOrganizationId = record.get('invOrganizationId') || [];
    if (!isEmpty(value) && isArray(value)) {
      record.set('itemIds', currentValue && currentValue.map((r) => r.partnerItemId));
      record.set(
        'invOrganizationIdLov',
        invOrganizationIdLov?.length ? invOrganizationIdLov[0] : invOrganizationIdLov || {}
      );
      record.set(
        'invOrganizationName',
        isArray(invOrganizationName) ? invOrganizationName[0] : invOrganizationName || ''
      );
      record.set(
        'invOrganizationId',
        invOrganizationId?.length ? invOrganizationId[0] : invOrganizationId || ''
      );
    } else {
      record.set('itemIds', currentValue.partnerItemId);
    }
    if (isEmpty(value)) {
      if (!isArray(invOrganizationId)) {
        record.set('invOrganizationIdLov', [invOrganizationIdLov] || []);
        record.set('invOrganizationName', [invOrganizationName] || []);
        record.set('invOrganizationId', [invOrganizationId] || []);
      }
    }
  }

  render() {
    const { dataSet, customizeForm, doubleUnitFlag = false, customizeUnitCode } = this.props;

    return customizeForm(
      {
        code: customizeUnitCode,
        dataSet,
      },
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <Lov name="ouIdLov" />
        <Lov
          name="invOrganizationIdLov"
          onChange={(value, preValue) => {
            this.changeLnvOrganizationIdLov(value, preValue);
          }}
        />
        <Lov
          name="itemIdLov"
          onChange={(value) => {
            this.changeItemIdLov(value);
          }}
        />
        {doubleUnitFlag ? (
          <NumberField name="secondaryQuantity" />
        ) : (
          <NumberField name="rfxQuantity" />
        )}
        <Switch name="taxIncludedFlag" />
        <Lov name="taxIdLov" />
        <DatePicker name="demandDate" />
      </Form>
    );
  }
}

export default observer(BatchCreateItemForm);
