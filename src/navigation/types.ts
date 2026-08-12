export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  AddFood: { date?: string } | undefined;
  EditFood: { id: string };
  DayDetail: { date: string };
};

export type MainTabParamList = {
  Home: { toast?: string } | undefined;
  Statistics: undefined;
  History: undefined;
  Settings: undefined;
};
