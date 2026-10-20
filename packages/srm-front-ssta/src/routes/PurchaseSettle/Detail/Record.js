/* eslint-disable global-require */
import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Icon, Timeline, Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { taxRecordDS as taxRecordDs } from '@/stores/PurchaseSettleDS';
import style from './index.less';

const { Item } = Timeline;
const prefix = 'ssta.purchaseSettle';
// const OPERATE_STATUS = {
//   PC_CREATE: {
//     icon: 'add',
//     // text: '发票池PC采集',
//   },
//   MOBILE_CREATE: {
//     icon: 'near_me-o',
//     // text: '发票池移动采集',
//   },
//   CHECK_SUCCESS: {
//     icon: 'check',
//     // text: '查验成功',
//   },
//   CHECK_FAILED: {
//     icon: 'near_me-o',
//     // text:'查验失败'
//   },
//   UPDATE_INFO: {
//     icon: 'near_me-o',
//     // text:'更新信息'
//   },
//   UPLOAD_ATTACHMENT: {
//     icon: 'near_me-o',
//     // text:'上传附件'
//   },
//   CANCEL: {
//     icon: 'near_me-o',
//     // text:'取消发票'
//   },

//   ASSOCIATE: {
//     icon: 'check',
//     // text:'关联单据'
//   },
//   DISASSOCIATE: {
//     icon: 'near_me-o',
//     // text:'取消关联'
//   },
//   SYNC: {
//     icon: 'near_me-o',
//     // text:'结算单同步	'
//   },
// };
const Record = (props) => {
  const { taxInvoiceHeaderId } = props;
  const [loading, setLoading] = React.useState();
  const [operateData, setoperateData] = React.useState();
  const taxRecordDS = useMemo(() => {
    return new DataSet(taxRecordDs());
  }, []);

  useEffect(() => {
    taxRecordDS.setQueryParameter('taxInvoiceHeaderId', taxInvoiceHeaderId);
    taxRecordDS.query().then((res) => {
      setLoading(true);
      if (res && !res.failed && res.content && res.content.length) {
        setoperateData(res.content);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('ssta.costSheet.model.noData').d('暂无数据')}</span>
      </div>
    );
  };
  // const columns = [
  //   {
  //     name: 'processUser',
  //     width: 150,
  //   },
  //   {
  //     name: 'processDate',
  //     width: 150,
  //   },
  //   // {
  //   //   name: 'processStatusMeaning',
  //   //   width: 150,
  //   // },
  //   {
  //     name: 'processRemark',
  //     width: 150,
  //   },
  // ];
  return (
    <Spin spinning={loading}>
      <div className={style.operating}>
        <Timeline className="operating-timeline">
          {operateData?.length > 0 &&
            operateData.map((t) => {
              if (t) {
                return (
                  <Item color="#E5E5E5">
                    <Icon type="mode_edit" className="small-icon" />
                    <div className="process-user">
                      <span className="operator">{t.processUser}</span>
                      <span className="revised">
                        {intl.get('ssta.costSheet.model.revised').d('修改了')}
                      </span>
                      <span className="result">
                        【{intl.get(`${prefix}.view.title.taxInvoice`).d('税务发票')}】
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

export default Record;
