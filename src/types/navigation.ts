export type RootStackParamList = {
  Converter: undefined;
  CurrencyPicker: { field: 'from' | 'to' };
  Chart: undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
