import React, { useContext, memo, useMemo } from 'react';
import { Form, useModal } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from './CardTitle';
import { Store } from '../StoreProvider';
import { FormItem } from '@/routes/Components';
import SelectBoxCard from '../components/SelectBoxCard';
import { useModalOpen } from '../hooks';
import SilentSignatureModal from './SilentSignatureModal';
import styles from '../index.less';

/**
 * @description: 电子签章弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo((props) => {
  const { documentType } = props;
  const { editFlag, headerDs } = useContext(Store);
  const modal = useModal();
  const modalOpen = useModalOpen(modal);

  const silentSignatureProps = useMemo(() => {
    return {
      editFlag,
      size: 'small',
      title: intl
        .get(`ssta.settleStrategy.model.settleStrategy.silentSignatureHeader`)
        .d('静默签配置'),
      children: <SilentSignatureModal documentType={documentType} />,
    };
  }, []);

  return (
    <div className={styles['e-sign-modal']}>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl.get(`ssta.settleStrategy.model.settleStrategy.sealOrder`).d('签章顺序')}
            effectiveText={intl.get('ssta.settleStrategy.view.message.sureEffective').d('确认生效')}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.orderHelp')
              .d('单据状态为已确认时生效，用户可在确认之前进行配置调整')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={headerDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="eSignOrder" editor="select" editable={editFlag} />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl.get(`ssta.settleStrategy.model.settleStrategy.sealKeyWord`).d('签章关键字')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.turntEffective`)
              .d('触发系统间交互时生效')}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.keyWordHelp')
              .d('单据发送应用商店签章时生效，用户可在发起签章前进行配置调整')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={headerDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem
            name="purchaserESignKeyword"
            editor="textarea"
            colSpan={2}
            newLine
            editable={editFlag}
          />
          <FormItem
            name="supplierESignKeyword"
            editor="textarea"
            colSpan={2}
            newLine
            editable={editFlag}
          />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl
              .get(`ssta.settleStrategy.model.settleStrategy.sealTimestamp`)
              .d('显示时间戳')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.turntEffective`)
              .d('触发系统间交互时生效')}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.keyWordHelp')
              .d('单据发送应用商店签章时生效，用户可在发起签章前进行配置调整')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={headerDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="sealTimestampCode" editor="select" editable={editFlag} />
        </Form>
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={
          <CardTitle
            title={intl.get(`ssta.settleStrategy.model.settleStrategy.billSealType`).d('印章类型')}
            effectiveText={intl
              .get(`ssta.settleStrategy.view.message.turntEffective`)
              .d('触发系统间交互时生效')}
            effectiveTip={intl
              .get('ssta.settleStrategy.view.message.keyWordHelp')
              .d('单据发送应用商店签章时生效，用户可在发起签章前进行配置调整')}
          />
        }
      >
        <Form
          columns={1}
          useColon={false}
          dataSet={headerDs}
          labelLayout={editFlag ? 'float' : 'vertical'}
        >
          <FormItem name="billSealType" editor="select" editable={editFlag} />
        </Form>
      </Card>
      <SelectBoxCard
        name="billSilentSignatureFlag"
        effectiveText={intl
          .get(`ssta.settleStrategy.view.message.turntEffective`)
          .d('触发系统间交互时生效')}
        effectiveTip={intl
          .get('ssta.settleStrategy.view.message.silentSignatureFlagHelp')
          .d('单据发送应用商店签章时生效，用户可在发起签章前进行配置调整')}
        onSuffixClick={() => modalOpen(silentSignatureProps)}
        hideLabelFlag
      />
    </div>
  );
});
