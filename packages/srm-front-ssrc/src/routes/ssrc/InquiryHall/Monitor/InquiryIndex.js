import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Monitor } from './index';

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL.MONITOR.HISTORY_TABLE', // 历史表格
        'SSRC.INQUIRY_HALL.MONITOR.FORM_HEADER', // 基础信息
        'SSRC.INQUIRY_HALL.MONITOR.HEADER_BUTTONS', // 头部按钮
        'SSRC.INQUIRY_HALL.MONITOR.SUPPLIER_TABLE', // 供应商表格
      ],
    })(
      connect(({ inquiryHallNew, loading }) => ({
        inquiryHallNew,
        inquiryHall: inquiryHallNew,
        modelName: 'inquiryHallNew',
        fetchMonitorHeaderLoading: loading.effects['inquiryHallNew/fetchMonitorHeaderDetail'],
        fetchMonitorSupplierLineLoading: loading.effects['inquiryHallNew/fetchMonitorSupplierLine'],
        fetchRecordLoading: loading.effects['inquiryHallNew/fetchRecord'],
        startRFALoading: loading.effects['inquiryHallNew/startRFA'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.common', 'ssta.common', 'ssrc.scux'],
        })(
          remoteHoc(
            {
              code: 'SSRC_INQUIRY_HALL_MONITOR',
            },
            {
              events: {
                cuxHandleAfterSocketMessage() {},
              },
            }
          )(Com)
        )
      )
    )
  );
};

export default HOCComponent(Monitor);
