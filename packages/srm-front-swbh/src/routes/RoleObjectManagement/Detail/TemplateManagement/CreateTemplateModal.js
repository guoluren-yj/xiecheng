import React, { useImperativeHandle, useMemo } from 'react';
import { Form, Lov, TextField, DataSet } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SWBH } from '../../../components/utils/config';

const organizationId = getCurrentOrganizationId();

const Index = (props) => {
  const { combineId, templateRef } = props;
  const formDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'relBusinessObjectCode',
            type: 'object',
            ignore: 'always',
            label: intl.get('swbh.common.relBusinessObjectCode').d('对象编码'),
            required: true,
            lovCode: 'SWBH_DOC_OBJECT_REL',
            textField: 'relBusinessObjectCode',
            lovQueryAxiosConfig: () => {
              return {
                url: `${SRM_SWBH}/v1/lovs/sql/data?lovCode=SWBH_DOC_OBJECT_REL`,
                method: 'GET',
              };
            },
            dynamicProps: {
              lovPara: () => {
                return {
                  tenantId: organizationId,
                  combineId,
                };
              },
            },
            transformResponse: (value) => value && { relBusinessObjectCode: value },
            transformRequest: (value) => value?.relBusinessObjectCode,
          },
          {
            name: 'relBusinessObjectName',
            type: 'string',
            label: intl.get('swbh.common.relBusinessObjectName').d('关联对象'),
            required: true,
            bind: 'relBusinessObjectCode.relBusinessObjectName',
          },
          {
            name: 'tableCode',
            type: 'string',
            required: true,
            bind: 'relBusinessObjectCode.tableCode',
          },
          {
            name: 'pkCode',
            type: 'string',
            required: true,
            bind: 'relBusinessObjectCode.pkCode',
          },
        ],
      }),
    []
  );
  useImperativeHandle(templateRef, () => ({
    formDs,
  }));
  return (
    <Observer>
      {() => (
        <Form dataSet={formDs} columns={2}>
          <Lov colSpan={2} name="relBusinessObjectCode" />
          <TextField colSpan={2} name="relBusinessObjectName" disabled />
        </Form>
      )}
    </Observer>
  );
};

export default Index;
