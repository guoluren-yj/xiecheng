/*
 * @Description: 外部寻源
 * @Date: 2025-05-22 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import { isEmpty } from 'lodash';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchPrivacyPolicyText } from '@/services/outsideProjectSetupService';
import Cmp from './Cmp';
import './index.less';

const CreatedBtn = props => {
  const { setLoading, loading, mixObj, tabKey, dispatch } = props;

  // 当前展示的协议
  const [currentAgreement, setCurrentAgreement] = useState({});

  // 跳转明细页
  const jumpDetail = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/oueside-project-setup/create',
        search: querystring.stringify({
          tabKey,
        }),
      })
    );
  };

  // 获取detailColumns函数返回的基本信息
  const handleAdd = () => {
    if (!isEmpty(currentAgreement) && !mixObj.agreementFlag) {
      Modal.open({
        header: null,
        border: false,
        style: { width: 600 },
        bodyStyle: { padding: 0 },
        footer: null,
        className: 'sslm-agreement-modal',
        children: <Cmp {...props} currentAgreement={currentAgreement} jumpDetail={jumpDetail} />,
      });
    } else {
      jumpDetail();
    }
  };

  useEffect(() => {
    queryAgreement();
  }, []);

  // 查询隐私协议
  const queryAgreement = async () => {
    const platformQueryParams = {
      partnerTenantId: 0,
      companyId: 0,
      textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
    };
    setLoading(true);
    fetchPrivacyPolicyText(platformQueryParams)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          setCurrentAgreement(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Button loading={loading} color="primary" type="c7n-pro" icon="add" onClick={handleAdd}>
      {intl.get('hzero.common.button.creat').d('新建')}
    </Button>
  );
};

export default CreatedBtn;
