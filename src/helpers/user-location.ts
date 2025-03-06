import { publicIpv4 } from 'public-ip';
import { currencies } from './currency-codes-list';

function formatDate(date: Date): string {

    const pad = (num: number) => (num < 10 ? '0' + num : num);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}


async function getUserLocation() {
    const ip = await publicIpv4();
    const response = await fetch(`https://apip.cc/api-json/${ip}`);
    const data = await response.json();
    return { country: data.CountryName, currency: data.Currency };
}

async function getExchangeRate(targetCurrency: string) {
    const response = await fetch(`https://apip.cc/api-rates/1-usd2${targetCurrency.toLocaleLowerCase()}`);
    const data = await response.text();
 
    if (data) {
        data.trim()
        const cleanedData = data.replace(',', '').replace('.', '.');
        const exchangeRateNumeric = parseFloat(cleanedData);
        return exchangeRateNumeric ; 
    } else {
        throw new Error('Error al obtener la tasa de cambio');
    }
}


    const today = new Date();
    const formattedDateFrom = formatDate(today);
    const formattedDateTo = formatDate(today);

async function exchangeRateElToque() {
    //weno por ahora esto se queda ahi no fn todavia la peticion Cosas con Cors
    //Cross-Origin Request Blocked: 
    //The Same Origin Policy disallows reading the remote resource at 
    //https://tasas.eltoque.com/v1/trmi?date_from=2022-10-27%2000%3A00%3A01&date_to=2022-10-27%2023%3A59%3A01. 
    //(Reason: CORS request did not succeed). Status code: (null).
   
    const apiUrl = `https://tasas.eltoque.com/v1/trmi?date_from=2022-10-27%2000%3A00%3A01&date_to=2022-10-27%2023%3A59%3A01`;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcxNDc3NjU0MywianRpIjoiMTQ4ZjljOTItNjViZC00YjFmLWFkYjQtMjE4OGI3OTgyZmEzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjY2MjE1ODJlNDVhZjllOGMxOWEyZjhlZSIsIm5iZiI6MTcxNDc3NjU0MywiZXhwIjoxNzQ2MzEyNTQzfQ.EkA1IidqBfmEQROjAhYsAnzyjDn5RzkG439BB6SbxyI';

    const myHeaders = new Headers( {Authorization: `Bearer ${token}`,Accept: 'application/json'});

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
    };
 

    try {
        const response = await fetch(apiUrl, {
            method:"GET",
            headers: myHeaders,
            redirect:"follow",
        });
        
       
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result.tasas.USD; 
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
    }
}
export async function getUserCurrencyAndRate(selectedCurrency: string | undefined) {
    try {
 
        const location = !selectedCurrency ? await getUserLocation() : null;
        console.log('Ubicación del usuario:', selectedCurrency);

        const targetCurrency = selectedCurrency || location?.currency;

        const exchangeRate = targetCurrency !== "CUP" 
            ? await getExchangeRate(targetCurrency)
            : 310.0 //Aqui se llamaria a la api del toque para obtener el cambio de usd a cup;

        const symbol = currencies[targetCurrency.toUpperCase()]?.symbol;

        return {
            country: location?.country,
            currency: targetCurrency,
            exchangeRate,
            symbol
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
