import React, { useContext } from 'react';
import { Table, Button, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import EmbedPage from '_components/EmbedPage';
import querystring from 'querystring';

import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

// 关联单据卡片
const RelatedBillTableCmp = observer(() => {
  const Modal = useModal();

  const { commonDs: { relatedBillDs } = {}, sourceProjectId } = useContext(StoreContext);

  // 打开明细页面
  const handleOpenDetailPage = (record) => {
    const { targetFrom, sourceHeaderId, secondarySourceCategory } =
      record?.get(['targetFrom', 'sourceHeaderId', 'secondarySourceCategory']) || {};
    const bidFlag = secondarySourceCategory === 'NEW_BID';
    const search = querystring.stringify({
      // projectLineSectionId: activeProjectLineSectionId,
      sourceProjectId,
    });

    let params = {};
    let routePath = '';
    switch (targetFrom) {
      case 'RFI':
      case 'RFP':
        routePath = `/ssrc/new-project-setup/rf-detail/${targetFrom}/${sourceHeaderId}`;
        params = {
          rfHeaderId: sourceHeaderId,
        };
        break;
      case 'RFX':
        if (bidFlag) {
          routePath = `/ssrc/new-project-setup/bid-detail/${sourceHeaderId}`;
          params = {
            rfxId: sourceHeaderId,
          };
        } else {
          routePath = `/ssrc/new-project-setup/rfx-detail/${sourceHeaderId}`;
          params = {
            rfxId: sourceHeaderId,
          };
        }
        break;
      default:
        break;
    }

    const _location = {
      hash: '',
      pathname: routePath,
      search: `?${search}`,
    };
    const flexLinkProps = {
      path: routePath,
      location: _location,
      match: {
        params,
        path: routePath,
      },
      history: {
        ...window.dvaApp._history,
        location: _location,
      },
    };

    return Modal.open({
      header: null,
      footer: null,
      drawer: true,
      children: <EmbedPage href={routePath} record={record} {...flexLinkProps} />,
      className: Style['ssrc-source-project-approval-detail-link-modal'],
      style: { width: 1050 },
    });
  };

  const columns = [
    {
      name: 'sourceNum',
      renderer: ({ value, record }) => {
        return (
          <Button funcType="link" onClick={() => handleOpenDetailPage(record)}>
            {value}
          </Button>
        );
      },
    },
    {
      name: 'sourceName',
    },
    {
      name: 'closingSourceStatusMeaning',
    },
    {
      name: 'closedComments',
    },
    {
      name: 'closeAttachmentUuid',
    },
    {
      name: 'closedByName',
    },
    {
      name: 'closedDate',
    },
  ];

  return <Table dataSet={relatedBillDs} columns={columns} />;
});

export default RelatedBillTableCmp;
