// 新建或者整单视图
// 基本信息
import React, { useMemo, useContext } from 'react';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';

// import NavigationAnchor from '../../../components/NavigationAnchor';
import { DetailCollapse } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import BasicInfo from './BasicInfo';
import PartList from './PartList';
import DocumentList from './DocumentList';
import ProjectList from './ProjectList';
import PartInventory from './PartInventory';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'part',
  'stage',
  'document',
  'partDetail',
];

const Detail = () => {
  const { headerDs, customizeCollapse, createFlag } = useContext<StoreValueType>(Store);
  const { projectStatus } = headerDs.current?.get(['projectStatus']) || {};

  const paneList: any = useMemo(() => {
    const statusFlag = ['CANCELED', 'PUBLISHED', 'CLOSE_COMFIRM_FUNCTION', 'CLOSE_COMFIRM_WORKFLOW', 'CLOSED', 'CLOSE_REJECTED'].includes(projectStatus);
    return [
      {
        key: 'basic',
        header: intl.get(`sqam.ppap.view.title.basicInfo`).d('基本信息'),
        content: <BasicInfo />,
      },
      !statusFlag && !createFlag && {
        key: 'part',
        header: intl.get(`sqam.ppap.view.title.partList`).d('零件列表'),
        content: <PartList />,
      },
      !statusFlag && !createFlag && {
        key: 'stage',
        header: intl.get(`sqam.ppap.view.title.stagePlan`).d('项目计划'),
        content: <ProjectList />,
      },
      !statusFlag && !createFlag && {
        key: 'document',
        header: intl.get(`sqam.ppap.view.title.documentList`).d('交付物清单'),
        content: <DocumentList />,
      },
      statusFlag && !createFlag && {
        key: 'partDetail',
        header: intl.get(`sqam.ppap.view.title.partDetail`).d('零件清单'),
        content: <PartInventory />,
      },
    ].filter((v) => v);
  }, [projectStatus, createFlag]);

  // const linkList = useMemo(
  //   () =>
  //     paneList.map((item) => {
  //       const { key, header } = item;
  //       return { key, title: header, href: `ppap-sum-${key}` };
  //     }),
  //   [paneList]
  // );

  return (
    <div id="ppap-sum-detail-content">
      {
        customizeCollapse(
          {
            code: DetailCollapse,
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
                <Panel id={`ppap-sum-${key}`} forceRender key={key} showArrow={false} {...panelProps}>
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
        custConfig={custConfig[DetailCollapse]}
        id='ppap-sum-detail-content'
      /> */}
    </div>
  );
};


export default observer(Detail);
