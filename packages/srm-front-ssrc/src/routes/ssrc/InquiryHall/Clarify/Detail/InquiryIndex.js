import { compose } from 'lodash';
import { connect } from 'dva';
import { Form } from 'hzero-ui';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { INQUIRY } from '@/utils/globalVariable';

import { getClarifyDetailCode } from '../utils/util';
import { Detail } from './index';

const Hooc = (Com, pageSymbol = INQUIRY) => {
  return compose(
    withCustomize({
      unitCode: Object.values(getClarifyDetailCode(pageSymbol)),
    }),
    formatterCollections({
      code: ['ssrc.clarify', 'ssrc.common', 'ssrc.inquiryHall'],
    }),
    connect(({ inquiryHallNew, loading }) => ({
      inquiryHallNew,
      inquiryHall: inquiryHallNew,
      detailsLoading: loading.effects['inquiryHallNew/fetchClarifyDetail'],
      tableLoading: loading.effects['inquiryHallNew/fetchClarifyReferIssue'],
      organizationId: getCurrentOrganizationId(),
      modelName: 'inquiryHallNew',
      sourceKey: pageSymbol,
    })),
    Form.create({ fieldNameProp: null })
  )(Com);
};

export default Hooc(Detail);
export { Hooc, Detail };
