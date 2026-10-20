
import intl from 'hzero-front/lib/utils/intl';
import uuid from 'uuid/v4';
import { getCurrentLanguage } from 'utils/utils';

const BLOCK_COLOR = [
  'rgba(242, 85, 53, 1)',
  'rgba(58, 180, 69, 1)',
  'rgba(25, 132, 247, 1)',
  'rgba(62, 78, 179, 1)',
  'rgba(47, 116, 182, 1)',
];
export function processApproveFieldList(node, results = [], resultNew = []) {
  const lang = getCurrentLanguage();
  const { id: nodeUuid, name: nodeName, code: nodeCode, config } = node;

  const approveStateFields = [];
  node.fields = approveStateFields;
  resultNew.push(node);
  [
    { code: 'procInstId', name: intl.get('hrpt.reportDesign.treeField.procInstId').d('流程标识') },
    { code: 'processName', name: intl.get('hrpt.reportDesign.treeField.processName').d('流程名称') },
    { code: 'startUserUnitName', name: intl.get('hrpt.reportDesign.treeField.startUserUnitName').d('发起人部门') },
    { code: 'startUserName', name: intl.get('hrpt.reportDesign.treeField.startUserName').d('发起人名称') },
    { code: 'processDesc', name: intl.get('hrpt.reportDesign.treeField.processDesc').d('流程描述') },
    { code: 'startTime', name: intl.get('hrpt.reportDesign.treeField.startTime').d('申请时间') },
    { code: 'processRejectedFlag', name: intl.get('hrpt.reportDesign.treeField.processRejectedFlag').d('是否存在拒绝记录') },
    { code: 'approvalStageName', name: intl.get('hrpt.reportDesign.treeField.approvalStageName').d('审批阶段名称') },
  ].map((i, _index) => {
    const fieldItem = {
      id: uuid().replaceAll('-', ''),
      name: i.name,
      parentName: nodeName,
      code: `${nodeCode}_${i.code}`,
      parentId: nodeUuid,
      parentCode: nodeCode,
      type: 'field',
      color: BLOCK_COLOR[_index % 5],
    };
    results.push(fieldItem);
    approveStateFields.push(fieldItem);
  });
  const detailNode = {
    id: uuid().replaceAll('-', ''),
    name: intl.get('hrpt.reportDesign.treeField.XXXdetailXXX').d('审批记录详情'),
    code: `${nodeCode}XXXdetailXXX`,
    type: 'approveStateDetail',
    color: BLOCK_COLOR[(approveStateFields.length + 1) % 5],
    parentId: nodeUuid,
    parentCode: nodeCode,
    fields: [],
  };
  results.push(detailNode);
  resultNew.push(detailNode);
  [
    { code: 'name', name: intl.get('hrpt.reportDesign.treeField.name').d('审批节点') },
    { code: 'assignee', name: intl.get('hrpt.reportDesign.treeField.assignee').d('审批人员工编码') },
    { code: 'assigneeName', name: intl.get('hrpt.reportDesign.treeField.assigneeName').d('审批人姓名') },
    { code: 'action', name: intl.get('hrpt.reportDesign.treeField.action').d('审批动作') },
    { code: 'comment', name: intl.get('hrpt.reportDesign.treeField.comment').d('审批意见') },
    { code: 'endTime', name: intl.get('hrpt.reportDesign.treeField.endTime').d('审批时间') },
    { code: 'approveDuration', name: intl.get('hrpt.reportDesign.treeField.approveDuration').d('审批用时') },
  ].map((i, _index) => {
    const fieldItem = {
      id: uuid().replaceAll('-', ''),
      name: `${i.name}`,
      parentName: detailNode.name,
      code: `${detailNode.code}_${i.code}`,
      parentId: detailNode.id,
      parentCode: detailNode.code,
      type: 'field',
      color: BLOCK_COLOR[_index % 5],
    };

    results.push(fieldItem);
    detailNode.fields.push(fieldItem);
  });
  if (config) {
    const { stageExFields, detailExFields } = JSON.parse(config);
    if (stageExFields && stageExFields.length) {
      stageExFields.forEach((item, _index) => {
        const fieldItem = {
          id: uuid().replaceAll('-', ''),
          name: (item._tls && item._tls.fieldName && item._tls.fieldName[lang]) || item.fieldName,
          parentName: nodeName,
          code: `${nodeCode}_${item.fieldCode}`,
          parentId: nodeUuid,
          parentCode: nodeCode,
          type: 'field',
          color: BLOCK_COLOR[_index % 5],
        };
        results.push(fieldItem);
        approveStateFields.push(fieldItem);
      });
    }
    if (detailExFields && detailExFields.length) {
      detailExFields.forEach((item, _index) => {
        const fieldItem = {
          id: uuid().replaceAll('-', ''),
          name: (item._tls && item._tls.fieldName && item._tls.fieldName[lang]) || item.fieldName,
          parentName: detailNode.name,
          code: `${detailNode.code}_${item.fieldCode}`,
          parentId: detailNode.id,
          parentCode: detailNode.code,
          type: 'field',
          color: BLOCK_COLOR[_index % 5],
        };
        results.push(fieldItem);
        detailNode.fields.push(fieldItem);
      });
    }
  }
  return;
}