import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { revertMultText } from './QueryField';

const organizationId = getCurrentOrganizationId();

export const searchBarConfig = {
  fieldProps: {
    publisherId: { lovPara: { organizationId } },
    catalogId: { lovPara: { tenantId: organizationId } },
    categoryId: { lovPara: { tenantId: organizationId } },
    itemId: { lovPara: { tenantId: organizationId } },
    priceEc: {
      precision: 10,
    },
    ecValidDateTo: {
      min: moment(moment().format(DEFAULT_DATE_FORMAT)),
    },
  },
  editorProps: {
    thirdSkuCode: {
      onPaste: undefined, // 为了change事件在复制时触发
      onChange({ name, value, record }) {
        if (value) {
          const newValue = revertMultText(value);
          record.set(name, newValue);
        }
      },
    },
  },
};
