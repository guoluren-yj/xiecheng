/**
 * DetailHeader - 编辑详情头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, TelField, SecretField } from 'choerodon-ui/pro';

import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';

import styles from '../index.less';

export default class DetailHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      editFlag = false,
      dataSet,
      sourcePage = '',
      customizeForm = () => {},
      code = '',
    } = this.props;
    const partnerRemarkHidden = sourcePage === 'waitRelease';
    // 行字段（联系人，邮箱，手机号）
    const lineFieldHidden = ['waitApprove', 'wfApprove'].includes(sourcePage);
    const lineFieldEdit = editFlag && sourcePage === 'waitRelease';

    return customizeForm(
      {
        code,
      },
      <Form
        useWidthPercent
        dataSet={dataSet}
        columns={3}
        labelLayout={editFlag ? 'float' : 'vertical'}
        className={editFlag ? styles['c7n-investig-edit-from'] : 'c7n-pro-vertical-form-display'}
      >
        <FormField isEdit={editFlag} name="investgNumber" />
        <FormField isEdit={editFlag} name="investigateLevel" />
        <FormField isEdit={editFlag} name="companyNum" />
        <FormField isEdit={editFlag} name="companyName" />
        <FormField isEdit={editFlag} name="investigateType" />
        <FormField isEdit={editFlag} name="investigateTemplateCode" />
        <FormField isEdit={editFlag} name="investigateTemplateName" />
        <FormField
          isEdit={editFlag}
          name="processStatus"
          renderer={({ record, name, value }) => {
            return renderStatus({ value, name, record });
          }}
        />
        <FormField isEdit={editFlag} name="createUserRealName" />
        <FormField isEdit={editFlag} name="unitName" />
        <FormField isEdit={editFlag} name="partnerCompanyNum" />
        <FormField isEdit={editFlag} name="supplierZhOrEnCompanyNum" />
        <FormField isEdit={editFlag} name="partnerBuildDate" componentType="DATETIMEPICKER" />
        <FormField
          isEdit={lineFieldEdit}
          name="partnerContactor"
          hidden={lineFieldHidden}
          componentType="Lov"
        />
        {lineFieldEdit ? (
          <TelField hidden={lineFieldHidden} name="partnerContactPhone" mode="secret" />
        ) : (
          <SecretField hidden={lineFieldHidden} name="partnerContactPhone" displayOutput />
        )}
        <FormField
          isEdit={lineFieldEdit}
          name="partnerContactMail"
          hidden={lineFieldHidden}
          componentType="SECRETFIELD"
          displayOutput={!lineFieldEdit}
        />
        <FormField isEdit={editFlag} name="releaseDate" componentType="DATETIMEPICKER" />
        <FormField
          isEdit={editFlag}
          name="remark"
          componentType="TextArea"
          newLine
          colSpan={2}
          resize="vertical"
        />
        <FormField
          isEdit={editFlag}
          name="partnerRemark"
          newLine
          colSpan={2}
          hidden={partnerRemarkHidden}
          resize="vertical"
        />
      </Form>
    );
  }
}
