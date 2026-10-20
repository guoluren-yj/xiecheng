import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Output, Tooltip, Attachment, Lov } from 'choerodon-ui/pro';

// import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { FIlESIZE } from '@/utils/SsrcRegx';
// import Upload from '_components/C7NUpload';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { Store } from '../store/index';

export default observer(function BasicInfoCard(props) {
  const {
    // ref: { basicInfoRef },
    routerParams: { sourceCategory },
    commonDs: { basicFormDs },
    customizeCollapseForm,
    storeData: { noBackFlag, participateFlag },
  } = useContext(Store);
  const { changeCurrency } = props;

  const { current } = basicFormDs;
  return customizeCollapseForm(
    {
      code: noBackFlag
        ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.BASE_HEADER`
        : `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER`,
      dataSet: basicFormDs,
      enableEmpty: true,
    },
    <CollapseForm
      dataSet={basicFormDs}
      columns={3}
      showLines={3}
      labelLayout="vertical"
      useWidthPercent
      // formRef={ref => {
      //   basicInfoRef.current = ref;
      // }}
      className="c7n-pro-vertical-form-display"
    >
      <Output name="rfTitle" />
      {/* <Output name="sourceProjectName" /> */}
      {current?.get('sourceFrom') === 'PROJECT' && (
        <Output
          name="sourceProjectName"
          renderer={({ record, value }) => (
            <Tooltip
              title={`${record?.get('sourceProjectNum')} - ${record?.get('sourceProjectName')}`}
            >
              {value}
            </Tooltip>
          )}
        />
      )}
      <Output name="rfRemark" colSpan={2} />
      {sourceCategory === 'RFI' && (
        <Attachment
          readOnly
          // viewMode="popup"
          sortable={false}
          fileSize={FIlESIZE}
          name="rfiAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-prequal"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
        />
      )}
      {sourceCategory === 'RFP' && current?.get('evaluateShowType') !== 'BUSS' && (
        <Attachment
          readOnly
          // viewMode="popup"
          sortable={false}
          fileSize={FIlESIZE}
          name="techAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-prequal"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
        />
      )}
      {sourceCategory === 'RFP' && current?.get('evaluateShowType') !== 'TECH' && (
        <Attachment
          readOnly
          // viewMode="popup"
          sortable={false}
          fileSize={FIlESIZE}
          name="businessAttachmentUuid"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rfp-rfpheader"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
        />
      )}
      {current?.get('lineItemsFlag') &&
        !participateFlag &&
        !noBackFlag && [<Lov name="currencyLov" onChange={(data) => changeCurrency(data)} />]}
      {noBackFlag && <Output name="currencyCode" />}
    </CollapseForm>
  );
});
