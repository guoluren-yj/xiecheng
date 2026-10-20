import React, { useMemo, useEffect } from 'react';
import { DataSet, Form, Output, Table } from 'choerodon-ui/pro';
import { Collapse, Icon } from 'choerodon-ui';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { getFieldsEnums } from '@/businessComponents/icon-picker/enums';
import styles from './index.less';

const { Panel } = Collapse;
const FieldDetail = ({ fieldDetail = {} }: { fieldDetail: any }) => {
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
            label: intl
              .get('hmde.boComposition.view.message.header.businessObjectName')
              .d('所属业务对象'),
          },
          {
            name: 'businessObjectFieldName',
            type: 'string',
            label: intl.get('hmde.boComposition.view.message.header.fieldName').d('字段名称'),
            required: true,
          },
          {
            name: 'componentType',
            type: 'string',
            label: intl
              .get('hmde.boComposition.view.message.header.fieldComponentType')
              .d('字段类型'),
            required: true,
          },
          {
            name: 'aliasName',
            type: 'string',
            label: intl.get('hmde.boComposition.view.message.header.fieldCode').d('字段编码'),
            required: true,
          },
          {
            name: 'helpText',
            type: 'string',
            label: intl.get('hmde.boComposition.view.message.header.helpText').d('帮助文本'),
            bind: 'attributeJson.helpText',
          },
          {
            name: 'remark',
            type: 'string',
            label: intl.get('hmde.common.label.remark').d('描述'),
          },
          {
            name: 'maxLength',
            type: 'string',
            label: intl.get('hmde.boComposition.view.message.header.maxLength').d('最大长度'),
          },
          {
            name: 'defaultValue',
            type: 'string',
            label: intl.get('hmde.boComposition.view.message.header.defaultValue').d('默认值'),
          },
          {
            name: 'requiredFlag',
            type: 'boolean',
            label: intl.get('hzero.common.title.individuation.required').d('是否必输'),
            trueValue: true,
            falseValue: false,
          },
        ],
      } as DataSetProps),
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
            label: intl.get('hmde.boComposition.view.message.header.fieldRefType').d('类型'),
          },
          {
            name: 'refBizName',
            label: intl.get('hmde.boComposition.view.message.header.refBizName').d('名称'),
          },
          {
            name: 'refBizCode',
            label: intl.get('hmde.boComposition.view.message.header.refBizCode').d('编码'),
          },
          {
            name: 'refBizExtInfo',
            label: intl.get('hmde.boComposition.view.message.header.refBizExtInfo').d('辅助信息'),
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
      } as DataSetProps),
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

  const map = useMemo(() => {
    const tmp = {};
    getFieldsEnums().forEach(i => {
      tmp[i.value] = i.title;
    });
    return tmp;
  }, []);

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
      <Panel
        header={intl.get('hmde.boComposition.view.title.fieldAttributes').d('字段属性')}
        key="fieldAttributes"
      >
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
              value
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否')
            }
          />
          <Output name="remark" newLine colSpan={3} />
        </Form>
      </Panel>
      <Panel
        header={intl.get('hmde.boComposition.view.title.fieldUsage').d('字段使用处')}
        key="fieldUsage"
      >
        <Table dataSet={tableDs} columns={tableCols} />
      </Panel>
    </Collapse>
  );
};
export default formatterCollections({
  code: ['hmde.boComposition', 'hzero.common', 'hmde.common'],
})(observer(FieldDetail));
