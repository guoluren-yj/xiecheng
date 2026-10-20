import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Table, DataSet, Spin, Attachment, Tooltip } from 'choerodon-ui/pro';
import { Icon, Popover, Tag } from 'choerodon-ui';
import querystring from 'querystring';
import classNames from 'classnames';

import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import arrowLeft from '@/assets/baseline-arrow_left.svg';
import theFirst from '@/assets/the-first.svg';
import wholePackageWinning from '@/assets/whole-package-winning.svg';
import partialWinning from '@/assets/partial-winning.svg';
import { fetchFinishQuoteLines, fetchSectionList } from '@/services/projectSetupService';
import { FIlESIZE } from '@/utils/SsrcRegx';
import { numberSeparatorRender } from '@/utils/renderer';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import style from './index.less';

const { Column } = Table;
const { Group } = Attachment;
const organizationId = getCurrentOrganizationId();

export default function Finish({
  subjectMatterRule,
  history = {},
  match = {},
  searchParams = {},
  isWorkflowContract = false,
  headerInfo = {},
}) {
  // isWorkflowContract 协议工作流引用
  const {
    params: { sourceProjectId },
  } = match;
  const { projectLineSectionId } = searchParams;

  const tableDs = useMemo(
    () =>
      new DataSet({
        selection: false,
        autoQuery: false,
        paging: false,
        fields: [
          {
            name: 'document',
            label: intl.get('ssrc.projectSetup.view.message.document').d('寻源单据'),
          },
          {
            name: 'sourceDetail',
            label: intl.get('ssrc.projectSetup.view.message.sourceDetail').d('寻源情况'),
          },
        ],
        transport: {
          read: ({ data }) => ({
            url: `${SRM_SSRC}/v1/${organizationId}/project-quote-lines/${sourceProjectId}/finished/detail`,
            method: 'GET',
            query: { ...data },
            transformResponse: (res) => {
              const result = getResponse(JSON.parse(res));
              if (result && !result.failed) {
                const { projectQuotes = [] } = result;
                return projectQuotes;
              }
            },
          }),
        },
      }),
    []
  );

  const sectionList = useRef([]);
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [leftShow, setLeftShow] = useState(true);
  const [activeProjectLineSectionId, setActiveProjectLineSectionId] = useState(
    projectLineSectionId
  );
  const [queryLoading, setQueryLoading] = useState(false);

  useEffect(() => {
    init();
  }, [sourceProjectId]);

  const init = () => {
    if (subjectMatterRule === 'PACK') {
      fetchSection();
    } else {
      fetchTableData();
    }
  };

  useEffect(() => {
    if (activeProjectLineSectionId) {
      fetchTableData(activeProjectLineSectionId);
      tableDs.setQueryParameter('projectLineSectionId', activeProjectLineSectionId);
    }
  }, [activeProjectLineSectionId]);

  const fetchSection = () => {
    const params = {
      organizationId,
      sourceProjectId,
    };
    fetchSectionList(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        sectionList.current = result;
        // 如果是从明细页回来，则默认是明细页的projectLineSectionId
        if (!projectLineSectionId) {
          setActiveProjectLineSectionId(result[0]?.projectLineSectionId);
          const initProjectLineSectionId = result.find((i) => i.finishFlag)?.projectLineSectionId;
          setActiveProjectLineSectionId(initProjectLineSectionId);
        }
      }
    });
  };

  const fetchTableData = async (sectionId = null) => {
    setQueryLoading(true);
    fetchFinishQuoteLines({ sourceProjectId, projectLineSectionId: sectionId })
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { sourceLineSuppliers = [], projectQuotes = [] } = result || {};

          const columns = [];
          // eslint-disable-next-line no-unused-expressions
          sourceLineSuppliers?.forEach((item) => {
            columns.push(
              <Column
                name={`${item.supplierCompanyId}_${item.supplierCompanyName}`}
                header={renderColumnTitle(item)}
                width={180}
                tooltip="none"
                renderer={({ record }) => renderSupplierValue(record, item)}
              />
            );
          });
          setDynamicColumns(columns);
          tableDs.loadData(projectQuotes || []);
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 渲染动态标题
  const renderColumnTitle = (field = {}) => {
    const { suggestType, supplierCompanyName } = field;
    switch (suggestType) {
      case '1':
        return (
          <span>
            <Tooltip
              title={intl.get('ssrc.projectSetup.model.projectSetup.wholePackage').d('整包推荐')}
            >
              <img src={wholePackageWinning} alt="" style={{ marginRight: '4px' }} />
            </Tooltip>
            {supplierCompanyName}
          </span>
        );
      case '0':
        return (
          <span>
            <Tooltip
              title={intl.get('ssrc.projectSetup.model.projectSetup.partialPackage').d('部分推荐')}
            >
              <img src={partialWinning} alt="" style={{ marginRight: '4px' }} />
            </Tooltip>
            {supplierCompanyName}
          </span>
        );
      default:
        return supplierCompanyName;
    }
  };

  // 渲染报价总价物料
  const renderContent = useCallback((data = {}, sourceFrom) => {
    const { currencySymbol, sourceQuotationLines = [] } = data || {};
    const content = sourceQuotationLines.map((item) => {
      return (
        <div className={style['amount-popover-content-item']}>
          <span className={style['amount-popover-content-itemName']}>
            <Tooltip title={item.itemName}>{item.itemName}</Tooltip>
          </span>
          <span className={style['amount-popover-content-price']}>
            {currencySymbol}
            <Tooltip title={numberSeparatorRender(item.quotationPrice)}>
              {numberSeparatorRender(item.quotationPrice)}
            </Tooltip>
          </span>
          {sourceFrom === 'RFX' ? (
            <span className={style['amount-popover-content-suggested']}>
              <Tag
                color={item?.suggestedFlag ? 'rgba(71,184,129,0.10)' : 'rgba(0,0,0,0.06)'}
                style={{ color: item?.suggestedFlag ? '#47B881' : 'rgba(0,0,0,0.65)' }}
              >
                {item?.suggestedFlag
                  ? intl.get('ssrc.projectSetup.model.projectSetup.bidding').d('中标')
                  : intl.get('ssrc.projectSetup.model.projectSetup.unBidding').d('未中标')}
              </Tag>
            </span>
          ) : null}
        </div>
      );
    });
    return content;
  }, []);

  // 渲染报价总价标题
  const renderTitle = useCallback((sourceFrom) => {
    return (
      <>
        <span className={style['amount-popover-title-item']}>
          {intl.get('ssrc.projectSetup.model.projectSetup.biddingItem').d('中标物料')}
        </span>
        <span className={style['amount-popover-title-price']}>
          {intl.get('ssrc.projectSetup.model.projectSetup.price').d('价格')}
        </span>
        {sourceFrom === 'RFX' ? (
          <span className={style['amount-popover-title-suggested']}>
            {intl.get('ssrc.projectSetup.model.projectSetup.suggested').d('中标情况')}
          </span>
        ) : null}
      </>
    );
  }, []);

  // 渲染供应商值
  const renderSupplierValue = (record = {}, field = {}) => {
    // 根据行上的record.get('sourceDetail')顺序，依次渲染
    const data = record.get('sourceDetail');
    const content = data.map((item) => {
      const index = record.data?.[
        `${field.supplierCompanyId || ''}_${field.supplierCompanyName}`
      ]?.findIndex((i) => i.detailKey === item.detailKey);
      if (index > -1) {
        const detailValue =
          record.data?.[`${field.supplierCompanyId || ''}_${field.supplierCompanyName}`]?.[index]
            ?.detailValue;
        const sourceFrom = record.get('document')?.sourceFrom;
        const commonProps = {
          readOnly: true,
          fileSize: FIlESIZE,
          labelLayout: 'float',
          bucketName: PRIVATE_BUCKET,
          data: {
            tenantId: organizationId,
          },
        };
        switch (item.detailKey) {
          case 'quotationAttachment': // rfx附件
          case 'quotationAttachment_rf': // rfi/rfp附件
            if (sourceFrom === 'RFI') {
              return (
                <Attachment
                  readOnly
                  fileSize={FIlESIZE}
                  value={detailValue?.rfiAttachmentUuid}
                  label={intl.get('hzero.common.view.title.attachment').d('附件')}
                  bucketName={PRIVATE_BUCKET}
                  viewMode="popup"
                  funcType="link"
                  data={{
                    tenantId: organizationId,
                  }}
                />
              );
            } else if (sourceFrom === 'RFP') {
              return (
                <Group funcType="link">
                  <Attachment
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.techAttach')
                      .d('技术附件')}
                    value={detailValue?.techAttachmentUuid}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.businessAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.businessAttach')
                      .d('商务附件')}
                    {...commonProps}
                  />
                </Group>
              );
            } else {
              // RFX
              return (
                <Group funcType="link">
                  <Attachment
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.techAttach')
                      .d('技术附件')}
                    value={detailValue?.techAttachmentUuid}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.businessAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.businessAttach')
                      .d('商务附件')}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.roundTechAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.roundTechAttachmentUuid')
                      .d('多轮技术附件')}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.roundBusinessAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.roundBusinessAttachmentUuid')
                      .d('多轮商务附件')}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.bargainTechAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.bargainTechAttachmentUuid')
                      .d('议价技术附件')}
                    {...commonProps}
                  />
                  <Attachment
                    value={detailValue?.bargainBusinessAttachmentUuid}
                    label={intl
                      .get('ssrc.projectSetup.view.card.subtitle.bargainBusinessAttachmentUuid')
                      .d('议价商务附件')}
                    {...commonProps}
                  />
                </Group>
              );
            }
          case 'quotationAmount': // 报价总价
            return (
              <div>
                {detailValue?.quotationAmount ? (
                  <Popover
                    overlayClassName={style['amount-popover']}
                    title={() => renderTitle(sourceFrom)}
                    content={() => renderContent(detailValue, sourceFrom)}
                  >
                    <span className={style.quotationAmountDisplay}>
                      {`${numberSeparatorRender(detailValue.quotationAmount)} ${
                        detailValue.currencyCode
                      }`?.replace('undefined', '')}
                    </span>
                  </Popover>
                ) : (
                  '-'
                )}
              </div>
            );
          case 'bidAmount': // 中标总价
            return (
              <div
                style={{ 'white-space': 'nowrap', overflow: 'hidden', 'text-overflow': 'ellipsis' }}
                onMouseEnter={(e) => handleEnter(e, detailValue)}
                onMouseLeave={handleLeave}
              >
                {detailValue?.bidAmount
                  ? `${numberSeparatorRender(detailValue.bidAmount)} ${
                      detailValue.currencyCode
                    }`?.replace('undefined', '')
                  : '-'}
              </div>
            );
          case 'summaryScore': // 评分
            return <div> {detailValue || '-'} </div>;
          case 'summaryRank': // 排名
            return (
              <div>
                {detailValue ? (
                  Number(detailValue) === 1 ? (
                    <span>
                      {detailValue} <img src={theFirst} alt="" />
                    </span>
                  ) : (
                    detailValue
                  )
                ) : (
                  '-'
                )}
              </div>
            );
          default:
            return <div>-</div>;
        }
      } else {
        return <div>-</div>;
      }
    });
    return content;
  };

  // 气泡显示鼠标进入
  const handleEnter = (e, detailValue) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      Tooltip.show(e.target, {
        title: `${numberSeparatorRender(detailValue.bidAmount)} ${
          detailValue.currencyCode
        }`?.replace('undefined', ''),
        placement: 'leftTop',
      });
    }
  };

  // 鼠标移出
  const handleLeave = () => {
    Tooltip.hide();
  };

  // 跳转明细页
  const handleJumpDetail = (data = {}) => {
    const { sourceFrom, sourceHeaderId } = data;
    const bidFlag = data?.secondarySourceCategory === 'NEW_BID';
    const search = querystring.stringify({
      projectLineSectionId: activeProjectLineSectionId,
      sourceProjectId,
    });
    switch (sourceFrom) {
      case 'RFI':
      case 'RFP':
        history.push({
          pathname: `/ssrc/new-project-setup/rf-detail/${data.sourceFrom}/${sourceHeaderId}`,
        });
        break;
      case 'RFX':
        if (bidFlag) {
          history.push({
            pathname: `/ssrc/new-project-setup/bid-detail/${sourceHeaderId}`,
            search,
          });
          return;
        }
        if (headerInfo && headerInfo.sourceRequest === 'OFFLINE_ENTER') {
          // 整单线下
          history.push({
            pathname: `/ssrc/new-project-setup/whole-detail/${sourceHeaderId}`,
            search,
          });
          return;
        }
        history.push({
          pathname: `/ssrc/new-project-setup/rfx-detail/${sourceHeaderId}`,
          search,
        });
        break;
      default:
        break;
    }
  };

  // 渲染寻源单据
  const renderDocument = (record = {}) => {
    const data = record.get('document');
    const content = (
      <div className={style['finish-document-wrapper']}>
        <div className={style['document-left']}>
          <div className={style['document-left-inner']}>
            <a onClick={() => handleJumpDetail(data)} style={{ fontWeight: 600 }}>
              {data.sourceNum}{' '}
            </a>
          </div>
          <div
            className={style['document-left-inner']}
            style={{ color: 'rgba(0,0,0,0.45)', marginTop: '2px' }}
          >
            {data.sourceTitle}
          </div>
        </div>
        <div className={style['document-right']}>
          <div className={style['finish-step-item']}>
            <div
              className={style['step-item-left']}
              style={record.index === 0 ? { borderRight: 'none' } : null}
            />
            <Icon className={style['step-item-icon']} type="fiber_manual_record-o" />
            <div
              className={style['step-item-right']}
              style={record.index === tableDs.length - 1 ? { borderRight: 'none' } : null}
            />
          </div>
        </div>
      </div>
    );
    return content;
  };

  // 渲染寻源情况
  const renderSourceDetail = (record = {}) => {
    const data = record.get('sourceDetail');
    const content = data?.map?.((item) => {
      return (
        <div
          style={
            data.length === 1
              ? { fontWeight: 600, height: '40px', lineHeight: '40px' }
              : { fontWeight: 600, marginTop: '2px' }
          }
        >
          {item.detailKeyMeaning}
        </div>
      );
    });
    return content;
  };

  return subjectMatterRule === 'PACK' ? (
    <div className="project-card-warp-section">
      <section className={leftShow ? style['section-left'] : style['section-left-closed']}>
        <div className={style['section-left-content']}>
          <div className={style['section-title']}>
            {leftShow ? (
              <>
                <h5>{intl.get('ssrc.projectSetup.model.projectSetup.section').d('标段')}</h5>
                <div>
                  {intl.get('ssrc.projectSetup.model.projectSetup.section.tip').d('快速切换标段')}
                </div>
              </>
            ) : (
              <h5>{intl.get('ssrc.projectSetup.model.projectSetup.section').d('标段')}</h5>
            )}
          </div>
          <ul className={style['menu-left']}>
            {sectionList.current?.map((item) => {
              if (leftShow) {
                return (
                  <li
                    onClick={() => {
                      if (!item.finishFlag) return;
                      setActiveProjectLineSectionId(item.projectLineSectionId);
                    }}
                    className={classNames(
                      !item.finishFlag ? style['menu-left-disabled'] : '',
                      `${
                        activeProjectLineSectionId === item.projectLineSectionId
                          ? style['menu-left-active']
                          : ''
                      }`
                    )}
                  >
                    <Popover content={`${item.sectionCode}-${item.sectionName}`}>
                      {item.sectionCode} - {item.sectionName}
                    </Popover>
                  </li>
                );
              } else {
                return (
                  <li
                    onClick={() => {
                      if (!item.finishFlag) return;
                      setActiveProjectLineSectionId(item.projectLineSectionId);
                    }}
                  >
                    <span
                      className={classNames(
                        !item.finishFlag ? style['menu-left-closed-disabled'] : '',
                        style['menu-left-closed']
                      )}
                    >
                      {item.sectionNum}
                    </span>
                    <span
                      className={`${
                        activeProjectLineSectionId === item.projectLineSectionId
                          ? style['menu-left-closed-active']
                          : ''
                      }`}
                    />
                  </li>
                );
              }
            })}
          </ul>
        </div>
        <div className={style['collapse-handle']} onClick={() => setLeftShow(!leftShow)}>
          {leftShow ? <img src={arrowLeft} alt="" /> : <Icon type="baseline-arrow_right" />}
        </div>
      </section>
      <section className={style['section-right']}>
        <Spin spinning={queryLoading}>
          <Table
            dataSet={tableDs}
            rowHeight="auto"
            className={style['finish-table-header-height']}
            // autoHeight={{ type: 'minHeight', diff: 8 }}
            style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
          >
            <Column
              lock
              name="document"
              align="right"
              width={200}
              tooltip="none"
              renderer={({ record }) => renderDocument(record)}
              className={style['finish-document']}
            />
            <Column
              lock
              name="sourceDetail"
              width={150}
              tooltip="none"
              renderer={({ record }) => renderSourceDetail(record)}
            />
            {dynamicColumns}
            <Column width={20} renderer={() => <div hidden />} />
          </Table>
        </Spin>
      </section>
    </div>
  ) : (
    <div className="project-card-warp">
      <div className="project-card-content">
        <Spin spinning={queryLoading}>
          <Table
            dataSet={tableDs}
            rowHeight="auto"
            className={style['finish-table-header-height']}
            // autoHeight={isWorkflowContract ? false : { type: 'minHeight', diff: 8 }}
            style={isWorkflowContract ? {} : getTableFixSelfAdaptStyle()?.tableMaxHeight}
          >
            <Column
              lock
              name="document"
              align="right"
              width={200}
              tooltip="none"
              renderer={({ record }) => renderDocument(record)}
              className={style['finish-document']}
            />
            <Column
              lock
              name="sourceDetail"
              width={150}
              tooltip="none"
              renderer={({ record }) => renderSourceDetail(record)}
            />
            {dynamicColumns}
            <Column width={20} renderer={() => <div hidden />} />
          </Table>
        </Spin>
      </div>
    </div>
  );
}
