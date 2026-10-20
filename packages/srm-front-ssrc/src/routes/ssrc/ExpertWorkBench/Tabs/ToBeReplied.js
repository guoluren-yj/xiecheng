import React, { useMemo, useCallback } from 'react';
import { noop } from 'lodash';
import { observer } from 'mobx-react';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';

import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

export default observer(function ToBeReplied(props) {
  const { dataSet, handleReply = noop, customizeTable = noop } = props || {};

  const handleChange = useCallback(
    (_, value) => {
      const searchValue = value
        ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
        : undefined;
      dataSet.setQueryParameter('multiNumOrTitle', searchValue);
    },
    [dataSet]
  );

  const clearQueryParameter = useCallback(() => {
    dataSet.setQueryParameter('multiNumOrTitle', '');
  }, [dataSet]);

  const leftInput = useCallback(
    (ds) => {
      return (
        <MutlTextFieldSearch
          searchBarDS={ds}
          name="multiNumOrTitle"
          placeholder={intl
            .get('ssrc.expertWorkBench.model.expert.inputMultiNumOrTitle')
            .d('请输入单号、标题查询')}
          onChange={handleChange}
        />
      );
    },
    [handleChange]
  );

  const columns = useMemo(() => {
    return [
      {
        name: 'operate',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        renderer: ({ record }) => {
          return (
            <a onClick={() => handleReply({ currentRecord: record })}>
              {intl.get('ssrc.expertWorkBench.view.button.reply').d('回复')}
            </a>
          );
        },
      },
      {
        name: 'sourceFromNum',
        width: 150,
      },
      {
        name: 'sourceFromTitle',
        width: 150,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'secondarySourceCategoryMeaning',
        width: 100,
      },
      {
        name: 'sourceMethodMeaning',
        width: 100,
      },
      {
        name: 'purName',
        width: 130,
      },
      {
        name: 'purPhone',
        width: 130,
      },
      {
        name: 'purEmail',
        width: 150,
      },
      {
        name: 'replyStartTime',
        width: 150,
      },
      {
        name: 'replyEndTime',
        width: 150,
      },
    ];
  }, [dataSet]);

  return customizeTable(
    {
      code: 'SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED',
    },
    <SearchBarTable
      virtual
      virtualCell
      searchCode="SSRC.EXPERT_REPLY.LIST.TO_BE_REPLIED_FILTER"
      dataSet={dataSet}
      columns={columns}
      style={{
        maxHeight: 'calc(100vh - 240px)',
      }}
      searchBarConfig={{
        left: {
          render: (_, ds) => leftInput(ds),
        },
        onReset: clearQueryParameter,
        onClear: clearQueryParameter,
      }}
    />
  );
});
