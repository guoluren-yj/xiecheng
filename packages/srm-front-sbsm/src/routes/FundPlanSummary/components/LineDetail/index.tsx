// 调整阶段明细
import React, { useMemo, useEffect, useCallback } from 'react';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import { Spin, Card } from 'choerodon-ui';
import { DataSet, Button } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Basic from './Basic';
import RelatedLine from './RelatedLine';
import { basicDS, lineDetailDS } from './storeDS';
import { LineDetailCuszCode } from '../../utils/type';

interface LineDetailProps {
  editFlag?: boolean,
  topRecord: DSRecord,
}

const LineDetail = flow(
  observer,
  withCustomize({
    unitCode: Object.values(LineDetailCuszCode),
  }),
)((props) => {

  const {
    modal,
    editFlag,
    topRecord,
    customizeForm,
    customizeTable,
  } = props;

  const prepViewType = topRecord?.get('prepViewType');
  const lineDetailDs = useMemo(() => new DataSet(lineDetailDS(topRecord)), [topRecord]);
  const basicDs = useMemo(() => new DataSet(basicDS(topRecord)), [topRecord]);

  const loading = basicDs.status !== 'ready';

  const handleSave = useCallback(async (closeFlag?: boolean) => {
    const res = await lineDetailDs.submit();
    if(!res) return false;
    const content = res?.content[0];
    const { objectVersionNumber } = content || {};
    topRecord.set('objectVersionNumber', objectVersionNumber);
    const lineDs = topRecord.dataSet;
    const headerDs = lineDs?.parent;
    if (headerDs) headerDs.query(undefined, undefined, true);
    return closeFlag;
  }, [topRecord, lineDetailDs]);

  useEffect(() => {
    if (modal) {
      if (editFlag) {
        modal.handleOk(handleSave);
        modal.update({
          okProps: { loading },
          okText: intl.get(`sbsm.common.button.saveAndClose`).d('保存并关闭'),
          footer: (okBtn, cancelBtn) => [
            okBtn,
            <Button loading={loading} onClick={() => handleSave(true)}>{intl.get(`sbsm.common.button.onlySave`).d('仅保存')}</Button>,
            cancelBtn,
          ],
        });
      } else {
        modal.update({
          cancelButton: false,
          okText: intl.get('hzero.common.button.close').d('关闭'),
        });
      }
    }
  }, [modal, loading, editFlag, handleSave]);

  const cardList = useMemo(() => {
    const commonProps = {
      editFlag,
      topRecord,
      customizeForm,
    };
    return [
      {
        key: 'basic',
        title: prepViewType === 'STAGE'
          ? intl.get(`sbsm.fundPlan.view.title.prepStageInfo`).d('编制阶段信息')
          : intl.get(`sbsm.fundPlan.view.title.prepSourceDocInfo`).d('编制来源单据信息'),
        content: <Basic {...commonProps} basicDs={basicDs} />,
      },
      {
        key: 'line',
        title: intl.get(`sbsm.fundPlan.view.title.sourceLineStageDetail`).d('编制来源单据行匹配阶段明细'),
        content: <RelatedLine {...commonProps} lineDetailDs={lineDetailDs} customizeTable={customizeTable} />,
      } as any,
    ].filter(Boolean);
  }, [
    basicDs,
    editFlag,
    topRecord,
    lineDetailDs,
    prepViewType,
    customizeForm,
    customizeTable,
  ]);

  return (
    <Spin spinning={loading}>
      {cardList.map((item) => {
        const { content, ...panelProps } = item;
        return (
          <Card bordered={false} className={DETAIL_CARD_CLASSNAME} {...panelProps}>
            {content}
          </Card>
        );
      })}
    </Spin>
  );
}) as React.FC<LineDetailProps>;


export default LineDetail;
