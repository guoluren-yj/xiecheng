/*
 * PaymentTermInfo - 订单明细页-订单付款条款信息
 * @date: 2024/08/29 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import { compose, noop } from 'lodash';
import { isObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

import React, { useCallback, useMemo } from 'react';
import { Form, Lov, Output, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { handleOpenFundTermIdDetail } from '@/routes/components/utils';
import { paymentTermInfo } from './store';

const PaymentTermInfo = (props) => {
  const {
    ds,
    source,
    customizeForm,
    customizeCode,
    getValues = noop,
    fetchDetailHeader,
    isSupplier = false,
    setChangeFlag, // 仅变更传
  } = props;
  const edit = useMemo(() => ['maintenance', 'change'].includes(source), [source]);
  const {
    fundTermId,
    poHeaderId,
    fundTermEditFlag,
    oldTermHideFlag,
    fundTermDimension,
  } = ds.current.get([
    'fundTermId',
    'poHeaderId',
    'fundTermEditFlag',
    'oldTermHideFlag',
    'fundTermDimension',
  ]);
  const changeFieldsList = ds.getState('changeFieldsList');

  const fundTermDetailDisabled = useMemo(
    () => !(poHeaderId && (isObservable(fundTermId) ? fundTermId.termHeaderId : fundTermId)),
    [fundTermId, poHeaderId]
  );

  const showFundTermDetail = useMemo(() => {
    switch (source) {
      case 'maintenance':
        return fundTermEditFlag && oldTermHideFlag;
      case 'change':
        return (
          (isObservable(fundTermId) ? fundTermId.termHeaderId : fundTermId) && fundTermDimension
        );
      default:
        return fundTermDimension;
    }
  }, [fundTermEditFlag, oldTermHideFlag, source, fundTermId, fundTermDimension]);

  const fundTermDisabled = useMemo(
    () => changeFieldsList && !changeFieldsList.includes('fundTermId'),
    [changeFieldsList]
  );

  const handleFundTermIdDetail = useCallback(async () => {
    const values = getValues() || {};
    await handleOpenFundTermIdDetail(fundTermDisabled ? undefined : source, {
      body: { ...values, poHeaderDetailDTO: { ...values.poHeaderDetailDTO, saveFlag: 1 } },
      ds,
      fetchDetailHeader,
      setChangeFlag,
    });
  }, [getValues, fundTermDisabled]);

  const paymentTermForm = edit ? (
    <Form dataSet={ds} columns={3} labelLayout="float" useWidthPercent>
      <Lov name="fundTermId" disabled={fundTermDisabled} />
      {showFundTermDetail && (
        <Output
          name="fundTermIdDetail"
          renderer={() => (
            <Button
              funcType="link"
              onClick={handleFundTermIdDetail}
              disabled={fundTermDetailDisabled}
            >
              {fundTermDisabled
                ? intl.get('sodr.workspace.view.option.view').d('查看')
                : intl.get('sodr.workspace.view.option.edit').d('编辑')}
            </Button>
          )}
        />
      )}
      {source === 'change' && <Output name="fundTermDimension" />}
    </Form>
  ) : (
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      <Output name="fundTermId" />
      {!isSupplier && showFundTermDetail && (
        <Output
          name="fundTermIdDetail"
          renderer={() => (
            <Button
              funcType="link"
              onClick={handleFundTermIdDetail}
              disabled={fundTermDetailDisabled}
            >
              {intl.get('sodr.workspace.view.option.view').d('查看')}
            </Button>
          )}
        />
      )}
      {!isSupplier && fundTermDimension && <Output name="fundTermDimension" />}
    </Form>
  );
  return customizeForm({ code: customizeCode }, paymentTermForm);
};

export default compose(observer)(PaymentTermInfo);

export { paymentTermInfo };
