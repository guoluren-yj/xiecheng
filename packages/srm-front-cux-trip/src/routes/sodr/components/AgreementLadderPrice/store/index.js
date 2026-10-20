import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const line = (pcSubjectId) => ({
  selection: 'single',
  autoQuery: true,
  fields: [
    {
      name: 'lineNum',
      width: 80,
      label: intl.get('sodr.workspace.model.agreementLadderPrice.lineNum').d('序号'),
    },
    {
      name: 'quantityStart',
      type: 'number',
      label: intl.get('sodr.workspace.model.agreementLadderPrice.quantityStart').d('数量从(>=)'),
    },
    {
      name: 'quantityEnd',
      type: 'number',
      label: intl.get('sodr.workspace.model.agreementLadderPrice.quantityEnd').d('数量至(<)'),
    },
    {
      name: 'price',
      type: 'number',
      label: intl.get('sodr.workspace.model.agreementLadderPrice.price').d('原币含税单价'),
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      label: intl
        .get('sodr.workspace.model.agreementLadderPrice.ladderNetPrice')
        .d('原币不含税单价'),
    },
    {
      name: 'description',
      label: intl.get('sodr.workspace.model.agreementLadderPrice.description').d('备注'),
    },
    {
      name: 'stepAccumulationFlag',
      label: intl
        .get('sodr.workspace.model.agreementLadderPrice.stepAccumulationFlag')
        .d('是否阶梯累计'),
    },
  ],
  transport: {
    read() {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/pc-subject/${pcSubjectId}/lines`,
        method: 'get',
      };
    },
  },
});

export { line };
