/**
 * 创建时间：2026-05-11 10:00:00
 * 文件名：index.js
 * 文件描述：企业尽职调查报告页面
 * 作者：Felix(LQX5731@163.com)
 * 版本号：v1.0.0
 * 最后更新时间：2026-05-11 10:00:00
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { compose } from 'lodash';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button, Modal } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { getEnvConfig } from 'utils/iocUtils';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';

import { getResponse, getLocalUrlParam } from '@/utils/utils';

import { fetchGetPdfUrl, fetchExportPdf, fetchGetMapData } from './stores/corporateDiligenceDS';
import LeftMenu from './LeftMenu';
import DynamicCardPanel from './DynamicCardPanel';
import RiskMapModal from '../EnterpriseRiskControl/RelationshipMiningQxb/RiskMapModal';

import styles from './index.less';

const { HZERO_FILE } = getEnvConfig();

let modal = null;

const CorpDue = (props) => {
  const { customizeTable } = props;

  const [selected, setSelected] = useState(null);
  const [defaultCompany, setDefaultCompany] = useState('');

  const handleExportPdf = async () => {
    if (!(selected && selected.recordId)) return;
    const res = await fetchExportPdf({ recordId: selected.recordId });
    if (getResponse(res) && res.fileUrl) {
      const a = document.createElement('a');
      a.href = res.fileUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    const { companyName = '' } = getLocalUrlParam() || {};
    setDefaultCompany(companyName);
  }, []);

  const handleSelectItem = (item) => {
    setSelected(item);
  };

  const handlePreview = async () => {
    const id = selected?.recordId ?? '';
    if (id) {
      const res = await fetchGetPdfUrl({ recordId: id });
      if (getResponse(res)) {
        const url = res?.fileUrl ?? '';
        window.open(
          `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/file-preview/by-url?url=${url}&bucketName=${PRIVATE_BUCKET}&access_token=${getAccessToken()}`
        );
      }
    }
  };

  /**
   * 查看关系路径图
   */
  const handleViewChart = async (record) => {
    if (modal) {
      modal.close();
    }

    const handleCloseModal = () => {
      modal.close();
    };

    let mapData = {};
    const res = await fetchGetMapData({ searchKey: record?.reportKey ?? '' });
    if (getResponse(res)) {
      try {
        mapData = res?.relationData ? JSON.parse(res?.relationData) : {};
      } catch (error) {
        mapData = {};
      }
    }

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.title.relationDetails').d('关系详情'),
      children: <RiskMapModal record={mapData} />,
      closable: true,
      drawer: true,
      style: { width: '1000px', overflow: 'hidden' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  return (
    <>
      <Header
        title={intl
          .get('sdat.corporateDiligence.view.title.corporateDueDiligence')
          .d('企业尽职调查报告')}
      >
        <Button funcType="flat" icon="visibility-o" onClick={handlePreview}>
          {intl.get('sdat.corporateDiligence.view.title.preViewReport').d('预览报告')}
        </Button>
        <Button funcType="flat" icon="file_download_black-o" onClick={handleExportPdf}>
          {intl.get('sdat.corporateDiligence.view.button.reportExport').d('报告下载')}
        </Button>
        {selected?.reportType === 'RELATION_MINING' ? (
          <Button funcType="flat" icon="bar_chart1" onClick={() => handleViewChart(selected)}>
            {intl.get('sdat.corporateDiligence.view.button.relationshipPath').d('关系路径图')}
          </Button>
        ) : null}
      </Header>
      <div className={styles['corp-due-diligence-basic']}>
        <LeftMenu onSelect={handleSelectItem} defaultCompany={defaultCompany} />
        <DynamicCardPanel record={selected} customizeTable={customizeTable} />
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['sdat.corporateDiligence', 'sdat.riskProfile', 'sdat.monitorBusiness', 'sdat.supplier'],
  }),
  WithCustomizeC7N({
    unitCode: ['SDAT.CORPORATE_DILIGENCE_TABLE_GROUP', 'SDAT.CORPORATE_DILIGENCE_TABLE_SHELL'],
  })
)(CorpDue);
