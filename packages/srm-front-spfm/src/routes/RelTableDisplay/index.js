import React, { useEffect, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { getDvaApp } from 'utils/iocUtils';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { loadTrackingMethod } from 'hzero-front/lib/customize/customizeTracking';
import RelTable from '@/components/RelTable';
import styles from './index.less';
import { getRelTableMenuConfigApi } from './service';

function RelTableDisplay(props = {}) {
  const {
    match: { params },
  } = props;
  const [loading, setLoading] = useState(true);
  const [relCode, setRelCode] = useState('');
  // 按钮控制默认：undefined，取配置表组件默认配置
  const [showQueryBarexportDataFlag, setShowQueryBarexportDataFlag] = useState(undefined);
  const [importDataFlag, setImportDataFlag] = useState(undefined);
  const [batchDeleteFlag, setBatchDeleteFlag] = useState(undefined);
  const [exportTemplateFlag, setExportTemplateFlag] = useState(undefined);
  const [showCreatedByFlag, setShowCreatedByFlag] = useState(undefined);
  // 行按钮 - 编辑，删除，历史记录显隐设置
  const [lineBtnFlag, setLineBtnFlag] = useState({
    rowEditFlag: null,
    rowDeleteFlag: null,
    rowHistoryFlag: null,
  });

  useEffect(() => {
    if (!isEmpty(params) && params.code) {
      getRelTableMenuConfigApi(params.code).then(res => {
        if (getResponse(res)) {
          if (res.length) {
            const menuConfig = res[0];
            setShowQueryBarexportDataFlag(Boolean(Number(menuConfig.showQueryBarexportDataFlag)));
            setImportDataFlag(Boolean(Number(menuConfig.importDataFlag)));
            setBatchDeleteFlag(Boolean(Number(menuConfig.batchDeleteFlag)));
            setExportTemplateFlag(Boolean(Number(menuConfig.exportTemplateFlag)));
            setShowCreatedByFlag(Boolean(Number(menuConfig.showCreatedByFlag)));
            setLineBtnFlag({
              rowEditFlag: menuConfig.rowEditFlag,
              rowDeleteFlag: menuConfig.rowDeleteFlag,
              rowHistoryFlag: menuConfig.rowHistoryFlag,
            });
          }
        }
        if (judgeRouter(params.code)) {
          setRelCode(params.code);
        }
        const trackingMethod = loadTrackingMethod({
          module: 'srm-front-spfm',
          code: 'SPFM_REL_TABLE_DISPLAY:QUERY_BAR_EXPORT_DATA_FLAG',
        });
        if (trackingMethod) {
          const showExportDataFlag = trackingMethod({
            code: params.code,
          });
          setShowQueryBarexportDataFlag(showExportDataFlag);
        }
        setLoading(false);
      });
    }
  }, [params]);

  const judgeRouter = code => {
    const state = getDvaApp()._store.getState();
    const { global: { activeTabKey = '' } = {} } = state;
    return activeTabKey === `/spfm/rel-table/${code}`;
  };

  const renderMessage = () => {
    const message = intl
      .get('spfm.relTableDisplay.error.none.message')
      .d(`当前路径下配置表编码为{code}，未配置成菜单，请配置后使用`);
    const messageArr = message.split('{code}');
    return (
      <span>
        {messageArr[0] || ''}
        <span>{params.code}</span>
        {messageArr[1] || ''}
      </span>
    );
  };

  return (
    <>
      {loading ? (
        <Spin />
      ) : relCode ? (
        <RelTable
          tableCode={relCode}
          exportDataFlag={showQueryBarexportDataFlag}
          importDataFlag={importDataFlag}
          batchDeleteFlag={batchDeleteFlag}
          exportTemplateFlag={exportTemplateFlag}
          showCreatedByFlag={showCreatedByFlag}
          lineBtnFlag={lineBtnFlag}
        />
      ) : (
        <div className={styles['relTable-error']}>
          <div className="relTable-error-middle">
            <div>
              <h1 className="relTable-error-middle-head">404</h1>
              <p className="relTable-error-middle-message">{renderMessage()}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.relTableDisplay'],
})(RelTableDisplay);
