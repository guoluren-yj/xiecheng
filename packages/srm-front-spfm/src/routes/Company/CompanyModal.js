import React from 'react';
import { Spin } from 'hzero-ui';
import notification from 'utils/notification';
import ModalForm from 'components/Modal/ModalForm';
import { getCurrentOrganizationId } from 'utils/utils';
import EnterpriseEdit from '../Enterprise/EnterpriseEdit';
import LegalForm from '../Enterprise/Edit/LegalForm';

export default class CompanyModal extends ModalForm {
  renderForm() {
    const { modalInitialData, hideModal, initialList, loading } = this.props;
    return (
      <React.Fragment>
        {modalInitialData && modalInitialData.sourceKey ? (
          <Spin spinning={loading.effects['enterpriseEdit/queryCompanyInfo']}>
            <EnterpriseEdit
              companyId={modalInitialData.sourceKey}
              callback={() => notification.success()}
            />
          </Spin>
        ) : (
          <LegalForm
            isTenant
            callback={() => {
              notification.success();
              hideModal();
              initialList({ organizationId: getCurrentOrganizationId() });
            }}
          />
        )}
      </React.Fragment>
    );
  }
}
