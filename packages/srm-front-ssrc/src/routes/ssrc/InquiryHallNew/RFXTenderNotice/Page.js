import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { Output, DataSet, Table, Attachment, Spin, Tooltip } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty, compose } from 'lodash';

import { Footer } from 'srm-front-boot/lib/components/PortalCard';
import { MyNav as Nav } from '@/routes/components/PortalCard/index';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { TopSection } from '_components/Section';
import { PUBLIC_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getResponse } from 'utils/utils';
import { getPublicLanguage, isText, getToken } from '@/utils/utils';
import { INQUIRY, BID } from '@/utils/globalVariable';
import remotes from 'hzero-front/lib/utils/remote';

import { queryRFXHeaderInfoForNotice } from '@/services/rfNoticeService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { formDS, rfItemLineDS } from './storeDS';
import styles from './index.less';

const Page = (props) => {
  const {
    match: {
      params: { rfxHeaderId, tenantId },
    },
    remote,
    location: { pathname },
    customizeTable,
    customizeCollapseForm,
    getHocInstance,
  } = props;

  const publicFlag = useMemo(() => pathname.indexOf('public') > -1, [pathname]);
  const bidFlag = useMemo(() => pathname.indexOf('new-bid-hall') > -1, [pathname]);
  const sourceKey = useMemo(() => (pathname.indexOf('new-bid-hall') > -1 ? BID : INQUIRY), [
    pathname,
  ]);
  const formDs = useMemo(() => new DataSet(formDS({ bidFlag })), [rfxHeaderId, bidFlag]);
  const rfItemLineDs = useMemo(
    () => new DataSet(rfItemLineDS({ rfxHeaderId, tenantId, sourceKey })),
    [rfxHeaderId, sourceKey]
  );

  const [queryLoading, setQueryLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);
  const showSupplierFlag = remote
    ? remote?.process?.('SSRC_RFX_TENDER_NOTICE_DISPLAY_SUPPLIER', true, { formDs, bidFlag })
    : true;
  const attachmentCardVisible = remote
    ? remote?.process?.('SSRC_RFX_TENDER_NOTICE_DISPLAY_PROCESS_ATTACHMENT_VISIBLE', getToken(), {
        formDs,
        bidFlag,
        pageProps: props,
      })
    : getToken();

  useEffect(() => {
    fetchRFNoticeInfo();
    queryDoubleUnit();
    if (publicFlag) {
      queryUnitConfig();
    } else {
      props.queryUnitConfig();
    }
  }, [rfxHeaderId]);

  const queryUnitConfig = () => {
    props.queryUnitConfig({
      customizeTenantId: tenantId,
      lang: getPublicLanguage(),
      __public__: true,
    });
  };

  const queryDoubleUnit = () => {
    queryEnableDoubleUnit({ businessModule: 'RFX', tenantId }).then((res) => {
      if (isText(res)) {
        setDoubleUnitFlag(!!Number(res));
        rfItemLineDs.setState('doubleUnitFlag', !!Number(res));
      }
    });
  };

  const fetchRFNoticeInfo = async () => {
    const params = {
      sourceCategory: 'RFX',
      rfxHeaderId,
      tenantId,
      customizeTenantId: tenantId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL_RFX_NOTICE.HEADER_RFX,SSRC.${sourceKey}_HALL_RFX_NOTICE.LINE_ITEM_RFX,SSRC.${sourceKey}_HALL_RFX_NOTICE.MEMBER_RFX,SSRC.${sourceKey}_HALL_RFX_NOTICE.ATTACH_RFX,SSRC.${sourceKey}_HALL_RFX_NOTICE.QUOTATION_RFX`,
    };
    const captcha = window?.localStorage?.getItem('pub-captcha');
    if (!getToken() && captcha) {
      Object.assign(params, { captcha });
    }
    try {
      setQueryLoading(true);
      let headerInfo = await queryRFXHeaderInfoForNotice(params);
      headerInfo = getResponse(headerInfo);
      setQueryLoading(false);
      if (!headerInfo || isEmpty(headerInfo)) {
        return;
      }

      formDs.loadData([headerInfo]);
      rfItemLineDs.query();
    } catch (e) {
      throw e;
    }
  };

  // 多选lov文本渲染
  const renderMultiLovText = (value = null) => {
    return <Tooltip title={value}>{value || '-'}</Tooltip>;
  };

  const columns = useMemo(
    () =>
      [
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
        },
        {
          name: 'itemCategoryName',
          width: 150,
        },
        {
          name: 'demandDate',
          width: 150,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryQuantity',
              width: 120,
            }
          : null,
        {
          name: 'rfxQuantity',
          width: 120,
        },
        doubleUnitFlag
          ? {
              name: 'secondaryUomName',
              width: 150,
            }
          : null,
        {
          name: 'uomName',
          width: 150,
        },
      ].filter(Boolean),
    [doubleUnitFlag]
  );

  return (
    <Fragment>
      {publicFlag ? (
        <Nav auto tenantId={tenantId} />
      ) : (
        <Header title={intl.get(`ssrc.rfxNotice.view.title.rfNoticePreview`).d('公告预览')} />
      )}
      <Content>
        <Spin spinning={queryLoading}>
          <div className={styles['rfx-notice-tender-page-content-container']}>
            <div className={styles['notice-header']}>
              <div className={styles['notice-header-title']}>
                {formDs.current?.get('noticeTitle')}
              </div>
              <div className={styles['notice-header-subtitle']}>
                <span>
                  {formDs.current?.get('approvedDate')
                    ? intl
                        .get('ssrc.rfxNotice.view.desc.approvedDate', {
                          name: formDs.current?.get('approvedDate'),
                        })
                        .d('发布时间：{name}')
                    : null}
                </span>
                <span style={formDs.current?.get('approvedDate') ? { marginLeft: '16px' } : null}>
                  {intl
                    .get('ssrc.rfxNotice.view.desc.companyName', {
                      name: formDs.current?.get('companyName'),
                    })
                    .d('发布单位：{name}')}
                </span>
              </div>
            </div>
            <Divider style={{ marginTop: '32px' }} />
            <Divider dashed style={{ marginTop: '-20px' }} />
            <div className={styles['notice-content']}>
              <TopSection
                title={intl.get(`ssrc.rfxNotice.view.subtitle.basicInfo`).d('基础信息')}
                code={`SSRC.${sourceKey}_HALL_RFX_NOTICE.HEADER_CARD_RFX`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}_HALL_RFX_NOTICE.HEADER_RFX`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={2}
                    labelLayout="vertical"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="baseForm"
                  >
                    <Output name="sourceNum" />
                    <Output name="sourceTitle" />
                    <Output name="companyName" />
                    <Output name="quotationStartDate" />,
                    <Output name="quotationEndDate" />,
                  </CollapseForm>
                )}
              </TopSection>
              <TopSection
                title={intl
                  .get(`ssrc.rfxNotice.view.subtitle.contactMethodAndHuman`)
                  .d('联系人及联系方式')}
                code={`SSRC.${sourceKey}_HALL_RFX_NOTICE.MEMBER_CARD_RFX`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}_HALL_RFX_NOTICE.MEMBER_RFX`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={2}
                    labelLayout="vertical"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="purchaseContact"
                  >
                    <Output name="purName" />
                    <Output name="purPhone" />
                    <Output name="purEmail" />
                  </CollapseForm>
                )}
              </TopSection>

              {showSupplierFlag && (
                <TopSection
                  title={intl
                    .get('ssrc.inquiryHall.view.inquiryHall.supplierWithRequest')
                    .d('对供应商要求')}
                  code={`SSRC.${sourceKey}_HALL_RFX_NOTICE.QUOTATION_CARD_RFX`}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                >
                  {customizeCollapseForm(
                    {
                      code: `SSRC.${sourceKey}_HALL_RFX_NOTICE.QUOTATION_RFX`,
                      dataSet: formDs,
                    },
                    <CollapseForm
                      dataSet={formDs}
                      columns={2}
                      labelLayout="vertical"
                      labelAlign="left"
                      className="c7n-pro-vertical-form-display"
                      code="supplierWithRequest"
                    >
                      <Output name="organizationTypeMeaning" />
                      <Output
                        name="industryData"
                        renderer={({ value }) => renderMultiLovText(value)}
                      />
                      <Output
                        name="industryCategoryData"
                        renderer={({ value }) => renderMultiLovText(value)}
                      />
                    </CollapseForm>
                  )}
                </TopSection>
              )}

              <TopSection
                title={intl.get(`ssrc.rfxNotice.view.subtitle.purchaseRequest`).d('采购需求')}
                code={`SSRC.${sourceKey}_HALL_RFX_NOTICE.LINE_ITEM_CARD_RFX`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeTable(
                  {
                    code: `SSRC.${sourceKey}_HALL_RFX_NOTICE.LINE_ITEM_RFX`,
                  },
                  <Table code="itemLine" dataSet={rfItemLineDs} columns={columns} />
                )}
              </TopSection>

              <TopSection
                title={intl.get(`ssrc.rfxNotice.view.subtitle.attachment`).d('附件')}
                code={`SSRC.${sourceKey}_HALL_RFX_NOTICE.ATTACH_CARD_RFX`}
                getHocInstance={getHocInstance}
                className="notice-content"
                hidden={!attachmentCardVisible}
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}_HALL_RFX_NOTICE.ATTACH_RFX`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={2}
                    labelLayout="float"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="attachments"
                  >
                    <Attachment
                      readOnly
                      name="noticeAttachmentUuid"
                      fileSize={FIlESIZE}
                      // label={intl
                      //   .get(`ssrc.rfxNotice.model.rfxNotice.noticeAttachment`)
                      //   .d('公告附件')}
                      labelLayout="float"
                      bucketName={PUBLIC_BUCKET}
                      bucketDirectory="ssrc-tendernotice-detail"
                      isPublic
                      data={{
                        tenantId,
                      }}
                    />
                  </CollapseForm>
                )}
              </TopSection>
            </div>
          </div>
          {publicFlag ? <Footer auto /> : ''}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  remotes({
    code: 'SSRC_RFX_TENDER_NOTICE',
    name: 'remote',
  })
)(observer(Page));
