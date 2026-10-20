import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { getCurrentOrganizationId, getResponse, getCurrentTenant } from 'utils/utils';
import { Modal, message } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import intl from 'intl';
// import EmbedPage from '_components/EmbedPage';
import { isEmpty, noop } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';

import { getJumpRoutePrefixUrl } from '@/utils/utils';
import { INQUIRY } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';
import NewControlComponent from '@/routes/ssrc/QuotationController/NewDetail';
import OldControlComponent from '@/routes/ssrc/QuotationController/Detail';
import { fetchOldControllerConfig } from '@/services/inquiryHallService';
import {
  createBeforeDirectController,
  validateBeforeDirectController,
} from '@/services/inquiryHallNewService';

const organizationId = getCurrentOrganizationId();

const Index = (props) => {
  const { location: { pathname, search } = {}, match: { params = {} } = {}, history } = props;

  const [controllerLoading, setControllerLoading] = useState(false);
  const [pageParams, setPageParams] = useState({});
  const controlApiSyncFlagRef = useRef(0);
  const activeTabKey = useMemo(() => getJumpRoutePrefixUrl(pathname), [pathname]);

  useEffect(() => {
    init();
  }, []);

  // 关闭角色工作台弹框
  const closeRoleWorkBenchModal = useCallback(() => {
    const { modal = noop } = props;
    modal.close();
  }, []);

  // 手动构造history对象
  const structureHistory = (url) => {
    if (!url) return {};
    const location = {
      hash: '',
      pathname: url,
      search,
      state: undefined,
    };
    const commonProps = {
      href: url,
      ...props,
      history: {
        ...history,
        location,
      },
      location,
    };
    return commonProps;
  };

  const init = async () => {
    const { rfxHeaderId } = params || {};

    setControllerLoading(true);

    try {
      const res = getResponse(
        await fetchOldControllerConfig({
          organizationId,
          tenant: getCurrentTenant().tenantNum,
        })
      );
      if (!res) {
        return;
      }
      if (!res.length) {
        const result = getResponse(
          await validateBeforeDirectController({
            organizationId,
            sourceHeaderId: rfxHeaderId,
            sourceFrom: 'RFX',
          })
        );
        if (result) {
          const onOk = async () => {
            if (controlApiSyncFlagRef.current === 1) {
              return;
            }

            controlApiSyncFlagRef.current = 1;
            const createRes = await createBeforeDirectController({
              organizationId,
              sourceHeaderId: rfxHeaderId,
              sourceFrom: 'RFX',
            });
            controlApiSyncFlagRef.current = 0;

            if (createRes) {
              if (!createRes.failed) {
                const url = `${activeTabKey}/new-rfx-detail-controller/:rfxId`;
                const childInParameter = {
                  ...structureHistory(url),
                  match: {
                    params: {
                      rfxId: createRes.adjustRecordId,
                    },
                    path: url,
                  },
                  isNewComponent: true,
                  closeRoleWorkBenchModal,
                };
                setPageParams(childInParameter);
              } else {
                message.warning(createRes.message);
              }
            }
          };
          if (result.validateResult === 'createAdjustAgain') {
            Modal.confirm({
              key: Modal.key(),
              title: intl
                .get(`ssrc.inquiryHall.view.message.title.commonAdjustagain`, {
                  documentTypeName: this.documentTypeName,
                  sourceName: this.sourceName,
                })
                .d(`{documentTypeName}中的部分信息已变更，是否重新发起{sourceName}过程控制？`),
              onOk: () => onOk(),
            });
          } else if (result.validateResult === 'createAdjust') {
            await onOk();
          } else if (result.validateResult === 'openAdjust') {
            const url = `${activeTabKey}/new-rfx-detail-controller/:rfxId`;
            const childInParameter = {
              ...structureHistory(url),
              match: {
                params: {
                  rfxId: result.adjustRecordId,
                },
                path: url,
              },
              isNewComponent: true,
              closeRoleWorkBenchModal,
            };
            setPageParams(childInParameter);
          }
        }
      } else {
        const url = `${activeTabKey}/rfx-detail-controller/:rfxId`;
        const childInParameter = {
          ...structureHistory(url),
          match: {
            params: {
              rfxId: rfxHeaderId,
            },
            path: url,
          },
        };
        setPageParams(childInParameter);
      }
    } catch (error) {
      throw error;
    } finally {
      setControllerLoading(false);
      controlApiSyncFlagRef.current = 0;
    }
  };

  return !isEmpty(pageParams) ? (
    // <EmbedPage {...pageParams} />
    pageParams?.isNewComponent ? (
      <NewControlComponent {...pageParams} />
    ) : (
      <OldControlComponent {...pageParams} />
    )
  ) : (
    <Spin size="large" spinning={controllerLoading} />
  );
};

const HocComponent = (Comp, type = INQUIRY) => {
  return formatterCollections({ code: ['ssrc.inquiryHall'] })(
    CombineComponent({
      sourceKey: type,
    })(Comp)
  );
};

export { Index, HocComponent };

export default HocComponent(Index);
