import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const getIndexDS = ({ pcHeaderId } = {}) => ({
  autoCreate: false,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'fileUrl',
      type: 'string',
      required: true,
    },
    {
      name: 'fileUrlMeaning',
      type: 'string',
      label: intl.get('spcm.common.view.common.currentText').d('当前合同文本'),
      dynamicProps: {
        disabled: () => true,
        required: () => true,
      },
      ignore: 'always',
    },
    {
      name: 'comparefileUrl',
      type: 'string',
      lookupCode: 'SPCM_SMART_COMPARE_LIST',
      noCache: true,
      textField: 'versionName',
      valueField: 'fileUrl',
      lovPara: {
        compareType: 'VERSION_LIST',
        pcHeaderId,
      },
      label: intl.get('spcm.common.view.common.compareText').d('对比文本'),
      dynamicProps: {
        required: () => true,
      },
    },
  ],
  transport: {
    submit: ({ data }) => {
      const { compareFileType, rightCompareFileType, fileUrl, comparefileUrl } = data[0] || {};
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/smart-contract-task/compare-contract`,
        method: 'POST',
        data: {
          leftDTO: {
            compareFileType,
            fileUrl,
          },
          rightDTO: {
            compareFileType: rightCompareFileType,
            fileUrl: comparefileUrl,
          },
          pcHeaderId,
        },
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'comparefileUrl') {
        if (value) {
          const data = record.getField('comparefileUrl').getLookupData(value, record) || {};
          record.set('rightCompareFileType', data?.compareFileType);
        } else {
          record.set('rightCompareFileType', null);
        }
      }
    },
  },
});

export { getIndexDS };
