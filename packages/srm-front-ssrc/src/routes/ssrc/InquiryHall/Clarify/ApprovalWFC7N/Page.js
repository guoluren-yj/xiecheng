import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { TopSection } from '_components/Section';

import { AFBasicCard, BasicInfo, ClarifyText, RelatedQuestion } from './CardList';
import { StoreContext } from './store/StoreProvider';

import Style from './index.less';

const Page = () => {
  const { getHocInstance, getCustomizeUnitCode, pageLoading } = useContext(StoreContext);

  return (
    <div className={Style['ssrc-clarify-approval-wrapper']}>
      <Spin spinning={pageLoading}>
        <TopSection
          code={getCustomizeUnitCode('titleAfCard')}
          getHocInstance={getHocInstance}
          className={`${Style['approval-common-top-section-card']} ${Style['ssrc-clarify-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <AFBasicCard />
        </TopSection>
        <TopSection
          title={intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('basicInfoCard')}
          className={Style['approval-common-top-section-card']}
        >
          <BasicInfo />
        </TopSection>
        <TopSection
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('textCard')}
          className={Style['approval-common-top-section-card']}
          titleProps={{ style: { display: 'none' } }}
        >
          <ClarifyText />
        </TopSection>
        <TopSection
          getHocInstance={getHocInstance}
          code={getCustomizeUnitCode('relatedQuestionCard')}
          className={Style['approval-common-top-section-card']}
          titleProps={{ style: { display: 'none' } }}
        >
          <RelatedQuestion />
        </TopSection>
      </Spin>
    </div>
  );
};

export default observer(Page);
