/**
 * DocInfo
 * 单据流单据信息
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import OverView from './OverView';
import Progress from './Progress';
import CnfAction from './CnfAction';

// FlowChart interface
interface FlowInfoProps {
  nodeDataId: string;
  currentOrganizationId: number;
  nodeDefinitionCode: string;
  currentUserId: number;
  ecpoId: number | undefined;
  authorityMap: {
    OVERVIEW: boolean;
    PROGRESS: boolean;
    CONFIG_INFORMATION: boolean;
  };
}

function FlowInfo(props: FlowInfoProps) {
  const { nodeDataId, currentOrganizationId, authorityMap, nodeDefinitionCode, currentUserId, ecpoId } = props;

  const otherProps = {
    nodeDataId,
    currentOrganizationId,
  };

  return (
    <div className="doc-flow-info-modal">
      {authorityMap.OVERVIEW && <OverView nodeDefinitionCode={nodeDefinitionCode} currentUserId={currentUserId} ecpoId={ecpoId} {...otherProps} />}
      {authorityMap.PROGRESS && <Progress {...otherProps} />}
      {authorityMap.CONFIG_INFORMATION && <CnfAction {...otherProps} />}
    </div>
  );
}

export default FlowInfo;
