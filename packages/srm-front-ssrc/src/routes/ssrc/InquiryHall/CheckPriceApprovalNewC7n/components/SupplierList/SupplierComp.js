import React, { useCallback, useContext, useEffect } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { Content } from 'components/Page';
import { Divider } from 'choerodon-ui';
import { INQUIRY } from '@/utils/globalVariable';
import ContentTitle from './../ContentTitle';
import ItemTable from './../../Tables/ItemTable';
import AttachmentForm from './../../Tables/AttachmentForm';
import { StoreContext } from './../../store/StoreProvider';
import { contentBasicDs, tableAttachmentDS, supplierTableDS } from './../../store/storeDS';
import styles from './index.less';

const SupplierComp = (props = {}) => {
  const {
    customizeForm = () => {},
    customizeTable = () => {},
    customizeCommon = () => {},
    sourceKey = INQUIRY,
    doubleUnitFlag = false,
    bidFlag = false,
    rfxHeaderId,
    templateInfo = {},
  } = useContext(StoreContext);

  const { headerInfo = {}, length = 0, indexNum = 0 } = props || {};

  const basicDs = useDataSet(() => contentBasicDs(bidFlag), []);
  const itemBasicDs = useDataSet(() => contentBasicDs(bidFlag), []);
  const tableAttachmentDs = useDataSet(() => tableAttachmentDS(), []);
  const supplierTableDs = useDataSet(() => supplierTableDS(sourceKey), []);

  useEffect(() => {
    const { rfxLineSupplierId = '' } = headerInfo;
    supplierTableDs.setState('doubleUnitFlag', doubleUnitFlag);
    supplierTableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
    supplierTableDs.setQueryParameter('rfxLineSupplierId', rfxLineSupplierId);
    supplierTableDs.setQueryParameter('templateInfo', templateInfo);
    supplierTableDs.query();
    basicDs.loadData([headerInfo]);
    itemBasicDs.loadData([headerInfo]);
    tableAttachmentDs.loadData([headerInfo]);
  }, [headerInfo, templateInfo, doubleUnitFlag]);

  const renderContentTitle = useCallback(() => {
    const titleParams = {
      customizeCommon,
      basicDs,
      headerInfo,
      sourceKey,
      itemBasicDs,
    };
    return <ContentTitle {...titleParams} />;
  }, [headerInfo]);

  const renderContent = useCallback(() => {
    const tabelProps = {
      customizeTable,
      headerInfo,
      sourceKey,
      doubleUnitFlag,
      supplierTableDs,
    };
    return <ItemTable {...tabelProps} />;
  }, [doubleUnitFlag, headerInfo]);

  const renderAttachmentForm = useCallback(() => {
    const formProps = {
      customizeForm,
      sourceKey,
      tableAttachmentDs,
    };

    return <AttachmentForm {...formProps} />;
  }, [doubleUnitFlag, headerInfo]);

  return (
    <div className={styles['content-table-content']}>
      <Content className={styles['content-table-body-content']}>
        <div className={styles['content-table-title']}>{headerInfo?.supplierCompanyName}</div>
        {renderContentTitle()}
        <div className={styles['content-table-title-second']}>
          <div className={styles['content-table-title-line']} />
          {intl.get('ssrc.inquiryHall.view.title.itemDetail').d('物料详情')}
        </div>
        {renderContent()}
        {renderAttachmentForm()}
      </Content>
      {length !== indexNum + 1 && <Divider />}
    </div>
  );
};

export default observer(SupplierComp);
