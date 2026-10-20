/*
 * @Description: 分屏模式-业务条款
 * @Date: 2025-01-23 17:26:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { Form, DataSet } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
import AISvg from '@/routes/components/AISvg';

import ConstructForm from '../../ContractHeader/ConstructForm';
import { businessTermsCardDS } from '../stores/BasicInfoDS';
import styles from '../index.less';

const BusinessTermsInfo = ({ businessTermsDs, customizeForm }) => {
  return businessTermsDs?.map((businessTerms, index) => {
    if (index > 2) {
      // 卡片只显示三条数据
      return null;
    }
    const businessTermsCardDs = new DataSet(businessTermsCardDS());
    const data = businessTerms.toData();
    const { termTypeName } = data || {};
    businessTermsCardDs.loadData([data]);
    const validate = businessTerms.getValidationErrors();
    return (
      <Card
        className={styles.extractCard}
        title={<AISvg mustIcon={!!validate?.length}>{termTypeName}</AISvg>}
        type="inner"
      >
        {customizeForm(
          {
            code: 'SPCM.WORKSPACE_DETAIL.BUSINESSTERMS.EXTRACT',
            dataSet: businessTermsCardDs,
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
            dataSet={businessTermsCardDs}
            labelAlign="left"
            useColon={false}
            columns={1}
          >
            <ConstructForm name="termTypeCode" />
            <ConstructForm name="termTypeName" />
            <ConstructForm name="termContent" />
          </Form>
        )}
      </Card>
    );
  });
};

export default BusinessTermsInfo;
