// Las fechas del plan personal se manejan como "YYYY-MM-DD" (fecha local del estudiante)
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

export const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const time = Date.parse(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
  );
};

// Cantidad de días entre dos fechas, contando ambos extremos.
// Si "to" es anterior a "from" devuelve 0 o un número negativo.
export const countDaysInclusive = (from: string, to: string): number => {
  const diff = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);

  return Math.round(diff / MS_PER_DAY) + 1;
};
