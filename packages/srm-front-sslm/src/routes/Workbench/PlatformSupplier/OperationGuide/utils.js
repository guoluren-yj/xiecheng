/*
 * @Date: 2023-04-23 10:16:11
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import React, { Fragment } from 'react';
import { useObserver } from 'mobx-react-lite';
import { TextField, Lov, SelectBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from './index.less';

// 获取步骤条集合
export const getStepList = ({ dataSet, supplierInfo, onSupplierChange, onChange }) => {
  const { isSynergy, operateType, companyName, partnerFlag } = useObserver(() =>
    dataSet.current.get(['isSynergy', 'operateType', 'companyName', 'partnerFlag'])
  );
  const { partnerType, supplierCompanyName, purchaseCompanyNames, companyCount } = supplierInfo;
  return [
    {
      key: 'supplier',
      title: intl.get('sslm.workbench.view.stepTitle.supplier').d('请输入将要发起操作的供应商'),
      children: (
        <TextField
          name="supplierCompanyName"
          style={{ width: '100%' }}
          onChange={onSupplierChange}
        />
      ),
    },
    partnerType === 1 && {
      key: 'choiceSubsidiary',
      title: intl.get('sslm.workbench.view.stepTitle.choiceSubsidiary').d('选择子公司'),
      children: (
        <Fragment>
          <span className={styles['supplier-wrap']}>
            <span className={styles['supplier-wrap-name']}>{supplierCompanyName}</span>
            {` ${intl.get('sslm.common.view.message.sum').d('和')} `}
            <span className={styles['supplier-wrap-name']}>
              {purchaseCompanyNames}
              {companyCount &&
                `${intl.get('sslm.common.view.message.wait').d('等')}${companyCount}${intl
                  .get('sslm.workbench.view.messgae.companys')
                  .d('家公司')}`}
            </span>
            {intl
              .get('sslm.workbench.view.messgae.noCooperation')
              .d('合作，其余公司均未建立合作关系。需要操作的子公司为？')}
          </span>
          <Lov
            name="companyLov"
            style={{ width: '100%', marginTop: 16 }}
            onChange={() => onChange('choiceSubsidiary')}
          />
        </Fragment>
      ),
    },
    (partnerType === 0 || partnerFlag) && {
      key: 'operateType',
      title: intl.get('sslm.workbench.view.stepTitle.operateType').d('选择操作类型'),
      children: (
        <Fragment>
          <span className={styles['supplier-wrap']}>
            <span className={styles['supplier-wrap-name']}>{supplierCompanyName}</span>{' '}
            {intl.get('sslm.common.view.message.alreadySum').d('已和')}{' '}
            <span className={styles['supplier-wrap-name']}>
              {companyName || intl.get('sslm.workbench.view.messgae.allSubsidiary').d('所有子公司')}
            </span>{' '}
            {intl
              .get('sslm.workbench.view.messgae.cooperation')
              .d('合作，是否需要变更信息或邀请新的销售员。')}
          </span>
          <SelectBox
            name="operateType"
            onChange={() => onChange('operateType')}
            style={{ marginTop: 32 }}
          />
        </Fragment>
      ),
    },
    (partnerType === 2 || operateType || partnerFlag === 0) && {
      key: 'isSynergy',
      title: intl.get('sslm.workbench.view.stepTitle.isSynergy').d('供应商是否在线协同'),
      children: (
        <SelectBox
          name="isSynergy"
          onChange={() => onChange('isSynergy')}
          style={{ marginTop: 16 }}
        />
      ),
    },
    isSynergy && {
      key: 'doableOperation',
      title: intl.get('sslm.workbench.view.stepTitle.doableOperation').d('可做操作'),
      children: (
        <span className={styles['supplier-wrap']}>
          {intl.get('sslm.workbench.view.messgae.operability').d('可做的操作为')}：
          <span className={styles['supplier-wrap-name']}>
            {getOperabilityDoc(partnerFlag, partnerType, operateType, isSynergy).message}
          </span>
          ，{intl.get('sslm.workbench.view.messgae.btnTrigger').d('点击确定按钮即可')}
        </span>
      ),
    },
  ].filter(Boolean);
};

// 获取可操作的单据
export const getOperabilityDoc = (partnerFlag, partnerType, operateType, isSynergy) => {
  // 已合作标识
  const cooperatedFlag = partnerFlag === 1 || partnerType === 0;
  // 是否协同标识
  const synergyFlag = Number(isSynergy) === 1;
  if (operateType === 'CHANGE_INFO' && synergyFlag) {
    return {
      key: 'questionnaire',
      message: intl.get('sslm.workbench.view.operability.questionnaire').d('发起调查表'),
    };
  } else if (operateType === 'CHANGE_INFO' && !synergyFlag) {
    return {
      key: 'supplierInfoChange',
      message: intl
        .get('sslm.workbench.view.operability.supplierInfoChange')
        .d('发起供应商信息变更'),
    };
  } else if (
    (operateType === 'NEW_PURCHASE_AGENT' || (isNil(operateType) && !cooperatedFlag)) &&
    synergyFlag
  ) {
    return {
      key: 'supplierInvite',
      message: intl.get('sslm.workbench.view.operability.supplierInvite').d('发起供应商邀约'),
    };
  } else if (
    (operateType === 'NEW_PURCHASE_AGENT' || (isNil(operateType) && !cooperatedFlag)) &&
    !synergyFlag
  ) {
    return {
      key: 'supplierEntry',
      message: intl.get('sslm.workbench.view.operability.supplierEntry').d('发起供应商录入'),
    };
  } else {
    return {};
  }
};
