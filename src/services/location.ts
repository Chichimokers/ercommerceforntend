export const locationFetcher = async (url: string) => {
  try {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`API error (${res.status}):`, errorText);
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        //console.log('API response success:', data);
        return data;
      } catch (fetchError) {
        attempts++;
        console.warn(`Fetch attempt ${attempts} failed:`, fetchError);

        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw fetchError;
        }
      }
    }
  } catch (error) {
    console.error('All fetch attempts failed:', error);
    throw error;
  }
};
