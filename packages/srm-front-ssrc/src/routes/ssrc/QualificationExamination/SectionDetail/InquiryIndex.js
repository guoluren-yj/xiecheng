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
    connect(({ qualificationExaminationInquiry, loading }) => ({
      qualificationExaminationInquiry,
      modelName: 'qualificationExaminationInquiry',
      qualificationExamination: qualificationExaminationInquiry,
      loading: loading.effects['qualificationExaminationInquiry/fetchQualificationLineList'],
      fetchHeaderLoading:
        loading.effects['qualificationExaminationInquiry/fetchQualificationSectionHeader'],
      fetchPretrialPanelLoading:
        loading.effects['qualificationExaminationInquiry/fetchPretrialSectionPanel'],
      saveQualificationLoading:
        loading.effects['qualificationExaminationInquiry/saveQualificationSectionExamination'],
      submitQualificationLoading:
        loading.effects['qualificationExaminationInquiry/submitQualificationSectionExamination'],
      organizationId: getCurrentOrganizationId(),
      fetchQualificationSectionLineListLoading:
        loading.effects['qualificationExaminationInquiry/fetchQualificationSectionLineList'],
      fetchQualificationLoading:
        loading.effects['qualificationExaminationInquiry/fetchQualificationSectionLineList'],
      rankListLoading:
        loading.effects['qualificationExaminationInquiry/fetchQualificationSectionRankList'],
      saveRankLoading:
        loading.effects['qualificationExaminationInquiry/saveQualificationSectionRankList'],
      fetchQualificationSumLoading:
        loading.effects['qualificationExaminationInquiry/fetchQualificationSectionSum'],
      saveLodaing:
        loading.effects['qualificationExaminationInquiry/saveSubmitQualificationSectionSum'],
    })),
    formatterCollections({
      code: ['ssrc.qualiExam', 'ssrc.common'],
    }),
    remoteHoc({
      code: 'SSRC_PREQUAL_DETAIL_SECTION',
      name: 'remote',
    }),
    Form.create({ fieldNameProp: null })
  )(com);

export default hocComponent(Detail);
