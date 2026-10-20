import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { decimalPointAccuracy } from '@/routes/utils';
import { math } from 'choerodon-ui/dataset';
import { prepaymentDS as prepaymentDs } from '@/stores/SupplySettleDS';
import PrepaymentAddModal from './PrepaymentAddModal';
import Styles from '@/routes/common.less';

const PrepaymentModal = (props) => {
  const { topRecord, onSavePre, modal } = props;

  let childModal;

  const prepaymentDS = useMemo(() => {
    return new DataSet({
      ...prepaymentDs(topRecord.get('amountPrecision'), 'quoteInvoice'),
      events: {
        update: ({ value, record, name }) => {
          if (name === 'applyAmount' && (value || value === 0)) {
            record.set(
              'applyAmount',
              math.toFixed(value, Number(topRecord.get('amountPrecision')))
            );
          }
        },
      },
    });
  }, []);

  useEffect(() => {
    const { settleApplyLineList } = topRecord.toData();
    if (isArray(settleApplyLineList)) {
      prepaymentDS.loadData(settleApplyLineList);
    }
  }, []);

  const columns = [
    {
      width: 250,
      name: 'prepaymentTitle',
    },
    {
      width: 150,
      name: 'prepaymentRemainingAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'applyAmount',
      editor: true,
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'prepaymentAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'prepaymentTypeMeaning',
    },
    {
      width: 150,
      name: 'associateNum',
    },
    {
      width: 150,
      name: 'prepaymentCreatedBy',
    },
    {
      width: 150,
      name: 'prepaymentCreationDate',
    },
  ];

  const queryPrepayment = (data) => {
    prepaymentDS.push(...data);
    childModal.close();
  };

  const handleAdd = () => {
    const selectKeys = prepaymentDS
      .toData()
      .map((item) => item.prepaymentLineId)
      .join();
    childModal = Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-second-modal'],
      title: intl.get('ssta.supplySettle.view.title.preCollectionWriteOffAdd').d('预收款核销-新增'),
      children: (
        <PrepaymentAddModal
          queryPrepayment={queryPrepayment}
          prepaymentLineIdList={selectKeys}
          topRecord={topRecord}
        />
      ),
      footer: null,
    });
  };

  const handleCancle = () => {
    if (prepaymentDS.selected.length) {
      const data = prepaymentDS.filter((record) => !record.isSelected);
      prepaymentDS.loadData(data.map((item) => item.toData()));
    } else {
      notification.warning({
        message: intl
          .get('ssta.supplySettle.view.notification.selectedEmpty')
          .d('请至少勾选一条数据'),
      });
    }
  };

  const buttons = [
    <Button icon="playlist_add" onClick={handleAdd}>
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <Button icon="delete" key="cancel" onClick={handleCancle}>
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
  ];

  const handleSave = async () => {
    const flag = await prepaymentDS.validate();
    if (flag) {
      onSavePre(prepaymentDS.toData(), topRecord);
    }
  };

  return (
    <>
      <Table pagination={false} columns={columns} dataSet={prepaymentDS} buttons={buttons} />
      <div style={{ float: 'right', marginTop: 10 }}>
        <Button onClick={handleSave} color="primary">
          {intl.get('hzero.common.button.confirm').d('确认')}
        </Button>
        <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
      </div>
    </>
  );
};

export default PrepaymentModal;
