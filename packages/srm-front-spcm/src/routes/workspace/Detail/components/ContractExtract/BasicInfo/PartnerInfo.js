/*
 * @Description: 分屏模式-基础信息-伙伴信息
 * @Date: 2025-01-23 17:26:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { flow } from 'lodash';
import { DataSet, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import AISvg from '@/routes/components/AISvg';

import ConstructForm from '../../ContractHeader/ConstructForm';
import { partnerCardDS } from '../stores/BasicInfoDS';
import styles from '../index.less';

const PartnerInfo = ({ partnerDs, customizeForm, handlePartner = () => {} }) => {
  if (!partnerDs?.length) {
    return null;
  }

  return partnerDs?.map((partner) => {
    const partnerCardDs = new DataSet(partnerCardDS());
    partnerCardDs.loadData([partner.toData()]);
    const validate = partner.getValidationErrors();
    const diffFlag = partner.get('partnerTypeNameDiffFlag');
    return (
      <Card
        className={styles.extractCard}
        title={
          <AISvg diffFlag={diffFlag} mustIcon={!!validate?.length}>
            {partner.get('partnerTypeName')}
          </AISvg>
        }
        type="inner"
        onClick={() => handlePartner()}
      >
        {customizeForm(
          {
            code: 'SPCM.WORKSPACE_DETAIL.PARTNER.EXTRACT',
            dataSet: partnerCardDs,
            extTextRenderIntercept: (...extParam) => {
              const [params, node] = extParam;
              const { name, record } = params;
              const diffFlag = record?.get(`${name}DiffFlag`);
              if (diffFlag) {
                return (
                  <AISvg diffFlag={diffFlag} text={node}>
                    {node}
                  </AISvg>
                );
              }
              return node;
            },
          },
          <Form
            className={styles['spcmCard-form']}
            labelLayout="horizontal"
            dataSet={partnerCardDs}
            labelAlign="left"
            useColon={false}
            columns={1}
          >
            <ConstructForm name="companyNum" />
            <ConstructForm name="companyName" />
            <ConstructForm name="legalRepName" />
            <ConstructForm name="unifiedSocialCode" />
          </Form>
        )}
      </Card>
    );
  });
};

// export default PartnerInfo;
export default flow(
  observer,
  withCustomize({
    unitCode: ['SPCM.WORKSPACE_DETAIL.PARTNER.EXTRACT'],
  })
)(PartnerInfo);
