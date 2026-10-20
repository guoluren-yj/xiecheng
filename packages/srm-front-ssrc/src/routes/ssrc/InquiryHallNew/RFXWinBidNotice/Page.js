import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { Output, Table, Attachment, Spin, useDataSet } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isUndefined } from 'lodash';

import { Footer } from 'srm-front-boot/lib/components/PortalCard';
import { MyNav as Nav } from '@/routes/components/PortalCard/index';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { TopSection } from '_components/Section';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { getPublicLanguage, getToken, isText } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { queryEnableDoubleUnit } from '@/services/commonService';

import { formDS, rfItemLineDS } from './storeDS';
import styles from './index.less';

export default observer(function Page(props) {
  const {
    match: {
      params: { rfxHeaderId, tenantId, rfxId },
    },
    location: { pathname },
    customizeTable,
    customizeCollapseForm,
    getHocInstance,
    remote,
  } = props;

  const publicFlag = useMemo(() => pathname.indexOf('public') > -1, [pathname]);
  // const bidFlag = useMemo(() => pathname.indexOf('new-bid-hall') > -1, [pathname]);
  const sourceKey = useMemo(() => (pathname.indexOf('new-bid-hall') > -1 ? 'BID_' : ''), [
    pathname,
  ]);
  const formDs = useDataSet(
    () =>
      formDS({
        tenantId: isUndefined(tenantId) ? getCurrentOrganizationId() : tenantId,
        rfxHeaderId: rfxHeaderId || rfxId,
        publicFlag,
      }),
    [rfxHeaderId, rfxId, publicFlag, tenantId]
  );
  const rfItemLineDs = useDataSet(() => rfItemLineDS(), []);

  const [queryLoading, setQueryLoading] = useState(false);
  const [doubleUnitFlag, setDoubleUnitFlag] = useState(false);

  useEffect(() => {
    fetchRFNoticeInfo();
    queryDoubleUnit();
    if (publicFlag) {
      queryUnitConfig();
    } else {
      props.queryUnitConfig();
    }
  }, [rfxHeaderId, rfxId]);

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
      customizeTenantId: tenantId,
      customizeUnitCode: `SSRC.${sourceKey}VIEW_WIN_NOTICE.MEMBER_INFO,SSRC.${sourceKey}VIEW_WIN_NOTICE.ATTACH_INFO,SSRC.${sourceKey}VIEW_WIN_NOTICE.BASE_INFO,SSRC.${sourceKey}VIEW_WIN_NOTICE.INFO`,
      lang: getPublicLanguage(),
    };
    const captcha = window?.localStorage?.getItem('pub-captcha');
    if (!getToken() && captcha) {
      Object.assign(params, { captcha });
    }
    try {
      setQueryLoading(true);
      const res = getResponse(await formDs.query(null, params));
      if (res) {
        rfItemLineDs.loadData(res.rfxLineItemList);
      }
    } catch (e) {
      throw e;
    } finally {
      setQueryLoading(false);
    }
  };

  const columns = useMemo(() => {
    const preColumns = [
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
        name: 'categoryName',
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 150,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'rfxQuantity',
            width: 150,
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 150,
          }
        : {
            name: 'uomName',
            width: 150,
          },
      {
        name: 'supplierCompanyNum',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      doubleUnitFlag
        ? {
            name: 'allottedSecondaryQuantity',
            width: 150,
            renderer: ({ value }) => {
              return numberSeparatorRender(value) || '***';
            },
          }
        : {
            name: 'validQuotationQuantityMeaning',
            width: 150,
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      {
        name: 'validQuotationPriceMeaning',
        width: 150,
      },
      {
        name: 'bidAcceptedRate',
        width: 150,
      },
    ];

    let winBidColumns = remote
      ? remote.process('SSRC_RFX_WIN_BID_NOTICE_PROCESS_WIN_BID_COLUMNS', preColumns, {
          formDs,
          pageProps: props,
        })
      : preColumns;
    winBidColumns = (winBidColumns || []).filter(Boolean);
    return winBidColumns;
  }, [doubleUnitFlag, formDs?.length]);

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
                  {formDs.current?.get('noticeDate')
                    ? intl
                        .get('ssrc.rfxNotice.view.desc.approvedDate', {
                          name: formDs.current?.get('noticeDate'),
                        })
                        .d('发布时间：{name}')
                    : null}
                </span>
              </div>
            </div>
            <Divider style={{ marginTop: '32px' }} />
            <Divider dashed style={{ marginTop: '-20px' }} />
            <div className={styles['notice-content']}>
              <TopSection
                title={intl.get('ssrc.inquiryHall.model.inquiryHall.noticInfor').d('公告信息')}
                code={`SSRC.${sourceKey}VIEW_WIN_NOTICE.BASE_CARD`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}VIEW_WIN_NOTICE.BASE_INFO`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={3}
                    labelLayout="vertical"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="baseForm"
                  >
                    <Output name="sourceNum" />
                    <Output name="sourceTitle" />
                    <Output name="sourceCategoryMeaning" />
                    <Output name="companyName" />,
                    <Output name="approvedDate" />,
                    <Output name="sourceAcceptedDate" />,
                    <Output name="sourceAcceptedTotalAmountMeaning" />,
                    {formDs?.current?.get('expertNames') && <Output name="expertNames" />},
                  </CollapseForm>
                )}
              </TopSection>
              <TopSection
                title={intl
                  .get(`ssrc.rfxNotice.view.subtitle.contactMethodAndHuman`)
                  .d('联系人及联系方式')}
                code={`SSRC.${sourceKey}VIEW_WIN_NOTICE.MEMBER_CARD`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}VIEW_WIN_NOTICE.MEMBER_INFO`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={3}
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

              <TopSection
                title={intl.get('ssrc.inquiryHall.model.inquiryHall.acceptInfor').d('中标信息')}
                code={`SSRC.${sourceKey}VIEW_WIN_NOTICE.INFO_CARD`}
                getHocInstance={getHocInstance}
                className="notice-content"
              >
                {customizeTable(
                  {
                    code: `SSRC.${sourceKey}VIEW_WIN_NOTICE.INFO`,
                  },
                  <Table code="itemLine" dataSet={rfItemLineDs} columns={columns} />
                )}
              </TopSection>

              <TopSection
                title={intl.get(`ssrc.rfxNotice.view.subtitle.attachment`).d('附件')}
                code={`SSRC.${sourceKey}VIEW_WIN_NOTICE.ATTACH_CARD`}
                getHocInstance={getHocInstance}
                className="notice-content"
                hidden={!getToken()}
              >
                {customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}VIEW_WIN_NOTICE.ATTACH_INFO`,
                    dataSet: formDs,
                  },
                  <CollapseForm
                    dataSet={formDs}
                    columns={3}
                    labelLayout="float"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="attachments"
                  >
                    <Attachment
                      readOnly
                      name="noticeAttachmentUuid"
                      fileSize={FIlESIZE}
                      labelLayout="float"
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-tendernotice-detail"
                      data={{
                        tenantId: isUndefined(tenantId) ? getCurrentOrganizationId() : tenantId,
                      }}
                    />
                  </CollapseForm>
                )}
              </TopSection>

              {remote
                ? remote.render('SSRC_RFX_WIN_BID_NOTICE_RENDER_PAGE_END_SECTION', '', {
                    pageProps: props,
                    publicFlag,
                    sourceKey,
                    formDs,
                  })
                : ''}
            </div>
          </div>
          {publicFlag ? <Footer auto /> : ''}
        </Spin>
      </Content>
    </Fragment>
  );
});
