/**
 * 数据类型转化
 Byte - 无法修改
 Short - Byte Short
 Integer - Byte Short Integer
 Long -Byte Short Integer Long
 Float -  无法修改
 Double -  无法修改
 Date - 无法修改
 Time - 无法修改
 Timestamp - Date Timestamp
 BigDecimal - 无法修改
 String - Byte Short Integer Long Float  Double Date Time Timestamp BigDecimal String

 */
export function MySQLDataType(dataType: string) {
  switch (dataType) {
    case 'Byte':
      return [];
    case 'Short':
      return ['Byte', 'Short'];
    case 'Integer':
      return ['Byte', 'Short', 'Integer'];
    case 'Long':
      return ['Byte', 'Short', 'Integer', 'Long'];
    case 'Float':
      return [];
    case 'Double':
      return [];
    case 'LocalDate':
      return [];
    case 'Time':
      return [];
    case 'ZonedDateTime':
      return ['LocalDate', 'ZonedDateTime'];
    case 'BigDecimal':
      return [];
    case 'String':
      return [
        'Byte',
        'Short',
        'Integer',
        'Long',
        'Float',
        'Double',
        'LocalDate',
        'ZonedDateTime',
        'BigDecimal',
        'String',
        'Boolean',
      ];
    default:
      return [];
  }
}

export function OracleDataType(dataType: string) {
  switch (dataType) {
    case 'Byte':
      return [];
    case 'Short':
      return ['Byte', 'Short'];
    case 'Integer':
      return ['Byte', 'Short', 'Integer'];
    case 'Long':
      return ['Byte', 'Short', 'Integer', 'Long'];
    case 'Float':
      return [];
    case 'Double':
      return [];
    case 'LocalDate':
      return [];
    case 'ZonedDateTime':
      return ['LocalDate', 'ZonedDateTime'];
    case 'BigDecimal':
      return [];
    case 'String':
      return [
        'Byte',
        'Short',
        'Integer',
        'Long',
        'Float',
        'Double',
        'LocalDate',
        'ZonedDateTime',
        'BigDecimal',
        'String',
        'Boolean',
      ];
    default:
      return [];
  }
}
