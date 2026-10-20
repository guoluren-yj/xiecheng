import React, { memo, Suspense, useState, lazy } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
// @ts-ignore
import cuxRemote from 'hzero-front/lib/utils/remote';

const PlanAsnCmp = (props) => {
const [btnLoading, setbtnLoading] = useState(false);
    const { fromPoLineLocationId, consultPlanNodeId, hidden = false, campKey, remote } = props;


    function openModal() {
        try {
            setbtnLoading(true);
            const Tables = lazy(() => import('./modalTable'));
            const tableModal = Modal.open({});
            tableModal.update({
              style: { width: '742px', minWidth: '742px' },
                title: intl.get('slod.deliveryWorkbench.model.common.planAsnTitle').d('送货计划'),
                children: (
                  <Suspense fallback={<div>{intl.get('hzero.common.view.load.loadingMsg').d('正在加载...')}</div>}>
                    <Tables fromPoLineLocationId={fromPoLineLocationId} nodeConfigId={consultPlanNodeId} campKey={campKey} remote={remote} />
                  </Suspense>
                ),
                drawer: true,
                okCancel: false,
                closable: true,
                closeOnLocationChange: true,
                okText: intl.get('hzero.common.button.close').d('关闭'),
            });
        } finally {
            setbtnLoading(false);
        }
    };

  return (
    <>
      {hidden ? (<>-</>) : (
        <Button
          wait={1000}
          style={{height: "28px"}}
          funcType={FuncType.link}
          color={ButtonColor.primary}
          onClick={openModal}
          loading={btnLoading}
        >
          {intl.get('hzero.common.button.look').d('查看')}
        </Button>
      )}
    </>
  );
};


export default formatterCollections({ code: ['hzero.common', 'slod.deliveryWorkbench'] })(cuxRemote({ code: 'ASN_PLAN'})(memo(PlanAsnCmp)));
