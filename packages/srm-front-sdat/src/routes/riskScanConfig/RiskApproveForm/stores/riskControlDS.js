import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';

const BUCKET_DIRECTORY = 'sdat-risk-workbench';

/**
 * 风险凭证处置信息 DS
 * @returns
 */
const DisposalDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.disposalAction`).d('处置动作'),
      name: 'processAction',
      type: 'string',
      multiple: true,
      required: true,
      lookupCode: 'SDAT.PROCESS_ACTION',
    },
    {
      label: intl.get(`sdat.riskControl.model.disposalFeedback`).d('处置反馈'),
      name: 'processFeedback',
      type: 'string',
      required: true,
      lookupCode: 'SDAT.PROCESS_FEEDBACK',
    },
    {
      // label: intl.get(`sdat.riskControl.model.disposalReason`).d('处置理由'),
      name: 'processReason',
      type: 'string',
    },
    {
      name: 'riskEventId',
    },
    {
      name: 'broadcastWay',
    },
    {
      name: 'tenantId',
    },
    {
      // label: intl.get(`sdat.riskDefinition.model.dealWithAttach`).d('处置附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 附件信息 DS
 * @returns
 */
const AttachmentDS = () => ({
  transport: {},
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

export { DisposalDS, AttachmentDS };
