export enum Currency {
    EGP = 1,
    SAR = 2,
    AED = 3,
    KWD = 4,
    QAR = 5,
    USD = 6,
    EUR = 7,
    GBP = 8
}

export const CurrencyLabels: { [key in Currency]: string } = {
    [Currency.EGP]: 'جنيه مصري',
    [Currency.SAR]: 'ريال سعودي',
    [Currency.AED]: 'درهم إماراتي',
    [Currency.KWD]: 'دينار كويتي',
    [Currency.QAR]: 'ريال قطري',
    [Currency.USD]: 'دولار أمريكي',
    [Currency.EUR]: 'يورو',
    [Currency.GBP]: 'جنيه إسترليني'
};

export const CurrencyOptions = [
    { label: 'جنيه مصري', value: Currency.EGP },
    { label: 'ريال سعودي', value: Currency.SAR },
    { label: 'درهم إماراتي', value: Currency.AED },
    { label: 'دينار كويتي', value: Currency.KWD },
    { label: 'ريال قطري', value: Currency.QAR },
    { label: 'دولار أمريكي', value: Currency.USD },
    { label: 'يورو', value: Currency.EUR },
    { label: 'جنيه إسترليني', value: Currency.GBP }
];
