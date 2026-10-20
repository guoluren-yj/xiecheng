/*
 * @Description: 分屏模式-标的和阶段-标的信息
 * @Date: 2025-01-23 17:26:45
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Card } from 'choerodon-ui';
import { Form, DataSet } from 'choerodon-ui/pro';
import AISvg from '@/routes/components/AISvg';

import ConstructForm from '../../ContractHeader/ConstructForm';
import { pcSubjectCardDS } from '../stores/BasicInfoDS';
import styles from '../index.less';

const SubjectInfo = ({ pcSubjectDs, customizeForm }) => {
  return pcSubjectDs?.map((pcSubject, index) => {
    if (index > 2) {
      // 卡片只显示三条数据
      return null;
    }
    const pcSubjectCardDs = new DataSet(pcSubjectCardDS());
    pcSubjectCardDs.loadData([pcSubject.toData()]);
    const validate = pcSubject.getValidationErrors();
    return (
      <Card
        className={styles.extractCard}
        title={<AISvg mustIcon={!!validate?.length}>{pcSubject.get('itemName')}</AISvg>}
        type="inner"
      >
        {customizeForm(
          {
            code: 'SPCM.WORKSPACE_DETAIL.SUBJECT.EXTRACT',
            dataSet: pcSubjectCardDs,
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
            dataSet={pcSubjectCardDs}
            labelAlign="left"
            useColon={false}
            columns={1}
          >
            <ConstructForm name="lineNum" />
            <ConstructForm name="itemCode" />
            <ConstructForm name="invOrganizationName" />
            <ConstructForm name="categoryName" />
            <ConstructForm name="uomCodeAndName" />
            <ConstructForm name="quantity" />
          </Form>
        )}
      </Card>
    );
  });
};

export default SubjectInfo;
