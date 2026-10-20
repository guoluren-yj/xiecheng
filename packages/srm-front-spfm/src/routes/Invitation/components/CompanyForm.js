/**
 * 公司信息Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import ModalForm from 'components/Modal/ModalForm';
import CompanyInformation from './CompanyInformation';

/**
 * 公司信息Modal
 * @extends {ModalForm} - React.ModalForm
 * @return React.element
 */
export default class CompanyForm extends ModalForm {
  renderForm() {
    const { companyId, inviteId } = this.props;
    return (
      <React.Fragment>
        <CompanyInformation key={companyId} companyId={companyId} inviteId={inviteId} />
      </React.Fragment>
    );
  }
}
