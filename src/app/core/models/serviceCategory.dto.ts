export interface IGetServiceCategoryDto {
    id: number,
    name: string,
    logo: string
}
export interface IGetServiceCompany {
    id: number,
    serviceCategories: string[],
    logo: string,
    name: string,
    order?: number,
}