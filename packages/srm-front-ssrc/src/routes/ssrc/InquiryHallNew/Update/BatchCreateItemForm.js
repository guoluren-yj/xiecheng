/**
 * 批量创建物料表单
 * @date: 2021-03-10
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 0.01
 * @copyright Copyright (c) 2021, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Lov, NumberField, CheckBox, DatePicker, Select } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';

export default class BatchCreateItemForm extends PureComponent {
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
    const { dataSet, remote } = this.props;
    const record = dataSet.current;
    console.log('value', value, record);
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
      record.set('itemIds', currentValue && currentValue.map((r) => r.itemId));
      record.set(
        'invOrganizationIdLov',
        isArray(invOrganizationIdLov) && invOrganizationIdLov.length
          ? invOrganizationIdLov[0]
          : invOrganizationIdLov || {}
      );
      record.set(
        'invOrganizationName',
        isArray(invOrganizationName) ? invOrganizationName[0] : invOrganizationName || ''
      );
      record.set(
        'invOrganizationId',
        isArray(invOrganizationId) && invOrganizationId.length
          ? invOrganizationId[0]
          : invOrganizationId || ''
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

    if (remote?.event) {
      remote.event.fireEvent('remoteBatchCreateItemLIneChangeItemIdAfter', {
        record,
        value,
        that: this,
      });
    }
  }

  render() {
    const { dataSet, customizeForm, custLoading, rfx = {}, doubleUnitFlag = false } = this.props;
    const { sourceKey } = rfx || {};

    return customizeForm(
      {
        code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BATCH_CREATE_FORM`,
        dataSet,
      },
      <Form dataSet={dataSet} columns={1} labelLayout="float" custLoading={custLoading}>
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
        <CheckBox name="taxIncludedFlag" />
        <Lov name="taxIdLov" />
        <DatePicker name="demandDate" />
        <CheckBox name="ladderInquiryFlag" />
        <Select name="freightIncludedFlag" />
        <Lov
          name="projectTaskId"
          tableProps={{
            selectionMode: 'rowbox',
            virtual: true,
            style: {
              maxHeight: '500px',
            },
          }}
        />
      </Form>
    );
  }
}
