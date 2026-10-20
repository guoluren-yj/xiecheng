import React, { Fragment, useMemo, useEffect, useState } from 'react';
import { Output, Table, Attachment, Spin, useDataSet, DataSet } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import { Footer } from 'srm-front-boot/lib/components/PortalCard';
import { MyNav as Nav } from '@/routes/components/PortalCard/index';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import CollapseForm from '_components/CollapseForm';
import { TopSection } from '_components/Section';
import { PUBLIC_BUCKET } from '_utils/config';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { getToken } from '@/utils/utils';

import { formDS, rfItemLineDS } from './storeDS';
import styles from './index.less';

export default formatterCollections({
  code: [['ssrc.acceptBidNotice']],
})(
  observer(function Page(props) {
    const {
      location: { pathname, search },
      getHocInstance,
    } = props;

    const { sourceHeaderId, tenantId = getCurrentOrganizationId() } = querystring.parse(
      search?.slice(1)
    );

    const publicFlag = useMemo(() => pathname.indexOf('public') > -1, [pathname]);

    const formDs = useDataSet(
      () =>
        formDS({
          tenantId,
          sourceHeaderId,
          publicFlag,
        }),
      []
    );
    const [rfxItemLineDsMap, setRfxItemLineDsMap] = useState([]);

    const [queryLoading, setQueryLoading] = useState(false);

    useEffect(() => {
      fetchRFNoticeInfo();
    }, [sourceHeaderId]);

    const fetchRFNoticeInfo = async () => {
      try {
        setQueryLoading(true);
        const res = getResponse(await formDs.query());
        if (res) {
          if (res.subjectMatterRule === 'NONE') {
            const ds = new DataSet(rfItemLineDS());
            ds.loadData(res.bidLineItemListNONE || []);
            setRfxItemLineDsMap([{ ds }]);
            // rfxItemLineDsMap[0].ds.loadData(res.bidLineItemListNONE || []);
          } else if (res.subjectMatterRule === 'PACK' && res.bidLineItemListPACK) {
            setRfxItemLineDsMap(
              res.bidLineItemListPACK.map((item, i) => {
                const ds = new DataSet(rfItemLineDS());
                ds.loadData(item.itemList || []);
                return {
                  ds,
                  sectionName: item.sectionName,
                  i,
                };
              })
            );
          }
        }
      } catch (e) {
        throw e;
      } finally {
        setQueryLoading(false);
      }
    };

    const columns = useMemo(() =>
      [
        {
          name: 'bidLineItemNum',
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
        {
          name: 'demandDate',
          width: 150,
        },
        {
          name: 'bidQuantity',
          width: 150,
        },
        {
          name: 'uomName',
          width: 150,
        },
      ].filter(Boolean)
    );
    const current = formDs?.current;

    return (
      <Fragment>
        {publicFlag ? (
          <Nav auto tenantId={tenantId} />
        ) : (
          <Header
            title={intl.get(`ssrc.acceptBidNotice.title.bidNoticePreview`).d('招标公告预览')}
          />
        )}
        <Content>
          <Spin spinning={queryLoading}>
            <div className={styles['rfx-notice-tender-page-content-container']}>
              <div className={styles['notice-header']}>
                <div className={styles['notice-header-title']}>
                  {current?.get('bidTitle')}
                  {intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.biddingAnnouncement`)
                    .d('招标公告')}
                </div>
                <div className={styles['notice-header-subtitle']}>
                  <span>
                    {current?.get('approvedDate')
                      ? `${intl
                          .get('ssrc.acceptBidNotice.model.title.releaseTime')
                          .d('发布时间')}：${formDs.current?.get('approvedDate')}`
                      : null}
                  </span>
                </div>
              </div>
              <Divider style={{ marginTop: '32px' }} />
              <Divider dashed style={{ marginTop: '-20px' }} />
              <div className={styles['notice-content']}>
                <TopSection
                  title={intl
                    .get('ssrc.acceptBidNotice.model.acceptBidNotice.noticInfor')
                    .d('公告信息')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                >
                  <CollapseForm
                    dataSet={formDs}
                    columns={3}
                    labelLayout="vertical"
                    labelAlign="left"
                    className="c7n-pro-vertical-form-display"
                    code="baseForm"
                  >
                    <Output name="bidNum" />
                    <Output name="bidTitle" />
                    <Output name="bidTypeMeaning" />
                    <Output name="companyName" />,
                    <Output name="quotationStartDate" />,
                    <Output name="quotationEndDate" />,
                    <Output name="bidOpenDate" />,
                    <Output name="bidOpenLocation" />,
                  </CollapseForm>
                </TopSection>
                <TopSection
                  title={intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.contactMethod`)
                    .d('联系人及联系方式')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                >
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
                </TopSection>

                <TopSection
                  title={intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.purchaseDemand`)
                    .d('采购需求')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                >
                  {rfxItemLineDsMap.map((item) => {
                    return (
                      <div className={styles['purchase-demand']}>
                        {item.sectionName && (
                          <div className={styles['section-title']}>
                            {intl.get('ssrc.acceptBidNotice.model.goods.bidLines').d('标段')}
                            {`${item.i + 1}-${item.sectionName}`}
                          </div>
                        )}
                        <Table code="itemLine" dataSet={item.ds} columns={columns} />
                      </div>
                    );
                  })}
                </TopSection>

                <TopSection
                  title={intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.bidStatusDemand`)
                    .d('投标人的资格要求')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                  hidden={!current?.get('prequalRemark')}
                >
                  <Output value={current?.get('prequalRemark')} />
                </TopSection>

                <TopSection
                  title={intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.otherSuppleItems`)
                    .d('其它补充事项')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                  hidden={!current?.get('remark')}
                >
                  <Output value={current?.get('remark')} />
                </TopSection>

                <TopSection
                  title={intl
                    .get(`ssrc.acceptBidNotice.model.acceptBidNotice.attachment`)
                    .d('附件')}
                  getHocInstance={getHocInstance}
                  className="notice-content"
                  hidden={!getToken()}
                >
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
                      bucketName={PUBLIC_BUCKET}
                      bucketDirectory="ssrc-tendernotice-detail"
                      data={{
                        tenantId,
                      }}
                    />
                  </CollapseForm>
                </TopSection>
              </div>
            </div>
            {publicFlag ? <Footer auto /> : ''}
          </Spin>
        </Content>
      </Fragment>
    );
  })
);
