import React, { Component } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { TextField, Output, Form, Switch, Spin, IntlField } from 'choerodon-ui/pro';
@formatterCollections({ code: ['smbl.purchaseRobotConfig', 'hzero.common'] })
export default class BasicInfo extends Component {
  render() {
    const { disabled, basicInfoDataSet, onEnabledChanged } = this.props;
    return (
      <Spin dataSet={basicInfoDataSet}>
        <Form
          dataSet={basicInfoDataSet}
          columns={3}
          labelLayout={disabled ? 'vertical' : 'float'}
          className={disabled ? 'c7n-pro-vertical-form-display' : ''}
          useColon={false}
        >
          {disabled ? (
            <>
              <Output name="templateName" />
              <Output name="templateCode" />
              <Output
                name="tenantId"
                renderer={({ value }) => {
                  return getCurrentOrganizationId() > value
                    ? intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义')
                    : intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义');
                }}
              />
              <Output name="remark" colSpan={2} />
              <Output
                name="enabledFlag"
                renderer={({ value }) => {
                  return String(value) === '1'
                    ? intl.get('hzero.common.yes').d('是')
                    : intl.get('hzero.common.no').d('否');
                }}
              />
            </>
          ) : (
            <>
              <IntlField name="templateName" />
              <TextField restrict="A-Za-z-_" name="templateCode" />
              <Output
                name="tenantId"
                renderer={({ value }) => {
                  return getCurrentOrganizationId() > value
                    ? intl.get('smbl.purchaseRobotConfig.model.skillSource.preDefine').d('预定义')
                    : intl.get('smbl.purchaseRobotConfig.model.skillSource.selfDefine').d('自定义');
                }}
              />
              <IntlField name="remark" type="multipleLine" colSpan={2} rows={4} resize="none" />
              <Switch
                name="enabledFlag"
                onChange={(val) => {
                  if (typeof onEnabledChanged === 'function') {
                    onEnabledChanged(val);
                  }
                }}
              />
            </>
          )}
        </Form>
      </Spin>
    );
  }
}
