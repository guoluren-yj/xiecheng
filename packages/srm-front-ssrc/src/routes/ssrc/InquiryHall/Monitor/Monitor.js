import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';

import { Monitor } from './index';

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL.MONITOR.HISTORY_TABLE', // 历史表格
        'SSRC.INQUIRY_HALL.MONITOR.FORM_HEADER', // 基础信息
        'SSRC.INQUIRY_HALL.MONITOR.HEADER_BUTTONS', // 头部按钮
      ],
    })(
      connect(({ inquiryHallMonitor, loading }) => ({
        inquiryHallMonitor,
        inquiryHall: inquiryHallMonitor,
        modelName: 'inquiryHallMonitor',
        fetchMonitorHeaderLoading: loading.effects['inquiryHallMonitor/fetchMonitorHeaderDetail'],
        fetchMonitorSupplierLineLoading:
          loading.effects['inquiryHallMonitor/fetchMonitorSupplierLine'],
        fetchRecordLoading: loading.effects['inquiryHallMonitor/fetchRecord'],
        startRFALoading: loading.effects['inquiryHallMonitor/startRFA'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: ['ssrc.inquiryHall', 'ssrc.common', 'ssta.common', 'ssrc.scux'],
        })(Com)
      )
    )
  );
};

export default HOCComponent(Monitor);
