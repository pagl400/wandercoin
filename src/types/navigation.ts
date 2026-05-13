export type RootStackParamList = {
  Converter: undefined;
  CurrencyPicker: { field: 'from' | 'to' };
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
