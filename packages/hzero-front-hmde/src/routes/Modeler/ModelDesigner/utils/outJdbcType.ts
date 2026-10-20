/**
 * 转化为正确数据类型
 * @param jdbcType
 * @returns {string}
 */
export function MySQLJdbcType(jdbcType: string) {
  const _jdbcType = jdbcType.toString();
  switch (_jdbcType) {
    case '-6':
      return 'Byte';
    case '5':
      return 'Short';
    case '4':
      return 'Integer';
    case '-5':
      return 'Long';
    case '7':
      return 'Float';
    case '6':
    case '8':
      return 'Double';
    case '-7':
    case '16':
      return 'Boolean';
    case '1':
    case '2005':
    case '-16':
    case '-1':
    case '-15':
    case '2011':
    case '-9':
    case '12':
      return 'String';
    case '91':
      return 'LocalDate';
    case '92':
      return 'Time';
    case '93':
      return 'ZonedDateTime';
    case '-2':
    case '2004':
    case '-4':
    case '-3':
      return 'Byte[]';
    case '3':
    case '2':
      return 'BigDecimal';
    case '2013':
      return 'OffsetTime';
    case '2014':
      return 'OffsetDateTime';
    case '2003':
    case '70':
    case '2001':
    case '2000':
    case '0':
    case '1111':
    case '2006':
    case '2002':
    default:
      return 'Object';
  }
}

function calculateBigDecimalReplacement(dataSize: number, decimalDigits: number) {
  let answer = 'BigDecimal';
  if (decimalDigits > 0 || dataSize > 19) {
    answer = 'BigDecimal';
  } else if (dataSize > 9) {
    answer = 'Long';
  } else if (dataSize > 4) {
    answer = 'Integer';
  } else if (dataSize > 2) {
    answer = 'Short';
  } else if (dataSize > 1) {
    answer = 'Byte';
  } else if (dataSize === 1) {
    answer = 'Boolean';
  }
  return answer;
}

/**
 * Oracle数据库对应outJdbc
 * @param {String} jdbcType 数据类型
 * @param {String} dataSize 最大长度
 * @param {String} decimalDigits 最小位数
 */
export function OracleJdbcType(jdbcType: string, dataSize: number, decimalDigits: number) {
  const _jdbcType = jdbcType.toString();
  switch (_jdbcType) {
    case '-6':
      return 'Byte';
    case '5':
      return 'Short';
    case '4':
      return 'Integer';
    case '-5':
      return 'Long';
    case '7':
      return 'Float';
    case '6':
    case '8':
      return 'Double';
    case '-7':
    case '16':
      return 'Boolean';
    case '1':
    case '2005':
    case '-16':
    case '-1':
    case '-15':
    case '2011':
    case '-9':
    case '12':
      return 'String';
    case '91':
      return 'LocalDate';
    case '92':
      return 'Time';
    case '93':
      return 'ZonedDateTime';
    case '-2':
    case '2004':
    case '-4':
    case '-3':
      return 'Byte[]';
    case '3':
    case '2':
      return calculateBigDecimalReplacement(dataSize, decimalDigits);
    case '2013':
      return 'OffsetTime';
    case '2014':
      return 'OffsetDateTime';
    case '2003':
    case '70':
    case '2001':
    case '2000':
    case '0':
    case '1111':
    case '2006':
    case '2002':
    default:
      return 'Object';
  }
}
