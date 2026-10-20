/*
 * @Description: 静默签配置
 */
import React, { memo, useEffect, useContext, useCallback } from 'react';
import { useDataSet, Form } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import intl from 'utils/intl';
import { FormItem } from '@/routes/Components';
import { slientSignatureDS } from '@/stores/SettleStrategyDS';
import CardTitle from './CardTitle';
import { Store } from '../StoreProvider';
import styles from '../index.less';


export default memo(({ modal, documentType }) => {
  const { editFlag, settleConfigId } = useContext(Store);

  const slientSignatureDs = useDataSet(() => slientSignatureDS(settleConfigId, documentType), [
    settleConfigId, documentType,
  ]);

  useEffect(() => {
    modal.handleOk(handleSubmit);
  }, [modal, handleSubmit, slientSignatureDs]);

  const handleSubmit = useCallback(async () => {
    const verifyRes = await slientSignatureDs.validate();
    if (!verifyRes) return false;
    const res = await slientSignatureDs.submit();
    return res;
  }, [slientSignatureDs]);

  return (
    <div className={styles['e-sign-modal']}>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl.get(`ssta.settleStrategy.model.settleStrategy.silentSealId`).d('静默签指定印章')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={slientSignatureDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="silentSealId" editor="select" editable={editFlag} />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl.get(`ssta.settleStrategy.view.settleStrategy.slientUser`).d('指定用章人')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={slientSignatureDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="userIdLov" editor="lov" editable={editFlag} />
        </Form>
      </Card>
    </div>
  );
});
