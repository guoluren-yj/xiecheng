import React, { useEffect, useContext, useCallback, memo, useRef } from 'react';
import { Modal } from 'choerodon-ui/pro';
import moment from 'moment';
import { isString } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  // getResponse,
  getCurrentRole,
  getCurrentUserId,
  getCurrentTenant,
  getCurrentOrganizationId,
  getCurrentUser,
} from 'utils/utils';
import dvaFetch from 'dva/fetch';
// import intl from 'utils/intl';
import request from 'utils/request';
// import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { getEnvConfig } from 'utils/iocUtils';
import UserStatusContext from '../LeadLink/UserStatusContext';

function getZhenyunTenantId() {
  const { ENV_NAME = '' } = getEnvConfig() as any;
  if (ENV_NAME.endsWith('DEV')) {
    return '30';
  } else if (ENV_NAME.endsWith('TEST')) {
    return '3';
  } else if (ENV_NAME.endsWith('PRD')) {
    return '65';
  }
}

function formatReason(reason): string {
  if (!reason) return '';
  try {
    if (reason instanceof Error) {
      return JSON.stringify({
        message: reason.message,
        stack: reason.stack,
        name: reason.name,
      });
    }
    return typeof reason === 'object' ? JSON.stringify(reason) : String(reason);
  } catch {
    return 'formatReason serializing error failed';
  }
}

const USERS = 'ALIYUN_PING_PINGED_USERS';
const TIME = 'ALIYUN_PING_PINGED_TIME'; // 按天更新

const AliyunPing = props => {
  const { lock: lockPromise } = props;
  const pingedRef = useRef<boolean>(false);
  const userStatusPromise = useContext<Promise<any>>(UserStatusContext);

  // const ds = useDataSet(
  //   () => ({
  //     autoCreate: true,
  //     fields: [{ name: 'forceFinish', type: FieldType.boolean, defaultValue: false }],
  //   }),
  //   []
  // );

  const handleIfFinish = useCallback(async () => {
    const pingedUsers = localStorage.getItem(USERS) || '|';
    localStorage.setItem(USERS, `${pingedUsers}${getCurrentUserId()}|`);
    // const forceFinish = ds.current?.get('forceFinish');
    // if (forceFinish) {
    //   const { tenantId } = getCurrentTenant() || {};
    //   const res = getResponse(
    //     await request(
    //       `/marmot/v1/${getCurrentOrganizationId()}/marmot-api-public/jdicyXEpOEQSAHDbmUjYR7ibFbOriaPl6qibpR70kAiaGxSoNzn3XxSda7ia2HDVSWeMJY`,
    //       {
    //         method: 'GET',
    //         query: { tenantId, userId: getCurrentUserId },
    //         body: { needFlag: 0 },
    //       }
    //     )
    //   );
    //   if (!res) return false;
    // }
  }, []);

  const handlePing = useCallback(async () => {
    const { id: userId, loginName } = getCurrentUser() || {};
    const { tenantId, tenantNum = '' } = getCurrentTenant() || {};
    const pingUrlList = [
      'https://check-net.test.isrm.going-link.com/',
      'https://check-net-oss.test.isrm.going-link.com/',
      'https://check-net-ops.going-link.com/',
      'https://check-net.going-link.com/',
      'https://check-net-oss.going-link.com/',
    ];

    const pingResList = await Promise.allSettled(
      pingUrlList.map(url =>
        (dvaFetch as any)(url, { method: 'GET' }).then(async (res: any) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          return JSON.stringify(data);
        })
      )
    ).then(results =>
      results.map((res: any, index) => {
        const { status, value, reason } = res;
        return {
          tenantId,
          tenantNum,
          userId,
          loginName,
          testUrl: pingUrlList[index],
          result: status === 'rejected' ? formatReason(reason) : value,
        };
      })
    );
    const resultSendRes = await request(
      `/marmot/v1/${getZhenyunTenantId()}/marmot-api-public/jdicyXEpOEQSAHDbmUjYR75gDibfFBRsPiaACykBxhENLE`,
      {
        method: 'POST',
        body: pingResList,
      }
    );
    if (resultSendRes && resultSendRes.flag) {
      handleIfFinish();
    }
  }, []);

  const openInitModal = useCallback(async () => {
    const { tenantNum = '' } = getCurrentTenant() || {};
    const { code: currentRoleCode } = getCurrentRole() || {};
    if (tenantNum.startsWith('SRM-') && currentRoleCode === 'administrator') {
      // const res = await request(
      //   `/marmot/v1/${getCurrentOrganizationId()}/marmot-api-public/jdicyXEpOEQSAHDbmUjYR7ibFbOriaPl6qibpR70kAiaGxSoNzn3XxSda7ia2HDVSWeMJY`,
      //     method: 'GET',
      //     query: { tenantId, userId: getCurrentUserId },
      //   }
      // );
      // if (!res) return;
      // const { needFlag } = res;
      // if (Number(needFlag) === 0) return;
      pingedRef.current = true;
      Modal.open({
        closable: false,
        key: Modal.key(),
        closeOnLocationChange: false,
        keyboardClosable: false,
        style: { width: 600, zIndex: 10 },
        bodyStyle: {
          padding: '48px 24px 24px',
          maxHeight: 'calc(100vh - 172px)',
        },
        contentStyle: { borderRadius: 8 },
        title: '甄云SRM公有云服务器迁移测试',
        children: (
          <div>
            <p>衷心感谢各位新老客户对SRM公有云服务器迁移工作的理解和支持。</p>
            <p>
              目前我们正在做前期的迁移测试和验证工作，2025年11月我们完成了DEV环境的迁移验证，目前在平稳运行中；我们预计将在2026年1月10日，完成Test环境的迁移，并进行环境验证工作。根据验证结果，我们将给出后续的详细迁移计划。同时为了验证服务器迁移后，用户的网页访问及接口访问，在TEST环境迁移时，将进行网络访问的第一轮测试。
            </p>
            <p>
              本次弹窗提示，您点击同意测试后，我们将基于当前的网络环境发起对前期已发布的阿里云环境的IP地址的网络访问测试，并记录相应的测试结果。针对此次测试，建议您在办公网络环境下进行，如有可能，建议您在IDC机房的网络环境下也打开登录页面，完成本次测试。
            </p>
            <p>
              再次感谢您的支持，后续针对迁移工作，有任何的疑问，您可以通过客户成功经理、销售、运维经理等渠道反馈您的建议、疑问和问题。
            </p>
          </div>
        ),
        okText: '参与测试',
        cancelText: '现在不测',
        onOk: handlePing,
        onCancel: handleIfFinish,
        footer: (okBtn, cancelBtn) => (
          <div
            style={{
              textAlign: 'right',
              margin: '-13px -24px -12px',
              padding: '24px',
            }}
          >
            {/* <CheckBox dataSet={ds} name="forceFinish">
              {intl.get('srm.common.button.aliyunPing.noTip').d('不再提示')}
            </CheckBox> */}
            {cancelBtn}
            {okBtn}
          </div>
        ),
      });
    }
  }, []);

  const handleInit = useCallback(async () => {
    const {
      ALIYUN_PING_METHOD: aliyunPingMethod,
    } = getEnvConfig() as any;
    const { tenantNum } = getCurrentTenant() || {};
    if (
      !userStatusPromise ||
      !aliyunPingMethod ||
      !isString(aliyunPingMethod) ||
      pingedRef.current ||
      !getZhenyunTenantId()
    ) {
      return;
    }
    const [method, excludeStr] = aliyunPingMethod.split('|');
    if (excludeStr && isString(excludeStr)) {
      const excludeTenantList = excludeStr.split(',').map(item => item.trim());
      if (excludeTenantList.includes(tenantNum)) {
        return;
      }
    }
    const [userStatus] = await Promise.all([userStatusPromise, lockPromise]);
    if (!userStatus) return;
    const pingedTime = localStorage.getItem(TIME) || '';
    if (pingedTime) {
      const isNewDay = moment().isAfter(moment(Number(pingedTime)), 'day');
      if (isNewDay) {
        localStorage.setItem(TIME, Date.now().toString());
        localStorage.setItem(USERS, '|');
      } else {
        const pingedUsers = localStorage.getItem(USERS) || '';
        const isPinged = pingedUsers.includes(`|${getCurrentUserId()}|`);
        if (isPinged) return;
      }
    } else {
      localStorage.setItem(TIME, Date.now().toString());
    }
    if (method === 'MODAL') {
      openInitModal();
    } else if (method === 'ALL') {
      pingedRef.current = true;
      handlePing();
    }
  }, [handlePing, openInitModal]);

  useEffect(() => {
    handleInit();
  }, []);

  return null;
};

AliyunPing.displayName = 'AliyunPing';
export default formatterCollections({ code: 'srm.common' })(memo(AliyunPing));
