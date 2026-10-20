import React, { useMemo } from 'react';
import { Form, Table, DataSet, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default observer(function AttrChildren(props) {
  const { modal, columnId, sourceFrom } = props;

  const formDs = useMemo(
    () =>
      new DataSet({
        data: [{ columnName: props.columnName, componentTypeMeaning: props.componentTypeMeaning }],
        fields: [
          {
            label: intl.get(`spc.priceModel.model.definition.fieldDesc`).d('字段描述'),
            name: 'columnName',
          },
          {
            label: intl.get(`spc.priceModel.model.definition.component`).d('组件'),
            name: 'componentTypeMeaning',
          },
        ],
      }),
    []
  );
  const tableDs = useMemo(
    () =>
      new DataSet({
        selection: null,
        autoQuery: true,
        primaryKey: 'quotationColumnCmptId',
        fields: [
          {
            label: intl.get(`spc.priceModel.model.definition.attrName`).d('属性名称'),
            name: 'attributeCode',
          },
          {
            label: intl.get(`spc.priceModel.model.definition.attrDesc`).d('属性描述'),
            name: 'attributeCodeMeaning',
          },
          {
            label: intl.get(`spc.priceModel.model.definition.attrVal`).d('属性值'),
            name: 'attributeValue',
            computedProps: {
              lookupCode: ({ record }) =>
                record.get('attributeCode') === 'integerLogic'
                  ? 'SPC.PRICE_MODEL.INTEGER_LOGIC'
                  : null,
            },
          },
        ],
        transport: {
          read: {
            url: `${SRM_SPC}/v1/${organizationId}/price-model-param-column-attrs/list`,
            method: 'GET',
            data: {
              sourceFrom,
              sourceFromId: columnId,
            },
          },
          submit: ({ data }) => {
            return {
              url: `${SRM_SPC}/v1/${organizationId}/price-model-param-column-attrs/save`,
              method: 'POST',
              data: data.map((item) => ({
                ...item,
                sourceFrom,
                sourceFromId: columnId,
              })),
            };
          },
        },
      }),
    []
  );

  modal.handleOk(async () => {
    const res = await tableDs.submit();
    // 校验失败，阻止弹框关闭
    return res;
  });

  const columns = useMemo(
    () => [
      {
        name: 'attributeCode',
      },
      {
        name: 'attributeCodeMeaning',
      },
      {
        name: 'attributeValue',
        editor: true,
      },
    ],
    []
  );

  return (
    <React.Fragment>
      <Form
        dataSet={formDs}
        columns={3}
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
        style={{ marginBottom: '18px' }}
      >
        <Output name="columnName" />
        <Output name="componentTypeMeaning" />
      </Form>
      <Table
        dataSet={tableDs}
        columns={columns}
        customizable
        customizedCode="SRC.PRICE_MODEL.UPDATE.COMPONENT_ATTRIBUTE"
      />
    </React.Fragment>
  );
});
