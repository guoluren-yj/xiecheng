/* eslint-disable global-require */
import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import styles from '../Detail/index.less';
import { taxLineRecordDS } from '@/stores/NewPurchaseSettleDS';
import { OperationIconType } from '@/components/HistoryRecord/enum';

const { Item } = Timeline;

// 税务发票处理状态 SSTA.TAX_INVOICE_PROCESS_STATUS
const iconMap = {
  MANUAL: OperationIconType.Add, // 手工新建了
  OCR: OperationIconType.Add, // OCR 识别了
  OFD: OperationIconType.Add, // OFD 识别了
  EXCEL: OperationIconType.Add, // EXCEL 导入了
  INTRODUCE: OperationIconType.Add, // 从发票池选择了
  UPDATE: OperationIconType.Update, // 更新了
  CHECK_SUCCESS: OperationIconType.Verify, // 查验成功了
  CHECK_FAILED: OperationIconType.Verify, // 查验失败了
  CREATE_LINE: OperationIconType.Add, // 新增了
  DELETE_LINE: OperationIconType.Delete, // 删除了
};

const TaxLineRecordModal = (props) => {
  const { taxInvoiceHeaderId } = props;
  const [loading, setLoading] = React.useState();
  const [operateData, setoperateData] = React.useState();
  const taxLineRecordDs = useMemo(() => new DataSet(taxLineRecordDS(taxInvoiceHeaderId)), [
    taxInvoiceHeaderId,
  ]);

  useEffect(() => {
    taxLineRecordDs.query().then((res) => {
      setLoading(true);
      if (res && !res.failed && res.content && res.content.length) {
        setoperateData(res.content);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, [taxLineRecordDs]);

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('ssta.costSheet.model.noData').d('暂无数据')}</span>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.operating}>
        <Timeline className="operating-timeline">
          {operateData?.length > 0 &&
            operateData.map((t) => {
              if (t) {
                return (
                  <Item color="#E5E5E5">
                    <Icon type={iconMap[t.processStatus] || 'mode_edit'} className="small-icon" />
                    <div className="process-user">
                      <span className="operator">{t.processUser}</span>
                      <span className="revised">
                        {t.processStatusMeaning ||
                          intl.get('ssta.costSheet.model.revised').d('修改了')}
                      </span>
                      <span className="result">
                        【
                        {['CREATE_LINE', 'DELETE_LINE', 'UPDATE_LINE'].includes(t.processStatus)
                          ? intl
                              .get(`ssta.purchaseSettle.view.title.taxInvoiceLine`)
                              .d('税务发票行')
                          : intl.get(`ssta.purchaseSettle.view.title.taxInvoice`).d('税务发票')}
                        】
                      </span>
                    </div>
                    {t.processRemark && (
                      <div className="reamks">
                        <div className="operator gray">{t.processUser}</div>
                        <div className="status gray">
                          {intl.get('ssta.costSheet.model.reamked').d('备注了')}
                        </div>
                        <div>
                          <div className="result comment gray">{t.processRemark}</div>
                        </div>
                      </div>
                    )}
                    <div className="date-time gray">{dateTimeRender(t.processDate)}</div>
                    <div className="line" />
                  </Item>
                );
              } else {
                return null;
              }
            })}
          {!operateData?.length && handleNoData()}
        </Timeline>
      </div>
    </Spin>
  );
};

export default TaxLineRecordModal;
