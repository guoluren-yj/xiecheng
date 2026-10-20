// 新建或者整单视图
// 基本信息
import React, { useMemo, useContext } from 'react';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

import BasicInfo from './BasicInfo';
import PartList from './PartList';
import DocumentList from './DocumentList';
import ProjectList from './ProjectList';
// import NavigationAnchor from '../../../components/NavigationAnchor';
import { DetailProjectCollapse } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'part',
  'stage',
  'document',
];

const Detail = () => {
  const { customizeCollapse } = useContext<StoreValueType>(Store);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sqam.ppap.view.title.basicInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      {
        key: 'part',
        header: intl.get(`sqam.ppap.view.title.partList`).d('零件列表'),
        content: <PartList />,
      },
      {
        key: 'stage',
        header: intl.get(`sqam.ppap.view.title.stagePlan`).d('项目计划'),
        content: <ProjectList />,
      },
      {
        key: 'document',
        header: intl.get(`sqam.ppap.view.title.documentList`).d('交付物清单'),
        content: <DocumentList />,
      },
    ];
  }, []);

  // const linkList = useMemo(
  //   () =>
  //     paneList.map((item) => {
  //       const { key, header } = item;
  //       return { key, title: header, href: `ppap-project-${key}` };
  //     }),
  //   [paneList]
  // );


  return (
    <div id="ppap-project-detail-content">
      {
        customizeCollapse(
          {
            code: DetailProjectCollapse,
          },
          <Collapse
            ghost
            trigger="icon"
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {paneList.map((item) => {
              const { content, key, ...panelProps } = item;
              return (
                <Panel showArrow={false} forceRender key={key} id={`ppap-project-${key}`} {...panelProps}>
                  {content}
                </Panel>
              );
            })}
          </Collapse>
        )
      }
      {/* <NavigationAnchor
        linkList={linkList}
        currentOffsetTop={40}
        custConfig={custConfig[DetailProjectCollapse]}
        id='ppap-project-detail-content'
      /> */}
    </div>
  );
};


export default observer(Detail);
