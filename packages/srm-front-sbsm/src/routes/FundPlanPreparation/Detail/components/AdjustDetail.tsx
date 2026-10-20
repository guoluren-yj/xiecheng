// 调整阶段明细
import React, { useMemo, useContext, useEffect, cloneElement, useCallback, useState } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { preStageInfoDS, preStageLineDS } from '../stores/indexDS';
import AdjustBasicInfo from './AdjustBasicInfo';
import AdjustLine from './AdjustLine';

interface DetailProps {
  lineRecordDs: any,
  modal?: any,
}

const AdjustDetail = (props: DetailProps) => {

  // lineRecordDs 点击的行数据
  const { modal, lineRecordDs } = props;

  const {
    loading,
    headerDs,
    preLineDs,
    editFlag,
  } = useContext<StoreValueType>(Store);

  const { prepHeaderId } = headerDs.current?.get(['prepHeaderId']) || {};
  const { poolHeaderId, poolStageId } = lineRecordDs?.get(['poolHeaderId', 'poolStageId']) || {};

  const [lineRecordData, setLineRecordData] = useState(lineRecordDs?.toData());

  const { prepViewType } = headerDs.current?.get(['prepViewType']) || {};


  const preStageInfoDs = useMemo(() => new DataSet(preStageInfoDS()), []);
  const preStageLineDs = useMemo(() => new DataSet(preStageLineDS({poolHeaderId, poolStageId, prepHeaderId, prepViewType})), [poolHeaderId, poolStageId, prepHeaderId, prepViewType]);

  useEffect(() => {
    preStageInfoDs.loadData([lineRecordData]);
  }, [preStageInfoDs, lineRecordData]);

  const handleAfterSave = useCallback((content, closeFlag) => {
    preLineDs.query();
    headerDs.query(undefined, undefined, true);
    if (closeFlag) {
      setLineRecordData(content);
      preStageInfoDs.loadData([content]);
    }
    if (!closeFlag) modal.close();
  }, [preLineDs, headerDs, preStageInfoDs, modal]);

  const handleSave = useCallback(async(closeFlag?: boolean) => {
    const validateRes = await preStageLineDs.validate();
    if (!validateRes) return false;
    const res = await preStageLineDs.setState('lineRecordData', lineRecordData).forceSubmit();
    if (!res) return;
    const content = res?.content[0];
    handleAfterSave(content, closeFlag);
    if (closeFlag) preStageLineDs.query();
  }, [preStageLineDs, lineRecordData, handleAfterSave]);

  useEffect(() => {
    if (editFlag) {
      modal.update({
        footer: (okBtn, cancelBtn) => [
          cloneElement(okBtn, { loading }),
          <Button loading={loading} onClick={() => handleSave(true)}>{intl.get(`sbsm.common.button.onlySave`).d('仅保存')}</Button>,
          cancelBtn,
        ],
        okText: intl.get(`sbsm.common.button.saveAndClose`).d('保存并关闭'),
      });
    } else {
      modal.update({
        cancelButton: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    }
  }, [modal, loading, handleSave, editFlag]);

  useEffect(() => {
    if (modal && editFlag) modal.handleOk(handleSave);
  }, [modal, handleSave, editFlag]);

  return (
    <div>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`sbsm.fundPlan.view.title.adjustStageInfo`).d('编制阶段信息')}
      >
        <AdjustBasicInfo preStageInfoDs={preStageInfoDs} />
      </Card>
      <Card
        bordered={false}
        className={DETAIL_CARD_CLASSNAME}
        title={intl.get(`sbsm.fundPlan.view.title.sourceLineStageDetail`).d('编制来源单据行匹配阶段明细')}
      >
        <AdjustLine handleAfterSave={handleAfterSave} preStageLineDs={preStageLineDs} lineRecordData={lineRecordData} preStageInfoDs={preStageInfoDs} setLineRecordData={setLineRecordData} />
      </Card>
    </div>
  );
};


export default AdjustDetail;
