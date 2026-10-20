import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Output, Table } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { HZERO_HMDE } from '../../../../components/utils/config';
import { lowcodeOrganizationURL } from '../../../../components/utils';
import { fieldsEnums } from '../../../../components/managementData';
import styles from './index.less';

const { Panel } = Collapse;

const FieldDetail = ({ fieldDetail = {} }) => {
  const map = {};
  const fieldsEnumsList = fieldsEnums();
  (fieldsEnumsList || []).forEach((i) => {
    map[i.value] = i.title;
  });
  const fieldDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'attributeJson',
            type: 'object',
          },
          {
            name: 'businessObjectName',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.businessObjectName').d('所属业务对象'),
          },
          {
            name: 'businessObjectFieldName',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.fieldName').d('字段名称'),
            required: true,
          },
          {
            name: 'componentType',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.fieldComponentType').d('字段类型'),
            required: true,
          },
          {
            name: 'aliasName',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.fieldCode').d('字段编码'),
            required: true,
          },
          {
            name: 'helpText',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.helpText').d('帮助文本'),
            bind: 'attributeJson.helpText',
          },
          {
            name: 'remark',
            type: 'string',
            label: intl.get('swbh.common.label.remark').d('描述'),
          },
          {
            name: 'maxLength',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.maxLength').d('最大长度'),
          },
          {
            name: 'defaultValue',
            type: 'string',
            label: intl.get('swbh.roManagement.view.message.header.defaultValue').d('默认值'),
          },
          {
            name: 'requiredFlag',
            type: 'boolean',
            label: intl.get('swbh.roManagement.title.individuation.required').d('是否必输'),
            trueValue: true,
            falseValue: false,
          },
        ],
      }),
    []
  );

  const tableDs = useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        selection: false,
        fields: [
          {
            name: 'fieldRefTypeMeaning',
            label: intl.get('swbh.roManagement.view.message.header.fieldRefType').d('类型'),
          },
          {
            name: 'refBizName',
            label: intl.get('swbh.roManagement.view.message.header.refBizName').d('名称'),
          },
          {
            name: 'refBizCode',
            label: intl.get('swbh.roManagement.view.message.header.refBizCode').d('编码'),
          },
          {
            name: 'refBizExtInfo',
            label: intl.get('swbh.roManagement.view.message.header.refBizExtInfo').d('辅助信息'),
          },
        ],
        transport: {
          read: ({ params }) => {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/field-ref-records`,
              params: {
                ...params,
                fieldId: fieldDetail.businessObjectRelationFieldId,
              },
              method: 'get',
            };
          },
        },
      }),
    []
  );

  const tableCols = useMemo(
    () => [
      {
        name: 'fieldRefTypeMeaning',
      },
      {
        name: 'refBizName',
      },
      {
        name: 'refBizCode',
      },
      {
        name: 'refBizExtInfo',
      },
    ],
    []
  );

  useEffect(() => {
    fieldDs.loadData([fieldDetail]);
    tableDs.query();
  }, []);

  return (
    <Collapse
      bordered={false}
      expandIcon={() => <Icon type="expand_more" />}
      expandIconPosition="text-right"
      defaultActiveKey={['fieldAttributes', 'fieldUsage']}
      className={styles['field-info-panel']}
    >
      <Panel header={intl.get('swbh.roManagement.view.title.fieldAttributes').d('字段属性')} key="fieldAttributes">
        <Form
          record={fieldDs.current}
          columns={3}
          labelLayout={LabelLayout.vertical}
          className="c7n-pro-vertical-form-display"
        >
          <Output name="businessObjectName" />
          <Output name="businessObjectFieldName" />
          <Output name="aliasName" />
          <Output name="componentType" renderer={({ value }) => map[value]} />
          <Output name="maxLength" />
          <Output name="defaultValue" />
          <Output name="helpText" />
          <Output
            name="requiredFlag"
            renderer={({ value }) =>
              value ? intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否')
            }
          />
          <Output name="remark" newLine colSpan={3} />
        </Form>
      </Panel>
      <Panel header={intl.get('swbh.roManagement.view.title.fieldUsage').d('字段使用处')} key="fieldUsage">
        <Table dataSet={tableDs} columns={tableCols} />
      </Panel>
    </Collapse>
  );
};
export default formatterCollections({
  code: ['swbh.roManagement', 'swbh.common', 'hzero.common'],
})(observer(FieldDetail));
