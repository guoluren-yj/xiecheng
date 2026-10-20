import React, { useMemo, useCallback, useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react';
import SearchBarTable from '_components/SearchBarTable';
import { Select, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import styles from '@/routes/common.less';
import { statusTagRender } from '@/routes/Components/StatusTag';

import { paymentStageCode, paymentStageLineCode } from '../Detail/StoreProvider';
import { Store } from '../Detail/StoreProvider';
import LineSyncDetail from './LineSyncDetail';

const { Option } = Select;

const PaymentStage = observer(() => {
  const { paymentStageDs, customizeTable, readOnlyFlag, settleHeaderDs } = useContext(Store);
  const [paymentStageTypeCustom, setPaymentStageTypeCustom] = useState('PAYMENT_STAGE');
  const settleStatus = settleHeaderDs?.current?.get('settleStatus');

  const { selected } = paymentStageDs;

  const customCodeMap = useMemo(() => {
    return {
      PAYMENT_STAGE: paymentStageCode,
      PAYMENT_STAGE_LINE: paymentStageLineCode,
    };
  }, []);

  useEffect(() => {
    paymentStageDs.setQueryParameter('paymentStageTypeCustom', 'PAYMENT_STAGE');
  }, [paymentStageDs]);

  const handleStageTypeChange = useCallback(
    (value) => {
      setPaymentStageTypeCustom(value);
      paymentStageDs.setQueryParameter('paymentStageTypeCustom', value);
    },
    [paymentStageDs]
  );

  const handleResync = useCallback(async () => {
    paymentStageDs.dataToJSON = 'selected';
    const res = await paymentStageDs.setState('submitType', 'resync').submit();
    if (!res) return;
    paymentStageDs.query();
    settleHeaderDs.query(undefined, undefined, true);
  }, [paymentStageDs, settleHeaderDs]);

  const handleUpdateStage = useCallback(async () => {
    const matchRes = await settleHeaderDs.setState('submitType', 'stageLineReMatch').forceSubmit();
    if (!matchRes) return false;
    paymentStageDs.query();
    settleHeaderDs.query(undefined, undefined, true);
  }, [settleHeaderDs, paymentStageDs]);

  const handleOpenSyncDetail = useCallback(
    (topRecord) => {
      topRecord.set({ documentType: 'PAYMENT_STAGE' });
      Modal.open({
        drawer: true,
        title: intl.get('ssta.common.message.title.syncStatusDetail').d('同步状态明细'),
        closable: true,
        key: Modal.key(),
        className: styles['ssta-large-modal'],
        children: <LineSyncDetail topListDs={paymentStageDs} topRecord={topRecord} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [paymentStageDs]
  );

  const columns = useMemo(() => {
    if (paymentStageTypeCustom === 'PAYMENT_STAGE') {
      return [
        {
          name: 'lineNum',
          width: 80,
        },
        {
          name: 'stageDocumentAndLineNum',
          width: 140,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        {
          name: 'stageNum',
          width: 100,
        },
        {
          name: 'stageDesc',
          width: 120,
        },
        {
          name: 'stageAmount',
          width: 100,
        },
        {
          name: 'paymentAmount',
          width: 140,
          help: intl
            .get('ssta.purchaseSettle.model.prePayment.docPaymentAmountTips')
            .d(
              '预付款行「预付款行金额」，分摊至编制确认明细行的「本次实际付款金额」后，按「阶段」维度汇总的「本次实际付款金额」'
            ),
        },
        {
          name: 'applyOccupyAmount',
          width: 140,
        },
        {
          name: 'applyAmount',
          width: 140,
        },
        {
          name: 'enableApplyAmount',
          width: 140,
        },
        {
          name: 'prepPaymentAmount',
          width: 140,
        },
        {
          name: 'paymentOccupyAmount',
          width: 140,
        },
        {
          name: 'enablePaymentAmount',
          width: 140,
        },
        {
          name: 'prepLatestPaymentDate',
          width: 160,
        },
        {
          name: 'prepLastPaymentDate',
          width: 160,
        },
        {
          name: 'shareFlag',
          width: 140,
          renderer: ({ value }) => yesOrNoRender(Number(value)),
        },
      ];
    } else {
      return [
        {
          name: 'lineNum',
          width: 80,
        },
        {
          name: 'prepDocumentAndLineNum',
          width: 160,
          renderer: ({ value, record }) => {
            const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
            return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
          },
        },
        {
          name: 'stageNum',
          width: 120,
        },
        {
          name: 'stageDesc',
          width: 160,
        },
        {
          name: 'paymentAmount',
          width: 140,
          help: intl
            .get('ssta.purchaseSettle.model.prePayment.docPaymentAmountLineTips')
            .d(
              '预付款行「预付款行金额」，按「关联单据编号-行号」匹配「条款来源单据编号」，结合编制确认明细行「可付款金额」「编制确认日期（由近到远）」，分摊至对应明细行的「本次实际付款金额」'
            ),
        },
        {
          name: 'applyAmount',
          width: 140,
        },
        {
          name: 'applyOccupyAmount',
          width: 140,
        },
        {
          name: 'enableApplyAmount',
          width: 140,
        },
        {
          name: 'prepPaymentAmount',
          width: 140,
        },
        {
          name: 'paymentOccupyAmount',
          width: 140,
        },
        {
          name: 'enablePaymentAmount',
          width: 140,
        },
        {
          name: 'prepPaymentDate',
          width: 160,
        },
        {
          name: 'syncStatus',
          width: 140,
          renderer: (rendererProps) => {
            const { value, record } = rendererProps;
            const partProps =
              value === 'WITHOUT_SYNC'
                ? {}
                : { icon: 'wysiwyg', onClick: () => handleOpenSyncDetail(record) };
            return statusTagRender({ ...rendererProps, ...partProps });
          },
        },
        {
          name: 'shareFlag',
          width: 140,
          renderer: ({ value }) => yesOrNoRender(Number(value)),
        },
        {
          name: 'prepRelationNum',
          width: 200,
        },
      ];
    }
  }, [paymentStageTypeCustom, handleOpenSyncDetail]);

  const buttons = useMemo(() => {
    return [
      paymentStageTypeCustom === 'PAYMENT_STAGE' && ['NEW', 'RETURN'].includes(settleStatus) && (
        <Button icon="update" key="updateStage" name="updateStage" onClick={handleUpdateStage}>
          {intl
            .get('ssta.purchaseSettle.model.prePayment.updateStageInfo')
            .d('更新阶段信息并重新分摊付款金额')}
        </Button>
      ),
      paymentStageTypeCustom !== 'PAYMENT_STAGE' && !['NEW'].includes(settleStatus) && (
        <Button
          icon="sync"
          key="resync"
          name="resync"
          onClick={handleResync}
          disabled={isEmpty(selected)}
        >
          {intl.get('ssta.purchaseSettle.model.prePayment.resync').d('重新同步')}
        </Button>
      ),
    ];
  }, [paymentStageTypeCustom, handleUpdateStage, handleResync, selected, settleStatus]);

  return customizeTable(
    {
      code: customCodeMap[paymentStageTypeCustom].LIST,
      readOnly: readOnlyFlag,
    },
    <SearchBarTable
      key={customCodeMap[paymentStageTypeCustom].SEARCH} // 同一个ds对应不同筛选器
      columns={columns}
      dataSet={paymentStageDs}
      style={{ maxHeight: 620 }}
      buttons={buttons}
      searchCode={customCodeMap[paymentStageTypeCustom].SEARCH}
      searchBarConfig={{
        closeFilterSelector: true,
        right: {
          render: () => (
            <div>
              <Select
                clearButton={false}
                value={paymentStageTypeCustom}
                onChange={handleStageTypeChange}
              >
                <Option value="PAYMENT_STAGE">
                  {intl
                    .get('ssta.purchaseSettle.model.prePayment.viewPaymentStage')
                    .d('按阶段聚合展示')}
                </Option>
                <Option value="PAYMENT_STAGE_LINE">
                  {intl
                    .get('ssta.purchaseSettle.model.prePayment.viewPaymentLineStage')
                    .d('按阶段明细展示')}
                </Option>
              </Select>
            </div>
          ),
        },
      }}
    />
  );
});

export default PaymentStage;
