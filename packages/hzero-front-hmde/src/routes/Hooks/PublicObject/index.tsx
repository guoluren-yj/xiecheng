// 业务对象发布
import React, { useRef } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { message } from 'choerodon-ui';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';

import ImgIcon from '@/utils/ImgIcon';
import { publicBusinessObjects, getOBDetailService } from '@/services/businessObjectService';

import PublishModal from './PublishModal';

interface IProps {
  queryParams?: boolean; // 是否查询发布参数 默认false
  _businessObjectId?: string;
  token?: string;
  _objectVersionNumber?: string;
  baseDS?: DataSet;
  initDetail?: any;
  ignoreWarning?: boolean;
  listRef?: any;
}
export const usePublicBusinessObjects = (props: IProps) => {
  const {
    queryParams = false,
    _businessObjectId,
    token,
    _objectVersionNumber,
    baseDS,
    initDetail,
    ignoreWarning = false,
    listRef,
  } = props;
  const paramsRef: any = useRef({});
  paramsRef.current = {
    _token: token,
    businessObjectId: _businessObjectId,
    objectVersionNumber: _objectVersionNumber,
    ignoreWarning,
  };

  const init = (boId) => {
    // 获取发布要参数
    return getOBDetailService({ boId }).then((res) => {
      if (getResponse(res)) {
        const { businessObjectId, _token, objectVersionNumber } = res;
        paramsRef.current = {
          _token,
          businessObjectId,
          objectVersionNumber,
          ignoreWarning,
        };
      }
    });
  };
  const handlePublicObject = async (boId?: string) => {
    if (queryParams) {
      await init(boId);
    }
    return publicBusinessObjects({ body: paramsRef.current, ignoreWarning }).then((res) => {
      if (res && !res?.failed) {
        // 业务对象查询
        // eslint-disable-next-line no-unused-expressions
        listRef?.current?.tableDS?.query();
        if (!isTenantRoleLevel()) {
          // eslint-disable-next-line no-unused-expressions
          listRef?.current?.extendTableDS?.query();
        }
        // eslint-disable-next-line no-unused-expressions
        listRef?.current?.baseInfoDS?.query();
        notification.success({
          message: intl.get('hmde.boComposition.view.message.releaseConfirm.success').d('发布成功'),
        });
        return true;
      } else if (res?.code.split('.')[2] !== 'publish') {
        notification.error({
          message: intl.get('hmde.common.status.error').d('失败'),
          description: res?.message,
          placement: 'bottomRight',
        });
      } else if (res?.code.split('.')[2] === 'publish') {
        Modal.open({
          style: { width: '1000px' },
          title: (
            <span>
              <ImgIcon
                name={res?.type === 'error' ? 'publish_fail.svg' : 'publish_warning.svg'}
                size={18}
                style={{ marginRight: 4 }}
              />{' '}
              {res?.type === 'error'
                ? intl.get('hzero.publish.title.fail').d('发布失败')
                : intl.get('hzero.publish.title.warn').d('发布警告')}
            </span>
          ),
          children: (
            <PublishModal
              data={res}
              baseInfoDS={baseDS}
              initDetail={initDetail}
              listRef={listRef}
            />
          ),
          okText: intl.get('hzero.common.button.sure').d('确定'),
          onOk: () => {},
          onCancel: () => {},
        });
      }
    });
  };
  return {
    handlePublicObject,
  };
};
