export const semesterFaculties = ["BBA", "BCA", "CSIT", "BITM", "BSC"];
export const yearlyFaculties = ["BBS", "BA", "BSW"];

export const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Semester ${i + 1}`
}));

export const yearOptions = Array.from({ length: 4 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `Year ${i + 1}`
}));