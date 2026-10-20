import React, { useCallback, useState, useMemo } from 'react';
import { Button, Icon, Menu, Dropdown } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { isEmpty, isArray, throttle } from 'lodash';
import { observer } from 'mobx-react-lite';
import querystring from 'querystring';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { openTab, getActiveTabKey } from 'utils/menuTab';

import { fetchuotationHistoryVersions } from '@/services/supplierQutationService';

/**
 * 历史版本下拉按钮
 * organizationId @required
 * quotationHeaderId || currentQuotationHeaderRecordId 当前版本id @required
 *
 */
const HistoryVersionListBtn = (props = {}) => {
  const {
    organizationId,
    quotationHeaderId,
    currentQuotationHeaderRecordId,
    disabled,
    switchUrl = null,
    purSelectQuotationDetailFlag = null,
  } = props;

  const [versionList, setVersionList] = useState([]); // 历史版本列表
  const [btnLoading, setBtnLoading] = useState(false);
  const currentActiveTabKey = useMemo(() => getActiveTabKey(), []);

  // 查询报价单历史
  const queryQuotationHistoryVersions = useCallback(async () => {
    if (!quotationHeaderId || !organizationId) {
      return;
    }

    let currentPurSelectQuotationDetailFlag = purSelectQuotationDetailFlag;
    // 路径上是采购方
    const urlPurchase = switchUrl === '2' || switchUrl === 2;
    if (urlPurchase) {
      currentPurSelectQuotationDetailFlag = 1;
    }

    const params = {
      quotationHeaderId,
      organizationId,
      switchUrl,
      purSelectQuotationDetailFlag: currentPurSelectQuotationDetailFlag,
    };

    let result = null;
    setBtnLoading(true);
    try {
      result = await fetchuotationHistoryVersions(params);
      result = getResponse(result);
      setBtnLoading(false);
      if (!result || !isArray(result)) {
        return;
      }

      setVersionList(result);
    } catch (e) {
      throw e;
    } finally {
      setBtnLoading(false);
    }
  }, [quotationHeaderId, organizationId, setVersionList, currentQuotationHeaderRecordId]);

  // current quotation stage
  const quotationStageRender = useCallback(
    (historyLineRecord = {}) => {
      const { quotationNode, quotationRoundNumber, quotationNodeMeaning, bargainTimes } =
        historyLineRecord || {};
      let title = '';

      switch (quotationNode) {
        case 'QUOTATION_PRICE':
        case 'PRICE_CLARIFICATION':
          title = quotationNodeMeaning;
          break;
        case 'ROUND_QUOTATION_PRICE':
          title = intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
              round: quotationRoundNumber,
            })
            .d('第{round}轮报价');
          break;
        case 'BARGAIN_PRICE':
          title = intl
            .get(`ssrc.common.theRoundBargainNum`, { bargainTimes })
            .d(`第{bargainTimes}次议价`);
          break;
        default:
          title = quotationNodeMeaning;
          break;
      }

      return title || '';
    },
    [quotationHeaderId, organizationId, currentQuotationHeaderRecordId]
  );

  // 跳转报价历史
  const directionHistoryVersion = useCallback(
    (versionRecord = {}) => {
      const {
        quotationHeaderRecordId,
        rfxHeaderId: versionRfxHeaderId,
        quotationHeaderId: versionQuotationHeaderId,
      } = versionRecord || {};

      if (!quotationHeaderRecordId || currentQuotationHeaderRecordId === quotationHeaderId) {
        return;
      }

      const searchObj = {
        quotationHeaderId: versionQuotationHeaderId,
        rfxHeaderId: versionRfxHeaderId,
        noBackFlag: 1, // openTab 不需要返回
        pageType: 'HISTORY_VERSION',
        switchUrl,
      };

      const routerActiveTabKey = currentActiveTabKey.split('/').slice(0, 3).join('/');
      const Path = `${routerActiveTabKey}/history-version/${quotationHeaderRecordId}`;
      const Title = 'hzero.common.button.History';
      const tab = {
        key: Path,
        title: Title,
        action: Title,
        path: Path,
        search: querystring.stringify(searchObj),
        closable: true,
      };

      openTab(tab);
    },
    [currentQuotationHeaderRecordId]
  );

  // menu child
  const menuListChild = useCallback(
    (child = []) => {
      if (isEmpty(child)) {
        return;
      }

      return child.map((item) => {
        const { quotationHeaderRecordId, quotationCount, realName, creationDate } = item || {};
        if (!quotationHeaderRecordId) {
          return '';
        }

        const tooltipTitle =
          realName && creationDate ? `${realName}-${creationDate}` : realName || creationDate;

        return (
          <Menu.Item onClick={() => directionHistoryVersion(item)}>
            <Tooltip title={tooltipTitle}>
              <span style={{ color: '#000' }} key={quotationHeaderRecordId}>
                {quotationCount
                  ? `${intl
                      .get('hzero.common.components.dataAudit.version')
                      .d('版本')} ${quotationCount}`
                  : ''}
              </span>
            </Tooltip>
          </Menu.Item>
        );
      });
    },
    [directionHistoryVersion]
  );

  // menu list
  const menuList = useCallback(() => {
    if (isEmpty(versionList)) {
      return '';
    }

    const allKeys = [];
    versionList.forEach((version, index) => {
      allKeys.push(`${version.quotationNode}${index}`);
    });

    return (
      <Menu
        mode="inline"
        defaultOpenKeys={allKeys}
        className="ssrc-quotation-query-history-version-btn-menu-wrap"
      >
        {versionList.map((item, index) => {
          const { quotationNode: historyquotationNode, rfxQuotationHeaderRecDTOList = [] } = item;
          const parentTitle = quotationStageRender(item);
          const newKey = `${historyquotationNode}${index}`;

          return (
            <Menu.SubMenu
              title={
                <span className="ssrc-quotation-menu-item-title">
                  <Tooltip title={parentTitle}>{parentTitle}</Tooltip>
                </span>
              }
              key={newKey}
            >
              {menuListChild(rfxQuotationHeaderRecDTOList)}
            </Menu.SubMenu>
          );
        })}
      </Menu>
    );
  }, [versionList, menuListChild]);

  // menu visible change
  const menuChange = useCallback(
    throttle((visible) => {
      if (!visible) {
        queryQuotationHistoryVersions();
      } else {
        setVersionList([]);
      }
    }, 1200),
    [queryQuotationHistoryVersions, setVersionList]
  );

  return (
    <Dropdown
      overlay={menuList}
      // trigger="click"
      onHiddenChange={menuChange}
      disabled={!quotationHeaderId || disabled}
    >
      <Button funcType="flat" loading={btnLoading} disabled={disabled} icon="schedule">
        {intl.get('hzero.common.button.History').d('历史版本')}
        <Icon type="expand_more" style={{ fontSize: '16px', margin: '-2px 0 0 4px' }} />
      </Button>
    </Dropdown>
  );
};

export default observer(HistoryVersionListBtn);
