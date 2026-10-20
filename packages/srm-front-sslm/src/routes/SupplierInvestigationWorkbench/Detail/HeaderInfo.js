/*
 * 基本信息
 * @date: 2022/11/16 15:12:06
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
// import { renderStatus } from '@/routes/components/utils';
import '@/routes/index.less';

const HeaderInfo = ({ dataSet, customizeForm, custLoading, customizeUnitCode, isEdit = false }) => {
  const style = { marginBottom: 20 };

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
        },
        <Form
          useWidthPercent
          dataSet={dataSet}
          columns={3}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          custLoading={custLoading}
          style={style}
        >
          <FormField isEdit={isEdit} name="investgNumber" />
          <FormField isEdit={isEdit} name="investigateLevelMeaning" />
          <FormField isEdit={isEdit} name="companyNum" />
          <FormField isEdit={isEdit} name="companyName" />
          {/* <FormField
            isEdit={isEdit}
            name="processStatusMeaning"
            renderer={({ record, name, value }) => {
              return renderStatus({ value, name, record });
            }}
          /> */}
          <FormField isEdit={isEdit} name="releaseDate" componentType="DATETIMEPICKER" />
          <FormField isEdit={isEdit} name="createUserRealName" />
          <FormField isEdit={isEdit} name="partnerCompanyNum" />
          <FormField isEdit={isEdit} name="partnerCompanyName" />
          <FormField isEdit={isEdit} name="remark" componentType="TextArea" colSpan={2} newLine />
          <FormField
            isEdit={isEdit}
            name="partnerRemark"
            componentType="TextArea"
            colSpan={2}
            newLine
          />
        </Form>
      )}
    </Spin>
  );
};

export default HeaderInfo;
