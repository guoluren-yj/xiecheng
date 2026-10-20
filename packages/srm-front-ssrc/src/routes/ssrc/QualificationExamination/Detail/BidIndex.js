import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import remoteHoc from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { DetailComponnet } from './index';

const hocComponent = (Com) => {
  const component = compose(
    withCustomize({
      unitCode: [
        'SSRC_PREQUAL.HEADER', // 预审申请
        'SSRC_PREQUAL.QUALIFICATION_REVIEW', // 资格预审表格
        'SSRC_PREQUAL.QUALIFICATION_REVIEWSUM', // 资格预审结果表格
      ],
    }),
    Form.create({ fieldNameProp: null }),
    connect(({ qualificationExaminationBid, loading }) => ({
      qualificationExaminationBid,
      modelName: 'qualificationExaminationBid',
      qualificationExamination: qualificationExaminationBid,
      loading: loading.effects['qualificationExaminationBid/fetchQualificationLineList'],
      saveLoading: loading.effects['qualificationExaminationBid/saveQualificationExamination'],
      submitLoading: loading.effects['qualificationExaminationBid/submitQualificationExamination'],
      fetchHeaderLoading: loading.effects['qualificationExaminationBid/fetchQualificationHeader'],
      fetchPretrialPanelLoading: loading.effects['qualificationExaminationBid/fetchPretrialPanel'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({ code: ['ssrc.qualiExam', 'ssrc.common', 'scux.ssrc'] })
  )(remoteHoc({
    code: 'SSRC_PREQUAL_DETAIL',
      name: 'remote',
  })(Com));

  return component;
};

export default hocComponent(DetailComponnet);
export { hocComponent, DetailComponnet };
