import React, { useCallback, useContext } from 'react';

import { observer } from 'mobx-react-lite';
import { Modal, } from 'choerodon-ui/pro';
import { Statistic, Text, } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';

import { amountRender } from '../../../../utils/utils';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import CostRule from '../CostRule';
import OperationRecord from '../../components/OperationRecord';


import styles from '../../index.less';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

// 头信息基础卡片
const HeaderInfoCmp = observer(() => {
  const {
    loading,
    depositId,
    // approvePoint,
    // approvePointMeaning,
    permissionMap,
    depositHeaderDs,
    customizeBtnGroup,
    // sourceProjectId,
    getCustomizeUnitCode,
    customizeCommon,
  } = useContext<StoreValueType>(Store);

  const approvePointMap = {
    'DEPOSIT.DEPOSIT_RETURN_SUPPLIER': intl.get('ssta.sourcingCost.view.message.return.deposit-amount').d('本次退回保证金金额'),// 保证金退回供应商
    'DEPOSIT.DEPOSIT_OFFLINE_CONFIRM': intl.get('ssta.sourcingCost.view.message.paid.deposit-amount').d('本次缴纳保证金金额'), // 保证金缴纳人为确认
    'DEPOSIT.DEPOSIT_TRANSFER_DEPOSIT': intl.get('ssta.sourcingCost.view.message.transfer.deposit-amount').d('本次转入保证金金额'),  // 保证金缴纳保证金 
  };

  const basicCurrent = depositHeaderDs?.current;

  const handleViewCostRule = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
      className: styles['ssta-small-modal'],
      children: <CostRule />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handleViewOperation = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      className: styles['ssta-medium-modal'],
      children: <OperationRecord depositId={depositId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [depositId]);

  // const buttons = useMemo(() => {

  //   return normalBtns;
  // }, [
  //   loading,
  //   depositId,
  //   permissionMap,
  //   depositHeaderDs,
  //   handleViewCostRule,
  //   handleViewOperation,
  // ]);
  
  // 基础卡片字段配置
  const afFieldsConfig = {
    companyName: {
      render({ value, record }) {
        return value && <Text style={{ maxWidth: '350px' }}>{value}-{record.get('depositNum')}</Text>;
      },
    },
    operationTypeMeaning: {
      render({record}) {
        return (
          (
            <div style={{ padding: '1px 4px' }}>
              <span>
                <Text style={{ maxWidth: '200px' }}>{record.get('operationTypeMeaning')}</Text>
              </span>
            </div>
          )
        );
    }
    },
  };

  // 头信息卡片按钮
  const contentBottomRender = () => {
    const buttons = [
      permissionMap?.get('depositPrint') && {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child:  intl.get('ssta.common.view.button.print').d('打印'),
        btnProps: {
          buttonText: intl.get('ssta.common.view.button.print').d('打印'),
          buttonProps: { funcType: 'flat', wait: 1000 },
          requestUrl: `${apiPrefix}/deposits/list-print-new`,
          method: 'PUT',
          data: { depositIdList: [depositId], menuCamp: 'PURCHASER' },
          successCallBack: () => depositHeaderDs.query(),
          loading,
        },
      },
      {
        name: 'costRule',
        child: intl.get('ssta.sourcingCost.view.button.sourcingCostRule').d('寻源费用规则'),
        btnProps: {
          loading,
          icon: 'ballot',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewCostRule,
        },
      },
      {
        name: 'operationRecord',
        child: intl.get('hzero.common.button.operation').d('操作记录'),
        btnProps: {
          loading,
          icon: 'assignment',
          funcType: FuncType.flat,
          color: ButtonColor.default,
          onClick: handleViewOperation,
        },
      },
    ];
    return customizeBtnGroup(
      {
        code: getCustomizeUnitCode('headerBtn'),
        pro: true,
      },
      <DynamicButtons buttons={buttons}  defaultBtnType='c7n-pro' />
    );
  };

  
  const contentRemainRender = useCallback(() => {
    if (basicCurrent) {
      const { operationAmount, currencyCode, operationType } = basicCurrent.get([
        'operationAmount',
        'currencyCode',
        'operationType',
      ]);
      
      const minusSign = operationType === 'DEPOSIT.DEPOSIT_RETURN_SUPPLIER' ? '-' : '';
      return (
        operationAmount && <Statistic
          valueStyle={{ fontWeight: 600 }}
          title={approvePointMap[operationType]}
          value={`${minusSign} ${amountRender({
            value: operationAmount,
            record: basicCurrent
          })} ${currencyCode}`}
        />
      );
    }
  }, [basicCurrent]);

  return customizeCommon(
    {
      code: getCustomizeUnitCode('headerInfo'),
      processUnitTag: 'AF-BASIC',
    },
    <AFBasic
      dataSet={depositHeaderDs}
      titleField="companyName"
      tagFields={['operationTypeMeaning']}
      normalFields={['creationDate', 'createdUserName']}
      fieldsConfig={afFieldsConfig}
      contentRemainWidth="25%"
      contentBottomRender={contentBottomRender}
      contentRemainRender={contentRemainRender}
    />
  );
});

export default HeaderInfoCmp;
