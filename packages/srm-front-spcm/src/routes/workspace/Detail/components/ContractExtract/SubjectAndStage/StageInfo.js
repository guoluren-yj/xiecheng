/*
 * @Description: 分屏模式-标的和阶段-阶段信息
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
import { pcStageCardDS } from '../stores/BasicInfoDS';
import styles from '../index.less';

const StageInfo = ({ pcStageDs, customizeForm }) => {
  return pcStageDs?.map((pcStage, index) => {
    if (index > 2) {
      // 卡片只显示三条数据
      return null;
    }
    const pcStageCardDs = new DataSet(pcStageCardDS());
    pcStageCardDs.loadData([pcStage.toData()]);
    const validate = pcStage.getValidationErrors();
    return (
      <Card
        className={styles.extractCard}
        title={<AISvg mustIcon={!!validate?.length}>{pcStage.get('stageName')}</AISvg>}
        type="inner"
      >
        {customizeForm(
          {
            code: 'SPCM.WORKSPACE_DETAIL.STAGE.EXTRACT',
            dataSet: pcStageCardDs,
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
            dataSet={pcStageCardDs}
            labelAlign="left"
            useColon={false}
            columns={1}
          >
            <ConstructForm name="stageNo" />
            <ConstructForm name="stageCode" />
            <ConstructForm name="milestoneTime" />
            <ConstructForm name="supplierCurrencyCode" />
            <ConstructForm name="payRatio" />
            <ConstructForm name="costQuantity" />
          </Form>
        )}
      </Card>
    );
  });
};

export default StageInfo;
