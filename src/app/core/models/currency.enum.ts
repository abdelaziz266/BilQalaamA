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
    [Currency.EGP]: 'جنيه مصري (EGP)',
    [Currency.SAR]: 'ريال سعودي (SAR)',
    [Currency.AED]: 'درهم إماراتي (AED)',
    [Currency.KWD]: 'دينار كويتي (KWD)',
    [Currency.QAR]: 'ريال قطري (QAR)',
    [Currency.USD]: 'دولار أمريكي (USD)',
    [Currency.EUR]: 'يورو (EUR)',
    [Currency.GBP]: 'جنيه إسترليني (GBP)'
};

export const CurrencyOptions = [
    { label: 'جنيه مصري (EGP)', value: Currency.EGP },
    { label: 'ريال سعودي (SAR)', value: Currency.SAR },
    { label: 'درهم إماراتي (AED)', value: Currency.AED },
    { label: 'دينار كويتي (KWD)', value: Currency.KWD },
    { label: 'ريال قطري (QAR)', value: Currency.QAR },
    { label: 'دولار أمريكي (USD)', value: Currency.USD },
    { label: 'يورو (EUR)', value: Currency.EUR },
    { label: 'جنيه إسترليني (GBP)', value: Currency.GBP }
];
