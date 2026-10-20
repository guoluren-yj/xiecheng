import React, { useMemo, useEffect, useState, Fragment } from 'react';
import { Table, Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { bidAnnouncementVersion } from '@/services/inquiryHallService';

const Container = (props) => {
  const {
    priceDs,
    amountDs,
    rfxHeaderId,
    supplierCompanyId,
    customizeTable = noop,
    bidFlag = false,
    doubleUnitFlag = false,
    modal,
  } = props;
  const [version, setVersion] = useState([]); // 所有版本
  const [currentVersion, setCurrentVersion] = useState({}); // 当前版本
  const [basicInfo, setBasicInfo] = useState({}); // 存储基本信息

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (modal) {
      modal.update({
        footer: (okBtn) => {
          return (
            <Fragment>
              {okBtn}
              <ExcelExportPro
                method="POST"
                allBody
                templateCode={
                  basicInfo?.bidAnnouncementType === 'UNIT_PRICE'
                    ? 'SRM_C_SRM_SSRC_BID_ANNOUNCEMENT_QUOTATION_LINE_EXPORT'
                    : 'SRM_C_SRM_SSRC_BID_ANNOUNCEMENT_QUOTATION_HEADER_EXPORT'
                }
                requestUrl={
                  basicInfo?.bidAnnouncementType === 'UNIT_PRICE'
                    ? `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/search/quotation/line/export`
                    : `${SRM_SSRC}/v2/${getCurrentOrganizationId()}/rfx/bid/announcement/search/quotation/header/export`
                }
                queryParams={() => {
                  return {
                    ...currentVersion,
                    customizeUnitCode: getCustomizeUnitCode(),
                  };
                }}
              />
            </Fragment>
          );
        },
      });
    }
  }, [currentVersion, getCustomizeUnitCode, basicInfo]);

  // 初始化
  const init = async () => {
    const res = await bidAnnouncementVersion({
      rfxHeaderId,
      supplierCompanyId,
    });
    if (getResponse(res)) {
      setVersion(res);
      setCurrentVersion(res[0]);
      setBasicInfo(res[0]);
      if (res[0].bidAnnouncementType === 'UNIT_PRICE') {
        priceDs.setQueryParameter('commonProps', {
          ...res[0],
        });
        priceDs.query();
      } else {
        amountDs.setQueryParameter('commonProps', {
          ...res[0],
        });
        amountDs.query();
      }
    }
  };

  const columnsPrice = useMemo(() => {
    return [
      {
        name: 'rfxLineItemNum',
        width: 100,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 200,
      },
      doubleUnitFlag
        ? basicInfo.benchmarkPriceType === 'TAX_INCLUDED_PRICE'
          ? {
              name: 'quotationSecondaryPrice',
              width: 100,
            }
          : {
              name: 'validNetSecondaryPrice',
              width: 100,
            }
        : null,
      basicInfo.benchmarkPriceType === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'quotationPrice',
            width: 100,
          }
        : {
            name: 'validNetPrice',
            width: 100,
          },
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
    ].filter(Boolean);
  }, [doubleUnitFlag, basicInfo]);

  const columnsAmount = useMemo(() => {
    return [
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      basicInfo.benchmarkPriceType === 'TAX_INCLUDED_PRICE'
        ? {
            name: 'qtnTotalAmount',
            width: 200,
          }
        : {
            name: 'qtnNetAmount',
            width: 200,
          },
    ].filter(Boolean);
  }, [basicInfo]);

  // 切换版本
  const handleMenuItem = (item) => {
    if (item.version !== currentVersion.version) {
      setCurrentVersion(item);
      if (item.bidAnnouncementType === 'UNIT_PRICE') {
        priceDs.setQueryParameter('commonProps', {
          ...item,
        });
        priceDs.query();
      } else {
        amountDs.setQueryParameter('commonProps', {
          ...item,
        });
        amountDs.query();
      }
    }
  };

  const menu = () => (
    <Menu>
      {version?.map((item) => {
        return (
          <Menu.Item
            style={{
              height: 'auto',
              background: currentVersion.version === item.version ? '#F2F3F5' : '',
            }}
            onClick={() => handleMenuItem(item)}
          >
            <div style={{ fontSize: '12px' }}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.versionNumber').d('版本')}
              {item.versionNum}
            </div>
            <div style={{ color: '#868D9C', marginTop: '-20px' }}>{item.showProcessDate}</div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  // 获取个性化code
  const getCustomizeUnitCode = () => {
    if (basicInfo?.bidAnnouncementType === 'UNIT_PRICE') {
      if (bidFlag) {
        return 'SSRC.BID_SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_LINE';
      } else {
        return 'SSRC.SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_LINE';
      }
    } else if (bidFlag) {
      return 'SSRC.BID_SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_HEADER';
    } else {
      return 'SSRC.SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_HEADER';
    }
  };

  return (
    <React.Fragment>
      {basicInfo?.showHistoricalPriceVersion === 1 ? (
        <div
          className="ssrc-bid-announcement-query"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Dropdown
            overlay={menu()}
            trigger={['click']}
            placement="bottomCenter"
            getPopupContainer={() => {
              return document.getElementsByClassName('ssrc-bid-announcement-query')[0];
            }}
          >
            <span style={{ color: '#4E5769' }}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.versionNumberQuery').d('版本查询')}
            </span>
            &nbsp;&nbsp;
            <span style={{ 'font-weight': 500, color: '#1D2129' }}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.versionNumber').d('版本')}
              {currentVersion?.version}
            </span>
            <Icon type="expand_more" style={{ marginTop: '-1px' }} />
          </Dropdown>
        </div>
      ) : null}
      <div style={{ marginTop: basicInfo?.showHistoricalPriceVersion === 1 ? '16px' : '0' }}>
        {basicInfo?.bidAnnouncementType === 'UNIT_PRICE'
          ? customizeTable(
              {
                code: getCustomizeUnitCode(),
                dataSet: priceDs,
              },
            <Table
              dataSet={priceDs}
              style={{ maxHeight: 'calc(100vh - 240px)' }}
              columns={columnsPrice}
            />
            )
          : customizeTable(
              {
                code: getCustomizeUnitCode(),
                dataSet: amountDs,
              },
            <Table
              dataSet={amountDs}
              style={{ maxHeight: 'calc(100vh - 240px)' }}
              columns={columnsAmount}
            />
            )}
      </div>
    </React.Fragment>
  );
};

export default WithCustomizeC7N({
  unitCode: [
    'SSRC.SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_LINE',
    'SSRC.SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_HEADER',
    'SSRC.BID_SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_HEADER',
    'SSRC.BID_SUPPLIER_BID_ANNOUNCEMENT.QUOTATION_LINE',
  ],
})(observer(Container));
