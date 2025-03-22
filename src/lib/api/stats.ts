export async function getPublicStats() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.esaki-jrr.com/';
    const response = await fetch(`${baseUrl}public/main`, {
      next: {
        revalidate: 3600,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching public stats: ${response.status}`);
    }

    const data = await response.json();
    return {
      products: data?.products || 100,
      provinces: data?.provinces || 2,
      category: data?.category || 5,
    };
  } catch (error) {
    console.error("Failed to fetch public stats:", error);
    return {
      products: 100,
      provinces: 2,
      category: 5,
    };
  }
}