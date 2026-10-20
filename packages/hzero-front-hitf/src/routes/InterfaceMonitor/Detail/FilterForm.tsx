import React, { useMemo, useState } from 'react';
import intl from 'hzero-front/lib/utils/intl';
import { Form } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';


import SelectFilter from '@/components/Filter/SelectFilter';
import TextFieldFilter from '@/components/Filter/TextFieldFilter';
import DatePickerFilter from '@/components/Filter/DatePickerFilter';
import Tool from '@/components/Filter/tool';

// @ts-ignore
import styles from './index.less';

const FilterForm: React.FC<any> = ({
  formDs,
  onSearch,
  executeResultOptions,
  interfaceTypeOptions,
  dynamicSearch,
}) => {
  const [showFilterFlag, setShowFilterFlag] = useState(true);
  const handleShowFilterFlag = () => {
    setShowFilterFlag(!showFilterFlag);
  };

  const executeResultOptionsValue = executeResultOptions.map((item) => {
    return { title: item.meaning, value: item.value, key: item.value };
  });

  const interfaceTypeOptionsValue = interfaceTypeOptions.map((item) => {
    return { title: item.meaning, value: item.value, key: item.value };
  });

  const toolData = {
    formDs,
    onSearch,
    showFilterFlag,
    onShowFilterFlag: handleShowFilterFlag,
  };

  const interfaceNameData = {
    title: intl.get('hitf.interfaceMonitor.model.interfaceName').d('接口名称'),
    filterName: 'interfaceName',
    onSearch,
    dataSet: formDs,
  };

  const executeResultData = {
    title: intl.get('hitf.interfaceMonitor.model.dataExecuteResult').d('数据执行结果'),
    filterName: 'dataExecuteResult',
    selectList: executeResultOptionsValue,
    onSearch,
    dataSet: formDs,
  };

  const interfaceTypeData = {
    title: intl.get('hitf.interfaceMonitor.model.interfaceType').d('接口类型'),
    filterName: 'interfaceType',
    selectList: interfaceTypeOptionsValue,
    onSearch,
    dataSet: formDs,
  };

  const insideBatchNumData = {
    title: intl.get('hitf.interfaceMonitor.model.batchCode').d('请求编码'),
    filterName: 'insideBatchNum',
    onSearch,
    dataSet: formDs,
  };

  const dateData = {
    title: intl.get('hitf.interfaceMonitor.model.requestTime').d('请求时间'),
    startTitle: intl.get('hitf.interfaceMonitor.model.requestTimeStart').d('请求时间开始'),
    endTitle: intl.get('hitf.interfaceMonitor.model.requestTimeEnd').d('请求时间结束'),
    filterName: 'requestTime',
    datePickerAfter: 'requestTimeFrom',
    datePickerBefore: 'requestTimeTo',
    onSearch,
    dataSet: formDs,
  };

  const renderDynamicSearch = useMemo(() => {
    return dynamicSearch.map(item => {
      const dynamicData = {
        title: item.title,
        filterName: item.name,
        onSearch,
        dataSet: formDs,
      };
      return <TextFieldFilter {...dynamicData} />;
    });
  }, [dynamicSearch]);

  return (
    <div className={styles['filter-form']}>
      <Form
        style={{ flex: 'auto' }}
        dataSet={formDs}
        labelLayout={LabelLayout.none}
        onKeyDown={(e) => {
          // 回车检索
          if (e.keyCode === 13) return onSearch();
        }}
      >
        <div className={styles['other-filter']}>
          <Tool {...toolData} />
          {
            showFilterFlag && (
            <>
              {renderDynamicSearch}
              <TextFieldFilter {...interfaceNameData} />
              <SelectFilter {...executeResultData} />
              <SelectFilter {...interfaceTypeData} />
              <TextFieldFilter {...insideBatchNumData} />
              <DatePickerFilter {...dateData} />
            </>
)}
        </div>
      </Form>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor', 'hitf.common'],
})(FilterForm));
