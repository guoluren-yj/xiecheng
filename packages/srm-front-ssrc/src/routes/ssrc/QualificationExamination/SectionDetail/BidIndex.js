import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Detail } from './index';

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC_PREQUAL.HEADER', // 预审申请
      ],
    }),
    connect(({ qualificationExaminationBid, loading }) => ({
      qualificationExaminationBid,
      qualificationExamination: qualificationExaminationBid,
      modelName: 'qualificationExaminationBid',
      loading: loading.effects['qualificationExaminationBid/fetchQualificationLineList'],
      fetchHeaderLoading:
        loading.effects['qualificationExaminationBid/fetchQualificationSectionHeader'],
      fetchPretrialPanelLoading:
        loading.effects['qualificationExaminationBid/fetchPretrialSectionPanel'],
      saveQualificationLoading:
        loading.effects['qualificationExaminationBid/saveQualificationSectionExamination'],
      submitQualificationLoading:
        loading.effects['qualificationExaminationBid/submitQualificationSectionExamination'],
      organizationId: getCurrentOrganizationId(),
      fetchQualificationSectionLineListLoading:
        loading.effects['qualificationExaminationBid/fetchQualificationSectionLineList'],
      fetchQualificationLoading:
        loading.effects['qualificationExaminationBid/fetchQualificationSectionLineList'],
      rankListLoading:
        loading.effects['qualificationExaminationBid/fetchQualificationSectionRankList'],
      saveRankLoading:
        loading.effects['qualificationExaminationBid/saveQualificationSectionRankList'],
      fetchQualificationSumLoading:
        loading.effects['qualificationExaminationBid/fetchQualificationSectionSum'],
      saveLodaing: loading.effects['qualificationExaminationBid/saveSubmitQualificationSectionSum'],
    })),
    remoteHoc({
      code: 'SSRC_PREQUAL_DETAIL_SECTION',
      name: 'remote',
    }),
    formatterCollections({
      code: ['ssrc.qualiExam', 'ssrc.common'],
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
