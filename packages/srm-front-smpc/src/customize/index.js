import { setCard } from 'hzero-front/lib/customize/cards';
import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import customizeConfigs from './customizeConfigs';

const configRegisterEvents = {
  CARD: setCard,
  WORKFLOW: setWorkflowApproveForm,
};

customizeConfigs.forEach((f) => {
  const { type, ...registerArgs } = f;
  const registerEvent = configRegisterEvents[type];
  if (registerEvent) registerEvent(registerArgs);
});
