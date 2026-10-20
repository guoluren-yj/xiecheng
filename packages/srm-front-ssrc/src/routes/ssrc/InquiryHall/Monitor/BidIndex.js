import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { Monitor } from './index';

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL.MONITOR.HISTORY_TABLE', // 历史表格
        'SSRC.BID_HALL.MONITOR.FORM_HEADER', // 基础信息
        'SSRC.BID_HALL.MONITOR.HEADER_BUTTONS', // 头部按钮
        'SSRC.BID_HALL.MONITOR.SUPPLIER_TABLE', // supplier table
      ],
    })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        fetchMonitorHeaderLoading: loading.effects['inquiryHall/fetchMonitorHeaderDetail'],
        fetchMonitorSupplierLineLoading: loading.effects['inquiryHall/fetchMonitorSupplierLine'],
        fetchRecordLoading: loading.effects['inquiryHall/fetchRecord'],
        startRFALoading: loading.effects['inquiryHall/startRFA'],
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

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(Monitor));
