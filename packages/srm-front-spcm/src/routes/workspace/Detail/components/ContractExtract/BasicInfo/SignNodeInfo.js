/*
 * @Description: 分屏模式-基础信息-签署节点信息
 * @Date: 2025-01-23 17:26:45
 * @Author: CDJ
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { useEffect } from 'react';
import { Card } from 'choerodon-ui';
import { flow } from 'lodash';
import { DataSet, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import AISvg from '@/routes/components/AISvg';

import ConstructForm from '../../ContractHeader/ConstructForm';
import { getSignNodeDs } from '../../DataSet';
import styles from '../index.less';

const SignNodeInfo = ({
  signNodeDs,
  customizeForm,
  handleViewAllSignNode = () => {},
  headerInfo,
}) => {
  const { pcHeaderId } = headerInfo || {};

  useEffect(() => {
    // 初始化校验一下数据，是否有误，用于卡片头标红处理
    // eslint-disable-next-line no-unused-expressions
    signNodeDs && signNodeDs.validate();
  }, [signNodeDs]);

  if (!signNodeDs?.length) {
    return null;
  }

  return signNodeDs?.map((item, index) => {
    if (index > 2) {
      // 卡片只显示三条数据
      return null;
    }
    const signNodeFormDs = new DataSet(getSignNodeDs({ isEdit: false, pcHeaderId }));
    signNodeFormDs.loadData([item.toData()]);
    const validate = item.getValidationErrors();
    return (
      <Card
        className={styles.extractCard}
        title={<AISvg mustIcon={!!validate?.length}>{item.get('userName') || '-'}</AISvg>}
        type="inner"
        onClick={() => handleViewAllSignNode()}
      >
        {customizeForm(
          {
            code: '',
            dataSet: signNodeFormDs,
          },
          <Form
            className={styles['spcmCard-form']}
            labelLayout="horizontal"
            dataSet={signNodeFormDs}
            labelAlign="left"
            useColon={false}
            columns={1}
          >
            <ConstructForm name="email" />
            <ConstructForm name="statusCode" />
          </Form>
        )}
      </Card>
    );
  });
};

export default flow(
  observer,
  withCustomize({
    unitCode: [''],
  })
)(SignNodeInfo);
