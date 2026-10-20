import React from 'react';
import { TextField, NumberField, Select, Form, TextArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import '../ConfigObjectTBL/index.less';

export default formatterCollections({ code: ['srdm.config-object'] })(
  ({ record, isNew = true }) => {
    return (
      <Form record={record} labelLayout="float">
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.basicInfo').d('基础信息')}
        </div>
        <TextField disabled={!isNew} name="fieldName" />
        <TextField name="objectFldName" />
        <TextField name="objectFldDesc" />
        <Select name="fieldType" />
        <Select name="enabledFlag" />
        <Select name="primaryFlag" />
        <Select name="idFlag" />
        <Select name="parentFlag" />
        <Select name="uniqueFlag" />
        <div className="modal-form-title">通用迁移行为</div>
        <TextArea name="idTranferSql" resize="both" showHelp="newLine" />
        <Select name="idTenantFlag" />
        <TextField name="fixValue" />
        <TextField name="defaultValue" />
        <div className="modal-form-title">更新行为</div>
        <Select name="updateFlag" />
        <div className="modal-form-title">多云特殊行为</div>
        <Select name="multiCloudUpdateFlag" />
        <div className="modal-form-title">文件字段配置</div>
        <Select name="fileFlag" />
        <TextField name="bucketName" />
        <TextField name="directory" />
        <div className="modal-form-title">
          {intl.get('srdm.config-object.modal.title.showAction').d('展示行为')}
        </div>
        <Select name="showFlag" />
        <NumberField step={1} name="fieldSeq" />
        <Select name="differCompareFlag" />
        <Select name="codeCompareFlag" />
        <Select name="encodeMode" />
        <Select name="searchFlag" />
        <TextField name="searchDefaultValue" />
      </Form>
    );
  }
);
