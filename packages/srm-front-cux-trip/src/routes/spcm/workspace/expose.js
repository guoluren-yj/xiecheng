import React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import intl from 'utils/intl';
import { Expose } from 'utils/remote';

import { sourcingResultsDS } from '@/routes/scux/ReferenceDocument/store/referenceDocumentDs';
import ReferenceDocument from '@/routes/scux/ReferenceDocument';
import HeaderButtons from '@/routes/scux/ReferenceDocument/HeaderButtons';

const { TabPane, TabGroup } = Tabs;

const cuxSourcingResultsDs = new DataSet(sourcingResultsDS());

export default new Expose({
  process: {
    // 渲染dom
    SPCM_WORKSPACE_LIST_RENDER_TABS: (sourceTabs, otherProps) => {
      const { groupDefaultKey, props: { workSpace, location } = {} } = otherProps;
      const { setting } = workSpace || {};
      const {
        dsFrFlag, // 寻源结果
      } = setting || {};
      return (
        !!dsFrFlag &&
        (sourceTabs || []).concat([
          <TabGroup
            tab={intl
              .get('scux.spcm.workspace.view.button.trip.referenceDocument')
              .d('引用单据新建')}
            key="cuxReferenceDocument"
            defaultActiveKey={groupDefaultKey.cuxReferenceDocument}
          >
            <TabPane
              key="cuxSourcingResults"
              tab={intl.get(`spcm.contractMaintain.view.button.quoteCreateOrder`).d('引用寻源结果')}
            >
              <ReferenceDocument location={location} sourcingResultsDs={cuxSourcingResultsDs} />
            </TabPane>
          </TabGroup>,
        ])
      );
    },
  },
  events: {
    handleCuxUseEffect(props) {
      const { group, groupDefaultKey } = props || {};
      Object.assign(groupDefaultKey || {}, {
        cuxReferenceDocument: 'cuxSourcingResults',
      });
      Object.assign(group || {}, {
        cuxSourcingResults: 'cuxReferenceDocument',
      });
    },
  },
  render: {
    SPCM_WORKSPACE_LIST_RENDER_DEFAULT_BUTTONS: (props) => {
      const { children, renderProps } = props;
      const { props: { dispatch } = {}, extractConfig, activeKey } = renderProps;
      if (activeKey !== 'cuxSourcingResults') return children;
      const headerButtonProps = {
        sourcingResultsDs: cuxSourcingResultsDs,
        dispatch,
        extractConfig,
      };
      return <HeaderButtons {...headerButtonProps} />;
    },
  },
});
