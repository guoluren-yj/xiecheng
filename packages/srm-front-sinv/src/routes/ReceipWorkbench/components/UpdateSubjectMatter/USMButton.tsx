import React, {FC} from 'react';
import intl from 'utils/intl';
import { Button, Modal, DataSet, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { indexDataSet } from '@/routes/components/CustomFormAndTableWrapper';
import ContentTable from './ContentTable';
import { lineCmsFun, fetchLine } from './methods';
import {confirm} from './services';

interface USMButtonProps {
  buttonProps?: any;
  btnText?: string;
  features?: string;
  funcType?: FuncType;
  color?: ButtonColor;
  loading?: boolean;
  dataSet?: DataSet;
  disabled?: boolean;
  inMenuItem?: boolean;
  isSlodConfig?: boolean;
};

const USMButton: FC<USMButtonProps> = (props: USMButtonProps) => {

  const {
      loading,
      features,
      dataSet,
      disabled = false,
      inMenuItem,
      btnText = '',
      isSlodConfig,
      buttonProps = {icon: 'edit-o', funcType: FuncType.flat},
  } = props;

  const message = {
    orderTypeCode: intl.get('sinv.receiptExecution.model.receipt.orderTypeCodeIsPC').d('校验失败，失败原因是勾选的事务行来源协议，不允许更新收货策略'),
    initialNodeFlag: intl.get('sinv.receiptExecution.model.receipt.initialNodeFlag').d('校验失败，失败原因是勾选的事务行存在非初始节点数据，仅允许勾选初始节点待收货数据进行策略更新'),
    celue: intl.get('sinv.receiptExecution.model.receipt.strategyCodeMessage').d('校验失败，失败原因是勾选的事务行收货策略不一致，仅允许勾选策略一致的数据批量策略更新'),
    moreThanOneHundred: intl.get('sinv.receiptExecution.model.receipt.moreThanOneHundred').d('校验失败，失败原因是勾选的事务行记录超过100条，仅允许勾选100条以内数据批量策略更新'),
  };

  const openModal = () => {

    const { lineCms, formCms, optionCms } = lineCmsFun();

    const data = dataSet?.selected?.map(item=> item.toData())?.map((m) => ({ ...m, inventoryId: m._inventoryId, locatorId: m._locatorId })) || [];


    if (features === "subMat") {
      if (data?.length > 100) return notification?.warning({ message: message?.moreThanOneHundred });

      if (data?.every(item => item?.orderTypeCode === 'PC')) return notification?.warning({ message: message?.orderTypeCode });

      if (data?.every(item => item?.initialNodeFlag === 0)) return notification?.warning({ message: message?.initialNodeFlag });

      const firstStrategyCode = data[0]?.strategyCode;
      if (!data?.every(item => item?.strategyCode === firstStrategyCode)) return notification?.warning({ message: message?.celue });
    }

    const ds = new DataSet(indexDataSet({
      selection: false,
      paging: features !== "subMat",
      read: features !== "subMat" ? fetchLine : undefined,
      componentData: features === "subMat"? lineCms : optionCms,
    }));

    const fromDs = new DataSet(indexDataSet({
      selection: false,
      forceValidate: true,
      componentData: formCms,
    }));

    if (features === "subMat") {
      const firststrategyHeaderId = data[0]?.strategyHeaderId;
      const firstStrategyCode = data[0]?.strategyCode;
      fromDs.loadData([{oldStrategyCode: firstStrategyCode, oldStrategyHeaderId: firststrategyHeaderId}]);
      ds?.loadData(data);
    };

    const lineProps = {
      ds,
      fromDs,
      features,
      loading,
    };

    Modal.open({
      key: 'updateSubjectMatter',
      title: btnText,
      drawer: true,
      children: <ContentTable {...lineProps} />,
      style: {
        width: 800,
      },
      okText: features === "subMat" ? intl.get('hzero.common.button.sure').d('确定') : intl.get('hzero.common.status.closed').d('关闭'),
      onOk: async () => {
        if(features !== "subMat") return true;
        const validate = await fromDs?.validate();
        if (!validate) {
          return false;
        };
        const res = await confirm({
          oldStrategyHeaderId: fromDs?.current?.get('oldStrategyHeaderId'),
          newStrategyHeaderId: fromDs?.current?.get('newStrategyHeaderId'),
          lineList: ds.toData(),
        });
        if (getResponse(res)) {
          (notification as any).success();
          dataSet?.query();
          return true;
        };
        return false;
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {features === "subMat" && cancelBtn}
        </div>
      ),
    });
  };

  const newBtnProps: any = { ...buttonProps };

  if (inMenuItem) newBtnProps.icon = undefined;

  const Btn = (
    <Button
      type="c7n-pro"
      loading={loading}
      onClick={openModal}
      disabled={disabled}
      {...newBtnProps}
    >
      {btnText}
    </Button>
  );

  if (!isSlodConfig && features === "subMat") {
    return (
      <Tooltip
        placement="topRight"
        title={intl.get('sinv.receiptWorkbench.view.button.updateSubjectMatterMsg').d('仅支持租户启用发货工作台且来源单据为发货单或订单时使用，在保持上游节点一致的情况下更新收货策略为指定策略')}
      >
        {Btn}
      </Tooltip>
    );
  };
  return Btn;
};

export default USMButton;