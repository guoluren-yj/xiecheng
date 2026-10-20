/*
 * @Date: 2023-04-23 09:38:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Steps } from 'choerodon-ui';
import { isNumber, isNil } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { useObserver } from 'mobx-react-lite';
import { useDataSet, Form, Spin } from 'choerodon-ui/pro';
import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

import { getResponse, filterNullValueObject } from 'utils/utils';

import { queryGuideSupplierInfo } from '@/services/workbenchService';
import styles from './index.less';
import { getIndexDS } from './getIndexDS';
import { getStepList, getOperabilityDoc } from './utils';

const { Step } = Steps;

const OperationGuide = ({ modal, dispatch }, ref) => {
  const [current, setCurrent] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState({});

  const dataSet = useDataSet(() => getIndexDS(), []);

  const {
    isSynergy,
    partnerFlag,
    partnerType,
    operateType,
    companyId,
    companyName,
    supplierCompanyId,
  } = useObserver(() =>
    dataSet.current.get([
      'isSynergy',
      'partnerFlag',
      'partnerType',
      'operateType',
      'companyId',
      'companyName',
      'supplierCompanyId',
    ])
  );

  useImperativeHandle(ref, () => ({
    handleJumpDetail,
  }));

  useEffect(() => {
    if (isSynergy) {
      modal.update({
        okProps: { disabled: false },
      });
    }
  }, [isSynergy]);

  // 查询供应商相关信息
  const handleSupplierInfo = useCallback(value => {
    setCurrent(0);
    if (value) {
      setSpinning(true);
      queryGuideSupplierInfo({
        supplierCompanyName: value,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            setSupplierInfo({ ...res, partnerType: isNil(res.partnerType) ? 2 : res.partnerType });
            dataSet.current.set({
              supplierCompanyId: res.supplierCompanyId,
            });
            setCurrent(cur => cur + 1);
          }
        })
        .finally(() => {
          setSpinning(false);
        });
    } else {
      setSupplierInfo({});
    }
  }, []);

  // 操作改变时的回调
  const handleOperateChange = key => {
    const currentIndex = stepList.findIndex(n => n.key === key);
    // 处理先显示是否协同再显示可操作提示
    if (key === 'operateType') {
      const { synergyFlag } = supplierInfo;
      if (isNumber(synergyFlag)) {
        dataSet.current.set({
          isSynergy: synergyFlag.toString(),
        });
        setCurrent(isNumber(synergyFlag) ? currentIndex + 2 : currentIndex + 1);
      }
    } else {
      setCurrent(currentIndex + 1);
    }
  };

  // 跳转对应页面
  const handleJumpDetail = useCallback(() => {
    const { key } = getOperabilityDoc(partnerFlag, partnerType, operateType, isSynergy);
    const {
      newRegisterFlag,
      newInvestigateFlag,
      newSupChangeFlag,
      supplierCompanyName,
    } = supplierInfo;
    let pathname = '';
    switch (key) {
      case 'questionnaire':
        pathname = newInvestigateFlag
          ? '/sslm/purchaser-investigation/detail/create'
          : '/sslm/investigation/create';
        break;
      case 'supplierInfoChange':
        pathname = newSupChangeFlag
          ? '/sslm/supplier-inform-change-new/detail/create'
          : '/sslm/supplier-inform-change/list';
        break;
      case 'supplierInvite':
        pathname = newRegisterFlag
          ? '/sslm/supplier-invite-manage/list'
          : '/spfm/company-search/supplier';
        break;
      case 'supplierEntry':
        pathname = '/sslm/supplier-entry/list';
        break;
      default:
        break;
    }
    if (pathname) {
      dispatch(
        routerRedux.push({
          pathname,
          search: querystring.stringify(
            filterNullValueObject({
              companyId,
              supplierCompanyId,
              supplierCompanyName,
              sourceType: 'GUIDE',
            })
          ),
        })
      );
    }
  }, [companyId, companyName, partnerFlag, partnerType, operateType, isSynergy, supplierInfo]);

  const stepList = getStepList({
    dataSet,
    supplierInfo,
    onChange: handleOperateChange,
    onSupplierChange: handleSupplierInfo,
  });

  return (
    <Spin spinning={spinning}>
      <Form columns={1} dataSet={dataSet} labelLayout="float">
        <Steps current={current} size="small" direction="vertical" className={styles['steps-wrap']}>
          {stepList.map(step => (
            <Step key={step.key} title={step.title} description={step.children} />
          ))}
        </Steps>
      </Form>
    </Spin>
  );
};

export default forwardRef(OperationGuide);
