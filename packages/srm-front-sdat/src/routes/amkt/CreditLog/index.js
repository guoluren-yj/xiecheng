/**
 * 风控日志
 * @date: 2022-09-16
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser, getResponse } from 'utils/utils';
// import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import { SRM_DATA_SDAT } from '@/utils/config';
import StaticSearchBar from '@/components/StaticSearchBar';
import { getLocalUrlParam } from '@/utils/utils';
import { fetchRfxId } from '@/services/creditLogService';

import { ReactExportButton } from './ReactExportButton';

import { logListDS } from './store/CreditLogDS';
import { getQueryConfig } from './queryConfig';

import style from './index.less';

const { Column } = Table;
const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const exportRequestUrl = `${SRM_DATA_SDAT}/v1/${tenantId}/risk-operate-log/log-export`;
// 类型标签颜色：格式为[背景颜色，字体颜色]
const tagColorMap = {
  ADD_MONITOR: ['#fdecdd', '#F46C0E'], // 添加监控
  CANCEL_MONITOR: ['#e5e7ec', '#4E5769'], // 取消监控
  RISK_SCAN: ['#dbecfe', '#1984f7'], // 风险扫描
  RELATION_MINING_DJG: ['gray', 'black'], // 关系挖掘-法人、股东、高管
  RELATION_REVELATION: ['gray', 'black'], // 关系挖掘-股权揭示
  RELATION_MINING_ZHGX: ['gray', 'black'], // 关系挖掘-组合关系
  RELATION_MINING_LXFS: ['gray', 'black'], // 关系挖掘-联系方式
  ENTERPRISE_RELATION: ['#e4f5ed', '#3AB545'], // 找关系
};

function CreditLog(props = {}) {
  const { remotePro, history } = props;
  const { logListDs } = props.valueDs;

  const { activeKey = '', selectUserId = '' } = getLocalUrlParam();

  // getFilters: 获取配置对象
  const getFilters = () => ({ ...getQueryConfig() });

  const handleFilterQueryAll = ({ params }) => {
    // 处理一下时间
    const { operateTime_range: rangeTime = '', operateType_range: operateType = '' } = params;
    const [startDate = undefined, endDate = undefined] = rangeTime?.split(',') ?? [];
    logListDs.queryParameter = { ...params, startDate, endDate, operateType };
    logListDs.query();
  };

  const handleClear = () => {
    logListDs.queryParameter = {};
    logListDs.query();
  };

  const renderType = ({ value, text }) => {
    return (
      value && (
        <Tag
          color={(tagColorMap[value] && tagColorMap[value][0]) || 'gray'}
          style={{
            cursor: 'default',
            color: (tagColorMap[value] && tagColorMap[value][1]) || 'black',
          }}
        >
          {text}
        </Tag>
      )
    );
  };

  const handlePushRfx = async (rfxNumber, businessType) => {
    if (rfxNumber) {
      const res = await fetchRfxId({ multiRfxNumOrTitle: rfxNumber });
      if (getResponse(res)) {
        if (res?.content?.length) {
          const { rfxHeaderId = '', sourceCategory = '', projectLineSectionId = '' } =
            res?.content[0] ?? {};
          if (rfxHeaderId) {
            if (!['NEW_BID', 'BID'].includes(businessType)) {
              history.push(
                `/ssrc/new-inquiry-hall/other-detail/${rfxHeaderId}?projectLineSectionId=${projectLineSectionId}&rfxHeaderId=${rfxHeaderId}&sourceCategory=${sourceCategory}&permissionFilterFlag=1`
              );
            } else {
              history.push(
                `/ssrc/new-bid-hall/other-detail/${rfxHeaderId}?projectLineSectionId=${projectLineSectionId}&rfxHeaderId=${rfxHeaderId}&sourceCategory=${sourceCategory}&permissionFilterFlag=1`
              );
            }
          }
        }
      }
    }
  };

  const renderLinkNumber = record => {
    // 二开埋点
    const isShow = remotePro
      ? remotePro.process('SDAT_CREDIT_LOG_SHOW_NUMBER_LINK_SHOW_LINK_COLUMN', null, {})
      : false;

    const rfxNumber = record?.get('businessInfo') ?? '';
    const businessType = record?.get('businessType') ?? '';

    return (
      <div className={style['link-number']}>
        {isShow && ['RFI', 'RFX', 'RFA', 'RFP', 'RFQ', 'NEW_BID', 'BID'].includes(businessType) ? (
          <a onClick={() => handlePushRfx(rfxNumber, businessType)}>{record.get('businessInfo')}</a>
        ) : (
          record.get('businessInfo')
        )}
      </div>
    );
  };

  return (
    <div className={style['credit-basic-panel']}>
      <Header
        title={intl.get('sdat.creditLog.view.header.creditLog').d('风控日志')}
        backPath={`/sdat/monitor-org-management/list?activeFlag=${activeKey}&selectUserId=${selectUserId}`}
      >
        <ReactExportButton
          btnText={intl.get('sdat.creditLog.view.button.export').d('导出')}
          exportRequestUrl={exportRequestUrl}
          params={{ ...passParams }}
          ds={logListDs}
        />
      </Header>
      <Content>
        <div className={style['credit-log-basic-panel']}>
          <StaticSearchBar
            key="monitor-org-bar"
            cacheState
            cacheKey="SDAT.CACHE_MONITOR_MANAGE_MINING_DETAILS"
            clearButton
            searchCode="SDAT.CREDIT_LOG"
            filters={getFilters()}
            dataSet={[logListDs]}
            onQuery={handleFilterQueryAll}
            onClear={handleClear}
            onReset={handleClear}
            showLoading={false}
            // defaultExpand={false}
          />
        </div>
        <div className={style['table-box']}>
          <Table
            dataSet={logListDs}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          >
            <Column name="operateType" width={150} renderer={renderType} />
            <Column name="enterpriseName" />
            <Column
              name="businessInfo"
              width={200}
              renderer={({ record }) => renderLinkNumber(record)}
            />
            <Column name="loginName" width={150} />
            <Column name="operateName" width={150} />
            <Column name="operateTime" width={150} />
          </Table>
        </div>
      </Content>
    </div>
  );
}

export default formatterCollections({
  code: ['sdat.creditLog', 'sdat.monitorStuff'],
})(
  remote({
    code: 'SDAT_CREDIT_LOG_SHOW_NUMBER_LINK', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remotePro', // 默认 'remote'， 如有属性冲突可以改此属性
  })(
    withProps(
      () => {
        const logListDs = new DataSet({ ...logListDS() });

        const valueDs = { logListDs };
        return { valueDs };
      },
      { cacheState: true, keepOriginDataSet: true }
    )(CreditLog)
  )
);
