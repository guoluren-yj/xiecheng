import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Table, DataSet, Spin } from 'choerodon-ui/pro';
import { Icon, Popover } from 'choerodon-ui';
import querystring from 'querystring';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { fetchProjectQuoteLines, fetchSectionList } from '@/services/projectSetupService';
import arrowLeft from '@/assets/baseline-arrow_left.svg';
import { BID } from '@/utils/globalVariable';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import Steps from '../Steps';
import style from './index.less';

const { Column } = Table;
const organizationId = getCurrentOrganizationId();

export default function Sourcing({
  subjectMatterRule,
  history = {},
  match = {},
  searchParams = {},
  remote,
  headerInfo = {},
}) {
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
            name: 'supplier',
          },
        ],
        transport: {
          read: ({ data }) => ({
            url: `${SRM_SSRC}/v1/${organizationId}/project-quote-lines/${sourceProjectId}/detail`,
            method: 'GET',
            query: { ...data },
            transformResponse: (res) => {
              const result = getResponse(JSON.parse(res));
              if (result && !result.failed) {
                const { sourceLineSuppliers = [] } = result;
                return sourceLineSuppliers;
              }
            },
          }),
        },
      }),
    []
  );

  const participatedCountAll = useRef();
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
        }
      }
    });
  };

  const fetchTableData = async (sectionId = null) => {
    setQueryLoading(true);
    fetchProjectQuoteLines({ sourceProjectId, projectLineSectionId: sectionId })
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { projectQuotes = [], sourceLineSuppliers = [], participatedCount } = result || {};

          participatedCountAll.current = participatedCount;

          const columns = [];
          // eslint-disable-next-line no-unused-expressions
          projectQuotes?.forEach((item) => {
            columns.push(
              <Column
                align="left"
                headerStyle={{ paddingLeft: '24px', fontSize: '14px' }}
                header={renderHeaderTitle(item)}
              >
                {item.sourceNodeList?.map((i, index) => (
                  <Column
                    align="center"
                    width={150}
                    name={
                      i?.nodeKey === 'ROUND_QUOTATION_RFX_SCORE'
                        ? `${i?.nodeKey}_${i?.nodeKeyParam}`
                        : i?.nodeKey
                    }
                    className={`${style['sourcing-progress']} ${style[getClassName(item, index)]}`}
                    header={i.nodeKeyMeaning}
                    headerStyle={getHeaderStyle(item, index)}
                    renderer={({ record }) =>
                      renderSteps(
                        record.get('sourceNodesMap')?.[item.sourceQuoteId]?.[index],
                        item.currentNodeKeySeq
                      )
                    }
                  />
                ))}
              </Column>
            );
          });
          setDynamicColumns(columns);
          tableDs.loadData(sourceLineSuppliers ?? []);
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 渲染头部标题
  const renderHeaderTitle = (data = {}) => {
    const header = (
      <a onClick={() => handleJumpDetail(data)}>
        {`${data.secondarySourceCategory === 'NEW_BID' ? BID : data.targetFrom}-${
          data.sourceTitle
        }`}
      </a>
    );
    return remote
      ? remote.render('SSRC_PROJECT_SETUP_DETAIL_RENDER_SOURCING_TABLE_HEADER_TITLE', header, {
          data,
        })
      : header;
  };

  // 动态设置className
  const getClassName = (data = {}, index) => {
    const thisLength = data.sourceNodeList?.length - 1;
    switch (index) {
      case 0:
        return 'left-side-col'; // 第一列
      case thisLength:
        return 'right-side-col'; // 最后一列
      default:
        return 'center-col'; // 中间列
    }
  };

  // 动态设置表头style
  const getHeaderStyle = (data = {}, index) => {
    const thisLength = data.sourceNodeList?.length - 1;
    const innerStyle = { fontSize: '12px', fontWeight: 400 };
    switch (index) {
      case 0:
        return { ...innerStyle, paddingRight: 0 }; // 第一列
      case thisLength:
        return { ...innerStyle, paddingLeft: 0 }; // 最后一列
      default:
        return innerStyle; // 中间列
    }
  };

  const renderSteps = (progress, currentNodeKeySeq) => {
    return progress ? (
      <Steps progress={[progress]} currentNodeKeySeq={currentNodeKeySeq} />
    ) : (
      <div hidden />
    );
  };

  // 跳转明细页
  const handleJumpDetail = (data = {}) => {
    const { targetFrom, targetHeaderId } = data;
    const bidFlag = data?.secondarySourceCategory === 'NEW_BID';
    const search = querystring.stringify({
      projectLineSectionId: activeProjectLineSectionId,
      sourceProjectId,
    });
    switch (targetFrom) {
      case 'RFI':
      case 'RFP':
        history.push({
          pathname: `/ssrc/new-project-setup/rf-detail/${data.targetFrom}/${targetHeaderId}`,
        });
        break;
      case 'RFX':
        if (bidFlag) {
          history.push({
            pathname: `/ssrc/new-project-setup/bid-detail/${targetHeaderId}`,
            search,
          });
          return;
        }
        if (headerInfo?.sourceRequest === 'OFFLINE_ENTER') {
          // 整单线下
          history.push({
            pathname: `/ssrc/new-project-setup/whole-detail/${targetHeaderId}`,
            search,
          });
          return;
        }
        history.push({
          pathname: `/ssrc/new-project-setup/rfx-detail/${targetHeaderId}`,
          search,
        });
        break;
      default:
        break;
    }
  };

  const supplierInfoRenderer = (record = {}) => {
    const { supplierIcon, supplierCompanyName, participatedCount } = record.get([
      'supplierIcon',
      'supplierCompanyName',
      'participatedCount',
    ]);
    return (
      <div className={style['supplier-wrapper']}>
        {supplierIcon ? (
          <img src={supplierIcon} alt="" className={style['supplier-img']} />
        ) : (
          <div className={style['supplier-icon']}>{supplierCompanyName?.substring(0, 1)}</div>
        )}
        <div className={style['supplier-info']}>
          <div className={style['supplier-name']}>{supplierCompanyName}</div>
          <div className={style['supplier-participate']}>
            {intl.get('ssrc.projectSetup.view.message.participate').d('参与')}
            <span className={style['supplier-participate-count']}>{participatedCount}</span>
            {intl.get('ssrc.projectSetup.view.message.sheet').d('单')}
          </div>
        </div>
      </div>
    );
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
                    onClick={() => setActiveProjectLineSectionId(item.projectLineSectionId)}
                    className={`${
                      activeProjectLineSectionId === item.projectLineSectionId
                        ? style['menu-left-active']
                        : ''
                    }`}
                  >
                    <Popover content={`${item.sectionCode}-${item.sectionName}`}>
                      {item.sectionCode} - {item.sectionName}
                    </Popover>
                  </li>
                );
              } else {
                return (
                  <li onClick={() => setActiveProjectLineSectionId(item.projectLineSectionId)}>
                    <span className={style['menu-left-closed']}>{item.sectionNum}</span>
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
            rowHeight={60}
            className={style['souring-table-header-height']}
            // autoHeight={{ type: 'minHeight', diff: 8 }}
            style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
          >
            <Column
              lock
              name="supplier"
              width={200}
              tooltip="none"
              className={style['souring-supplier']}
              renderer={({ record }) => supplierInfoRenderer(record)}
              headerClassName={style['header-souring-supplier']}
              header={
                <div className={style['souring-supplier-header']}>
                  {intl.get('ssrc.projectSetup.view.message.title.supplier').d('供应商')}
                  <p className={style['souring-supplier-sub-header']}>
                    {intl.get('ssrc.projectSetup.view.message.participateAll').d('共参与')}
                    <span className={style['souring-supplier-sub-header-participate']}>
                      {participatedCountAll.current}
                    </span>
                    {intl.get('ssrc.projectSetup.view.message.example').d('家')}
                  </p>
                </div>
              }
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
            rowHeight={60}
            className={style['souring-table-header-height']}
            // autoHeight={{ type: 'minHeight', diff: 8 }}
            style={getTableFixSelfAdaptStyle()?.tableMaxHeight}
          >
            <Column
              lock
              name="supplier"
              width={200}
              tooltip="none"
              className={style['souring-supplier']}
              renderer={({ record }) => supplierInfoRenderer(record)}
              headerClassName={style['header-souring-supplier']}
              header={
                <div className={style['souring-supplier-header']}>
                  {intl.get('ssrc.projectSetup.view.message.title.supplier').d('供应商')}
                  <p className={style['souring-supplier-sub-header']}>
                    {intl.get('ssrc.projectSetup.view.message.participateAll').d('共参与')}
                    <span className={style['souring-supplier-sub-header-participate']}>
                      {participatedCountAll.current}
                    </span>
                    {intl.get('ssrc.projectSetup.view.message.example').d('家')}
                  </p>
                </div>
              }
            />
            {dynamicColumns}
            <Column width={20} renderer={() => <div hidden />} />
          </Table>
        </Spin>
      </div>
    </div>
  );
}
