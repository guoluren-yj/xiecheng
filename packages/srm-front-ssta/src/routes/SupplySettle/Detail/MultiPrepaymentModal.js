import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { decimalPointAccuracy } from '@/routes/utils';
import { getResponse } from '@/utils/utils';
import { math } from 'choerodon-ui/dataset';
import { multiPrepaymentDS as multiPrepaymentDs } from '../../../stores/SupplySettleDS';
import MultiPrepaymentAddModal from './MultiPrepaymentAddModal';
import { getMutilPayApplySupplier } from '@/services/settlePoolServices';
import Styles from '@/routes/common.less';

const MultiPrepaymentModal = (props) => {
  let childModal;
  let tableRef;

  const {
    isModalEdit,
    modal,
    settleApplyLineList,
    topRecord,
    onSaveMultiPre,
    amountPer,
    headerCurrent,
    headerDS,
    multiDimensionDs,
    isList,
  } = props;
  const { settleStatus } = headerDS.toData()[0] || {};

  const settleHeaderId = isList
    ? topRecord.get('settleHeaderId')
    : headerDS.current.get('settleHeaderId');

  const [force, useForce] = React.useState(false);

  const multiPrepaymentDS = useMemo(() => {
    return new DataSet({
      ...multiPrepaymentDs(amountPer),
      events: {
        update: ({ value, record, name }) => {
          if (name === 'applyAmount' && (value || value === 0)) {
            record.set('applyAmount', math.toFixed(value, Number(amountPer)));
          }
        },
      },
    });
  }, []);

  useEffect(() => {
    useForce(true);
    if (!isList && ['NEW', 'RETURN'].includes(settleStatus)) {
      const preApplyAmountList = [];
      const multiPrepaymentAddList = [];
      multiDimensionDs.records.forEach((item) => {
        if (Array.from(item.get('settleApplyLineList')).length > 0) {
          Array.from(item.get('settleApplyLineList')).forEach((a) => {
            preApplyAmountList.push(a);
          });
        }
      });
      settleApplyLineList.forEach((row) => {
        let { defaultRemainingAmount } = row;
        const { applyAmount } = row;
        preApplyAmountList.forEach((input) => {
          if (input.prepaymentLineId === row.prepaymentLineId) {
            defaultRemainingAmount = math.minus(defaultRemainingAmount, input.applyAmount || 0);
          }
        });
        multiPrepaymentAddList.push({
          ...row,
          prepaymentRemainingAmount: math.plus(defaultRemainingAmount, applyAmount || 0),
        });
      });
      multiPrepaymentDS.loadData(multiPrepaymentAddList);
    } else {
      getMutilPayApplySupplier({
        paymentDimension: topRecord.get('paymentDimension'),
        settleHeaderId,
        documentNum: topRecord.get('documentNum'),
      }).then((res) => {
        if (getResponse(res)) {
          multiPrepaymentDS.loadData(res);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (tableRef) {
      tableRef.tableStore.width = document.body.clientWidth;
    }
  }, [force]);

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
      editor: isModalEdit,
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
    multiPrepaymentDS.push(...data);
    childModal.close();
  };

  const handleAdd = () => {
    childModal = Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-third-modal'],
      title: intl.get('ssta.supplySettle.view.title.preCollectionWriteOffAdd').d('预收款核销-新增'),
      children: (
        <MultiPrepaymentAddModal
          topRecord={topRecord}
          headerCurrent={headerCurrent}
          queryPrepayment={queryPrepayment}
          multiDimensionDs={multiDimensionDs}
          prepaymentLineIdList={multiPrepaymentDS
            .toData()
            .map((item) => item.prepaymentLineId)
            .join()}
          applyTotalAmount={multiPrepaymentDS
            .toData()
            .map((item) => item.applyAmount)
            .reduce((a = 0, b = 0) => math.plus(a, b), 0)}
        />
      ),
      footer: null,
    });
  };

  const handleCancle = () => {
    if (multiPrepaymentDS.selected.length) {
      const data = multiPrepaymentDS.filter((record) => !record.isSelected);
      multiPrepaymentDS.loadData(data.map((item) => item.toData()));
      const totalApplyAmount = data
        .map((item) => item.get('applyAmount'))
        .reduce((a = 0, b = 0) => math.plus(a, b), 0);
      topRecord.set('applyAmount', totalApplyAmount);
      topRecord.set('settleApplyLineList', data);
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
    <Button
      icon="delete"
      key="cancel"
      onClick={handleCancle}
      disabled={multiPrepaymentDS.selected.length === 0}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
  ];

  const handleSave = async () => {
    const flag = await multiPrepaymentDS.validate();
    if (flag) {
      onSaveMultiPre(multiPrepaymentDS.toData(), topRecord);
    }
  };

  return (
    <>
      <Table
        columns={columns}
        ref={(ref) => {
          tableRef = ref;
        }}
        dataSet={multiPrepaymentDS}
        selectionMode={isModalEdit ? 'rowbox' : 'none'}
        buttons={isModalEdit ? buttons : null}
        pagination={false}
      />
      {isModalEdit && (
        <div className="ssta-body-footer">
          <Button
            onClick={handleSave}
            color="primary"
            // disabled={multiPrepaymentDS.records.length === 0}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={modal.close}>{intl.get('hzero.common.button.cancel').d('取消')}</Button>
        </div>
      )}
    </>
  );
};

export default observer(MultiPrepaymentModal);
