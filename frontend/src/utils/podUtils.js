export function getPOD(otDateInput) {
  if (!otDateInput) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const otDate = new Date(otDateInput);
  otDate.setHours(0, 0, 0, 0);
  const diffMs = today - otDate;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

