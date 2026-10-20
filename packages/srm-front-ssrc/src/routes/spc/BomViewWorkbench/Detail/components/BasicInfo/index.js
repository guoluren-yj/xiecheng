import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { StatusRender } from '@/routes/spc/FormulaManage/utils';

import ConstructForm from './ConstructForm';

const Index = (props) => {
  const {
    bomViewId,
    isEdit = true,
    dynamicColumns = [],
    dataSet,
    dynamicBasicInfoDS,
    onChangeBomTemplate,
  } = props;
  return (
    <>
      <Form
        useWidthPercent
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? null : 'c7n-pro-vertical-form-display'}
        dataSet={dataSet}
        columns={3}
      >
        <ConstructForm formType="TextField" disabled isEdit={isEdit} name="bomViewCode" />
        <ConstructForm formType="TextField" isEdit={isEdit} name="bomViewName" />
        {/* <ConstructForm formType="Lov" isEdit={isEdit} name="companyId" />
        <ConstructForm formType="Lov" isEdit={isEdit} name="bomViewItemId" />
        <ConstructForm formType="Lov" isEdit={isEdit} name="bomViewSupplierId" />
        <ConstructForm formType="Select" disabled isEdit={isEdit} name="bomViewType" /> */}
        <ConstructForm
          formType="Lov"
          disabled={bomViewId}
          isEdit={isEdit}
          name="bomTemplateId"
          onChange={onChangeBomTemplate}
        />
        <ConstructForm
          formType="TextField"
          isEdit={isEdit}
          disabled
          name="bomViewStatus"
          {...(isEdit
            ? {}
            : {
                renderer: ({ value, record }) =>
                  StatusRender(value, record.get('bomViewStatusMeaning')),
              })}
        />
        <ConstructForm formType="DatePicker" disabled isEdit={isEdit} name="creationDate" />
        <ConstructForm
          formType="TextField"
          isEdit={isEdit}
          disabled
          name="createdBy"
          renderer={({ record }) => record.get('createdByMeaning')}
        />
        <ConstructForm formType="TextField" isEdit={isEdit} disabled name="bomViewVersion" />
        {bomViewId && dynamicColumns.map((column) => <ConstructForm isEdit={isEdit} {...column} />)}
      </Form>
      {!bomViewId && (
        <Form
          useWidthPercent
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? null : 'c7n-pro-vertical-form-display'}
          dataSet={dynamicBasicInfoDS}
          columns={3}
          style={{ marginTop: '16px' }}
        >
          {dynamicColumns.map((column) => (
            <ConstructForm isEdit={isEdit} {...column} />
          ))}
        </Form>
      )}
    </>
  );
};

export default Index;
