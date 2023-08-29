import dayjs from 'dayjs';

const STANDARD_DT_FORMAT = 'M/D/YY [at] h:mm A';

export const applyStandardDateTimeFormat = (date: string): string => {
  return dayjs(date).format(STANDARD_DT_FORMAT);
};
