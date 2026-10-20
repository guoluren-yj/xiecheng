import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { Output, DataSet, Table, Attachment, Spin } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';

import { Footer } from 'srm-front-boot/lib/components/PortalCard';
import { MyNav as Nav } from '@/routes/components/PortalCard/index';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import CollapseForm from '_components/CollapseForm';
import { PUBLIC_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getResponse } from 'utils/utils';
import { getPublicLanguage, isText, getToken } from '@/utils/utils';

import { queryRFNoticeInfo } from '@/services/rfNoticeService';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { formDS, rfFormDS, rfItemLineDS, sourceGroupDS } from './storeDS';
import styles from './index.less';

export default observer(function Page(props) {
  const {
    match: {
      params: { rfHeaderId, tenantId },
    },
    location: { pathname },
    customizeTable,
    customizeCollapseForm,
  } = props;

  const sourceCategory = useMemo(() => (pathname.indexOf('RFI') > -1 ? 'RFI' : 'RFP'), [pathname]);
  const publicFlag = useMemo(() => pathname.indexOf('public') > -1, [pathname]);

  const formDs = useMemo(() => new DataSet(formDS()), [sourceCategory]);
  const rfFormDs = useMemo(() => new DataSet(rfFormDS()), [sourceCategory]);
  const sourceGroupDs = useMemo(() => new DataSet(sourceGroupDS()), []);
  const rfItemLineDs = useMemo(
    () => new DataSet(rfItemLineDS({ rfHeaderId, sourceCategory, tenantId })),
    []
  );

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
  }, []);

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

  const fetchRFNoticeInfo = () => {
    const params = {
      sourceCategory,
      rfHeaderId,
      tenantId,
      customizeUnitCode: `SSRC.INQUIRY_HALL_RF_NOTICE.HEADER_${sourceCategory},SSRC.INQUIRY_HALL_RF_NOTICE.LINE_ITEM_${sourceCategory},SSRC.INQUIRY_HALL_RF_NOTICE.FORM_${sourceCategory},SSRC.INQUIRY_HALL_RF_NOTICE.MEMBER_${sourceCategory},SSRC.INQUIRY_HALL_RF_NOTICE.ATTACH_${sourceCategory}`,
    };
    const captcha = window?.localStorage?.getItem('pub-captcha');
    if (!getToken() && captcha) {
      Object.assign(params, { captcha });
    }
    setQueryLoading(true);
    queryRFNoticeInfo(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { rfMembers = [], rfForm = {}, ...others } = result;
          formDs.loadData([others]);
          sourceGroupDs.loadData(rfMembers);
          rfFormDs.loadData([rfForm || {}]);
          if (result.lineItemsFlag) {
            rfItemLineDs.query();
          }
        }
      })
      .finally(() => setQueryLoading(false));
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'rfLineItemNum',
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
              // renderer: ({ value }) => numberSeparatorRender(value),
            }
          : null,
        {
          name: 'demandQuantity',
          width: 120,
          // renderer: ({ value }) => numberSeparatorRender(value),
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

  const sourceColumns = useMemo(
    () => [
      {
        name: 'contactName',
        width: 250,
      },
      {
        name: 'contactPhone',
        renderer: ({ record, text }) =>
          [record.get('internationalTelCodeMeaning'), text].filter(Boolean).join(' | '),
      },
      {
        name: 'contactMail',
        width: 250,
      },
    ],
    []
  );

  return (
    <Fragment>
      {publicFlag ? (
        <Nav auto tenantId={tenantId} />
      ) : (
        <Header title={intl.get(`ssrc.rfNotice.view.title.rfNoticePreview`).d('征询公告预览')} />
      )}
      <Content>
        <Spin spinning={queryLoading}>
          <div className={styles['page-content-container']}>
            <div className={styles['notice-header']}>
              <div className={styles['notice-header-title']}>
                {formDs.current?.get('noticeTitle')}
              </div>
              <div className={styles['notice-header-subtitle']}>
                <span>
                  {formDs.current?.get('approvedDate')
                    ? intl
                        .get('ssrc.rfNotice.view.desc.approvedDate', {
                          name: formDs.current?.get('approvedDate'),
                        })
                        .d('发布时间：{name}')
                    : null}
                </span>
                <span style={formDs.current?.get('approvedDate') ? { marginLeft: '16px' } : null}>
                  {intl
                    .get('ssrc.rfNotice.view.desc.companyName', {
                      name: formDs.current?.get('companyName'),
                    })
                    .d('发布单位：{name}')}
                </span>
              </div>
            </div>
            <Divider style={{ marginTop: '32px' }} />
            <Divider dashed style={{ marginTop: '-20px' }} />
            <div className={styles['notice-content']}>
              <div className={styles['notice-content-title']}>
                {intl.get(`ssrc.rfNotice.view.subtitle.basicInfo`).d('基础信息')}
              </div>
              {customizeCollapseForm(
                {
                  code: `SSRC.INQUIRY_HALL_RF_NOTICE.HEADER_${sourceCategory}`,
                  dataSet: formDs,
                },
                <CollapseForm
                  dataSet={formDs}
                  columns={3}
                  labelLayout="vertical"
                  labelAlign="left"
                  className="c7n-pro-vertical-form-display"
                  useWidthPercent
                >
                  <Output name="sourceNum" />
                  <Output name="sourceTitle" />
                  {formDs.current?.get('sourceFrom') === 'PROJECT' && (
                    <Output name="sourceProjectName" />
                  )}
                  <Output name="quotationStartDate" newLine />,
                  <Output name="quotationEndDate" />,
                </CollapseForm>
              )}
              {formDs.current?.get('lineItemsFlag') ? (
                <>
                  <div className={styles['notice-content-title']}>
                    {intl.get(`ssrc.rfNotice.view.subtitle.purchase`).d('采购需求')}
                  </div>
                  {customizeTable(
                    {
                      code: `SSRC.INQUIRY_HALL_RF_NOTICE.LINE_ITEM_${sourceCategory}`,
                    },
                    <Table dataSet={rfItemLineDs} columns={columns} />
                  )}
                </>
              ) : null}
              <div className={styles['notice-content-title']}>
                {sourceCategory === 'RFP'
                  ? intl.get(`ssrc.rfNotice.view.subtitle.programme`).d('方案要求')
                  : intl.get(`ssrc.rfNotice.view.subtitle.rfiProgramme`).d('征询内容')}
              </div>
              {customizeCollapseForm(
                {
                  code: `SSRC.INQUIRY_HALL_RF_NOTICE.FORM_${sourceCategory}`,
                  dataSet: rfFormDs,
                },
                <CollapseForm
                  dataSet={rfFormDs}
                  columns={2}
                  labelLayout="vertical"
                  labelAlign="left"
                  className="c7n-pro-vertical-form-display"
                  useWidthPercent
                >
                  <Output name="rfContent" colSpan={2} />
                </CollapseForm>
              )}
              <div className={styles['notice-content-title']}>
                {intl.get(`ssrc.rfNotice.view.subtitle.contact`).d('采购联系人')}
              </div>
              {customizeTable(
                {
                  code: `SSRC.INQUIRY_HALL_RF_NOTICE.MEMBER_${sourceCategory}`,
                },
                <Table dataSet={sourceGroupDs} columns={sourceColumns} />
              )}
              {getToken() && (
                <>
                  <div className={styles['notice-content-title']}>
                    {intl.get(`ssrc.rfNotice.view.subtitle.attachment`).d('附件')}
                  </div>
                  {customizeCollapseForm(
                    {
                      code: `SSRC.INQUIRY_HALL_RF_NOTICE.ATTACH_${sourceCategory}`,
                      dataSet: formDs,
                    },
                    <CollapseForm
                      dataSet={formDs}
                      columns={2}
                      labelLayout="float"
                      labelAlign="left"
                      useWidthPercent
                      // className="c7n-pro-vertical-form-display"
                    >
                      <Attachment
                        readOnly
                        name="noticeAttachmentUuid"
                        fileSize={FIlESIZE}
                        label={intl
                          .get(`ssrc.rfNotice.model.rfNotice.noticeAttachment`)
                          .d('公告附件')}
                        labelLayout="float"
                        bucketName={PUBLIC_BUCKET}
                        bucketDirectory="ssrc-rf-tender-notice"
                        data={{
                          tenantId,
                        }}
                      />
                    </CollapseForm>
                  )}
                </>
              )}
            </div>
          </div>
          {publicFlag ? <Footer auto /> : ''}
        </Spin>
      </Content>
    </Fragment>
  );
});
