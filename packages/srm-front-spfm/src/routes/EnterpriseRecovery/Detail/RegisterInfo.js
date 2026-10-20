import React from 'react';
import { isEmpty } from 'lodash';
import { Output, CheckBox, Form } from 'choerodon-ui/pro';
import classnames from 'classnames';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getAttachmentUrl, getCurrentOrganizationId } from 'utils/utils';

export default ({ ds, header, className }) => {
  const { certificationType } = ds?.current?.get(['certificationType']) || {};
  return (
    <Form
      columns={3}
      header={header}
      dataSet={ds}
      className={classnames(className, 'sslm-c7n-wrap-form')}
      labelLayout="vertical"
    >
      <Output name="companyName" />
      <Output name="companyEnglishName" />
      <Output name="shortName" />
      <Output name="companyTypeMeaning" />
      <Output name="registeredCountryName" />
      <Output name="registeredRegionName" />
      <Output name="legalRepName" />
      <Output name="registeredCapital" />
      <Output name="currencyName" />
      <Output
        name="licenceUrl"
        renderer={({ record = {} }) => {
          const { data = {} } = record;
          const { basic = {}, bucketDirectory } = data;
          const { licenceUrl } = basic;
          const url = getAttachmentUrl(
            licenceUrl,
            PRIVATE_BUCKET,
            getCurrentOrganizationId(),
            bucketDirectory
          );
          return (
            <a href={url}>
              {intl.get('spfm.certificationApproval.model.detailForm.download').d('下载')}
            </a>
          );
        }}
      />
      <Output name="buildDate" />
      <Output name="licenceEndDate" />
      <CheckBox name="longTermFlag" disabled />
      <Output name="businessScope" />
      <Output
        name="domesticForeignRelation"
        hidden={!isEmpty(certificationType)}
        renderer={({ value } = {}) => {
          return value
            ? intl.get('spfm.certificationApproval.model.detailForm.withinBorders').d('境内')
            : intl.get('spfm.certificationApproval.model.detailForm.withoutBorders').d('境外');
        }}
      />
      <Output name="certificationType" hidden={isEmpty(certificationType)} />
      <Output
        name="certificationRegionId"
        hidden={isEmpty(certificationType) || certificationType === '2'}
      />
      <Output name="dunsCode" />
      <Output name="organizingInstitutionCode" />
      <Output name="taxpayerTypeMeaning" />
      <Output name="businessRegistrationNumber" />
      <Output name="unifiedSocialCode" />
    </Form>
  );
};
