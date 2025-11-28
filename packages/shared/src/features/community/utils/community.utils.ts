/**
 *  calculate time difference between now and the date
 */
const getTimeDiff = (date: string) => {
  const targetDate = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - targetDate.getTime();

  return {
    minutes: Math.floor(diffInMs / (1000 * 60)),
    hours: Math.floor(diffInMs / (1000 * 60 * 60)),
    days: Math.floor(diffInMs / (1000 * 60 * 60 * 24)),
    date: targetDate,
  };
};

/**
 * format date for post display
 */
export const formatPostDate = (date: string): string => {
  const { minutes, hours, days, date: postDate } = getTimeDiff(date);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const month = String(postDate.getMonth() + 1).padStart(2, '0');
  const day = String(postDate.getDate()).padStart(2, '0');
  return `${month}/${day}`;
};

/**
 * format date for comment display
 */
export const formatCommentDate = (date: string): string => {
  const { minutes, hours, days, date: commentDate } = getTimeDiff(date);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const month = String(commentDate.getMonth() + 1).padStart(2, '0');
  const day = String(commentDate.getDate()).padStart(2, '0');
  const hour = String(commentDate.getHours()).padStart(2, '0');
  const minute = String(commentDate.getMinutes()).padStart(2, '0');

  return `${month}/${day} ${hour}:${minute}`;
};
