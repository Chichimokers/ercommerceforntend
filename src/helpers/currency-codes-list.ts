interface Currency {
    code: string;
    symbol: string;
    name: string;
}export const currencies: { [key: string]: Currency } = {
    // Monedas prioritarias para emigrantes cubanos
    CUP: { code: "CUP", symbol: "$", name: "Peso cubano" },
    USD: { code: "USD", symbol: "$", name: "Dólar estadounidense" },
    CAD: { code: "CAD", symbol: "$", name: "Dólar canadiense" },
    EUR: { code: "EUR", symbol: "€", name: "Euro" },
    BRL: { code: "BRL", symbol: "R$", name: "Real brasileño" },
    GBP: { code: "GBP", symbol: "£", name: "Libra esterlina" },
    RUB: { code: "RUB", symbol: "₽", name: "Rublo ruso" },
    MXN: { code: "MXN", symbol: "$", name: "Peso mexicano" },
    DOP: { code: "DOP", symbol: "$", name: "Peso dominicano" },
    NIO: { code: "NIO", symbol: "C$", name: "Córdoba nicaragüense" },
    PAB: { code: "PAB", symbol: "B/.", name: "Balboa panameño" },
    CRC: { code: "CRC", symbol: "₡", name: "Colón costarricense" },
    GTQ: { code: "GTQ", symbol: "Q", name: "Quetzal guatemalteco" },
    HNL: { code: "HNL", symbol: "L.", name: "Lempira hondureña" },
    ARS: { code: "ARS", symbol: "$", name: "Peso argentino" },
    COP: { code: "COP", symbol: "$", name: "Peso colombiano" },
    VES: { code: "VES", symbol: "Bs.S.", name: "Bolívar soberano venezolano" },
    AUD: { code: "AUD", symbol: "$", name: "Dólar australiano" },
    SAR: { code: "SAR", symbol: "ر.س.", name: "Riyal saudí" },
    AED: { code: "AED", symbol: "د.إ", name: "Dirham de Emiratos Árabes Unidos" },
    CHF: { code: "CHF", symbol: "Fr", name: "Franco suizo" },
    JPY: { code: "JPY", symbol: "¥", name: "Yen japonés" },
    CNY: { code: "CNY", symbol: "¥", name: "Yuan chino" },
    TRY: { code: "TRY", symbol: "₺", name: "Lira turca" },
    PEN: { code: "PEN", symbol: "S/.", name: "Sol peruano" },
    CLP: { code: "CLP", symbol: "$", name: "Peso chileno" },
    UYU: { code: "UYU", symbol: "$U", name: "Peso uruguayo" }
}