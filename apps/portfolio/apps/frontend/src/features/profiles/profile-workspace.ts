/** Personas in the prepared office share records; archived case profiles retain their own scope. */
export const preparedOfficeId = "family-office-composite";
export const isOfficePersona = (id: string) => id.startsWith("office-role-") || id.startsWith("office-member-");
export const workspaceForProfile = (id: string) => isOfficePersona(id) ? preparedOfficeId : id;
