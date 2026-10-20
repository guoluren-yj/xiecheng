import React, { useState } from 'react';
import { TextField, NumberField, Select, Form, TextArea } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import './index.less';

export default formatterCollections({ code: ['srdm.config-object'] })(
  ({ record, isNew = true, handleSchema = () => {} }) => {
    const [hidden, setHidden] = useState(true);

    const changeOtherHidden = () => {
      setHidden(!hidden);
    };

    return (
      <Form record={record} labelLayout="float">
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.basicInfo').d('基础信息')}
        </div>
        <TextField disabled={!isNew} name="tableName" />
        <TextField
          readOnly
          name="schemaName"
          suffix={
            <Icon
              type="close"
              onClick={() => {
                record.set('schemaName', null);
              }}
            />
          }
          addonAfter={<Icon type="search" onClick={() => handleSchema(record)} />}
          addonAfterStyle={{ backgroundColor: 'white', cursor: 'pointer' }}
        />
        <TextField name="objectTblName" />
        <TextField name="objectTblDesc" />
        <Select name="enabledFlag" />
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.transfer').d('迁移通用配置')}
        </div>
        <NumberField step={1} name="tblPriority" />
        <Select name="sortFlag" />
        <Select name="updateFlag" />
        <TextArea autoSize name="tenantField" resize="both" />
        <TextArea autoSize name="lastUpdDateField" resize="both" />
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.transfer.publicConfig').d('公有云配置')}
        </div>
        <Select name="publicCloudFlag" />
        <TextArea autoSize name="conditionField" resize="both" />
        <TextArea autoSize name="mainTableSql" resize="both" />
        <Select name="postFlag" />
        <TextField name="callbackService" />
        <TextField name="callbackServiceParam" />
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.servicesConfig').d('多云配置')}
        </div>
        <Select name="multiCloudFlag" />
        <Select name="srmTenantFlag" />
        <Select name="multiCloudTenantFlag" />
        <Select name="multiCloudBehavior" />
        <TextArea autoSize name="multiCloudConditionField" resize="both" />
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.orther').d('其他配置')}
          <a onClick={() => changeOtherHidden(hidden)}>
            {hidden
              ? intl.get('hzero.common.button.expand').d('展开')
              : intl.get('hzero.common.button.up').d('收起')}
          </a>
        </div>
        {!hidden && <Select name="relateType" />}
        {!hidden && <TextArea autoSize name="displayFieldTitle" resize="both" />}
        {!hidden && <TextArea autoSize name="displayFieldDesc" resize="both" />}
        {/* {!hidden && <Select name="cacheFlag" />}
        {!hidden && <Select name="cacheMode" />}
        {!hidden && <TextField name="fullMethod" />}
        {!hidden && <TextField name="incrementalMethod" />}
        {!hidden && <Select name="postFlag" />}
        {!hidden && <TextArea autoSize name="postMethod" resize="both" />} */}
      </Form>
    );
  }
);
